import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DMKLab - Nền Tảng Giáo Dục Trực Tuyến K–12",
  description: "Nền tảng học tập trực tuyến thông minh K-12 DMKLab với lộ trình chuẩn hóa và trợ lý AI gợi mở",
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
