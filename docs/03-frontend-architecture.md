# 🎨 03. CHI TIẾT KIẾN TRÚC FRONTEND (NEXT.JS 16 & REACT 19)

> **Mã nguồn**: Thư mục `education-frontend`  
> **Framework**: Next.js 16.4.5 (App Router, Turbopack, Partial Prerendering)  
> **Thư viện lõi**: React 19, TypeScript 5, Tailwind CSS  
> **Nguyên tắc thiết kế**: Solid Enterprise UI • Chuẩn WCAG 2.1 • Zero Glass Blur • 60fps  

---

## 1. CẤU TRÚC THƯ MỤC NGUỒN (FEATURE-DRIVEN ARCHITECTURE)

Dự án Frontend được tổ chức theo kiến trúc **Feature-Driven (Hướng tính năng)**, giúp cô lập mã nguồn của từng nghiệp vụ, dễ dàng mở rộng và bảo trì:

```
education-frontend/src/
├── app/                                # Next.js 16 App Router Routes
│   ├── layout.tsx                      # Root Layout (Theme & Global Context Providers)
│   ├── page.tsx                        # Trang chủ SPA Controller đa góc nhìn
│   ├── not-found.tsx                   # Trang 404 thân thiện học sinh K-12
│   ├── error.tsx                       # React Error Boundary bắt lỗi runtime giao diện
│   ├── books/page.tsx                  # Tuyến đường chuyên dụng: Tủ sách & E-Reader Studio
│   ├── admin/page.tsx                  # Tuyến đường chuyên dụng: Cổng quản trị Admin CMS
│   ├── dashboard/page.tsx              # Bảng điều khiển học tập cá nhân hóa của học sinh
│   ├── articles/page.tsx               # Thư viện bài viết sư phạm & Cẩm nang học tập
│   ├── about/page.tsx                  # Giới thiệu sứ mệnh DMKLab Education
│   └── contact/page.tsx                # Liên hệ & Tư vấn phụ huynh
│
├── components/                         # Các UI Components dùng chung toàn ứng dụng
│   ├── Header.tsx                      # Thanh điều hướng Navbar chính (chuyển lớp, vai trò)
│   ├── Footer.tsx                      # Chân trang chuẩn nhận diện thương hiệu
│   ├── PlyrVideoPlayer.tsx             # Trình phát video bài giảng HLS chuyên nghiệp
│   └── ui/                             # Hệ thống UI nguyên tử (Buttons, Badges, Cards)
│
├── features/                           # Các Module tính năng nghiệp vụ độc lập
│   ├── student/                        # Phân hệ Học sinh:
│   │   ├── SocraticChatbot.tsx         # Gia sư AI Socratic 24/7 (5 chế độ, KaTeX, Audio)
│   │   ├── LessonRoom.tsx              # Phòng học tập tương tác (Video HLS, Trắc nghiệm, Ghi chú)
│   │   ├── StudentDashboard.tsx        # Bảng thành tích học tập, Chuỗi Streak, Điểm năng lượng
│   │   └── HeroSection.tsx             # Banner chào mừng trực quan theo khối lớp
│   │
│   ├── books/                          # Phân hệ Tủ sách & E-Reader Studio:
│   │   ├── BookReaderPage.tsx          # Trình đọc SGK đa chế độ (Reader, Slide, Mindmap)
│   │   └── book-data.ts                # Dữ liệu SGK K-12 chuẩn hóa (Toán, Lý, Hóa GDPT 2018)
│   │
│   ├── admin/                          # Phân hệ Quản trị viên & Giáo viên:
│   │   └── AdminDashboard.tsx          # Báo cáo KPI, Giám sát token AI, Quản lý bài học, Audit
│   │
│   ├── profile/                        # Phân hệ Hồ sơ người dùng:
│   │   └── UserProfilePage.tsx         # Cập nhật thông tin, Đổi mật khẩu, Lịch sử học
│   │
│   └── auth/                           # Phân hệ Định danh:
│       ├── LoginPage.tsx               # Đăng nhập hệ thống (Học sinh, Giáo viên, Admin)
│       └── RegisterPage.tsx            # Đăng ký tài khoản học sinh K-12
│
├── lib/                                # Các tiện ích lõi và tầng giao tiếp dữ liệu
│   ├── api.ts                          # HTTP Client (Bọc Bearer JWT, Rate Limit Toast, SSE Stream)
│   ├── mock-data.ts                    # Dữ liệu K-12 mẫu và người dùng kiểm thử
│   ├── theme/ThemeContext.tsx          # Quản lý giao diện Sáng / Tối (Light / Dark Solid)
│   └── bookmarks/BookmarksContext.tsx  # Lưu trữ bài học yêu thích & Ghi chú vào LocalStorage
│
└── types/                              # Định nghĩa kiểu dữ liệu TypeScript (Domain Interfaces)
    └── index.ts                        # User, Grade, Subject, Lesson, Quiz, AI Responses
```

---

## 2. QUY CHUẨN THIẾT KẾ SOLID ENTERPRISE UI (ZERO GLASS BLUR)

Khác với các giao diện sử dụng hiệu ứng làm mờ kính (`backdrop-blur`) thường gây giảm tốc độ khung hình và mờ chữ trên màn hình độ phân giải thường, DMKLab áp dụng **100% Solid Color Surface**:

