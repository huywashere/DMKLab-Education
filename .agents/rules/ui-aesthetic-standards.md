---
description: Tiêu chuẩn thiết kế giao diện DMKLab Education (Solid Enterprise UI, không Glass Blur, WCAG 2.1)
globs: ["education-frontend/**/*"]
alwaysApply: true
---

# Quy Tắc Thiết Kế Giao Diện DMKLab Education (UI/UX Guardrails)

Mọi code frontend viết trong thư mục `education-frontend` phải tuân thủ nghiêm ngặt các nguyên tắc sau:

1. **Tuyệt đối KHÔNG dùng Glass Blur / Hiệu ứng mờ đục**:
   - Không sử dụng `backdrop-blur-*`, `bg-white/10`, `bg-black/20` làm nền chính của header, modal, card, popover hoặc button.
   - Luôn sử dụng bề mặt màu đặc chuẩn doanh nghiệp:
     - Nền sáng: `#FFFFFF`, `#F8FAFC`, `#F1F5F9`.
     - Nền tối: `#000000` (Khan black), `#081C3D` (Khan midnight navy), `#0B172E` (Dark slate navy).

2. **Quy chuẩn Nút Bấm & Tương Tác**:
   - Nút hành động chính (Primary CTA): Sử dụng dạng con nhộng bo tròn toàn phần (`rounded-full`), màu xanh đặc `#1865F2` (Royal Blue) hoặc `#14BF96` (Khan Green), chữ trắng đậm, bóng đổ nhẹ (`shadow-md`).
   - Mọi nút bấm phải có:
     - `focus-visible:ring-2 focus-visible:ring-blue-500` cho phím Tab.
     - `active:scale-[0.98]` và `cursor-pointer`.

3. **Tái sử dụng Component từ `@/components/ui`**:
   - Khi cần dải chạy đối tác / thông báo: Dùng `Marquee` (`@/components/ui/marquee`).
   - Khi cần đếm số thống kê: Dùng `NumberTicker` (`@/components/ui/number-ticker`).
   - Khi cần cụm tính năng K-12: Dùng `BentoGrid` và `BentoCard` (`@/components/ui/bento-grid`).
   - Khi cần nút CTA viền sáng nổi bật: Dùng `ShimmerButton` (`@/components/ui/shimmer-button`).
   - Khi cần thẻ bắt sáng theo chuột: Dùng `SpotlightCard` (`@/components/ui/spotlight-card`).
   - Khi cần thẻ 3D perspective: Dùng `TiltCard` (`@/components/ui/tilt-card`).
   - Khi cần chữ phát sáng: Dùng `AnimatedShinyText` (`@/components/ui/animated-shiny-text`).
   - Khi cần nền khoa học giáo dục: Dùng `GridPattern` (`@/components/ui/grid-pattern`).
