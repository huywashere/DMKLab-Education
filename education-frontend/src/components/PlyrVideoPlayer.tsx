"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from "react";
import "plyr/dist/plyr.css";
import {
  Sparkles,
  Maximize2,
  Minimize2,
  Clock,
  RotateCcw,
  Volume2,
  Tv,
} from "lucide-react";

export interface PlyrChapter {
  time: number;
  title: string;
}

export interface PlyrPlayerHandle {
  play: () => Promise<void> | void;
  pause: () => void;
  seekTo: (seconds: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getIsPlaying: () => boolean;
  rawPlayer: any;
}

export interface PlyrVideoPlayerProps {
  src?: string;
  poster?: string;
  title?: string;
  initialTime?: number;
  chapters?: PlyrChapter[];
  subtitlesUrl?: string;
  defaultSubtitles?: boolean;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onReady?: (player: any) => void;
  className?: string;
  // Modern Interactive & Cinema Features
  isTheaterMode?: boolean;
  onToggleTheater?: () => void;
  onAskAi?: (currentTime: number, chapterTitle?: string) => void;
  ambientGlow?: boolean;
}

// Từ điển Việt hóa toàn diện cho Plyr
const VIETNAMESE_I18N = {
  restart: "Phát lại",
  rewind: "Lùi {seektime} giây",
  play: "Phát",
  pause: "Tạm dừng",
  fastForward: "Tua nhanh {seektime} giây",
  seek: "Tìm kiếm",
  seekLabel: "{currentTime} trên {duration}",
  played: "Đã phát",
  buffered: "Đã tải trước",
  currentTime: "Thời gian hiện tại",
  duration: "Tổng thời lượng",
  volume: "Âm lượng",
  mute: "Tắt âm thanh",
  unmute: "Bật âm thanh",
  enableCaptions: "Bật phụ đề",
  disableCaptions: "Tắt phụ đề",
  download: "Tải xuống",
  enterFullscreen: "Toàn màn hình",
  exitFullscreen: "Thoát toàn màn hình",
  frameTitle: "Trình phát video {title}",
  captions: "Phụ đề",
  settings: "Cài đặt phát",
  pip: "Hình trong hình (PIP)",
  menuBack: "Quay lại",
  speed: "Tốc độ phát",
  normal: "Chuẩn (1x)",
  quality: "Chất lượng",
  loop: "Lặp lại",
  start: "Bắt đầu",
  end: "Kết thúc",
  all: "Tất cả",
  reset: "Đặt lại",
  disabled: "Đã tắt",
  enabled: "Đã bật",
  advertisement: "Quảng cáo",
  qualityBadge: {
    2160: "4K",
    1440: "2K",
    1080: "FHD",
    720: "HD",
    576: "SD",
    480: "SD",
  },
};

const DEFAULT_VTT_CONTENT = `WEBVTT

00:00.000 --> 02:00.000
Chào mừng các em học sinh đến với bài học trực tuyến trên DMKLab Education!

02:00.000 --> 05:30.000
Khái niệm cốt lõi: Tử số chỉ số phần lấy ra, Mẫu số chỉ tổng số phần bằng nhau được chia.

05:30.000 --> 08:00.000
Ví dụ thực tế: Cắt bánh Pizza thành 4 phần bằng nhau, lấy 1 phần tức là 1/4 chiếc bánh.

08:00.000 --> 12:00.000
Quy tắc vàng: Khi nhân hoặc chia cả tử và mẫu với cùng một số tự nhiên khác 0, ta được phân số bằng phân số đã cho.`;

export const PlyrVideoPlayer = forwardRef<PlyrPlayerHandle, PlyrVideoPlayerProps>(
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
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const playerInstanceRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const [isClient, setIsClient] = useState(false);
    const [subtitlesBlobUrl, setSubtitlesBlobUrl] = useState<string | null>(null);

    // Interactive HUD overlay & skip animation state
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSec, setCurrentSec] = useState(initialTime);
    const [durationSec, setDurationSec] = useState(0);
    const [isHudVisible, setIsHudVisible] = useState(true);
    const [skipBadge, setSkipBadge] = useState<"-10s" | "+10s" | null>(null);
    const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
    const skipTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Chuẩn bị phụ đề WebVTT cục bộ nếu không có URL ngoài
    useEffect(() => {
      setIsClient(true);
      if (!subtitlesUrl) {
        const blob = new Blob([DEFAULT_VTT_CONTENT], { type: "text/vtt" });
        const blobUrl = URL.createObjectURL(blob);
        setSubtitlesBlobUrl(blobUrl);
        return () => {
          URL.revokeObjectURL(blobUrl);
        };
      }
    }, [subtitlesUrl]);

