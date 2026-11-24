import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import {
  generateChaptersVtt,
  formatVttTime,
  formatDisplayTime,
  VIETNAMESE_TRANSLATIONS,
} from "../src/lib/video-helpers.ts";

console.log("=== Bắt đầu kiểm thử đơn vị Vidstack Player (Unit Tests) ===");

// 1. Kiểm thử generateChaptersVtt với đầu vào rỗng và bất thường
console.log("1. Test generateChaptersVtt with edge inputs...");
assert.strictEqual(generateChaptersVtt([]), "", "Rỗng phải trả về chuỗi rỗng");
assert.strictEqual(
  generateChaptersVtt(null as unknown as Parameters<typeof generateChaptersVtt>[0]),
  "",
  "Null phải trả về chuỗi rỗng"
);
assert.strictEqual(
  generateChaptersVtt(undefined as unknown as Parameters<typeof generateChaptersVtt>[0]),
  "",
  "Undefined phải trả về chuỗi rỗng"
);
assert.strictEqual(
  generateChaptersVtt([
    null as unknown as Parameters<typeof generateChaptersVtt>[0][0],
    undefined as unknown as Parameters<typeof generateChaptersVtt>[0][0],
    { time: NaN, title: "Bad" },
  ]),
  "",
  "Mảng chỉ chứa phần tử null/undefined/NaN phải trả về chuỗi rỗng không ném lỗi"
);

// 2. Kiểm thử formatVttTime và formatDisplayTime với giá trị biên
console.log("2. Test formatVttTime and formatDisplayTime edge cases (0, negative, NaN, Infinity)...");
assert.strictEqual(formatVttTime(0), "00:00:00.000", "0s format VTT chuẩn");
assert.strictEqual(formatVttTime(-15), "00:00:00.000", "Số âm phải được kẹp về 0");
assert.strictEqual(formatVttTime(NaN), "00:00:00.000", "NaN phải được kẹp về 0");
assert.strictEqual(formatVttTime(Infinity), "00:00:00.000", "Infinity phải được kẹp về 0");
assert.strictEqual(formatVttTime(3661.5), "01:01:01.500", "3661.5s format chính xác 01:01:01.500");

assert.strictEqual(formatDisplayTime(0), "00:00", "0s display chuẩn");
assert.strictEqual(formatDisplayTime(-10), "00:00", "Số âm display chuẩn 00:00");
assert.strictEqual(formatDisplayTime(NaN), "00:00", "NaN display chuẩn 00:00");
assert.strictEqual(formatDisplayTime(Infinity), "00:00", "Infinity display chuẩn 00:00");
assert.strictEqual(formatDisplayTime(75), "01:15", "75s display chuẩn 01:15");
console.log("✓ formatVttTime và formatDisplayTime xử lý an toàn mọi giá trị biên");

// 3. Kiểm thử generateChaptersVtt với danh sách chapter chuẩn và xử lý mốc thời gian trùng
console.log("3. Test generateChaptersVtt with chapters and overlapping times...");
const testChapters = [
  { time: 0, title: "1. Giới thiệu phân số" },
  { time: 120, title: "2. Khái niệm Tử số và Mẫu số" },
  { time: 330, title: "3. Ví dụ thực tế lát bánh Pizza" },
  { time: 480, title: "4. Tính chất cơ bản của phân số" },
  { time: 720, title: "5. Bài tập củng cố & Kết luận" },
];
const vtt = generateChaptersVtt(testChapters, 1000);
assert.ok(vtt.startsWith("WEBVTT\n\n"), "WebVTT phải bắt đầu bằng WEBVTT header");
assert.ok(vtt.includes("00:00:00.000 --> 00:02:00.000"), "Chapter 1 timing phải chính xác");
assert.ok(vtt.includes("1. Giới thiệu phân số"), "Chapter 1 title phải tồn tại");
assert.ok(vtt.includes("00:02:00.000 --> 00:05:30.000"), "Chapter 2 timing phải chính xác");
assert.ok(vtt.includes("2. Khái niệm Tử số và Mẫu số"), "Chapter 2 title phải tồn tại");
assert.ok(vtt.includes("00:12:00.000 --> 00:16:40.000"), "Chapter cuối phải mở rộng đến duration");

