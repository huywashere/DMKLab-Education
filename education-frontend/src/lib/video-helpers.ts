import type { DefaultLayoutTranslations } from "@vidstack/react/player/layouts/default";
import type { MediaPlayerInstance } from "@vidstack/react";

export interface VidstackChapter {
  time: number;
  title: string;
}

// Backward compatibility alias with Plyr
export type PlyrChapter = VidstackChapter;

export interface VidstackPlayerHandle {
  play: () => Promise<void> | void;
  pause: () => void;
  seekTo: (seconds: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getIsPlaying: () => boolean;
  rawPlayer: MediaPlayerInstance | null;
}

export type PlyrPlayerHandle = VidstackPlayerHandle;

export interface VidstackPlayerProps {
  src?: string;
  poster?: string;
  title?: string;
  initialTime?: number;
  chapters?: VidstackChapter[];
  subtitlesUrl?: string;
  defaultSubtitles?: boolean;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onReady?: (player: MediaPlayerInstance | null | unknown) => void;
  className?: string;
  // Modern Interactive & Cinema Features
  isTheaterMode?: boolean;
  onToggleTheater?: () => void;
  onAskAi?: (currentTime: number, chapterTitle?: string) => void;
  ambientGlow?: boolean;
}

export type PlyrVideoPlayerProps = VidstackPlayerProps;

// Từ điển Việt hóa toàn diện cho Vidstack Player & Layout
export const VIETNAMESE_TRANSLATIONS: Partial<DefaultLayoutTranslations> = {
  Announcements: "Thông báo",
  Accessibility: "Trợ năng",
  AirPlay: "AirPlay",
  Audio: "Âm thanh",
  Auto: "Tự động",
  Boost: "Khuếch đại",
  Captions: "Phụ đề",
  "Caption Styles": "Kiểu phụ đề",
  "Captions look like this": "Phụ đề hiển thị như thế này",
  Chapters: "Chương bài học",
  "Closed-Captions Off": "Tắt phụ đề",
  "Closed-Captions On": "Bật phụ đề",
  Connected: "Đã kết nối",
  Continue: "Tiếp tục",
  Connecting: "Đang kết nối",
  Default: "Mặc định",
  Disabled: "Đã tắt",
  Disconnected: "Đã ngắt kết nối",
  "Display Background": "Màu nền hiển thị",
  Download: "Tải xuống",
  "Enter Fullscreen": "Toàn màn hình",
  "Enter PiP": "Hình trong hình (PiP)",
  "Exit Fullscreen": "Thoát toàn màn hình",
  "Exit PiP": "Thoát hình trong hình",
  Font: "Phông chữ",
  Family: "Họ phông chữ",
  Fullscreen: "Toàn màn hình",
  "Google Cast": "Google Cast",
  "Keyboard Animations": "Hiệu ứng phím",
  LIVE: "Trực tiếp",
  Loop: "Lặp lại",
  Mute: "Tắt tiếng",
  Normal: "Chuẩn (1x)",
  Off: "Tắt",
  Pause: "Tạm dừng",
  Play: "Phát",
  Playback: "Phát lại",
  PiP: "PiP",
  Quality: "Chất lượng",
  Replay: "Xem lại",
  Reset: "Đặt lại",
  "Seek Backward": "Tua lùi 10 giây",
  "Seek Forward": "Tua nhanh 10 giây",
  Seek: "Tua",
  Settings: "Cài đặt phát",
  "Skip To Live": "Đến phần trực tiếp",
  Speed: "Tốc độ",
  Size: "Cỡ chữ",
  Color: "Màu sắc",
  Opacity: "Độ mờ",
  Shadow: "Đổ bóng",
  Text: "Văn bản",
  "Text Background": "Màu nền văn bản",
  Track: "Bản nhạc",
  Unmute: "Bật tiếng",
  Volume: "Âm lượng",
};

export const DEFAULT_VTT_CONTENT = `WEBVTT

00:00.000 --> 02:00.000
Chào mừng các em học sinh đến với bài học trực tuyến trên DMKLab Education!

02:00.000 --> 05:30.000
Khái niệm cốt lõi: Tử số chỉ số phần lấy ra, Mẫu số chỉ tổng số phần bằng nhau được chia.

05:30.000 --> 08:00.000
Ví dụ thực tế: Cắt bánh Pizza thành 4 phần bằng nhau, lấy 1 phần tức là 1/4 chiếc bánh.

08:00.000 --> 12:00.000
Quy tắc vàng: Khi nhân hoặc chia cả tử và mẫu với cùng một số tự nhiên khác 0, ta được phân số bằng phân số đã cho.`;

// Định dạng thời gian WebVTT: hh:mm:ss.mmm
export const formatVttTime = (seconds: number): string => {
  const safeSec = Math.max(0, isNaN(seconds) || !isFinite(seconds) ? 0 : seconds);
  const h = Math.floor(safeSec / 3600);
  const m = Math.floor((safeSec % 3600) / 60);
  const s = Math.floor(safeSec % 60);
  const ms = Math.floor((safeSec % 1) * 1000);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(3, "0")}`;
};

// Tạo file WebVTT cho các mốc chương học
export const generateChaptersVtt = (
  chapters: VidstackChapter[],
  duration = 3600
): string => {
  if (!chapters || !Array.isArray(chapters) || chapters.length === 0) return "";
  const validChapters = chapters.filter(
    (c): c is VidstackChapter =>
      Boolean(c) && typeof c.time === "number" && !isNaN(c.time) && isFinite(c.time)
  );
  if (validChapters.length === 0) return "";
  const sorted = [...validChapters].sort((a, b) => a.time - b.time);
  const safeDuration = Math.max(0, isNaN(duration) || !isFinite(duration) ? 3600 : duration);
  let vtt = "WEBVTT\n\n";
  for (let i = 0; i < sorted.length; i++) {
    const start = Math.max(0, sorted[i].time);
    let end: number;
    if (i < sorted.length - 1) {
      end = Math.max(start + 1, sorted[i + 1].time);
    } else {
      end = safeDuration > start ? safeDuration : start + 300;
    }
    const title = sorted[i].title || `Chương ${i + 1}`;
    vtt += `${formatVttTime(start)} --> ${formatVttTime(end)}\n${title}\n\n`;
  }
  return vtt;
};

// Định dạng hiển thị phút:giây mm:ss
export const formatDisplayTime = (secs: number): string => {
  const safeSec = Math.max(0, isNaN(secs) || !isFinite(secs) ? 0 : Math.floor(secs));
  const m = Math.floor(safeSec / 60);
  const s = Math.floor(safeSec % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};
