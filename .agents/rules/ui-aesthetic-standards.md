---
description: Tiêu chuẩn thiết kế giao diện DMKLab Education (Solid Enterprise UI, không Glass Blur, Brilliant Active Learning, WCAG 2.1)
globs: ["education-frontend/**/*"]
alwaysApply: true
---

# Quy Tắc Thiết Kế Giao Diện DMKLab Education (UI/UX Guardrails)

Mọi code frontend viết trong thư mục `education-frontend` phải tuân thủ nghiêm ngặt các nguyên tắc sau:

1. **Tuyệt đối KHÔNG dùng Glass Blur / Hiệu ứng mờ đục**:
   - Không sử dụng `backdrop-blur-*`, `bg-white/10`, `bg-black/20` làm nền chính của header, modal, card, popover hoặc button.
   - Luôn sử dụng bề mặt màu đặc chuẩn doanh nghiệp:
     - Nền sáng: `#FFFFFF`, `#F8FAFC`, `#F9F7F5` (warm cream).
     - Nền tối: `#000000` (Khan black), `#081C3D` (Midnight navy), `#0B172E` (Deep slate navy).

2. **Quy chuẩn Nút Bấm & Tương Tác**:
   - Nút hành động chính (Primary CTA): Dạng con nhộng bo tròn toàn phần (`rounded-full`), màu xanh đặc `#1865F2` (Royal Blue) hoặc `#14BF96` (Khan Green), chữ trắng đậm, bóng đổ có chủ đích.
   - Mọi nút bấm phải có:
     - `focus-visible:ring-2 focus-visible:ring-blue-500` cho phím Tab (Accessibility).
     - Phản hồi xúc giác `active:scale-[0.98]` và `cursor-pointer`.

3. **Tái sử dụng Component từ `@/components/ui`**:
   - Khi cần dải chạy đối tác / thông báo: Dùng `Marquee` (`@/components/ui/marquee`).
   - Khi cần đếm số thống kê: Dùng `NumberTicker` (`@/components/ui/number-ticker`).
   - Khi cần cụm tính năng K-12: Dùng `BentoGrid` và `BentoCard` (`@/components/ui/bento-grid`).
   - Khi cần nút CTA viền sáng nổi bật: Dùng `ShimmerButton` (`@/components/ui/shimmer-button`).
   - Khi cần thẻ bắt sáng theo chuột: Dùng `SpotlightCard` (`@/components/ui/spotlight-card`).
   - Khi cần thẻ 3D perspective: Dùng `TiltCard` (`@/components/ui/tilt-card`).
   - Khi cần chữ phát sáng: Dùng `AnimatedShinyText` (`@/components/ui/animated-shiny-text`).
   - Khi cần nền khoa học giáo dục: Dùng `GridPattern` (`@/components/ui/grid-pattern`).

4. **Chuẩn Mực Tương Tác Chủ Động (Brilliant.org Active Learning Pattern)**:
   - Khi xây dựng bài giảng, trang học tập hoặc Hero section, ưu tiên tích hợp **Interactive Knowledge Widgets** (trực quan hóa bài toán, chia hình, slider thay đổi thông số, mô phỏng sinh học).
   - Widget phải phản hồi tức thì (<200ms), hỗ trợ cả chuột và cảm ứng touch, có nút Reset trạng thái và hộp giải thích Socratic động theo thời gian thực.

5. **Quy Chuẩn Hoàn Thiện Thị Giác (Visual Polish Invariants)**:
   - **Đầy đủ trạng thái**: Mọi component tương tác đều phải xử lý đủ: `Default`, `Hover`, `Active/Pressed`, `Focus-visible`, `Loading (Skeleton)`, và `Empty State`.
   - **Typography Scale**: Phân cấp rõ rệt giữa Hero (`text-4xl sm:text-6xl font-black tracking-tight`), Tiêu đề Section (`text-2xl sm:text-3xl font-black`), và Body Text (`text-slate-600 dark:text-slate-300`).
   - **Hairline Crisp Borders**: Sử dụng viền 1px mỏng sắc nét `border border-slate-200 dark:border-slate-800` kết hợp bóng đổ nhẹ (`shadow-xs` hoặc `shadow-sm`).
