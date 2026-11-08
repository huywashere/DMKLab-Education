import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tủ Sách K-12 & Trình Bày Sách Số | DMKLab Education",
  description:
    "Trình bày lại file sách giáo khoa K-12, sách số hóa tương tác đa chế độ: E-Reader, Trình chiếu bài giảng và Sơ đồ tư duy toán lý hóa.",
};

export default function BooksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