    // Format mm:ss helper
    const formatTimeSec = (secs: number) => {
      const m = Math.floor(secs / 60);
      const s = Math.floor(secs % 60);
      return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

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

    // Trigger visual skip feedback (+10s or -10s)
    const triggerSkip = (type: "-10s" | "+10s") => {
      setSkipBadge(type);
      if (skipTimerRef.current) clearTimeout(skipTimerRef.current);
      skipTimerRef.current = setTimeout(() => {
        setSkipBadge(null);
      }, 700);
    };

    // Double click to skip 10s left or right
    const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current || !playerInstanceRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;

      if (clickX < width * 0.35) {
        // Rewind 10s
        const target = Math.max(0, playerInstanceRef.current.currentTime - 10);
        playerInstanceRef.current.currentTime = target;
        triggerSkip("-10s");
      } else if (clickX > width * 0.65) {
        // Fast forward 10s
        const maxDur = playerInstanceRef.current.duration || 999999;
        const target = Math.min(maxDur, playerInstanceRef.current.currentTime + 10);
        playerInstanceRef.current.currentTime = target;
        triggerSkip("+10s");
      }
    };

    // Expose imperative handle to parent component
    useImperativeHandle(
      ref,
      () => ({
        play: () => {
          if (playerInstanceRef.current) {
            return playerInstanceRef.current.play();
          }
          if (videoRef.current) {
            return videoRef.current.play();
          }
        },
        pause: () => {
          if (playerInstanceRef.current) {
            playerInstanceRef.current.pause();
          } else if (videoRef.current) {
            videoRef.current.pause();
          }
        },
        seekTo: (seconds: number) => {
          if (playerInstanceRef.current) {
            playerInstanceRef.current.currentTime = seconds;
          } else if (videoRef.current) {
            videoRef.current.currentTime = seconds;
          }
        },
        getCurrentTime: () => {
          if (playerInstanceRef.current) {
            return playerInstanceRef.current.currentTime;
          }
          return videoRef.current ? videoRef.current.currentTime : 0;
        },
        getDuration: () => {
          if (playerInstanceRef.current) {
            return playerInstanceRef.current.duration;
          }
          return videoRef.current ? videoRef.current.duration : 0;
        },
        getIsPlaying: () => {
          if (playerInstanceRef.current) {
            return playerInstanceRef.current.playing;
          }
          return false;
        },
        rawPlayer: playerInstanceRef.current,
      }),
      []
    );

    // Initialize Plyr on the client
    useEffect(() => {
      if (!isClient || !videoRef.current) return;

      let player: any = null;
      let isMounted = true;

      const initPlyr = async () => {
        try {
          const PlyrModule = (await import("plyr")).default;
          if (!isMounted || !videoRef.current) return;

          // Danh sách mốc chapter cho thanh tiến độ
          const markerPoints = chapters
            .filter((c) => c.time >= 0)
            .map((c) => ({
              time: c.time,
              label: c.title,
            }));

          player = new PlyrModule(videoRef.current, {
            controls: [
              "play-large", // Nút play lớn ở giữa
              "restart", // Phát lại từ đầu
              "rewind", // Tua lùi 10s
              "play", // Phát/Tạm dừng
              "fast-forward", // Tua nhanh 10s
              "progress", // Thanh tiến độ
              "current-time", // Thời gian hiện tại
              "duration", // Tổng thời gian
              "mute", // Tắt/bật âm
              "volume", // Thanh trượt âm lượng
              "captions", // Phụ đề CC
              "settings", // Cài đặt tốc độ, lặp lại
              "pip", // Picture-in-picture
              "airplay", // Airplay nếu có
              "fullscreen", // Toàn màn hình
            ],
            settings: ["captions", "speed", "loop"],
            seekTime: 10,
            speed: {
              selected: 1,
              options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
            },
            captions: {
              active: defaultSubtitles,
              language: "vi",
              update: true,
            },
            markers: {
              enabled: markerPoints.length > 0,
              points: markerPoints,
            },
            i18n: VIETNAMESE_I18N,
            tooltips: {
              controls: true,
              seek: true,
            },
            invertTime: false,
            keyboard: {
              focused: true,
              global: false,
            },
            storage: {
              enabled: true,
              key: "dmklab_plyr_settings",
            },
          });

          playerInstanceRef.current = player;

          // Đăng ký các sự kiện Plyr
          player.on("ready", () => {
            if (initialTime > 0 && player.currentTime === 0) {
              player.currentTime = initialTime;
            }
            if (player.duration) {
              setDurationSec(player.duration);
            }
            if (onReady) onReady(player);
          });

          player.on("timeupdate", () => {
            setCurrentSec(player.currentTime);
            if (player.duration) setDurationSec(player.duration);
            if (onTimeUpdate) {
              onTimeUpdate(player.currentTime, player.duration || 0);
            }
          });

          player.on("play", () => {
            setIsPlaying(true);
            if (onPlay) onPlay();
          });

          player.on("pause", () => {
            setIsPlaying(false);
            setIsHudVisible(true);
            if (onPause) onPause();
          });

          player.on("ended", () => {
            setIsPlaying(false);
            setIsHudVisible(true);
            if (onEnded) onEnded();
          });
        } catch (error) {
          console.error("Lỗi khi khởi tạo Plyr player:", error);
        }
      };

      initPlyr();

      return () => {
        isMounted = false;
        if (player) {
          try {
            player.destroy();
          } catch (e) {
            console.warn("Lỗi hủy player instance:", e);
          }
          playerInstanceRef.current = null;
        }
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        if (skipTimerRef.current) clearTimeout(skipTimerRef.current);
      };
    }, [isClient, defaultSubtitles]); // Initialize once on client mount

