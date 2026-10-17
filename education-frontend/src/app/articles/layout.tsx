import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bài Viết & Cẩm Nang K–12 | DMKLab Education",
  description:
    "Kho bài viết chuyên sâu về phương pháp học Toán tư duy Socratic, ứng dụng AI trong trường học K–12, phương pháp Pomodoro và cẩm nang đồng hành cùng con.",
  keywords: [
    "Bài viết giáo dục",
    "DMKLab blog",
    "học toán K12",
    "Socratic method",
    "Gia sư AI",
    "Cẩm nang phụ huynh",
    "kỹ năng học tập",
  ],
  alternates: {
    canonical: "https://dmklab.edu.vn/articles",
  },
  openGraph: {
    title: "Bài Viết & Cẩm Nang K–12 | DMKLab Education",
    description:
      "Kho kiến thức và bài viết chuyên sâu về phương pháp học tập hiện đại, khoa học não bộ và ứng dụng công nghệ giáo dục.",
    url: "https://dmklab.edu.vn/articles",
    siteName: "DMKLab Education",
    locale: "vi_VN",
    type: "website",
  },
};

export default function ArticlesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