### 2.1 Bảng màu đặc doanh nghiệp (Solid Color Palette)
- **Màu nền Dark Mode**: Bề mặt đặc `#0B1528` (Xanh hải quân đậm) và `#070F1E` (Xanh đen thẳm), mang lại cảm giác tập trung và bảo vệ thị lực học sinh khi học buổi tối.
- **Màu nền Light Mode**: Màu trắng tinh `#FFFFFF` kết hợp viền xám nhạt `#E2E8F0` và nền thẻ `#F8FAFC`.
- **Màu chủ đạo (Primary Accent)**: Xanh dương hoàng gia `#1865F2` (kích thích sự chú ý và tin cậy).
- **Màu thành công / Điểm thưởng**: Xanh lục bảo `#14BF96` / `#10B981` (đại diện cho sự tiến bộ và điểm Energy Points).
- **Màu cảnh báo sư phạm**: Vàng hổ phách `#F59E0B` (nhắc nhở điểm ngộ nhận và rào cản chủ đề).

### 2.2 Tối ưu hóa hiệu năng 60fps & Khả năng tiếp cận WCAG 2.1
- **Không Glass Blur**: Trình duyệt không phải tính toán lớp lọc làm mờ phần cứng trên GPU (`filter: blur(...)`), giúp giao diện chuyển động mượt mà 60fps trên cả điện thoại và máy tính bảng học đường.
- **Độ tương phản cao**: Tỉ lệ tương phản chữ trên nền luôn đạt trên **4.5:1** (chuẩn AA) và **7:1** (chuẩn AAA) cho văn bản đọc sách giáo khoa.

---

## 3. BỘ GÕ VÀ TRÌNH DIỄN TOÁN HỌC CHUẨN KATEX (KATEX MATH TYPOGRAPHY)

Toàn bộ công thức toán học từ SGK và câu trả lời của AI đều được render trực tiếp thông qua **KaTeX**:
- **Cú pháp nội dòng (Inline Math)**: Bọc trong cặp `$ ... $` (ví dụ: `$x^2 - 4 = 0$`, `$\frac{a}{b}$`, `$\sqrt{3}$`).
- **Cú pháp khối hiển thị (Block Math)**: Bọc trong cặp `$$ ... $$` (ví dụ: `$$a^2 = b^2 + c^2 - 2bc \cos A$$`).

Hàm xử lý `renderFormattedContent` trong `SocraticChatbot.tsx`:
```tsx
const renderFormattedContent = (content: string) => {
  // Tách văn bản dựa trên các đoạn bọc dấu $...$ hoặc $$...$$
  const parts = content.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g);
  return parts.map((part, index) => {
    if (part.startsWith("$$") && part.endsWith("$$")) {
      const latex = part.slice(2, -2).trim();
      return <KaTeXBlock key={index} math={latex} displayMode={true} />;
    } else if (part.startsWith("$") && part.endsWith("$")) {
      const latex = part.slice(1, -1).trim();
      return <KaTeXBlock key={index} math={latex} displayMode={false} />;
    }
    return <span key={index}>{renderMarkdownSpans(part)}</span>;
  });
};
```

---

## 4. TRÌNH PHÁT VIDEO BÀI GIẢNG HLS CHUYÊN NGHIỆP (`PlyrVideoPlayer.tsx`)

Được thiết kế nhằm tối ưu hóa trải nghiệm học tập qua video:
- **Tương thích luồng phát HLS (HTTP Live Streaming)**: Tích hợp thư viện `hls.js`, tự động chọn luồng phân giải phù hợp với tốc độ mạng của học sinh (360p, 720p, 1080p).
- **Kiểm soát tốc độ học**: Hỗ trợ tua nhanh `0.75x`, `1.0x`, `1.25x`, `1.5x`, `2.0x`.
- **Ghi nhớ thời điểm xem (Auto-Resume)**: Tự động lưu mốc giây đang xem vào `localStorage`, khi học sinh mở lại bài học sẽ tiếp tục đúng vị trí đã dừng.
- **Heartbeat đồng bộ tiến độ học tập**: Cứ mỗi 15 giây xem liên tục, component gửi request `POST /api/v1/progress/heartbeat` về máy chủ để cập nhật tỉ lệ hoàn thành bài học và cộng điểm Energy Points.

---

## 5. TẦNG GIAO TIẾP DỮ LIỆU HTTP CLIENT VÀ STREAMING (`lib/api.ts`)

Lớp `api.ts` đóng vai trò là API Gateway phía client:
1. **Tự động tiêm Bearer Token**: Mọi request đều được gắn header `Authorization: Bearer <token>` lấy từ bộ nhớ lưu trữ an toàn.
2. **Xử lý mã lỗi HTTP 429 (Rate Limit Catch)**:
   - Khi Backend phản hồi mã `429 Too Many Requests`, client tự động đọc header `Retry-After` và hiển thị Toast thông báo thân thiện:  
     `"Thao tác quá nhanh! Vui lòng chờ {x} giây trước khi gửi tiếp."`
3. **Giải mã luồng dữ liệu Server-Sent Events (SSE)**:
   - Hỗ trợ phương thức `streamLearningChat`, đọc từng token văn bản truyền về qua luồng `text/event-stream`, tạo hiệu ứng gõ chữ mượt mà cho Gia sư Socratic AI (độ trễ 25ms/token).
