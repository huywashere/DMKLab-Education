"use client";

import React, { useState } from "react";
import { User, Grade, Lesson } from "@/types";
import { MOCK_SUBJECTS, MOCK_LESSONS } from "@/lib/mock-data";
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
  Sparkles
} from "lucide-react";

interface KhanHomepageProps {
  currentUser: User;
  selectedGrade: Grade;
  onOpenLesson: (lesson: Lesson) => void;
  onOpenAiChat: () => void;
}

const SUBJECT_ITEMS = [
  { icon: <Calculator className="w-5 h-5" />, label: "Toán: Tiểu học (Lớp 1–5)", color: "#1865F2", bg: "#EBF2FF" },
  { icon: <Calculator className="w-5 h-5" />, label: "Toán: THCS & THPT (Lớp 6–12)", color: "#1865F2", bg: "#EBF2FF" },
  { icon: <Calculator className="w-5 h-5" />, label: "Toán: Phân theo lớp học", color: "#1865F2", bg: "#EBF2FF" },
  { icon: <Atom className="w-5 h-5" />, label: "Khoa học Tự nhiên & STEM", color: "#14BF96", bg: "#E6FAF6" },
  { icon: <Globe className="w-5 h-5" />, label: "Tiếng Anh giao tiếp K–12", color: "#8B5CF6", bg: "#F3F0FF" },
  { icon: <BookOpen className="w-5 h-5" />, label: "Ngữ Văn & Ngôn ngữ học", color: "#F59E0B", bg: "#FFF9EB" },
  { icon: <Compass className="w-5 h-5" />, label: "Lịch sử & Địa lý Việt Nam", color: "#EF4444", bg: "#FEF2F2" },
  { icon: <BarChart2 className="w-5 h-5" />, label: "Kinh tế & Giáo dục tài chính", color: "#10B981", bg: "#ECFDF5" },
  { icon: <Sparkles className="w-5 h-5" />, label: "AI & Lập trình cho học sinh", color: "#6366F1", bg: "#EEEFFF" },
];

const STATS = [
  { value: "180M+", label: "học sinh đăng ký học" },
  { value: "63B+", label: "phút học tập thực sự" },
  { value: "Miễn phí", label: "cho học sinh & giáo viên" },
  { value: "15+ năm", label: "tập trung vào một sứ mệnh" },
];

const WHO_ARE_YOU = [
  {
    role: "Học sinh",
    desc: "Học tập theo tốc độ của bản thân",
    href: "#",
    color: "text-[#1865F2]",
    border: "border-[#1865F2]",
  },
  {
    role: "Gia đình",
    desc: "Hỗ trợ việc học của con bạn",
    href: "#",
    color: "text-slate-700",
    border: "border-slate-200",
  },
  {
    role: "Giáo viên",
    desc: "Giáo viên với lớp học",
    href: "#",
    color: "text-slate-700",
    border: "border-slate-200",
  },
  {
    role: "Trường học & Sở",
    desc: "Triển khai AI toàn trường",
    href: "#",
    color: "text-slate-700",
    border: "border-slate-200",
  },
];

const HOW_WORKS_CHECKS = [
  "Luyện tập xây dựng hiểu biết thông qua các kỹ năng theo chuẩn chương trình",
  "Phản hồi tức thì giúp học sinh vượt qua điểm khó khi gặp",
  "Thấu hiểu học sinh giúp giáo viên định hướng chính xác",
];

const LEARNER_CHECKS = [
  "1 kỹ năng thành thạo = +0.5 điểm phần trăm",
  "10 kỹ năng thành thạo = +5 điểm phần trăm",
  "60 kỹ năng thành thạo = +30 điểm phần trăm",
];

