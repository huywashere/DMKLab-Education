"use client";

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import "plyr/dist/plyr.css";

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
    },
    ref
  ) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const playerInstanceRef = useRef<any>(null);
    const [isClient, setIsClient] = useState(false);
    const [subtitlesBlobUrl, setSubtitlesBlobUrl] = useState<string | null>(null);

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
              "restart",    // Phát lại từ đầu
              "rewind",     // Tua lùi 10s
              "play",       // Phát/Tạm dừng
              "fast-forward", // Tua nhanh 10s
              "progress",   // Thanh tiến độ
              "current-time", // Thời gian hiện tại
              "duration",   // Tổng thời gian
              "mute",       // Tắt/bật âm
              "volume",     // Thanh trượt âm lượng
              "captions",   // Phụ đề CC
              "settings",   // Cài đặt tốc độ, lặp lại
              "pip",        // Picture-in-picture
              "airplay",    // Airplay nếu có
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
            if (onReady) onReady(player);
          });

          player.on("timeupdate", () => {
            if (onTimeUpdate) {
              onTimeUpdate(player.currentTime, player.duration || 0);
            }
          });

          player.on("play", () => {
            if (onPlay) onPlay();
          });

          player.on("pause", () => {
            if (onPause) onPause();
          });

          player.on("ended", () => {
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

    return (
      <div className={`relative dmklab-plyr-container bg-black rounded-2xl overflow-hidden shadow-2xl ${className}`}>
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
            <span className="text-xs font-medium text-slate-300">Đang chuẩn bị trình phát Plyr...</span>
          </div>
        )}
      </div>
    );
  }
);

PlyrVideoPlayer.displayName = "PlyrVideoPlayer";
