"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Ghi log lỗi runtime để giám sát (có thể đẩy về Sentry / Grafana)
    console.error("[DMKLab Global Error Boundary Caught]:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <div className="relative z-10 max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
        {/* Icon & Title */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
            Đã có sự cố xảy ra
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Hệ thống gặp gián đoạn tạm thời khi kết xuất trang này. Dữ liệu học tập của bạn hoàn toàn an toàn.
          </p>
        </div>

        {error.digest && (
          <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80 text-xs font-mono text-slate-500">
            Mã định danh lỗi: {error.digest}
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors duration-200"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Thử lại ngay</span>
          </button>

          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold transition-colors duration-200"
          >
            <Home className="w-4 h-4" />
            <span>Về Trang chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
