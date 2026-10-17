import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giới Thiệu Về DMKLab Education | Sứ Mệnh & Triết Lý Socratic K–12",
  description:
    "Khám phá sứ mệnh giáo dục miễn phí đẳng cấp quốc tế của DMKLab Education, triết lý gợi mở Socratic và công nghệ AI đồng hành cùng học sinh Việt Nam.",
  keywords: [
    "DMKLab",
    "Giới thiệu DMKLab",
    "giáo dục K12",
    "phương pháp Socratic",
    "học toán thông minh",
    "Mastery learning",
  ],
  alternates: {
    canonical: "https://dmklab.edu.vn/about",
  },
  openGraph: {
    title: "Giới Thiệu Về DMKLab Education | Sứ Mệnh & Triết Lý Socratic",
    description:
      "Nền tảng giáo dục trực tuyến K–12 hiện đại, chuẩn hóa chương trình GDPT Việt Nam kết hợp trí tuệ nhân tạo Socratic Tutor.",
    url: "https://dmklab.edu.vn/about",
    siteName: "DMKLab Education",
    locale: "vi_VN",
    type: "website",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