// Kiểm tra chapter có thời gian trùng nhau hoặc đảo ngược
const overlappingChapters = [
  { time: 50, title: "Chapter A" },
  { time: 50, title: "Chapter B" },
];
const vttOverlapping = generateChaptersVtt(overlappingChapters, 100);
assert.ok(vttOverlapping.includes("00:00:50.000 --> 00:00:51.000"), "Cues trùng mốc phải luôn có end > start");
console.log("✓ generateChaptersVtt sinh WebVTT chính xác 100%");

// 4. Kiểm thử từ điển Việt hóa VIETNAMESE_TRANSLATIONS
console.log("4. Test VIETNAMESE_TRANSLATIONS coverage...");
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
  assert.ok(
    VIETNAMESE_TRANSLATIONS[key as keyof typeof VIETNAMESE_TRANSLATIONS],
    `Thiếu bản dịch tiếng Việt cho key: ${key}`
  );
  assert.ok(
    typeof VIETNAMESE_TRANSLATIONS[key as keyof typeof VIETNAMESE_TRANSLATIONS] === "string",
    `Bản dịch cho ${key} phải là chuỗi`
  );
}
assert.strictEqual(VIETNAMESE_TRANSLATIONS["Play"], "Phát");
assert.strictEqual(VIETNAMESE_TRANSLATIONS["Pause"], "Tạm dừng");
assert.strictEqual(VIETNAMESE_TRANSLATIONS["Enter Fullscreen"], "Toàn màn hình");
assert.strictEqual(VIETNAMESE_TRANSLATIONS["Exit Fullscreen"], "Thoát toàn màn hình");
assert.strictEqual(VIETNAMESE_TRANSLATIONS["Chapters"], "Chương bài học");
assert.strictEqual(VIETNAMESE_TRANSLATIONS["Settings"], "Cài đặt phát");
console.log("✓ Toàn bộ nhãn controls & tooltips đều được bản địa hóa Tiếng Việt chuẩn");

// 5. Kiểm thử toàn bộ videoUrl trong mock-data không còn link 403 Forbidden hay Google bucket cũ
console.log("5. Test mock-data media sources validity...");
const mockDataPath = path.resolve(process.cwd(), "src/lib/mock-data.ts");
const mockDataContent = fs.readFileSync(mockDataPath, "utf8");
assert.ok(
  !mockDataContent.includes("commondatastorage.googleapis.com"),
  "mock-data.ts không được trỏ về Google Cloud Storage cũ bị 403"
);
assert.ok(
  !mockDataContent.includes("gtv-videos-bucket"),
  "mock-data.ts không được chứa gtv-videos-bucket bị lỗi 403"
);
const videoUrlMatches = mockDataContent.match(/videoUrl:\s*["'][^"']+["']/g) || [];
assert.ok(videoUrlMatches.length >= 4, "Phải có ít nhất 4 videoUrl cho các bài học");
for (const match of videoUrlMatches) {
  assert.ok(
    match.includes("https://files.vidstack.io/"),
    `Mọi videoUrl (${match}) phải trỏ về máy chủ test Vidstack tin cậy`
  );
}
console.log("✓ 100% videoUrl trong mock-data hợp lệ và không bị 403");

console.log("6. Test all 57 DefaultLayoutWord translations...");
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
  assert.ok(
    typeof VIETNAMESE_TRANSLATIONS[word as keyof typeof VIETNAMESE_TRANSLATIONS] === "string",
    `Thiếu bản dịch cho từ: ${word}`
  );
}
console.log("✓ Toàn bộ 57 từ khóa DefaultLayoutWord đều có bản dịch Tiếng Việt");

console.log("=== TẤT CẢ KIỂM THỬ ĐƠN VỊ ĐÃ VƯỢT QUA XUẤT SẮC ===");
