import Link from "next/link";
import { Compass, Home, BookOpen, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background Subtle Accent */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#1865F2_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full text-center space-y-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/80 border border-blue-800 text-blue-400 text-sm font-semibold tracking-wide">
          <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: "8s" }} />
          <span>Lỗi 404 • Không tìm thấy trang</span>
        </div>

        {/* Big Code */}
        <h1 className="text-7xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 tracking-tight">
          404
        </h1>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-100">
            Trang bạn đang tìm không tồn tại hoặc đã được di chuyển
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Đường dẫn bài học hoặc tài nguyên này có thể đã thay đổi. Đừng lo lắng, hành trình học tập của bạn vẫn tiếp diễn!
          </p>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors duration-200 shadow-lg shadow-blue-600/30"
          >
            <Home className="w-4 h-4" />
            <span>Về Trang chủ</span>
          </Link>

          <Link
            href="/books"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold transition-colors duration-200"
          >
            <BookOpen className="w-4 h-4" />
            <span>Tủ Sách K–12</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
