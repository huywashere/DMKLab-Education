"use client";

import React from "react";
import { User, Grade, Subject, Lesson } from "@/types";
import { MOCK_SUBJECTS, MOCK_COURSE, MOCK_LESSONS } from "@/lib/mock-data";
import {
  Play,
  Award,
  CheckCircle2,
  ArrowRight,
  Calculator,
  Atom,
  BookOpen,
  Globe,
  Compass,
  Sparkles,
  Flame,
  Clock,
  Target,
  Zap,
  TrendingUp,
  BrainCircuit,
  RotateCcw,
  Presentation,
  Network,
  Upload,
} from "lucide-react";
import { NumberTicker, SpotlightCard, ShimmerButton, AnimatedShinyText } from "@/components/ui";

interface StudentDashboardProps {
  currentUser: User;
  selectedGrade: Grade;
  onOpenLesson: (lesson: Lesson) => void;
  onOpenAiChat: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  selectedGrade,
  onOpenLesson,
  onOpenAiChat,
}) => {
  // Bài học tiếp tục (Resume Learning)
  const currentLesson = MOCK_LESSONS[1]; // Bài 2: Quy đồng mẫu số

  const getSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case "Calculator":
        return <Calculator className="w-5 h-5" />;
      case "Atom":
        return <Atom className="w-5 h-5" />;
      case "BookOpen":
        return <BookOpen className="w-5 h-5" />;
      case "Globe":
        return <Globe className="w-5 h-5" />;
      default:
        return <Compass className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* ─────────────────────────────────────────────────────────────
          1. BENTO HERO BANNER (SOLID MIDNIGHT NAVY & NUMBER TICKERS)
      ───────────────────────────────────────────────────────────── */}
      <div className="relative rounded-3xl bg-[#081C3D] dark:bg-[#061226] text-white p-6 sm:p-8 lg:p-10 border border-slate-700/60 dark:border-slate-800 shadow-xl overflow-hidden">
        {/* Subtle geometric dot accent background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-15"
          style={{
            backgroundImage: "radial-gradient(#14BF96 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0D2A57] text-[#14BF96] text-xs font-bold border border-[#184585]">
              <Sparkles className="w-3.5 h-3.5 text-[#14BF96]" />
              <span>Mục tiêu tuần này: Hoàn thành 4 kỹ năng toán học</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
              Chào mừng trở lại, {currentUser.fullName}! 👋
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0">
              Tiếp tục hành trình làm chủ kiến thức theo phương pháp gợi mở Socratic. Mỗi bài học là một bước vững chắc để đạt chuẩn Tinh thông!
            </p>

            {/* Quick Socratic AI CTA */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <ShimmerButton
                background="#14BF96"
                onClick={onOpenAiChat}
                className="text-slate-950 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-md"
              >
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-slate-950" />
                  <span>Hỏi Gia Sư Socratic AI</span>
                </div>
              </ShimmerButton>

              <button
                onClick={() => onOpenLesson(currentLesson)}
                className="px-5 py-2.5 rounded-full bg-[#0D2A57] hover:bg-[#133A76] text-white text-xs sm:text-sm font-semibold border border-[#184585] transition-all active:scale-[0.98] cursor-pointer flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Xem lại bài gần nhất</span>
              </button>

              <button
                onClick={() => (window.location.href = "/books")}
                className="px-5 py-2.5 rounded-full bg-[#1865F2] hover:bg-[#1557D0] text-white text-xs sm:text-sm font-bold transition-all active:scale-[0.98] cursor-pointer flex items-center gap-2 shadow-sm"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Tủ Sách & Trình Bày SGK</span>
              </button>
            </div>
          </div>

          {/* Right Metrics Grid (Solid Bento Cards) */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
            {/* Metric 1: Streak */}
            <div className="rounded-2xl bg-[#0B2349] border border-[#193F77] p-4 sm:p-5 flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Chuỗi Học Tập</span>
                <Flame className="w-5 h-5 text-[#FFC700] fill-[#FFC700]" />
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-black text-white flex items-baseline gap-1">
                  <NumberTicker value={currentUser.streakDays} />
                  <span className="text-xs font-semibold text-slate-400">ngày</span>
                </div>
                <p className="text-[11px] text-amber-300 font-medium mt-1">Giữ phong độ rất tốt! 🔥</p>
              </div>
            </div>

            {/* Metric 2: Energy Points */}
            <div className="rounded-2xl bg-[#0B2349] border border-[#193F77] p-4 sm:p-5 flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Điểm Năng Lượng</span>
                <Award className="w-5 h-5 text-[#14BF96]" />
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-black text-[#14BF96] flex items-baseline">
                  <NumberTicker value={currentUser.energyPoints} />
                </div>
                <p className="text-[11px] text-slate-300 font-medium mt-1">Huy hiệu Tinh Thông ⚡</p>
              </div>
            </div>

            {/* Metric 3: Weekly Goal Progress */}
            <div className="rounded-2xl bg-[#0B2349] border border-[#193F77] p-4 sm:p-5 flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Kỹ Năng Tuần</span>
                <Target className="w-5 h-5 text-[#1865F2]" />
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-black text-white flex items-baseline gap-1">
                  <span>3</span>
                  <span className="text-xs font-semibold text-slate-400">/ 4 kỹ năng</span>
                </div>
                <div className="w-full bg-[#071731] h-1.5 rounded-full overflow-hidden mt-2">
                  <div className="bg-[#1865F2] h-full rounded-full" style={{ width: "75%" }} />
                </div>
              </div>
            </div>

            {/* Metric 4: Mastery Rate */}
            <div className="rounded-2xl bg-[#0B2349] border border-[#193F77] p-4 sm:p-5 flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Độ Tinh Thông</span>
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 flex items-baseline">
                  <NumberTicker value={82} decimalPlaces={0} suffix="%" />
                </div>
                <p className="text-[11px] text-slate-300 font-medium mt-1">Toán & Khoa học Lớp {selectedGrade.code.replace("GRADE_", "")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. BRILLIANT-STYLE RESUME LEARNING CARD (TACTILE PROGRESS)
      ───────────────────────────────────────────────────────────── */}
      <div className="rounded-3xl bg-white dark:bg-[#0B172E] p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#14BF96] animate-pulse" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Tiếp tục bài giảng gần nhất
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" /> Đang ở phút 3:00 / 10:53 (65% hoàn thành)
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-[#1865F2] border border-blue-200 dark:border-blue-900">
                Toán học · {selectedGrade.name}
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                Cấp độ: Đang thành thạo (Proficient ⚡)
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {currentLesson.title}
            </h3>

            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
              {currentLesson.description}
            </p>

            {/* High-Contrast Dual-Layer Progress Bar */}
            <div className="pt-2 space-y-1.5 max-w-lg">
              <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                <span>Tiến độ xem video</span>
                <span className="text-slate-900 dark:text-white font-black">65%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full p-0.5 border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#1865F2] to-[#14BF96] rounded-full transition-all duration-500 shadow-xs"
                  style={{ width: "65%" }}
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="shrink-0 pt-2 md:pt-0">
            <button
              onClick={() => onOpenLesson(currentLesson)}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#1865F2] hover:bg-[#1253CE] active:scale-[0.98] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Học tiếp bài này</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. DANH MỤC MÔN HỌC BẮT SÁNG CHUỘT (SPOTLIGHT CARDS)
      ───────────────────────────────────────────────────────────── */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Môn học trọng tâm · {selectedGrade.name}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Chương trình chuẩn hóa K-12 kết hợp rèn luyện kỹ năng tư duy chủ động
            </p>
          </div>

          {/* Mastery Level Indicator Pills */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-3.5 py-2 rounded-2xl border border-slate-200/80 dark:border-slate-700">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Chưa học
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Làm quen
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1865F2]" /> Thành thạo
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#14BF96]" /> Tinh thông
            </span>
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MOCK_SUBJECTS.map((sub) => {
            const percent = Math.round((sub.completedLessons / sub.totalLessons) * 100);
            return (
              <SpotlightCard
                key={sub.id}
                spotlightColor="rgba(24, 101, 242, 0.12)"
                className="cursor-pointer group hover:border-[#1865F2]/50 transition-all duration-200"
              >
                <div
                  onClick={() => onOpenLesson(MOCK_LESSONS[0])}
                  className="p-6 flex flex-col justify-between h-full space-y-5"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105 duration-200"
                        style={{ backgroundColor: sub.color }}
                      >
                        {getSubjectIcon(sub.icon)}
                      </div>

                      <span className="text-xs font-bold text-slate-400 group-hover:text-[#1865F2] flex items-center gap-1 transition-colors">
                        Khám phá <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>

                    <div>
                      <h3 className="font-black text-lg text-slate-900 dark:text-white group-hover:text-[#1865F2] transition-colors tracking-tight">
                        {sub.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {sub.completedLessons} / {sub.totalLessons} bài học đã hoàn thành
                      </p>
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div className="pt-4 space-y-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                      <span>Độ thành thạo</span>
                      <span className="text-slate-900 dark:text-white font-black">{percent}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: sub.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3.5 TỦ SÁCH GIÁO KHOA K-12 & TRÌNH BÀY LẠI SÁCH SỐ
      ───────────────────────────────────────────────────────────── */}
      <div className="rounded-3xl bg-white dark:bg-[#0B172E] p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-900/60 text-[#1865F2] dark:text-blue-300 mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tính năng mới 2026</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
              <BookOpen className="w-5 h-5 text-[#1865F2]" />
              <span>Tủ Sách Giáo Khoa & Trình Bày Lại Sách Số</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Bóc tách và trình bày lại file sách SGK thành 3 chế độ: E-Reader chuẩn mực, Trình chiếu slide giảng dạy và Sơ đồ tư duy
            </p>
          </div>

          <button
            onClick={() => (window.location.href = "/books")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer self-start sm:self-auto shadow-xs"
          >
            <Upload className="w-4 h-4" />
            <span>Mở Studio Trình Bày Sách</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Book 1 */}
          <div className="p-5 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-600 text-white">
                Lớp 10
              </span>
              <h3 className="font-black text-sm text-slate-900 dark:text-white">
                Toán Học 10 - Tập 1 (Đại Số & Hình Học)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                NXB Giáo Dục Việt Nam • 4 chương • Mệnh đề, Tập hợp, Hệ thức lượng
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-blue-200/60 dark:border-blue-900/60">
              <button
                onClick={() => (window.location.href = "/books")}
                className="flex-1 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition text-center cursor-pointer"
              >
                Đọc sách số
              </button>
              <button
                onClick={() => (window.location.href = "/books")}
                className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 text-xs font-bold cursor-pointer"
                title="Trình chiếu bài giảng"
              >
                <Presentation className="w-4 h-4" />
              </button>
              <button
                onClick={() => (window.location.href = "/books")}
                className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-purple-600 text-xs font-bold cursor-pointer"
                title="Sơ đồ tư duy & Công thức"
              >
                <Network className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Book 2 */}
          <div className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-600 text-white">
                Lớp 5
              </span>
              <h3 className="font-black text-sm text-slate-900 dark:text-white">
                Toán Lớp 5 (Số Học & Phân Số)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kết Nối Tri Thức • 3 chương • Rút gọn, Quy đồng mẫu số
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-emerald-200/60 dark:border-emerald-900/60">
              <button
                onClick={() => (window.location.href = "/books")}
                className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition text-center cursor-pointer"
              >
                Đọc sách số
              </button>
              <button
                onClick={() => (window.location.href = "/books")}
                className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-600 text-xs font-bold cursor-pointer"
                title="Trình chiếu bài giảng"
              >
                <Presentation className="w-4 h-4" />
              </button>
              <button
                onClick={() => (window.location.href = "/books")}
                className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-purple-600 text-xs font-bold cursor-pointer"
                title="Sơ đồ tư duy & Công thức"
              >
                <Network className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Book 3 */}
          <div className="p-5 rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/20 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-purple-600 text-white">
                Lớp 10
              </span>
              <h3 className="font-black text-sm text-slate-900 dark:text-white">
                Vật Lý 10 (Cơ Học Chuyển Động)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Bộ Cánh Diều • Chuyển động biến đổi đều, gia tốc & định luật Newton
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-purple-200/60 dark:border-purple-900/60">
              <button
                onClick={() => (window.location.href = "/books")}
                className="flex-1 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition text-center cursor-pointer"
              >
                Đọc sách số
              </button>
              <button
                onClick={() => (window.location.href = "/books")}
                className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-purple-600 text-xs font-bold cursor-pointer"
                title="Trình chiếu bài giảng"
              >
                <Presentation className="w-4 h-4" />
              </button>
              <button
                onClick={() => (window.location.href = "/books")}
                className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-purple-600 text-xs font-bold cursor-pointer"
                title="Sơ đồ tư duy & Công thức"
              >
                <Network className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. CÂY CHƯƠNG TRÌNH HỌC (CURRICULUM TREE - SOLID LIST)
      ───────────────────────────────────────────────────────────── */}
      <div className="rounded-3xl bg-white dark:bg-[#0B172E] p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
              <BookOpen className="w-5 h-5 text-[#14BF96]" />
              <span>{MOCK_COURSE.title}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {MOCK_COURSE.description}
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {MOCK_COURSE.chapters.map((chapter) => (
            <div
              key={chapter.id}
              className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/40 dark:bg-slate-900/40"
            >
              {/* Chapter Header */}
              <div className="bg-slate-100/80 dark:bg-slate-800/80 px-5 py-3.5 font-black text-sm text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span>{chapter.title}</span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {chapter.lessons.length} bài giảng & thực hành
                </span>
              </div>

              {/* Lessons List */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-[#0B172E]">
                {chapter.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    onClick={() => onOpenLesson(lesson)}
                    className="p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between gap-4 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-[#1865F2] group-hover:text-white transition-colors shrink-0">
                        {lesson.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 group-hover:text-white" />
                        ) : (
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-[#1865F2] transition-colors">
                          {lesson.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Video bài giảng · {Math.floor(lesson.durationSeconds / 60)} phút ·{" "}
                          {lesson.quiz ? "Có trắc nghiệm rèn luyện" : "Lý thuyết cơ bản"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${
                          lesson.masteryLevel === "MASTERED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                            : lesson.masteryLevel === "PROFICIENT"
                              ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800"
                              : lesson.masteryLevel === "FAMILIAR"
                                ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                                : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                        }`}
                      >
                        {lesson.masteryLevel === "MASTERED"
                          ? "Tinh thông 🏆"
                          : lesson.masteryLevel === "PROFICIENT"
                            ? "Thành thạo ⚡"
                            : lesson.masteryLevel === "FAMILIAR"
                              ? "Làm quen 💡"
                              : "Chưa học"}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#1865F2] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
