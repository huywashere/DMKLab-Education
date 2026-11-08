---
name: modern-ui-design-system
description: >-
  Cẩm nang thiết kế UI/UX hiện đại cho EdTech kết hợp shadcn/ui, Magic UI, Aceternity UI, Brilliant.org và Godly.
  Kích hoạt khi xây dựng landing page, trang môn học K-12, thẻ bài giảng, hoặc bảng điều khiển,
  đảm bảo 100% bề mặt màu đặc (solid enterprise UI), không glass blur mờ đục, chuẩn WCAG 2.1 và hiệu năng 60fps.
---

# Modern UI Design System for EdTech (shadcn/ui + Magic UI + Godly + Brilliant)

Cẩm nang này định hình bộ quy chuẩn thiết kế giao diện cho hệ thống giáo dục trực tuyến DMKLab Education, kế thừa tinh hoa từ các thư viện và showcase Open UI hàng đầu thế giới:

1. **shadcn/ui**: Đóng vai trò **nền tảng kỹ thuật** (Foundational Primitives, semantic tokens, accessible structure, cva/cn utilities).
2. **Magic UI & Aceternity UI**: Đóng vai trò **vi tương tác & điểm chạm cảm xúc** (Micro-interactions, marquee ticker, bento grid, number ticker, shimmer button, spotlight lighting, 3D tilt).
3. **Godly & Land-book**: Đóng vai trò **định hướng thẩm mỹ tổng thể** (Art Direction, typographic hierarchy, nhịp thở không gian 64px–96px, màu sắc doanh nghiệp cao cấp).
4. **Brilliant.org & Generative UI**: Đóng vai trò **tương tác học tập chủ động** (Active Learning Manipulatives, trực quan hóa bài toán tương tác, instant feedback loops <200ms).

---

## 1. Các Quy Tắc Bất Biến (Design Guardrails)

### Quy tắc 1: Tuyệt đối KHÔNG sử dụng Glass Blur mờ nhạt
- **Lý do**: Lớp kính mờ (`backdrop-blur-md`, `bg-white/10`) làm chữ bị nhòe khó đọc trong môi trường học tập, gây sụt giảm FPS đáng kể trên máy tính bảng/điện thoại học sinh, và trông thiếu chuyên nghiệp.
- **Giải pháp**: 100% các thành phần (Header, Card, Modal, Footer, Popover, Dropdown) phải dùng **màu nền đặc (solid background)**:
  - Dark Mode: `#000000` (Khan black), `#081C3D` (Khan midnight navy), `#0B172E` (Slate dark navy).
  - Light Mode: `#FFFFFF`, `#F8FAFC` (Slate 50), `#F9F7F5` (Khan warm cream).

### Quy tắc 2: Tương phản cao & Chuẩn tiếp cận (WCAG 2.1 AA+)
- Văn bản phải đạt tỷ lệ tương phản tối thiểu 4.5:1 so với nền.
- Mọi nút bấm hoặc liên kết tương tác đều phải có:
  - `focus-visible:ring-2 focus-visible:ring-blue-500` cho người dùng sử dụng phím Tab.
  - Trạng thái hover và active (`active:scale-[0.98]`) rõ ràng.

### Quy tắc 3: Hiệu năng 60fps & Zero Runtime Bloat
- Tận dụng tối đa CSS Transforms và GPU Compositing (`transform: translate3d`, `rotateX/Y`).
- Không cài thêm runtime animation cồng kềnh khi các hook React nhẹ nhàng + CSS Variables đã giải quyết mượt mà.

---

## 2. Thư Viện UI Components Trong Dự Án (`@/components/ui`)

Tất cả các component đã được tối ưu hóa sẵn trong codebase tại `education-frontend/src/components/ui/`:

### 1. Marquee (`@/components/ui/marquee`)
- Dải chạy vô tận không giật cục cho danh sách đối tác, trường học, môn thi đua.
- Tự động tạm dừng khi di chuột (`pauseOnHover`).
```tsx
import { Marquee } from "@/components/ui/marquee";

<Marquee pauseOnHover duration="25s">
  {partners.map((p) => <PartnerBadge key={p.id} {...p} />)}
</Marquee>
```

### 2. NumberTicker (`@/components/ui/number-ticker`)
- Bộ đếm số tự động kích hoạt khi cuộn vào tầm nhìn (IntersectionObserver) với đường cong ease-out mượt mà.
```tsx
import { NumberTicker } from "@/components/ui/number-ticker";

<NumberTicker value={2450} suffix=" Học sinh" />
<NumberTicker value={99.4} decimalPlaces={1} suffix="%" />
```

