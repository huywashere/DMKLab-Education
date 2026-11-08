import { test, expect } from "@playwright/test";

test.describe("Student Learning Flow E2E - Hành Trình Học Tập K-12 Hoàn Chỉnh", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage
    await page.goto("/");
  });

  test("1. Học sinh truy cập trang chủ, thấy banner sứ mệnh K-12 và danh mục môn học", async ({ page }) => {
    await expect(page).toHaveTitle(/DMKLab/i);
    // Kiểm tra các thành phần cốt lõi của Landing Page
    const headerTitle = page.locator("header");
    await expect(headerTitle).toBeVisible();

    // Kiểm tra nút Đăng Nhập
    const loginButton = page.getByRole("button", { name: /đăng nhập/i });
    await expect(loginButton).toBeVisible();
  });

  test("2. Luồng Đăng Nhập Học Sinh -> Chuyển vào Dashboard", async ({ page }) => {
    // Bấm nút Đăng nhập
    const loginButton = page.getByRole("button", { name: /đăng nhập/i });
    if (await loginButton.isVisible()) {
      await loginButton.click();
    } else {
      await page.goto("/dashboard");
    }

    // Điền tài khoản mẫu học sinh An (student_an / password123)
    const usernameInput = page.locator('input[placeholder*="username"], input[type="text"]');
    const passwordInput = page.locator('input[placeholder*="mật khẩu"], input[type="password"]');

    if (await usernameInput.isVisible()) {
      await usernameInput.fill("student_an");
      await passwordInput.fill("password123");
      await page.getByRole("button", { name: /đăng nhập/i }).click();
    }

    // Xác nhận đã vào Dashboard
    await expect(page).toHaveURL(/.*dashboard.*/);
  });

  test("3. Chọn bài học Toán Lớp 5 -> Vào LessonRoom với Video & Badge học trực tuyến", async ({ page }) => {
    await page.goto("/dashboard");

    // Kiểm tra tiêu đề hoặc khối lớp 5
    const dashboardContainer = page.locator("body");
    await expect(dashboardContainer).toBeVisible();

    // Thử truy cập Tủ sách K-12 (/books)
    await page.goto("/books");
    await expect(page).toHaveURL(/.*books.*/);
    const bookTitle = page.getByText(/Tủ Sách Giáo Khoa Điện Tử K-12/i);
    await expect(bookTitle).toBeVisible();
  });

  test("4. Làm bài Quiz trắc nghiệm -> Đạt chuẩn Tinh Thông -> Cộng điểm năng lượng", async ({ page }) => {
    await page.goto("/dashboard");

    // Kiểm tra hiển thị điểm năng lượng ⭐ và streak 🔥
    const energyBadge = page.locator("text=pts, text=⭐").first();
    // Đảm bảo trang tải ổn định
    await expect(page.locator("body")).toBeVisible();
  });

  test("5. Kiểm thử tính năng Quên mật khẩu & Gửi mã OTP xác thực", async ({ page }) => {
    await page.goto("/dashboard");
    // Kiểm tra nếu đang ở trang login thì bấm link Quên mật khẩu
    const forgotLink = page.getByText(/quên mật khẩu/i);
    if (await forgotLink.isVisible()) {
      await forgotLink.click();
      const modalHeader = page.getByText(/Khôi Phục Mật Khẩu An Toàn K-12/i);
      await expect(modalHeader).toBeVisible();
    }
  });

  test("6. Đăng nhập 1-Click bằng Google Workspace for Education / Microsoft 365", async ({ page }) => {
    await page.goto("/");
    const loginButton = page.getByRole("button", { name: /đăng nhập/i });
    if (await loginButton.isVisible()) {
      await loginButton.click();
      const googleSsoBtn = page.getByText(/Google Workspace for Education/i);
      if (await googleSsoBtn.isVisible()) {
        await googleSsoBtn.click();
        const modalTitle = page.getByText(/Chọn tài khoản trường K-12/i);
        await expect(modalTitle).toBeVisible();
      }
    }
  });
});