export const KhanHomepage: React.FC<KhanHomepageProps> = ({
  currentUser,
  selectedGrade,
  onOpenLesson,
  onOpenAiChat,
}) => {
  const [activeWho, setActiveWho] = useState(0);
  const [activeAudienceTab, setActiveAudienceTab] = useState<'schools' | 'teachers' | 'students' | 'families'>('schools');

  return (
    <div className="w-full">
      {/* ────────────────────────────────────────────────
          HERO SECTION — exact Khan Academy split layout
      ──────────────────────────────────────────────── */}
      <section className="bg-[#FEF8E7] border-b border-[#E8E3D0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left: Headlines + Bullets */}
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#21242C] leading-tight tracking-tight">
              Biến mục tiêu học tập lớn thành{" "}
              <em className="not-italic text-[#1865F2]">kết quả thực sự.</em>
            </h1>
            <p className="text-base text-slate-600 leading-relaxed max-w-lg">
              EduK12 giúp nhà trường cá nhân hóa việc học, củng cố kỹ năng nền tảng và hỗ trợ từng học sinh – dù đang bắt kịp, giữ nhịp hay sẵn sàng tiến xa hơn.
            </p>

            <ul className="space-y-2 text-sm text-slate-700">
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
                Bắt đầu học ngay
              </button>
              <button
                className="khan-btn-secondary text-sm px-6 py-3 cursor-pointer"
              >
                Tìm hiểu thêm
              </button>
            </div>
          </div>

          {/* Right: Khan-style illustration using user's images + "Get started" card */}
          <div className="relative flex flex-col items-center">
            {/* Illustration image from img-web */}
            <div className="relative w-full max-w-md mx-auto">
              <img
                src="/img-web/background-hoc-tap-001.webp"
                alt="Học sinh học tập trực tuyến"
                className="w-full rounded-3xl object-cover shadow-xl border border-[#E8E3D0]"
                style={{ aspectRatio: "4/3" }}
              />
              {/* Floating mascot-style badge */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl border border-slate-200 px-4 py-3 flex items-center gap-3">
                <img
                  src="/img-web/khan-illustration.svg"
                  alt="Khan mascot"
                  className="w-12 h-12 object-contain"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">Khanmigo AI</p>
                  <p className="text-[11px] text-slate-500">Gia sư gợi mở Socratic</p>
                </div>
              </div>
              {/* Floating streak badge top right */}
              <div className="absolute -top-3 -right-3 bg-[#FFC700] text-white text-xs font-black px-3 py-1.5 rounded-full shadow-md flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-white" />
                <span>{currentUser.energyPoints.toLocaleString()} Điểm</span>
              </div>
            </div>

            {/* "Get started" role selector card — mimics Khan Academy's right column */}
            <div className="w-full max-w-md mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 pt-4 pb-2">
                <p className="text-sm font-bold text-slate-800 mb-3">Bạn là ai?</p>
                <div className="divide-y divide-slate-100">
                  {WHO_ARE_YOU.map((w, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveWho(idx)}
                      className={`w-full text-left px-2 py-3 flex items-center justify-between hover:bg-slate-50 transition text-sm cursor-pointer ${activeWho === idx ? 'bg-slate-50' : ''}`}
                    >
                      <div>
                        <span className={`font-bold ${activeWho === idx ? 'text-[#1865F2]' : 'text-slate-800'}`}>{w.role}</span>
                        <p className="text-[11px] text-slate-500">{w.desc}</p>
                      </div>
                      <ChevronRight className={`w-4 h-4 shrink-0 ${activeWho === idx ? 'text-[#1865F2]' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
                Đã có tài khoản?{" "}
                <button className="text-[#1865F2] font-bold hover:underline">Đăng nhập</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────
          STATS BAR — 180M+, 63B+, Free, 15+ years
      ──────────────────────────────────────────────── */}
      <section className="border-b border-slate-200 bg-white py-8">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {STATS.map((s, i) => (
            <div key={i} className="space-y-1">
              <p className="text-2xl sm:text-3xl font-extrabold text-[#21242C]">{s.value}</p>
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ────────────────────────────────────────────────
          COURSES SECTION — "Explore our courses"
          Exact Khan Academy pill-badge layout
      ──────────────────────────────────────────────── */}
      <section className="bg-white py-16 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#21242C]">
            Khám phá các môn học
          </h2>

          <div className="flex flex-wrap justify-center gap-3">
            {SUBJECT_ITEMS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onOpenLesson(MOCK_LESSONS[idx % MOCK_LESSONS.length])}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold border border-slate-200 hover:border-slate-300 hover:shadow-sm bg-white transition cursor-pointer"
                style={{ color: item.color }}
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: item.bg, color: item.color }}
                >
                  {item.icon}
                </span>
                <span className="text-[#21242C]">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────
          HOW KHAN ACADEMY WORKS — split with real graphic
      ──────────────────────────────────────────────── */}
      <section className="bg-white py-16 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left text */}
          <div className="space-y-5">
            <p className="text-xs font-bold uppercase tracking-widest text-[#1865F2]">
              Cách EduK12 hoạt động
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#21242C] leading-tight">
              Tiến bộ thực sự bắt đầu từ{" "}
              <em className="not-italic text-[#1865F2]">cách</em>{" "}
              học sinh học.
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Học sinh học tốt nhất khi thực hành đều đặn, nhận phản hồi ngay và được hỗ trợ kịp thời. EduK12 giúp điều đó khả thi để học sinh luôn tiến về phía trước, dù ở đâu trong hành trình học tập.
            </p>
            <ul className="space-y-3">
              {HOW_WORKS_CHECKS.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle className="w-4 h-4 text-[#14BF96] shrink-0 mt-0.5" />
                  {c}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Real progress graphic from img-web */}
          <div className="relative flex justify-center">
            <img
              src="/img-web/75eaf31453137fba-pre_footer_graphic_desktop@2x.webp"
              alt="Biểu đồ tiến độ học tập thực sự"
              className="w-full max-w-md rounded-2xl object-contain drop-shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────
          LEARNER RESULTS — "Every skill counts"
      ──────────────────────────────────────────────── */}
      <section className="bg-[#F7F8FA] py-16 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left image */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-sm">
              <img
                src="/img-web/background-hoc-tap-1-002.webp"
                alt="Kết quả học sinh"
                className="w-full rounded-3xl object-cover shadow-xl"
                style={{ aspectRatio: "1/1" }}
              />
              {/* Floating progress chart overlay */}
              <div className="absolute -bottom-5 -right-5 bg-white rounded-2xl shadow-xl border border-slate-100 p-3">
                <img
                  src="/img-web/ebae4d32de6a73eb-real_progress_graphic.svg"
                  alt="Biểu đồ kỹ năng"
                  className="w-36 h-auto"
                />
              </div>
            </div>
          </div>

          {/* Right text */}
          <div className="space-y-5">
            <p className="text-xs font-bold uppercase tracking-widest text-[#14BF96]">
              Kết quả học sinh
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#21242C] leading-tight">
              Mỗi kỹ năng đều có giá trị.
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Mỗi kỹ năng học sinh làm chủ đều xây dựng lên kỹ năng tiếp theo, giúp lấp đầy lỗ hổng kiến thức, tạo tự tin và tiến lên. Tiến bộ là có thể đo lường – và nó cộng dồn theo thời gian.
            </p>
            <ul className="space-y-3">
              {LEARNER_CHECKS.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle className="w-4 h-4 text-[#14BF96] shrink-0 mt-0.5" />
                  {c}
                </li>
              ))}
            </ul>
            <button className="khan-btn-primary text-sm px-6 py-3 cursor-pointer gap-2">
              Xem tác động thực tế
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────
          AUDIENCE TABS — Schools / Teachers / Students / Families
      ──────────────────────────────────────────────── */}
      <section className="bg-white py-16 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Tab Nav */}
          <div className="flex gap-6 border-b border-slate-200 overflow-x-auto">
            {[
              { key: 'schools', label: 'Trường học & Sở GD' },
              { key: 'teachers', label: 'Giáo viên' },
              { key: 'students', label: 'Học sinh' },
              { key: 'families', label: 'Gia đình' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveAudienceTab(t.key as any)}
                className={`pb-3 text-sm font-bold whitespace-nowrap border-b-2 transition cursor-pointer ${
                  activeAudienceTab === t.key
                    ? 'border-[#1865F2] text-[#1865F2]'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <h2 className="text-3xl font-extrabold text-[#21242C] leading-tight">
                {activeAudienceTab === 'schools' && "Thúc đẩy tiến bộ trên mọi lớp học."}
                {activeAudienceTab === 'teachers' && "Cung cấp cho mỗi học sinh sự hỗ trợ cần thiết."}
                {activeAudienceTab === 'students' && "Tự học theo tốc độ của bản thân, miễn phí."}
                {activeAudienceTab === 'families' && "Xem con bạn học thật sự hiệu quả."}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {activeAudienceTab === 'schools' && "EduK12 được giáo viên tin dùng mỗi ngày. Các quan hệ đối tác cấp trường xây dựng trên nền tảng đó, mang lại sự nhất quán và học tập sâu hơn trên toàn trường."}
                {activeAudienceTab === 'teachers' && "Hiểu chính xác mỗi học sinh cần gì, tiết kiệm thời gian chuẩn bị bài và tập trung vào những khoảnh khắc dạy học quan trọng nhất."}
                {activeAudienceTab === 'students' && "Hàng nghìn video bài giảng, bài tập và giải thích. Học mọi thứ từ toán cơ bản đến đại số nâng cao, khoa học, lịch sử và nhiều hơn nữa."}
                {activeAudienceTab === 'families' && "Theo dõi tiến độ học tập của con, biết con đang học gì và cần hỗ trợ ở đâu – tất cả trong một nơi."}
              </p>
              <div className="flex gap-3">
                <button className="khan-btn-primary text-sm px-5 py-2.5 cursor-pointer">
                  {activeAudienceTab === 'schools' ? "Khám phá quan hệ đối tác" : "Bắt đầu ngay"}
                </button>
                <button className="khan-btn-outline text-sm px-5 py-2.5 cursor-pointer">
                  Liên hệ với chúng tôi
                </button>
              </div>
            </div>

            {/* Right side image depending on tab */}
            <div className="flex justify-center">
              <div className="w-full max-w-md rounded-2xl overflow-hidden bg-[#E8F5FF] border border-blue-100 shadow-md">
                <img
                  src={activeAudienceTab === 'schools' || activeAudienceTab === 'teachers'
                    ? "/img-web/Healthcare-Market-Access-Banner-2-AdobeStock_829907754-1.png"
                    : "/img-web/background-hoc-tap-001.webp"
                  }
                  alt="Minh hoạ"
                  className="w-full h-56 object-cover"
                />
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#14BF96] flex items-center justify-center">
                      <CheckCircle className="w-3.5 h-3.5 text-white fill-[#14BF96]" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700">Thực hành 25 bài tập kỹ năng</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full">
                    <div className="h-full w-2/3 bg-[#14BF96] rounded-full" />
                  </div>
                  <p className="text-[11px] text-slate-400">Đang ở mức Thành Thạo — tiếp tục để đạt Tinh Thông!</p>
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
              Trợ lý AI giáo dục K–12
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
              Khanmigo – Gia sư AI gợi mở{" "}
              <span className="text-[#14BF96]">Socratic</span> của bạn.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Không cho chép bài. Không đưa đáp án ngay. Khanmigo đặt câu hỏi dẫn dắt tư duy giúp học sinh thực sự hiểu – không chỉ làm xong bài tập.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <button
                onClick={onOpenAiChat}
                className="khan-btn-green text-sm px-6 py-3 cursor-pointer gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Thử Khanmigo AI ngay
              </button>
            </div>
          </div>

          {/* Khanmigo Illustration */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-72 h-72 bg-gradient-to-br from-emerald-500/20 to-blue-500/10 rounded-3xl flex items-center justify-center border border-white/10 shadow-xl">
                <img
                  src="/img-web/khan-illustration.svg"
                  alt="Khanmigo AI Mascot"
                  className="w-48 h-48 object-contain drop-shadow-2xl"
                />
              </div>
              {/* Floating chat bubble */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-3 max-w-[180px] border border-slate-100">
                <p className="text-[11px] text-slate-700 font-medium leading-relaxed">
                  💡 "Bước đầu tiên em định làm gì với bài toán này?"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
