import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Liên Hệ DMKLab Education | Hỗ Trợ 24/7 & Tư Vấn Lộ Trình",
  description: "Liên hệ đội ngũ DMKLab Education: Hotline 1900 6868, email contact@dmklab.edu.vn hoặc gửi thắc mắc để được tư vấn lộ trình học Socratic K–12 miễn phí.",
  keywords: ["Liên hệ DMKLab", "hotline DMKLab", "tư vấn học tập K12", "hỗ trợ phụ huynh", "hợp tác trường học"],
  alternates: {
    canonical: "https://dmklab.edu.vn/contact",
  },
  openGraph: {
    title: "Liên Hệ DMKLab Education | Hỗ Trợ 24/7 & Tư Vấn Học Tập",
    description: "Kênh hỗ trợ chính thức của DMKLab Education dành cho học sinh, phụ huynh và quý thầy cô trên cả nước.",
    url: "https://dmklab.edu.vn/contact",
    siteName: "DMKLab Education",
    locale: "vi_VN",
    type: "website",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
