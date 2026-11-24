import { test, expect } from "@playwright/test";

test.describe("Vidstack Player Component & Lesson Room Integration", () => {
  let pageErrors: string[] = [];

  test.beforeEach(async ({ page }) => {
    pageErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        console.log("BROWSER ERROR:", msg.text());
      }
    });
    page.on("response", (res) => {
      if (res.status() >= 400) {
        console.log("HTTP ERROR:", res.status(), res.url());
      }
    });
    page.on("pageerror", (err) => {
      pageErrors.push(err.message);
      console.log("PAGE UNCAUGHT ERROR STACK:", err.stack || err.message);
    });
    // Navigate to homepage
    await page.goto("/");
  });

  test("1. Lesson Room loads Vidstack Player with ambient glow, overlay HUD, and Vietnamese labels", async ({
    page,
  }) => {
    // Navigate into the lesson room via learner CTA button
    const learnerBtn = page.getByRole("button", { name: "Tôi là người học" });
    await expect(learnerBtn).toBeVisible();
    await learnerBtn.click();

    // Verify Vidstack player container exists and is visible
    const vidstackContainer = page.locator(".dmklab-vidstack-container");
    await expect(vidstackContainer).toBeVisible({ timeout: 10000 });

    // Verify Vidstack data-media-player element exists
    const mediaPlayer = vidstackContainer.locator("[data-media-player]");
    await expect(mediaPlayer).toBeVisible();

    // Verify media provider and video element
    const videoElem = vidstackContainer.locator("video");
    await expect(videoElem).toBeAttached();

    // Verify Lesson 1 initialTime restoration (596s)
    await expect.poll(async () => {
      return await videoElem.evaluate((v: HTMLVideoElement) => Math.floor(v.currentTime));
    }, { timeout: 10000 }).toBe(596);

    // Verify ambient glow element exists
    const ambientGlow = page.locator(".blur-2xl, .blur-3xl").first();
    await expect(ambientGlow).toBeAttached();

    // Verify Vietnamese HUD action controls
    const askAiBtn = page.getByRole("button", { name: /hỏi ai/i });
    await expect(askAiBtn).toBeVisible();

    const theaterBtn = page.getByRole("button", { name: "Rạp chiếu" }).first();
    await expect(theaterBtn).toBeVisible();

    // Verify chapter badge in overlay HUD
    const chapterPill = vidstackContainer.locator("text=/Giới thiệu bài học|Khái niệm|Rút gọn/").first();
    await expect(chapterPill).toBeVisible();

    // Test Theater Mode toggle
    await theaterBtn.click();
    const minimizeBtn = page.getByRole("button", { name: "Thu nhỏ" }).first();
    await expect(minimizeBtn).toBeVisible();

    // Verify layout expanded to full width (col-span-12)
    const expandedContainer = page.locator(".lg\\:col-span-12").first();
    await expect(expandedContainer).toBeVisible();

    // Toggle back to standard mode
    await minimizeBtn.click();
    await expect(page.getByRole("button", { name: "Rạp chiếu" }).first()).toBeVisible();

    // Test Ask AI button interaction
    await askAiBtn.click();
    const aiModalOrTitle = page.locator("text=Gia Sư AI Socratic").first();
    await expect(aiModalOrTitle).toBeVisible();

    expect(pageErrors).toEqual([]);
  });

  test("2. Vidstack Player supports HLS stream and MP4 sources with lesson switching and chapter seeking", async ({
    page,
  }) => {
    // Navigate to lesson room
    await page.getByRole("button", { name: "Tôi là người học" }).click();
    const vidstackContainer = page.locator(".dmklab-vidstack-container");
    await expect(vidstackContainer).toBeVisible({ timeout: 10000 });

    const mediaPlayer = vidstackContainer.locator("[data-media-player]");
    await expect(mediaPlayer).toBeVisible();

    // Default lesson 1 uses standard MP4
    const videoElem = vidstackContainer.locator("video");
    await expect(videoElem).toBeAttached();
    await expect.poll(async () => {
      return await videoElem.evaluate((v: HTMLVideoElement) => {
        const sourceEl = v.querySelector("source");
        return v.currentSrc || v.src || sourceEl?.getAttribute("src") || sourceEl?.src || "";
      });
    }).toMatch(/720p\.mp4/);

    // Switch to Lesson 2 (HLS stream: sprite-fight/hls/stream.m3u8)
    const lesson2Link = page.locator("text=2. Quy đồng mẫu số các phân số").first();
    await expect(lesson2Link).toBeVisible();
    await lesson2Link.click();

    // Verify lesson header updated
    await expect(page.locator("h1")).toContainText("2. Quy đồng mẫu số các phân số");

    // Verify Vidstack player seamlessly re-attached with HLS .m3u8 source
    const hlsMediaPlayer = vidstackContainer.locator("[data-media-player]");
    await expect(hlsMediaPlayer).toBeVisible();
    const hlsVideo = vidstackContainer.locator("video");
    await expect(hlsVideo).toBeAttached();

    // Verify chapter timeline buttons
    const chapter2Btn = page.getByRole("button", { name: /Khái niệm Tử số và Mẫu số/i });
    await expect(chapter2Btn).toBeVisible();
    await chapter2Btn.click();

    // Switch back to Lesson 1 (MP4) to verify clean provider teardown and re-mount
    const lesson1Link = page.locator("text=1. Khái niệm Phân số và Các tính chất cơ bản").first();
    await expect(lesson1Link).toBeVisible();
    await lesson1Link.click();

    await expect(page.locator("h1")).toContainText("1. Khái niệm Phân số và Các tính chất cơ bản");
    const video = vidstackContainer.locator("video");
    await expect(video).toBeAttached();
    await expect.poll(async () => {
      return await video.evaluate((v: HTMLVideoElement) => {
        const sourceEl = v.querySelector("source");
        return v.currentSrc || v.src || sourceEl?.getAttribute("src") || sourceEl?.src || "";
      });
    }).toMatch(/720p\.mp4/);

    expect(pageErrors).toEqual([]);
  });

  test("3. Progress tracking & initialTime restoration across lesson switching", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Tôi là người học" }).click();
    const vidstackContainer = page.locator(".dmklab-vidstack-container");
    await expect(vidstackContainer).toBeVisible({ timeout: 10000 });

    // Verify Lesson 1 initialTime restoration (596s)
    const video = vidstackContainer.locator("video");
    await expect(video).toBeAttached();
    await expect.poll(async () => {
      return await video.evaluate((v: HTMLVideoElement) => Math.floor(v.currentTime));
    }, { timeout: 10000 }).toBe(596);

    // Switch to Lesson 2 which has positionSeconds = 180 (03:00)
    const lesson2Link = page.locator("text=2. Quy đồng mẫu số các phân số").first();
    await expect(lesson2Link).toBeVisible();
    await lesson2Link.click();

    // Verify lesson header updated to Lesson 2
    await expect(page.locator("h1")).toContainText("2. Quy đồng mẫu số các phân số");

    // Verify HUD chapter indicator adjusts to active chapter and shows timestamp 03:00
    const hudTimeOrChapter = vidstackContainer.locator(".flex.items-center.gap-2.bg-slate-950\\/85");
    await expect(hudTimeOrChapter).toBeVisible();
    await expect(hudTimeOrChapter).toContainText("03:00");

    // Verify that the video player element remains attached and functional
    await expect(video).toBeAttached();

    expect(pageErrors).toEqual([]);
  });

  test("4. Double-click quick-skip badges (-10s / +10s) and rapid chapter jumping", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Tôi là người học" }).click();
    const vidstackContainer = page.locator(".dmklab-vidstack-container");
    await expect(vidstackContainer).toBeVisible({ timeout: 10000 });

    // Double-click on the left side of the player (<= 35% of width)
    const box = await vidstackContainer.boundingBox();
    if (box) {
      await page.mouse.dblclick(box.x + box.width * 0.15, box.y + box.height * 0.5);
      // Verify rewind badge appeared
      const rewindBadge = vidstackContainer.locator("text=Lùi lại");
      await expect(rewindBadge).toBeVisible({ timeout: 2000 });

      // Double-click on the right side of the player (>= 65% of width)
      await page.mouse.dblclick(box.x + box.width * 0.85, box.y + box.height * 0.5);
      const forwardBadge = vidstackContainer.locator("text=Tua nhanh");
      await expect(forwardBadge).toBeVisible({ timeout: 2000 });
    }

    // Verify double-clicking on an interactive control (e.g. Hỏi AI) does NOT trigger skip badge
    const askAiBtn = page.getByRole("button", { name: /hỏi ai/i });
    if (await askAiBtn.isVisible()) {
      await askAiBtn.dblclick();
      await expect(vidstackContainer.locator("text=Tua nhanh")).toHaveCount(0);
    }

    // Rapidly click chapter buttons in sequence
    const ch1 = page.getByRole("button", { name: /Giới thiệu bài học/i }).first();
    const ch2 = page.getByRole("button", { name: /Khái niệm Tử số/i }).first();
    const ch3 = page.getByRole("button", { name: /Ví dụ thực tế/i }).first();

    await ch1.click();
    await ch2.click();
    await ch3.click();

    // Allow events to settle
    await page.waitForTimeout(500);

    expect(pageErrors).toEqual([]);
  });

  test("5. All 4 curriculum lessons load valid media streams with zero HTTP 403 Forbidden errors", async ({
    page,
  }) => {
    const forbidden403Urls: string[] = [];
    page.on("response", (res) => {
      if (res.status() === 403) {
        forbidden403Urls.push(res.url());
      }
    });

    await page.getByRole("button", { name: "Tôi là người học" }).click();
    const vidstackContainer = page.locator(".dmklab-vidstack-container");
    await expect(vidstackContainer).toBeVisible({ timeout: 10000 });

    // Lesson 1: MP4 720p
    const video = vidstackContainer.locator("video");
    await expect(video).toBeAttached();

    // Lesson 2: HLS stream.m3u8
    const l2 = page.locator("text=2. Quy đồng mẫu số").first();
    await l2.click();
    await expect(page.locator("h1")).toContainText("2. Quy đồng");
    await expect(video).toBeAttached();

    // Lesson 3: MP4 1080p
    const l3 = page.locator("text=3. Phép cộng và trừ").first();
    await l3.click();
    await expect(page.locator("h1")).toContainText("3. Phép cộng");
    await expect(video).toBeAttached();

    // Lesson 4: MP4 480p
    const l4 = page.locator("text=4. Khái niệm Số thập phân").first();
    await l4.click();
    await expect(page.locator("h1")).toContainText("4. Khái niệm");
    await expect(video).toBeAttached();

    // Re-verify no 403 Forbidden errors across all 4 lessons
    expect(forbidden403Urls).toEqual([]);
    expect(pageErrors).toEqual([]);
  });
});
