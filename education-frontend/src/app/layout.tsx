import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { ThemeProvider } from "@/lib/theme/ThemeContext";
import { AccessibilityProvider } from "@/lib/a11y/AccessibilityContext";
import { BookmarksProvider } from "@/lib/bookmarks/BookmarksContext";
import { KeyboardShortcutsModal } from "@/components/KeyboardShortcutsModal";
import { BookmarksModal } from "@/components/BookmarksModal";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-be-vietnam-pro",
});

export const viewport: Viewport = {
  themeColor: "#1865F2",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://dmklab.edu.vn"),
  title: {
    default: "DMKLab Education - Nền Tảng Giáo Dục Trực Tuyến K–12 Việt Nam",
    template: "%s | DMKLab Education",
  },
  description:
    "DMKLab Education - Nền tảng học tập trực tuyến thông minh K–12 miễn phí. Lộ trình học Toán, STEM chuẩn Bộ GD&ĐT kết hợp phương pháp gợi mở Socratic và Trợ lý Gia sư DMK AI Tutor 24/7.",
  keywords: [
    "DMKLab",
    "DMKLab Education",
    "Học trực tuyến K12",
    "Toán lớp 1 đến lớp 12",
    "Phương pháp Socratic",
    "Gia sư AI",
    "DMK AI Tutor",
    "Giáo dục phổ thông Việt Nam",
    "Học tập tinh thông",
    "Mastery learning",
  ],
  authors: [{ name: "DMKLab Education Team", url: "https://dmklab.edu.vn" }],
  creator: "DMKLab Education",
  publisher: "DMKLab Education",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://dmklab.edu.vn",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "DMKLab Education - Nền Tảng Giáo Dục Trực Tuyến K–12 Việt Nam",
    description:
      "Hệ sinh thái học tập K–12 chuẩn hóa với phương pháp gợi mở Socratic, cây tiến độ kỹ năng và Trợ lý AI đồng hành 24/7.",
    url: "https://dmklab.edu.vn",
    siteName: "DMKLab Education",
    locale: "vi_VN",
    type: "website",
    images: [
      {
        url: "/img-web/background-hoc-tap-001.webp",
        width: 1200,
        height: 630,
        alt: "DMKLab Education - Nền Tảng Giáo Dục K-12",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DMKLab Education - Nền Tảng Giáo Dục Trực Tuyến K–12",
    description:
      "Học tập tinh thông, phương pháp Socratic và gia sư AI đồng hành cùng học sinh Việt Nam.",
    images: ["/img-web/background-hoc-tap-001.webp"],
  },
  category: "education",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOrganization",
        "@id": "https://dmklab.edu.vn/#organization",
        name: "DMKLab Education",
        url: "https://dmklab.edu.vn",
        logo: {
          "@type": "ImageObject",
          url: "https://dmklab.edu.vn/favicon.ico",
        },
        description:
          "Nền tảng giáo dục trực tuyến K–12 chuẩn hóa chương trình GDPT Việt Nam, cung cấp lộ trình học tập cá nhân hóa và trợ lý AI Socratic Tutor.",
        telephone: "19006868",
        email: "contact@dmklab.edu.vn",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Tầng 8, Tòa nhà DMK Innovation, Phố Duy Tân",
          addressLocality: "Cầu Giấy",
          addressRegion: "Hà Nội",
          postalCode: "100000",
          addressCountry: "VN",
        },
        sameAs: [
          "https://facebook.com/dmklab.education",
          "https://youtube.com/@dmklab.education",
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://dmklab.edu.vn/#website",
        url: "https://dmklab.edu.vn",
        name: "DMKLab Education",
        description: "Hệ sinh thái học tập K–12 trực tuyến đẳng cấp quốc tế hoàn toàn miễn phí.",
        publisher: {
          "@id": "https://dmklab.edu.vn/#organization",
        },
        inLanguage: "vi-VN",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://dmklab.edu.vn/?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <html lang="vi" suppressHydrationWarning className={`h-full antialiased ${beVietnamPro.variable}`}>
      <head>
        {/* Anti-flicker instant theme initialization */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('dmklab_theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}}catch(e){}})();`,
          }}
        />
        {/* JSON-LD Structured Data Schema for Google & Search Engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`min-h-full flex flex-col bg-[#F8FAFC] dark:bg-[#0B1120] text-[#0F172A] dark:text-[#F1F5F9] transition-colors duration-200 ${beVietnamPro.className}`}>
        <ThemeProvider>
          <LanguageProvider>
            <AccessibilityProvider>
              <BookmarksProvider>
                {children}
                <KeyboardShortcutsModal />
                <BookmarksModal />
              </BookmarksProvider>
            </AccessibilityProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