### 3. BentoGrid & BentoCard (`@/components/ui/bento-grid`)
- Bố cục lưới phi đối xứng phong cách Apple / Godly cho các tính năng K-12 cốt lõi.
```tsx
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";

<BentoGrid>
  <BentoCard
    name="Gia Sư AI Socratic"
    className="md:col-span-2"
    description="Hướng dẫn gợi mở từng bước thay vì giải hộ."
    tag="Trí Tuệ Nhân Tạo"
    cta="Trải nghiệm ngay"
  />
  <BentoCard
    name="Lộ Trình Cá Nhân Hóa"
    className="md:col-span-1"
    description="Tự động lấp lỗ hổng kiến thức chuẩn Bộ GD&ĐT."
  />
</BentoGrid>
```

### 4. ShimmerButton (`@/components/ui/shimmer-button`)
- Nút kêu gọi hành động (CTA) nổi bật với dải sáng xoay quanh viền, nền xanh đặc `#1865F2` hoặc `#14BF96`.
```tsx
import { ShimmerButton } from "@/components/ui/shimmer-button";

<ShimmerButton background="#1865F2" onClick={handleStart}>
  Bắt đầu học ngay
</ShimmerButton>
```

### 5. SpotlightCard (`@/components/ui/spotlight-card`)
- Thẻ học tập bắt sáng theo tọa độ chuột, tạo cảm giác sang trọng và tương tác sống động.
```tsx
import { SpotlightCard } from "@/components/ui/spotlight-card";

<SpotlightCard spotlightColor="rgba(24, 101, 242, 0.12)">
  <h4>Môn Toán Hình Học Không Gian</h4>
</SpotlightCard>
```

### 6. TiltCard (`@/components/ui/tilt-card`)
- Thẻ 3D nghiêng theo góc di chuột (perspective tilt) dành cho giấy khen, chứng chỉ, hoặc thẻ khóa học đặc biệt.
```tsx
import { TiltCard } from "@/components/ui/tilt-card";

<TiltCard maxTilt={6}>
  <CertificateBadge />
</TiltCard>
```

### 7. AnimatedShinyText (`@/components/ui/animated-shiny-text`)
- Dải ánh sáng gradient chạy qua chữ, làm nổi bật nhãn thông báo mới hoặc khẩu hiệu.
```tsx
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";

<AnimatedShinyText>✨ Phiên bản Socratic AI 2.0 đã sẵn sàng</AnimatedShinyText>
```

### 8. GridPattern (`@/components/ui/grid-pattern`)
- Nền lưới toán học / khoa học công nghệ tinh tế, tăng tính học thuật cho các khối section.
```tsx
import { GridPattern } from "@/components/ui/grid-pattern";

<div className="relative py-24 overflow-hidden">
  <GridPattern width={32} height={32} />
  {/* Content */}
</div>
```

---

## 3. Nhịp Thở Không Gian & Typography (Godly Art Direction)

1. **Khoảng cách nhịp thở lớn (Spatial Breathing Room)**:
   - Khoảng cách giữa các Section: `py-20 sm:py-28`.
   - Khoảng cách giữa Tiêu đề và Mô tả: `mt-3 mb-8`.
   - Khoảng cách giữa các Card: `gap-6 sm:gap-8`.
2. **Phân cấp phông chữ (Typographic Scale)**:
   - Hero Headline: `text-4xl sm:text-6xl font-black tracking-tight leading-[1.1]`.
   - Section Title: `text-2xl sm:text-4xl font-extrabold tracking-tight`.
   - Body Text: `text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300`.
   - Tag / Badge: `text-[11px] font-bold uppercase tracking-wider`.

---

## 4. Mô Hình Thiết Kế Interactive Knowledge Widgets (Brilliant.org & Generative UI)

Mỗi khi tạo các khối bài giảng hoặc mô phỏng kiến thức:

1. **Cấu Trúc Chuẩn của Một Widget Tương Tác**:
   - **Header**: Tiêu đề khái niệm + Tag môn học + Nút Reset trạng thái.
   - **Interactive Canvas / Stage**: Vùng thao tác trực quan (SVG / Canvas / Flex grid) hỗ trợ click, hover, hoặc kéo slider.
   - **Control Bar**: Các nút lựa chọn chế độ (vd: Lát cắt hình học, Bộ nhiễm sắc thể, Bước sóng) + Slider điều chỉnh thông số.
   - **Insight Box**: Khung giải thích động cập nhật theo thời gian thực dựa trên thao tác của học sinh.

2. **Quy Trình Tạo Generative UI Prototype Trong Chat**:
   - Khi người dùng yêu cầu ý tưởng giao diện mới hoặc thiết kế bài học mới:
     - Tạo nhanh file HTML standalone sử dụng semantic tokens (`bg-[var(--card)]`, `text-[var(--foreground)]`) và Tailwind CSS.
     - Nhúng bằng `<agent-embed>` để người dùng tương tác trực tiếp ngay trong chat.
     - Sau khi người dùng hài lòng, chuyển đổi sạch sẽ thành React Component chuẩn (`src/components/` hoặc `src/features/`).
