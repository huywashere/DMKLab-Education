"use client";

import React, { useState } from "react";
import { User, Grade, Lesson } from "@/types";
import { MOCK_SUBJECTS, MOCK_LESSONS } from "@/lib/mock-data";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  Play,
  CheckCircle,
  ArrowRight,
  Calculator,
  Atom,
  BookOpen,
  Globe,
  Compass,
  Star,
  Users,
  Clock,
  BarChart2,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import {
  FaCalculator,
  FaEarthAmericas,
  FaLandmarkDome,
  FaCoins,
  FaFire,
  FaStar,
} from "react-icons/fa6";
import { RiBookOpenFill, RiRobot2Fill, RiSparklingFill } from "react-icons/ri";
import { TbMathFunction, TbMathSymbols, TbAtom } from "react-icons/tb";

interface KhanHomepageProps {
  currentUser: User;
  selectedGrade: Grade;
  onOpenLesson: (lesson: Lesson) => void;
  onOpenAiChat: () => void;
}

export const KhanHomepage: React.FC<KhanHomepageProps> = ({
  currentUser,
  selectedGrade,
  onOpenLesson,
  onOpenAiChat,
}) => {
  const { t, lang } = useLanguage();
  const [activeWho, setActiveWho] = useState(0);
  const [activeAudienceTab, setActiveAudienceTab] = useState<
    "schools" | "teachers" | "students" | "families"
  >("schools");

  const SUBJECT_ITEMS = [
    {
      icon: <TbMathFunction className="w-5 h-5" />,
      labelKey: "subject_math_primary",
      fallback: "Toán: Tiểu học (Lớp 1–5)",
      color: "#1865F2",
      bg: "#EBF2FF",
    },
    {
      icon: <FaCalculator className="w-5 h-5" />,
      labelKey: "subject_math_secondary",
      fallback: "Toán: THCS & THPT (Lớp 6–12)",
      color: "#1865F2",
      bg: "#EBF2FF",
    },
    {
      icon: <TbMathSymbols className="w-5 h-5" />,
      labelKey: "subject_math_by_grade",
      fallback: "Toán: Phân theo lớp học",
      color: "#1865F2",
      bg: "#EBF2FF",
    },
    {
      icon: <TbAtom className="w-5 h-5" />,
      labelKey: "subject_stem",
      fallback: "Khoa học Tự nhiên & STEM",
      color: "#14BF96",
      bg: "#E6FAF6",
    },
    {
      icon: <FaEarthAmericas className="w-5 h-5" />,
      labelKey: "subject_english",
      fallback: "Tiếng Anh giao tiếp K–12",
      color: "#8B5CF6",
      bg: "#F3F0FF",
    },
    {
      icon: <RiBookOpenFill className="w-5 h-5" />,
      labelKey: "subject_literature",
      fallback: "Ngữ Văn & Ngôn ngữ học",
      color: "#F59E0B",
      bg: "#FFF9EB",
    },
    {
      icon: <FaLandmarkDome className="w-5 h-5" />,
      labelKey: "subject_history",
      fallback: "Lịch sử & Địa lý Việt Nam",
      color: "#EF4444",
      bg: "#FEF2F2",
    },
    {
      icon: <FaCoins className="w-5 h-5" />,
      labelKey: "subject_economics",
      fallback: "Kinh tế & Giáo dục tài chính",
      color: "#10B981",
      bg: "#ECFDF5",
    },
    {
      icon: <RiRobot2Fill className="w-5 h-5" />,
      labelKey: "subject_ai_coding",
      fallback: "AI & Lập trình cho học sinh",
      color: "#6366F1",
      bg: "#EEEFFF",
    },
  ];

  const STATS = [
    { value: "180M+", label: t("stats_students_label", "học sinh đăng ký học") },
    { value: "63B+", label: t("stats_minutes_label", "phút học tập thực sự") },
    {
      value: t("stats_free_val", "Miễn phí"),
      label: t("stats_free_label", "cho học sinh & giáo viên"),
    },
    {
      value: t("stats_years_val", "15+ năm"),
      label: t("stats_years_label", "tập trung vào một sứ mệnh"),
    },
  ];

  const WHO_ARE_YOU = [
    {
      role: t("hero_role_student", "Học sinh"),
      desc: t("hero_role_student_desc", "Học tập theo tốc độ của bản thân"),
      href: "#",
      color: "text-[#1865F2]",
      border: "border-[#1865F2]",
    },
    {
      role: t("hero_role_family", "Gia đình"),
      desc: t("hero_role_family_desc", "Hỗ trợ việc học của con bạn"),
      href: "#",
      color: "text-slate-700",
      border: "border-slate-200",
    },
    {
      role: t("hero_role_teacher", "Giáo viên"),
      desc: t("hero_role_teacher_desc", "Giáo viên với lớp học"),
      href: "#",
      color: "text-slate-700",
      border: "border-slate-200",
    },
    {
      role: t("hero_role_school", "Trường học & Sở"),
      desc: t("hero_role_school_desc", "Triển khai AI toàn trường"),
      href: "#",
      color: "text-slate-700",
      border: "border-slate-200",
    },
  ];

  const HOW_WORKS_CHECKS = [
    t("hero_check_1", "Luyện tập xây dựng hiểu biết thông qua các kỹ năng theo chuẩn chương trình"),
    t("hero_check_2", "Phản hồi tức thì giúp học sinh vượt qua điểm khó khi gặp"),
    t("hero_check_3", "Thấu hiểu học sinh giúp giáo viên định hướng chính xác"),
  ];

  const LEARNER_CHECKS = [
    t("results_check_1", "1 kỹ năng thành thạo = +0.5 điểm phần trăm"),
    t("results_check_2", "10 kỹ năng thành thạo = +5 điểm phần trăm"),
    t("results_check_3", "60 kỹ năng thành thạo = +30 điểm phần trăm"),
  ];

  return (
    <div className="w-full">
      {/* ────────────────────────────────────────────────
          HERO SECTION — exact Khan Academy split layout
      ──────────────────────────────────────────────── */}
      <section className="bg-[#FEF8E7] dark:bg-[#0B1324] border-b border-[#E8E3D0] dark:border-slate-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left: Headlines + Bullets */}
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#21242C] dark:text-white leading-tight tracking-tight">
              {t("hero_headline_1", "Biến mục tiêu học tập lớn thành")}{" "}
              <em className="not-italic text-[#1865F2] dark:text-blue-400">
                {t("hero_headline_2", "kết quả thực sự.")}
              </em>
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg">
              {t(
                "hero_desc",
                "DMKLab giúp cá nhân hóa việc học, củng cố kỹ năng nền tảng và hỗ trợ từng học sinh từ lớp 1 đến lớp 12 tiến bộ mỗi ngày."
              )}
            </p>

            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              {HOW_WORKS_CHECKS.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#14BF96] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => onOpenLesson(MOCK_LESSONS[0])}
                className="khan-btn-primary text-sm px-6 py-3 gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                {t("hero_btn_start", "Bắt đầu học ngay")}
              </button>
              <button className="khan-btn-secondary text-sm px-6 py-3 cursor-pointer">
                {t("hero_btn_learn_more", "Tìm hiểu thêm")}
              </button>
            </div>
          </div>

          {/* Right: DMKLab illustration using user's images + "Get started" card */}
          <div className="relative flex flex-col items-center">
            {/* Illustration image from img-web */}
            <div className="relative w-full max-w-md mx-auto">
              <img
                src="/img-web/background-hoc-tap-001.webp"
                alt="Học sinh học tập trực tuyến"
                className="w-full rounded-3xl object-cover shadow-xl border border-[#E8E3D0]"
                style={{ aspectRatio: "4/3" }}
                fetchPriority="high"
                decoding="async"
              />
              {/* Floating mascot-style badge */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl border border-slate-200 px-4 py-3 flex items-center gap-3">
                <img
                  src="/img-web/khan-illustration.svg"
                  alt="DMK mascot"
                  className="w-12 h-12 object-contain"
                  width={48}
                  height={48}
                  decoding="async"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    {t("ai_tutor_badge", "DMK AI Tutor")}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {t("ai_tutor_subbadge", "Gia sư gợi mở Socratic")}
                  </p>
                </div>
              </div>
              {/* Floating streak badge top right */}
              <div className="absolute -top-3 -right-3 bg-[#FFC700] text-white text-xs font-black px-3 py-1.5 rounded-full shadow-md flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-white" />
                <span>
                  {currentUser.energyPoints.toLocaleString()} {t("points_label", "Điểm")}
                </span>
              </div>
            </div>

            {/* "Get started" role selector card — mimics Khan Academy's right column */}
            <div className="w-full max-w-md mt-6 bg-white dark:bg-[#131E35] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="px-5 pt-4 pb-2">
                <p className="text-sm font-bold text-slate-800 dark:text-white mb-3">
                  {t("hero_who_are_you", "Bạn là ai?")}
                </p>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {WHO_ARE_YOU.map((w, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveWho(idx)}
                      className={`w-full text-left px-2 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/80 transition text-sm cursor-pointer ${activeWho === idx ? "bg-slate-50 dark:bg-slate-800/80" : ""}`}
                    >
                      <div>
                        <span
                          className={`font-bold ${activeWho === idx ? "text-[#1865F2] dark:text-blue-400" : "text-slate-800 dark:text-slate-200"}`}
                        >
                          {w.role}
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{w.desc}</p>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 shrink-0 ${activeWho === idx ? "text-[#1865F2] dark:text-blue-400" : "text-slate-300 dark:text-slate-600"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                {t("hero_has_account", "Đã có tài khoản?")}{" "}
                <button className="text-[#1865F2] dark:text-blue-400 font-bold hover:underline cursor-pointer">
                  {t("hero_login_link", "Đăng nhập")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────
          STATS BAR — 180M+, 63B+, Free, 15+ years
      ──────────────────────────────────────────────── */}
      <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] py-8 transition-colors duration-200">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {STATS.map((s, i) => (
            <div key={i} className="space-y-1">
              <p className="text-2xl sm:text-3xl font-extrabold text-[#21242C] dark:text-white">
                {s.value}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ────────────────────────────────────────────────
          COURSES DIRECTORY — Official Khan Academy 4-Domain Grid
      ──────────────────────────────────────────────── */}
      <section className="bg-white dark:bg-[#08182D] py-16 border-b border-slate-100 dark:border-slate-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1865F2]/10 text-[#1865F2] dark:text-blue-400 text-xs font-bold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Chương Trình Học K–12 Chuẩn Quốc Tế</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B2149] dark:text-white tracking-tight">
              {t("courses_heading", "Khám phá các khóa học theo lĩnh vực")}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Hàng nghìn bài giảng video, bài tập thực hành thích ứng và bài kiểm tra tinh thông
              theo từng khối lớp.
            </p>
          </div>

          {/* 4 Major Khan Academy Domains */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Domain 1: Toán học (Khan Royal Blue #1865F2) */}
            <div className="bg-white dark:bg-[#0D2650] rounded-2xl border-2 border-[#1865F2]/20 hover:border-[#1865F2] hover:shadow-xl transition-all duration-200 p-6 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#EBF2FF] dark:bg-blue-900/40 text-[#1865F2] flex items-center justify-center font-bold shadow-xs">
                  <TbMathFunction className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-[#0B2149] dark:text-white group-hover:text-[#1865F2] transition-colors">
                    Toán học K–12
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Từ số học cơ bản đến đại số, hình học, lượng giác và giải tích vi phân ôn thi
                    THPT Quốc gia.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs font-medium text-slate-700 dark:text-slate-200">
                  <div className="flex items-center gap-1.5 hover:text-[#1865F2] cursor-pointer">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1865F2]" />
                    <span>Toán Tiểu học (Lớp 1 – Lớp 5)</span>
                  </div>
                  <div className="flex items-center gap-1.5 hover:text-[#1865F2] cursor-pointer">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1865F2]" />
                    <span>Toán THCS (Lớp 6 – Lớp 9)</span>
                  </div>
                  <div className="flex items-center gap-1.5 hover:text-[#1865F2] cursor-pointer">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1865F2]" />
                    <span>Toán THPT (Lớp 10 – Lớp 12)</span>
                  </div>
                  <div className="flex items-center gap-1.5 hover:text-[#1865F2] cursor-pointer">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1865F2]" />
                    <span>Đại số & Luyện thi THPTQG</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onOpenLesson(MOCK_LESSONS[0])}
                className="mt-6 w-full py-2.5 rounded-xl bg-[#EBF2FF] hover:bg-[#1865F2] text-[#1865F2] hover:text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Học môn Toán</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Domain 2: Khoa học & Tự nhiên (Khan Green #14BF96) */}
            <div className="bg-white dark:bg-[#0D2650] rounded-2xl border-2 border-[#14BF96]/20 hover:border-[#14BF96] hover:shadow-xl transition-all duration-200 p-6 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#E6FAF6] dark:bg-emerald-950/50 text-[#14BF96] flex items-center justify-center font-bold shadow-xs">
                  <TbAtom className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-[#0B2149] dark:text-white group-hover:text-[#14BF96] transition-colors">
                    Khoa học & STEM
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Khám phá thế giới qua các bài học tương tác: Vật lý, Hóa học, Sinh học và Khoa
                    học Tự nhiên.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs font-medium text-slate-700 dark:text-slate-200">
                  <div className="flex items-center gap-1.5 hover:text-[#14BF96] cursor-pointer">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#14BF96]" />
                    <span>Khoa học Tự nhiên THCS</span>
                  </div>
                  <div className="flex items-center gap-1.5 hover:text-[#14BF96] cursor-pointer">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#14BF96]" />
                    <span>Vật lý lý thuyết & Thí nghiệm</span>
                  </div>
                  <div className="flex items-center gap-1.5 hover:text-[#14BF96] cursor-pointer">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#14BF96]" />
                    <span>Hóa học: Phản ứng & Hợp chất</span>
                  </div>
                  <div className="flex items-center gap-1.5 hover:text-[#14BF96] cursor-pointer">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#14BF96]" />
                    <span>Sinh học tế bào & Di truyền</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onOpenLesson(MOCK_LESSONS[2] || MOCK_LESSONS[0])}
                className="mt-6 w-full py-2.5 rounded-xl bg-[#E6FAF6] hover:bg-[#14BF96] text-[#008272] hover:text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Học Khoa học</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Domain 3: Máy tính & AI (Khan Purple #7433FF) */}
            <div className="bg-white dark:bg-[#0D2650] rounded-2xl border-2 border-[#7433FF]/20 hover:border-[#7433FF] hover:shadow-xl transition-all duration-200 p-6 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#F3F0FF] dark:bg-purple-950/50 text-[#7433FF] flex items-center justify-center font-bold shadow-xs">
                  <RiRobot2Fill className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-[#0B2149] dark:text-white group-hover:text-[#7433FF] transition-colors">
                    Lập trình & Tin học
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Xây dựng tư duy logic qua Scratch, Python, thuật toán và nhập môn Trí tuệ nhân
                    tạo (AI).
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs font-medium text-slate-700 dark:text-slate-200">
                  <div className="flex items-center gap-1.5 hover:text-[#7433FF] cursor-pointer">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7433FF]" />
                    <span>Lập trình Scratch cho thiếu nhi</span>
                  </div>
                  <div className="flex items-center gap-1.5 hover:text-[#7433FF] cursor-pointer">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7433FF]" />
                    <span>Python căn bản & Dự án</span>
                  </div>
                  <div className="flex items-center gap-1.5 hover:text-[#7433FF] cursor-pointer">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7433FF]" />
                    <span>Thuật toán & Tư duy máy tính</span>
                  </div>
                  <div className="flex items-center gap-1.5 hover:text-[#7433FF] cursor-pointer">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7433FF]" />
                    <span>Nhập môn Trí Tuệ Nhân Tạo (AI)</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onOpenLesson(MOCK_LESSONS[1] || MOCK_LESSONS[0])}
                className="mt-6 w-full py-2.5 rounded-xl bg-[#F3F0FF] hover:bg-[#7433FF] text-[#7433FF] hover:text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Học Lập trình & AI</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Domain 4: Ngôn ngữ & Xã hội (Khan Coral #EA580C) */}
            <div className="bg-white dark:bg-[#0D2650] rounded-2xl border-2 border-[#EA580C]/20 hover:border-[#EA580C] hover:shadow-xl transition-all duration-200 p-6 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#FFF7ED] dark:bg-orange-950/50 text-[#EA580C] flex items-center justify-center font-bold shadow-xs">
                  <RiBookOpenFill className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-[#0B2149] dark:text-white group-hover:text-[#EA580C] transition-colors">
                    Ngôn ngữ & Xã hội
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Trau dồi cảm thụ Ngữ Văn, Tiếng Anh giao tiếp K–12, Lịch sử và Địa lý quê hương
                    Việt Nam.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs font-medium text-slate-700 dark:text-slate-200">
                  <div className="flex items-center gap-1.5 hover:text-[#EA580C] cursor-pointer">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C]" />
                    <span>Ngữ Văn: Đọc hiểu & Cảm thụ</span>
                  </div>
                  <div className="flex items-center gap-1.5 hover:text-[#EA580C] cursor-pointer">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C]" />
                    <span>Tiếng Anh K–12 chuẩn CEFR</span>
                  </div>
                  <div className="flex items-center gap-1.5 hover:text-[#EA580C] cursor-pointer">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C]" />
                    <span>Lịch sử & Văn hóa Việt Nam</span>
                  </div>
                  <div className="flex items-center gap-1.5 hover:text-[#EA580C] cursor-pointer">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C]" />
                    <span>Kinh tế & Giáo dục tài chính</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onOpenLesson(MOCK_LESSONS[0])}
                className="mt-6 w-full py-2.5 rounded-xl bg-[#FFF7ED] hover:bg-[#EA580C] text-[#EA580C] hover:text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Học Nhân văn</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Filter Pill Badges */}
          <div className="pt-4 flex flex-wrap justify-center gap-2.5">
            {SUBJECT_ITEMS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onOpenLesson(MOCK_LESSONS[idx % MOCK_LESSONS.length])}
                className="flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold border border-[#E4E7EB] dark:border-slate-700 hover:border-[#1865F2] hover:shadow-xs bg-[#F7F8FA] dark:bg-slate-800/80 transition-all cursor-pointer"
              >
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs"
                  style={{ backgroundColor: item.bg, color: item.color }}
                >
                  {item.icon}
                </span>
                <span className="text-[#21242C] dark:text-slate-100">
                  {t(item.labelKey, item.fallback)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────
          HOW KHAN ACADEMY WORKS — split with real graphic
      ──────────────────────────────────────────────── */}
      <section className="bg-white dark:bg-[#0B1120] py-16 border-b border-slate-100 dark:border-slate-800 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left text */}
          <div className="space-y-5">
            <p className="text-xs font-bold uppercase tracking-widest text-[#1865F2] dark:text-blue-400">
              {t("how_badge", "Cách DMKLab hoạt động")}
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#21242C] dark:text-white leading-tight">
              {t("how_title_1", "Tiến bộ thực sự bắt đầu từ")}{" "}
              <em className="not-italic text-[#1865F2] dark:text-blue-400">
                {t("how_title_emphasis", "cách")}
              </em>{" "}
              {t("how_title_2", "học sinh học.")}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t(
                "how_desc",
                "Học sinh học tốt nhất khi thực hành đều đặn, nhận phản hồi ngay và được hỗ trợ kịp thời. DMKLab giúp điều đó khả thi để học sinh luôn tiến về phía trước, dù ở đâu trong hành trình học tập."
              )}
            </p>
            <ul className="space-y-3">
              {HOW_WORKS_CHECKS.map((c, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200"
                >
                  <CheckCircle className="w-4 h-4 text-[#14BF96] shrink-0 mt-0.5" />
                  {c}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Mastery Growth graphic from img-web */}
          <div className="relative flex justify-center items-center bg-slate-50/80 dark:bg-slate-800/60 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
            <img
              src="/img-web/v2_growing_asset.svg"
              alt="4 cấp độ tinh thông kỹ năng: Chưa học - Làm quen - Thành thạo - Tinh thông"
              className="w-full max-w-md object-contain drop-shadow-sm"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────
          LEARNER RESULTS — "Every skill counts"
      ──────────────────────────────────────────────── */}
      <section className="bg-[#F7F8FA] dark:bg-[#080D1A] py-16 border-b border-slate-100 dark:border-slate-800 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left image */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-sm">
              <img
                src="/img-web/background-hoc-tap-1-002.webp"
                alt="Kết quả học sinh"
                className="w-full rounded-3xl object-cover shadow-xl"
                style={{ aspectRatio: "1/1" }}
                loading="lazy"
                decoding="async"
              />
              {/* Floating progress chart overlay */}
              <div className="absolute -bottom-5 -right-5 bg-white dark:bg-[#131E35] rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-3">
                <img
                  src="/img-web/ebae4d32de6a73eb-real_progress_graphic.svg"
                  alt="Biểu đồ kỹ năng"
                  className="w-36 h-auto"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </div>

          {/* Right text */}
          <div className="space-y-5">
            <p className="text-xs font-bold uppercase tracking-widest text-[#14BF96]">
              {t("results_badge", "Kết quả học sinh")}
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#21242C] dark:text-white leading-tight">
              {t("results_title", "Mỗi kỹ năng đều có giá trị.")}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t(
                "results_desc",
                "Mỗi kỹ năng học sinh làm chủ đều xây dựng lên kỹ năng tiếp theo, giúp lấp đầy lỗ hổng kiến thức, tạo tự tin và tiến lên. Tiến bộ là có thể đo lường – và nó cộng dồn theo thời gian."
              )}
            </p>
            <ul className="space-y-3">
              {LEARNER_CHECKS.map((c, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200"
                >
                  <CheckCircle className="w-4 h-4 text-[#14BF96] shrink-0 mt-0.5" />
                  {c}
                </li>
              ))}
            </ul>
            <button className="khan-btn-primary text-sm px-6 py-3 cursor-pointer gap-2">
              {t("results_btn", "Xem tác động thực tế")}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────
          AUDIENCE TABS — Schools / Teachers / Students / Families
      ──────────────────────────────────────────────── */}
      <section className="bg-white dark:bg-[#0B1120] py-16 border-b border-slate-100 dark:border-slate-800 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Tab Nav */}
          <div className="flex gap-6 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
            {[
              { key: "schools", label: t("audience_tab_schools", "Trường học & Sở GD") },
              { key: "teachers", label: t("audience_tab_teachers", "Giáo viên") },
              { key: "students", label: t("audience_tab_students", "Học sinh") },
              { key: "families", label: t("audience_tab_families", "Gia đình") },
            ].map((tItem) => (
              <button
                key={tItem.key}
                onClick={() => setActiveAudienceTab(tItem.key as any)}
                className={`pb-3 text-sm font-bold whitespace-nowrap border-b-2 transition cursor-pointer ${
                  activeAudienceTab === tItem.key
                    ? "border-[#1865F2] dark:border-blue-400 text-[#1865F2] dark:text-blue-400"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                {tItem.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <h2 className="text-3xl font-extrabold text-[#21242C] dark:text-white leading-tight">
                {activeAudienceTab === "schools" &&
                  t("audience_schools_title", "Thúc đẩy tiến bộ trên mọi lớp học.")}
                {activeAudienceTab === "teachers" &&
                  t("audience_teachers_title", "Cung cấp cho mỗi học sinh sự hỗ trợ cần thiết.")}
                {activeAudienceTab === "students" &&
                  t("audience_students_title", "Tự học theo tốc độ của bản thân, miễn phí.")}
                {activeAudienceTab === "families" &&
                  t("audience_families_title", "Xem con bạn học thật sự hiệu quả.")}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {activeAudienceTab === "schools" &&
                  t(
                    "audience_schools_desc",
                    "DMKLab được giáo viên tin dùng mỗi ngày. Các quan hệ đối tác cấp trường xây dựng trên nền tảng đó, mang lại sự nhất quán và học tập sâu hơn trên toàn trường."
                  )}
                {activeAudienceTab === "teachers" &&
                  t(
                    "audience_teachers_desc",
                    "Hiểu chính xác mỗi học sinh cần gì, tiết kiệm thời gian chuẩn bị bài và tập trung vào những khoảnh khắc dạy học quan trọng nhất."
                  )}
                {activeAudienceTab === "students" &&
                  t(
                    "audience_students_desc",
                    "Hàng nghìn video bài giảng, bài tập và giải thích. Học mọi thứ từ toán cơ bản đến đại số nâng cao, khoa học, lịch sử và nhiều hơn nữa."
                  )}
                {activeAudienceTab === "families" &&
                  t(
                    "audience_families_desc",
                    "Theo dõi tiến độ học tập của con, biết con đang học gì và cần hỗ trợ ở đâu – tất cả trong một nơi."
                  )}
              </p>
              <div className="flex gap-3">
                <button className="khan-btn-primary text-sm px-5 py-2.5 cursor-pointer">
                  {activeAudienceTab === "schools"
                    ? t("audience_btn_partnership", "Khám phá quan hệ đối tác")
                    : t("audience_btn_get_started", "Bắt đầu ngay")}
                </button>
                <button className="khan-btn-outline text-sm px-5 py-2.5 cursor-pointer">
                  {t("audience_btn_contact", "Liên hệ với chúng tôi")}
                </button>
              </div>
            </div>

            {/* Right side image depending on tab */}
            <div className="flex justify-center">
              <div className="w-full max-w-md rounded-2xl overflow-hidden bg-[#E8F5FF] dark:bg-slate-800/80 border border-blue-100 dark:border-slate-700 shadow-md">
                <img
                  src={
                    activeAudienceTab === "schools" || activeAudienceTab === "teachers"
                      ? "/img-web/Healthcare-Market-Access-Banner-2-AdobeStock_829907754-1.png"
                      : "/img-web/background-hoc-tap-001.webp"
                  }
                  alt="Minh hoạ"
                  className="w-full h-56 object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#14BF96] flex items-center justify-center">
                      <CheckCircle className="w-3.5 h-3.5 text-white fill-[#14BF96]" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700">
                      {t("audience_card_skill_practiced", "Thực hành 25 bài tập kỹ năng")}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full">
                    <div className="h-full w-2/3 bg-[#14BF96] rounded-full" />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {t(
                      "audience_card_status",
                      "Đang ở mức Thành Thạo — tiếp tục để đạt Tinh Thông!"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────
          KHANMIGO AI CTA BANNER (matches Khan's bottom CTA)
      ──────────────────────────────────────────────── */}
      <section className="bg-[#0A2540] py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-5 text-white">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-emerald-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              {t("ai_banner_tag", "Trợ lý AI giáo dục K–12")}
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
              {t("ai_banner_title_1", "DMK AI – Gia sư AI gợi mở")}{" "}
              <span className="text-[#14BF96]">{t("ai_banner_title_socratic", "Socratic")}</span>{" "}
              {t("ai_banner_title_2", "của bạn.")}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {t(
                "ai_banner_desc",
                "Không cho chép bài. Không đưa đáp án ngay. DMK AI đặt câu hỏi dẫn dắt tư duy giúp học sinh thực sự hiểu – không chỉ làm xong bài tập."
              )}
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <button
                onClick={onOpenAiChat}
                className="khan-btn-green text-sm px-6 py-3 cursor-pointer gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {t("ai_banner_btn", "Trải nghiệm DMK AI ngay")}
              </button>
            </div>
          </div>

          {/* DMK AI Illustration */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-72 h-72 bg-gradient-to-br from-emerald-500/20 to-blue-500/10 rounded-3xl flex items-center justify-center border border-white/10 shadow-xl">
                <img
                  src="/img-web/khan-illustration.svg"
                  alt="DMK AI Mascot"
                  className="w-48 h-48 object-contain drop-shadow-2xl"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              {/* Floating chat bubble */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-3 max-w-[180px] border border-slate-100">
                <p className="text-[11px] text-slate-700 font-medium leading-relaxed">
                  {t("ai_bubble_prompt", '💡 "Bước đầu tiên em định làm gì với bài toán này?"')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
