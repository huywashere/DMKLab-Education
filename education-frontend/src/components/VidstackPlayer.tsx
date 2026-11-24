"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from "react";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import {
  MediaPlayer,
  MediaProvider,
  Track,
  Poster,
  type MediaPlayerInstance,
  type MediaTimeUpdateEventDetail,
} from "@vidstack/react";
import {
  DefaultVideoLayout,
  defaultLayoutIcons,
} from "@vidstack/react/player/layouts/default";
import {
  Sparkles,
  Maximize2,
  Minimize2,
} from "lucide-react";
import {
  type VidstackPlayerHandle,
  type VidstackPlayerProps,
  type VidstackChapter,
  VIETNAMESE_TRANSLATIONS,
  DEFAULT_VTT_CONTENT,
  generateChaptersVtt,
  formatDisplayTime,
} from "@/lib/video-helpers";

export * from "@/lib/video-helpers";

export const VidstackPlayer = forwardRef<VidstackPlayerHandle, VidstackPlayerProps>(
  (
    {
      src = "",
      poster,
      title = "Video bài học DMKLab",
      initialTime = 0,
      chapters = [],
      subtitlesUrl,
      defaultSubtitles = false,
      onTimeUpdate,
      onPlay,
      onPause,
      onEnded,
      onReady,
      className = "",
      isTheaterMode = false,
      onToggleTheater,
      onAskAi,
      ambientGlow = true,
    },
    ref
  ) => {
    const playerRef = useRef<MediaPlayerInstance | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const [isClient, setIsClient] = useState(false);
    const [subtitlesBlobUrl, setSubtitlesBlobUrl] = useState<string | null>(null);
    const [chaptersBlobUrl, setChaptersBlobUrl] = useState<string | null>(null);

    const safeInitialTime = Math.max(
      0,
      isNaN(initialTime) || !isFinite(initialTime) ? 0 : initialTime
    );

    // Interactive HUD overlay & skip animation state
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSec, setCurrentSec] = useState(safeInitialTime);
    const [durationSec, setDurationSec] = useState(0);
    const [isHudVisible, setIsHudVisible] = useState(true);
    const [skipBadge, setSkipBadge] = useState<"-10s" | "+10s" | null>(null);

    const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
    const skipTimerRef = useRef<NodeJS.Timeout | null>(null);
    const hasResumedRef = useRef(false);
    const hasFiredReadyRef = useRef(false);
    const prevSrcRef = useRef(src);
    const prevInitialTimeRef = useRef(safeInitialTime);
    const currentSecRef = useRef(safeInitialTime);
    const durationSecRef = useRef(0);
    const isPlayingRef = useRef(false);

    useEffect(() => {
      currentSecRef.current = currentSec;
    }, [currentSec]);

    useEffect(() => {
      durationSecRef.current = durationSec;
    }, [durationSec]);

    useEffect(() => {
      isPlayingRef.current = isPlaying;
    }, [isPlaying]);

    // Client mount detection and timer cleanup
    useEffect(() => {
      setIsClient(true);
      return () => {
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        if (skipTimerRef.current) clearTimeout(skipTimerRef.current);
      };
    }, []);

    // Tạo blob URL cho phụ đề
    useEffect(() => {
      if (!isClient) return;
      if (subtitlesUrl) {
        setSubtitlesBlobUrl(subtitlesUrl);
        return;
      }
      const blob = new Blob([DEFAULT_VTT_CONTENT], { type: "text/vtt" });
      const blobUrl = URL.createObjectURL(blob);
      setSubtitlesBlobUrl(blobUrl);
      return () => {
        URL.revokeObjectURL(blobUrl);
      };
    }, [isClient, subtitlesUrl]);

    // Tạo blob URL cho chapters VTT (chỉ tạo lại khi nội dung chapters hoặc mốc duration thay đổi thực sự)
    const safeChapters = Array.isArray(chapters) ? chapters : [];
    const chaptersSerialized = JSON.stringify(safeChapters);
    const normalizedDuration = Math.round((durationSec || 0) / 10) * 10;
    useEffect(() => {
      const parsedChapters: VidstackChapter[] = JSON.parse(chaptersSerialized);
      if (!isClient || parsedChapters.length === 0) {
        setChaptersBlobUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return null;
        });
        return;
      }
      const vtt = generateChaptersVtt(parsedChapters, normalizedDuration || 3600);
      const blob = new Blob([vtt], { type: "text/vtt" });
      const blobUrl = URL.createObjectURL(blob);
      setChaptersBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return blobUrl;
      });
      return () => {
        URL.revokeObjectURL(blobUrl);
      };
    }, [isClient, chaptersSerialized, normalizedDuration]);

    // Reset cờ khôi phục thời gian và ready khi nguồn video hoặc initialTime thay đổi
    useEffect(() => {
      const srcChanged = prevSrcRef.current !== src;
      const initialTimeChanged = prevInitialTimeRef.current !== safeInitialTime;

      if (srcChanged || initialTimeChanged) {
        prevSrcRef.current = src;
        prevInitialTimeRef.current = safeInitialTime;
        hasResumedRef.current = false;
        hasFiredReadyRef.current = false;
        setCurrentSec(safeInitialTime);

        // Nếu nguồn video không đổi (chỉ đổi initialTime) và player đã canPlay thì seek ngay
        if (!srcChanged && playerRef.current && playerRef.current.state?.canPlay) {
          try {
            playerRef.current.currentTime = safeInitialTime;
            hasResumedRef.current = true;
          } catch {
            // Player may still be initializing
          }
        }
      }
    }, [src, safeInitialTime]);

    // Auto-hide HUD overlay during playback when mouse is idle
    const handleUserActivity = useCallback(() => {
      setIsHudVisible(true);
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      if (isPlaying) {
        idleTimerRef.current = setTimeout(() => {
          setIsHudVisible(false);
        }, 3200);
      }
    }, [isPlaying]);

    // Hiển thị hiệu ứng tua nhanh/lùi (+10s hoặc -10s)
    const triggerSkip = (type: "-10s" | "+10s") => {
      setSkipBadge(type);
      if (skipTimerRef.current) clearTimeout(skipTimerRef.current);
      skipTimerRef.current = setTimeout(() => {
        setSkipBadge(null);
      }, 700);
    };

    // Double click to skip 10s left or right
    const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      // Bỏ qua nếu người dùng nhấp đúp vào nút bấm hoặc điều khiển tương tác (như Hỏi AI, Rạp chiếu, Sliders)
      if (
        (e.target as HTMLElement)?.closest(
          "button, [role='button'], a, input, [role='slider'], [data-media-slider], .vds-controls"
        )
      ) {
        return;
      }
      if (!containerRef.current || !playerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const width = rect.width;
      if (width <= 0) return;
      const clickX = e.clientX - rect.left;

      const rawCurrent = playerRef.current.currentTime;
      const cur = Math.max(
        0,
        typeof rawCurrent === "number" && !isNaN(rawCurrent) && isFinite(rawCurrent)
          ? rawCurrent
          : (currentSec || 0)
      );

      if (clickX < width * 0.35) {
        // Rewind 10s
        const target = Math.max(0, cur - 10);
        try {
          playerRef.current.currentTime = target;
        } catch {
          // Gracefully ignore early seek if media not ready
        }
        setCurrentSec(target);
        triggerSkip("-10s");
      } else if (clickX > width * 0.65) {
        // Fast forward 10s
        const rawDur = playerRef.current.duration;
        const maxDur = Math.max(
          cur,
          typeof rawDur === "number" && !isNaN(rawDur) && isFinite(rawDur)
            ? rawDur
            : (durationSec || 999999)
        );
        const target = Math.min(maxDur, cur + 10);
        try {
          playerRef.current.currentTime = target;
        } catch {
          // Gracefully ignore early seek if media not ready
        }
        setCurrentSec(target);
        triggerSkip("+10s");
      }
    };

    // Expose stable imperative handle to parent component
    useImperativeHandle(
      ref,
      () => ({
        play: () => {
          return playerRef.current?.play().catch(() => {
            // Gracefully handle media not ready or autoplay restriction
            return undefined;
          });
        },
        pause: () => {
          playerRef.current?.pause();
        },
        seekTo: (seconds: number) => {
          const safeSeconds = Math.max(
            0,
            isNaN(seconds) || !isFinite(seconds) ? 0 : seconds
          );
          if (playerRef.current) {
            try {
              playerRef.current.currentTime = safeSeconds;
            } catch {
              // Gracefully handle seek on unready media
            }
          }
          setCurrentSec(safeSeconds);
        },
        getCurrentTime: () => {
          if (playerRef.current) {
            const rawCur = playerRef.current.currentTime;
            const stateCur = playerRef.current.state?.currentTime;
            const cur = typeof rawCur === "number" && !isNaN(rawCur) && isFinite(rawCur)
              ? rawCur
              : (typeof stateCur === "number" && !isNaN(stateCur) && isFinite(stateCur)
                  ? stateCur
                  : (currentSecRef.current || 0));
            return cur;
          }
          return currentSecRef.current || 0;
        },
        getDuration: () => {
          if (playerRef.current) {
            const rawDur = playerRef.current.duration;
            const stateDur = playerRef.current.state?.duration;
            const dur = typeof rawDur === "number" && !isNaN(rawDur) && isFinite(rawDur) && rawDur > 0
              ? rawDur
              : (typeof stateDur === "number" && !isNaN(stateDur) && isFinite(stateDur) && stateDur > 0
                  ? stateDur
                  : (durationSecRef.current || 0));
            return dur;
          }
          return durationSecRef.current || 0;
        },
        getIsPlaying: () => {
          if (playerRef.current) {
            return !playerRef.current.paused || Boolean(playerRef.current.state?.playing);
          }
          return isPlayingRef.current;
        },
        get rawPlayer() {
          return playerRef.current;
        },
      }),
      []
    );

    // Xử lý sự kiện MediaPlayer
    const handleCanPlay = () => {
      // Khôi phục mốc initialTime chính xác khi video sẵn sàng
      if (!hasResumedRef.current) {
        hasResumedRef.current = true;
        const targetTime = safeInitialTime;
        if (playerRef.current) {
          try {
            playerRef.current.currentTime = targetTime;
          } catch {
            // Gracefully handle early seek
          }
        }
      }
      const rawDur = playerRef.current?.duration;
      if (typeof rawDur === "number" && !isNaN(rawDur) && isFinite(rawDur) && rawDur > 0) {
        setDurationSec(rawDur);
      }
      if (onReady && playerRef.current && !hasFiredReadyRef.current) {
        hasFiredReadyRef.current = true;
        onReady(playerRef.current);
      }
    };

    const handleDurationChange = (detail: number) => {
      if (typeof detail === "number" && !isNaN(detail) && isFinite(detail) && detail > 0) {
        setDurationSec(detail);
      }
    };

    const handleTimeUpdate = (detail: MediaTimeUpdateEventDetail) => {
      const curTime = typeof detail?.currentTime === "number" && !isNaN(detail.currentTime)
        ? detail.currentTime
        : (playerRef.current?.currentTime || 0);
      setCurrentSec(curTime);
      const rawDur = playerRef.current?.duration;
      const dur = typeof rawDur === "number" && !isNaN(rawDur) && isFinite(rawDur) && rawDur > 0
        ? rawDur
        : (durationSec || 0);
      if (dur > 0 && dur !== durationSec) {
        setDurationSec(dur);
      }
      if (onTimeUpdate) {
        onTimeUpdate(curTime, dur);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      if (onPlay) onPlay();
    };

    const handlePause = () => {
      setIsPlaying(false);
      setIsHudVisible(true);
      if (onPause) onPause();
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setIsHudVisible(true);
      if (onEnded) onEnded();
    };

    // Active Chapter Lookup based on current playback second
    const activeChapter = safeChapters
      .slice()
      .filter((c) => c && typeof c.time === "number" && c.time <= currentSec)
      .sort((a, b) => b.time - a.time)[0];

    // Chuẩn hóa MediaSrc object có type tường minh để Vidstack provider loader nhận diện chuẩn HLS (.m3u8) và MP4/WebM
    const normalizedMediaSrc = typeof src === "string" && src
      ? {
          src,
          type: src.includes(".m3u8")
            ? ("application/x-mpegurl" as const)
            : src.includes(".webm")
            ? ("video/webm" as const)
            : ("video/mp4" as const),
        }
      : src || undefined;

    return (
      <div className={`relative group/player ${className}`}>
        {/* 1. Dynamic Ambient Backlight Glow (Cinema Effect) */}
        {ambientGlow && (
          <div
            aria-hidden="true"
            className={`absolute -inset-3 sm:-inset-5 bg-gradient-to-tr from-blue-600/30 via-indigo-600/25 to-teal-400/25 blur-2xl sm:blur-3xl rounded-3xl transition-all duration-700 pointer-events-none ${
              isPlaying ? "opacity-85 scale-100" : "opacity-40 scale-95"
            }`}
          />
        )}

        {/* 2. Main Player Frame */}
        <div
          ref={containerRef}
          onMouseMove={handleUserActivity}
          onMouseEnter={handleUserActivity}
          onDoubleClick={handleDoubleClick}
          className="relative dmklab-vidstack-container bg-slate-950 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-800/80 transition-shadow duration-300"
        >
          {/* Top Cinematic Overlay HUD */}
          <div
            className={`absolute top-0 inset-x-0 p-3.5 sm:p-5 z-20 flex items-center justify-between gap-3 pointer-events-none transition-all duration-300 ${
              isHudVisible || !isPlaying
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-3"
            }`}
          >
            {/* Left: Active Chapter & Title Pill Badge */}
            <div className="flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-white shadow-xl pointer-events-auto">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
              </span>
              <span className="text-xs font-black tracking-tight line-clamp-1 max-w-[190px] sm:max-w-xs md:max-w-md">
                {activeChapter ? activeChapter.title : title}
              </span>
              <span className="text-[10px] text-slate-400 font-mono font-bold hidden sm:inline border-l border-white/20 pl-2">
                {formatDisplayTime(currentSec)} /{" "}
                {formatDisplayTime(durationSec || 600)}
              </span>
            </div>

            {/* Right: Quick Action Controls */}
            <div className="flex items-center gap-2 pointer-events-auto">
              {onAskAi && (
                <button
                  type="button"
                  onClick={() => onAskAi(currentSec, activeChapter?.title)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white text-xs font-black shadow-lg shadow-blue-900/40 border border-white/20 transition-all cursor-pointer"
                  title="Hỏi AI giải thích nội dung tại giây này"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <span className="hidden sm:inline">Hỏi AI về đoạn này</span>
                  <span className="sm:hidden">Hỏi AI</span>
                </button>
              )}

              {onToggleTheater && (
                <button
                  type="button"
                  onClick={onToggleTheater}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-bold border transition-all active:scale-95 cursor-pointer shadow-lg ${
                    isTheaterMode
                      ? "bg-amber-400 text-slate-950 border-amber-300 font-black shadow-amber-500/20"
                      : "bg-slate-950/85 hover:bg-slate-900 text-white border-white/15"
                  }`}
                  title={
                    isTheaterMode
                      ? "Thu nhỏ chế độ rạp chiếu"
                      : "Mở rộng Chế độ Rạp chiếu (Cinema Mode)"
                  }
                >
                  {isTheaterMode ? (
                    <>
                      <Minimize2 className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Thu nhỏ</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Rạp chiếu</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Quick Double-Tap Skip Indicator Visual Ripple */}
          {skipBadge && (
            <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-around">
              {skipBadge === "-10s" ? (
                <div className="flex flex-col items-center justify-center w-24 h-24 rounded-full bg-slate-950/85 backdrop-blur-md text-white border border-white/20 shadow-2xl animate-in zoom-in-75 duration-200">
                  <span className="text-xl font-black">⏪ 10s</span>
                  <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">
                    Lùi lại
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center w-24 h-24 rounded-full bg-slate-950/85 backdrop-blur-md text-white border border-white/20 shadow-2xl animate-in zoom-in-75 duration-200">
                  <span className="text-xl font-black">10s ⏩</span>
                  <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">
                    Tua nhanh
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Vidstack Media Player Engine */}
          {isClient ? (
            <MediaPlayer
              ref={playerRef}
              className="w-full aspect-video bg-slate-950 text-white font-sans ring-0 outline-none"
              title={title}
              src={normalizedMediaSrc}
              poster={poster}
              currentTime={safeInitialTime}
              crossOrigin
              playsInline
              onLoadedMetadata={handleCanPlay}
              onCanPlay={handleCanPlay}
              onCanPlayThrough={handleCanPlay}
              onDurationChange={handleDurationChange}
              onTimeUpdate={handleTimeUpdate}
              onPlay={handlePlay}
              onPause={handlePause}
              onEnded={handleEnded}
            >
              <MediaProvider>
                {poster && (
                  <Poster
                    className="vds-poster object-cover"
                    src={poster}
                    alt={title}
                  />
                )}
                {subtitlesBlobUrl && (
                  <Track
                    src={subtitlesBlobUrl}
                    kind="subtitles"
                    label="Tiếng Việt"
                    lang="vi"
                    default={defaultSubtitles}
                  />
                )}
                {chaptersBlobUrl && (
                  <Track
                    src={chaptersBlobUrl}
                    kind="chapters"
                    label="Mục lục"
                    lang="vi"
                    default
                  />
                )}
              </MediaProvider>

              {/* Default Vidstack Video Layout with full Vietnamese localization */}
              <DefaultVideoLayout
                icons={defaultLayoutIcons}
                translations={VIETNAMESE_TRANSLATIONS}
              />
            </MediaPlayer>
          ) : (
            <div className="w-full aspect-video bg-slate-950 flex flex-col items-center justify-center text-white gap-3">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium text-slate-300">
                Đang chuẩn bị trình phát Vidstack Player...
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

VidstackPlayer.displayName = "VidstackPlayer";

// Backward compatibility export
export const PlyrVideoPlayer = VidstackPlayer;