    // Update source when `src` or `poster` changes dynamically without tearing down the player
    useEffect(() => {
      const player = playerInstanceRef.current;
      if (player && src) {
        const vttSrc = subtitlesUrl || subtitlesBlobUrl;
        const tracks = vttSrc
          ? [
              {
                kind: "captions" as const,
                label: "Tiếng Việt",
                src: vttSrc,
                srclang: "vi",
                default: defaultSubtitles,
              },
            ]
          : [];

        player.source = {
          type: "video",
          title: title,
          sources: [
            {
              src: src,
              type: src.endsWith(".webm") ? "video/webm" : "video/mp4",
            },
          ],
          poster: poster,
          tracks: tracks,
        };

        if (initialTime > 0) {
          setTimeout(() => {
            try {
              player.currentTime = initialTime;
            } catch {
              // Ignore seek timing issues during initial source load
            }
          }, 300);
        }
      }
    }, [src, poster, title, subtitlesUrl, subtitlesBlobUrl, initialTime, defaultSubtitles]);

    const activeVtt = subtitlesUrl || subtitlesBlobUrl;

    // Active Chapter Lookup based on current playback second
    const activeChapter = chapters
      .slice()
      .filter((c) => c.time <= currentSec)
      .sort((a, b) => b.time - a.time)[0];

    return (
      <div className={`relative group/player ${className}`}>
        {/* 1. Dynamic Ambient Backlight Glow (Cinema Effect) */}
        {ambientGlow && (
          <div
            aria-hidden="true"
            className={`absolute -inset-3 sm:-inset-5 bg-gradient-to-tr from-blue-600/30 via-indigo-600/25 to-teal-400/25 blur-2xl sm:blur-3xl rounded-3xl transition-all duration-700 pointer-events-none ${
              isPlaying
                ? "opacity-85 scale-100"
                : "opacity-40 scale-95"
            }`}
          />
        )}

        {/* 2. Main Player Frame */}
        <div
          ref={containerRef}
          onMouseMove={handleUserActivity}
          onMouseEnter={handleUserActivity}
          onDoubleClick={handleDoubleClick}
          className="relative dmklab-plyr-container bg-slate-950 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-800/80 transition-shadow duration-300"
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
                {formatTimeSec(currentSec)} / {formatTimeSec(durationSec || 600)}
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
                  title={isTheaterMode ? "Thu nhỏ chế độ rạp chiếu" : "Mở rộng Chế độ Rạp chiếu (Cinema Mode)"}
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

          {/* Native video element targeted by Plyr */}
          <video
            ref={videoRef}
            className="plyr-react plyr w-full aspect-video object-cover"
            playsInline
            crossOrigin="anonymous"
            poster={poster}
            preload="metadata"
          >
            <source src={src} type={src.endsWith(".webm") ? "video/webm" : "video/mp4"} />
            {activeVtt && (
              <track
                kind="captions"
                label="Tiếng Việt"
                src={activeVtt}
                srcLang="vi"
                default={defaultSubtitles}
              />
            )}
            Trình duyệt của bạn không hỗ trợ thẻ video HTML5.
          </video>

          {/* Fallback loading state while player initializes on SSR */}
          {!isClient && (
            <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center text-white gap-3">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium text-slate-300">
                Đang chuẩn bị trình phát Plyr...
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

PlyrVideoPlayer.displayName = "PlyrVideoPlayer";
