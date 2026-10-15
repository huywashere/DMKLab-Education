import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EduK12 - Nền Tảng Giáo Dục Trực Tuyến K–12 | Khan Academy Style",
  description: "Website học tập trực tuyến dành cho học sinh từ lớp 1 đến lớp 12 theo chuẩn đặc tả kiến trúc Modular Monolith v1.1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-[#0F172A] font-sans">
        {children}
      </body>
    </html>
  );
}
