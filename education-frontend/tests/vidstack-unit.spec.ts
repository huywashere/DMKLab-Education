import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import {
  generateChaptersVtt,
  formatVttTime,
  formatDisplayTime,
  VIETNAMESE_TRANSLATIONS,
} from "../src/lib/video-helpers";

test.describe("Vidstack Player Helpers & Unit Tests", () => {
  test("1. generateChaptersVtt handles empty, null, undefined, and malformed inputs gracefully", () => {
    expect(generateChaptersVtt([])).toBe("");
    expect(generateChaptersVtt(null as unknown as Parameters<typeof generateChaptersVtt>[0])).toBe("");
    expect(generateChaptersVtt(undefined as unknown as Parameters<typeof generateChaptersVtt>[0])).toBe("");
    expect(
      generateChaptersVtt([
        null as unknown as Parameters<typeof generateChaptersVtt>[0][0],
        undefined as unknown as Parameters<typeof generateChaptersVtt>[0][0],
        { time: NaN, title: "Bad" },
      ])
    ).toBe("");
  });

  test("2. formatVttTime and formatDisplayTime handle boundary conditions safely", () => {
    expect(formatVttTime(0)).toBe("00:00:00.000");
    expect(formatVttTime(-15)).toBe("00:00:00.000");
    expect(formatVttTime(NaN)).toBe("00:00:00.000");
    expect(formatVttTime(Infinity)).toBe("00:00:00.000");
    expect(formatVttTime(3661.5)).toBe("01:01:01.500");

    expect(formatDisplayTime(0)).toBe("00:00");
    expect(formatDisplayTime(-10)).toBe("00:00");
    expect(formatDisplayTime(NaN)).toBe("00:00");
    expect(formatDisplayTime(Infinity)).toBe("00:00");
    expect(formatDisplayTime(75)).toBe("01:15");
  });

  test("3. generateChaptersVtt generates valid WebVTT cues with monotonic intervals", () => {
    const chapters = [
      { time: 0, title: "1. Giới thiệu" },
      { time: 120, title: "2. Khái niệm" },
      { time: 330, title: "3. Ví dụ" },
    ];
    const vtt = generateChaptersVtt(chapters, 600);
    expect(vtt.startsWith("WEBVTT\n\n")).toBe(true);
    expect(vtt).toContain("00:00:00.000 --> 00:02:00.000\n1. Giới thiệu");
    expect(vtt).toContain("00:02:00.000 --> 00:05:30.000\n2. Khái niệm");
    expect(vtt).toContain("00:05:30.000 --> 00:10:00.000\n3. Ví dụ");

    // Duplicate timestamps
    const dup = [
      { time: 60, title: "Part 1" },
      { time: 60, title: "Part 2" },
    ];
    const vttDup = generateChaptersVtt(dup, 120);
    expect(vttDup).toContain("00:01:00.000 --> 00:01:01.000\nPart 1");
  });

  test("4. VIETNAMESE_TRANSLATIONS dictionary covers 100% of required layout controls", () => {
    const requiredKeys = [
      "Play",
      "Pause",
      "Replay",
      "Mute",
      "Unmute",
      "Volume",
      "Seek",
      "Seek Backward",
      "Seek Forward",
      "Settings",
      "Speed",
      "Quality",
      "Captions",
      "Chapters",
      "Enter Fullscreen",
      "Exit Fullscreen",
      "Enter PiP",
      "Exit PiP",
      "LIVE",
      "Loop",
      "Normal",
      "Accessibility",
      "Announcements",
    ];

    for (const key of requiredKeys) {
      expect(VIETNAMESE_TRANSLATIONS[key as keyof typeof VIETNAMESE_TRANSLATIONS]).toBeTruthy();
      expect(
        typeof VIETNAMESE_TRANSLATIONS[key as keyof typeof VIETNAMESE_TRANSLATIONS]
      ).toBe("string");
    }

    expect(VIETNAMESE_TRANSLATIONS["Play"]).toBe("Phát");
    expect(VIETNAMESE_TRANSLATIONS["Pause"]).toBe("Tạm dừng");
    expect(VIETNAMESE_TRANSLATIONS["Chapters"]).toBe("Chương bài học");
    expect(VIETNAMESE_TRANSLATIONS["Settings"]).toBe("Cài đặt phát");
  });

  test("5. mock-data media sources point to valid Vidstack test endpoints without 403 errors", () => {
    const mockDataPath = path.resolve(process.cwd(), "src/lib/mock-data.ts");
    const mockDataContent = fs.readFileSync(mockDataPath, "utf8");
    expect(mockDataContent).not.toContain("commondatastorage.googleapis.com");
    expect(mockDataContent).not.toContain("gtv-videos-bucket");

    const videoUrlMatches = mockDataContent.match(/videoUrl:\s*["'][^"']+["']/g) || [];
    expect(videoUrlMatches.length).toBeGreaterThanOrEqual(4);
    for (const match of videoUrlMatches) {
      expect(match).toContain("https://files.vidstack.io/");
    }
  });

  test("6. VIETNAMESE_TRANSLATIONS dictionary covers all 57 DefaultLayoutWord keys", () => {
    const allWords = [
      "Announcements", "Accessibility", "AirPlay", "Audio", "Auto", "Boost",
      "Captions", "Caption Styles", "Captions look like this", "Chapters",
      "Closed-Captions Off", "Closed-Captions On", "Connected", "Continue",
      "Connecting", "Default", "Disabled", "Disconnected", "Display Background",
      "Download", "Enter Fullscreen", "Enter PiP", "Exit Fullscreen", "Exit PiP",
      "Font", "Family", "Fullscreen", "Google Cast", "Keyboard Animations",
      "LIVE", "Loop", "Mute", "Normal", "Off", "Pause", "Play", "Playback",
      "PiP", "Quality", "Replay", "Reset", "Seek Backward", "Seek Forward",
      "Seek", "Settings", "Skip To Live", "Speed", "Size", "Color", "Opacity",
      "Shadow", "Text", "Text Background", "Track", "Unmute", "Volume"
    ];
    for (const word of allWords) {
      expect(VIETNAMESE_TRANSLATIONS[word as keyof typeof VIETNAMESE_TRANSLATIONS]).toBeDefined();
      expect(
        typeof VIETNAMESE_TRANSLATIONS[word as keyof typeof VIETNAMESE_TRANSLATIONS]
      ).toBe("string");
    }
  });
});
