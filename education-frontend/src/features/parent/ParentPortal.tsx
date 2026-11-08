"use client";

import React, { useState } from "react";
import { User } from "@/types";
import {
  UserCheck,
  Shield,
  Heart,
  Flame,
  Award,
  Clock,
  BookOpen,
  Sparkles,
  Send,
  PlusCircle,
  Eye,
  CheckCircle2,
  AlertCircle,
  Calendar,
  MessageSquare,
  Lock,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

interface ParentPortalProps {
  currentUser?: User;
}

interface LinkedChild {
  id: string;
  name: string;
  studentCode: string;
  grade: string;
  school: string;
  avatarUrl: string;
  weeklyHours: number;
  targetHours: number;
  energyPoints: number;
  streakDays: number;
  completedLessonsThisWeek: number;
}

interface SkillMastery {
  subject: string;
  topic: string;
  score: number;
  status: "MASTERED" | "PROFICIENT" | "IMPROVING" | "NEEDS_HELP";
  recommendation: string;
}

interface TeacherMessage {
  id: string;
  sender: string;
  role: string;
  timestamp: string;
  content: string;
  isTeacher: boolean;
}

const INITIAL_CHILDREN: LinkedChild[] = [
  {
    id: "child-01",
    name: "Trần Văn An",
    studentCode: "HS-2026-001",
    grade: "Lớp 5A1 (Tiểu Học)",
    school: "Trường Tiểu Học Thực Nghiệm Hà Nội",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=an",
    weeklyHours: 4.5,
    targetHours: 5.0,
    energyPoints: 2450,
    streakDays: 7,
    completedLessonsThisWeek: 8,
  },
  {
    id: "child-02",
    name: "Trần Bảo Vy",
    studentCode: "HS-2026-089",
    grade: "Lớp 2A3 (Tiểu Học)",
    school: "Trường Tiểu Học Thực Nghiệm Hà Nội",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=vy",
    weeklyHours: 3.2,
    targetHours: 4.0,
    energyPoints: 1820,
    streakDays: 4,
    completedLessonsThisWeek: 6,
  },
];

const INITIAL_SKILLS: SkillMastery[] = [
  {
    subject: "Toán Học Lớp 5",
    topic: "Phân số & Số thập phân",
    score: 95,
    status: "MASTERED",
    recommendation: "Con làm bài rất xuất sắc, tính nhẩm nhanh và chính xác.",
  },
  {
    subject: "Toán Học Lớp 5",
    topic: "Hình học: Chu vi & Diện tích hình thang",
    score: 88,
    status: "PROFICIENT",
    recommendation: "Nắm vững công thức, cần chú ý đơn vị đo khi đổi mét sang xăng-ti-mét.",
  },
  {
    subject: "Toán Học Lớp 5",
    topic: "Giải toán chuyển động đều (v = s/t)",
    score: 72,
    status: "IMPROVING",
    recommendation: "Đang tiến bộ tốt, đã hiểu cách vẽ sơ đồ đoạn thẳng.",
  },
  {
    subject: "Khoa Học Tự Nhiên 5",
    topic: "Sự biến đổi của chất & Năng lượng",
    score: 62,
    status: "NEEDS_HELP",
    recommendation: "Cần ôn tập thêm bài 14. Gia sư AI Socratic đã tạo bài luyện tập riêng cho con.",
  },
];

const INITIAL_MESSAGES: TeacherMessage[] = [
  {
    id: "m-1",
    sender: "Cô Nguyễn Thị Mai",
    role: "Giáo viên chủ nhiệm 5A1",
    timestamp: "Hôm qua lúc 16:30",
    content: "Chào gia đình! Tuần này bé An học rất tập trung và hăng hái phát biểu trong tiết Toán. Điểm kiểm tra 15 phút của bé đạt 10/10 tuyệt đối ạ!",
    isTeacher: true,
  },
  {
    id: "m-2",
    sender: "Phụ huynh (Bạn)",
    role: "Mẹ bé An",
    timestamp: "Hôm qua lúc 17:15",
    content: "Dạ cảm ơn cô Mai nhiều ạ. Ở nhà cháu cũng chăm chỉ xem video bài giảng trên DMKLab và tự giác làm bài tập về nhà cô giao.",
    isTeacher: false,
  },
];

export const ParentPortal: React.FC<ParentPortalProps> = ({ currentUser }) => {
  const [children, setChildren] = useState<LinkedChild[]>(INITIAL_CHILDREN);
  const [selectedChildId, setSelectedChildId] = useState("child-01");
  const [messages, setMessages] = useState<TeacherMessage[]>(INITIAL_MESSAGES);
  const [inputMsg, setInputMsg] = useState("");
  const [screentimeLimit, setScreentimeLimit] = useState(60);
  const [eyeProtectionEnabled, setEyeProtectionEnabled] = useState(true);

  // Link child modal states
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [newStudentCode, setNewStudentCode] = useState("");
  const [newStudentName, setNewStudentName] = useState("");
  const [newGrade, setNewGrade] = useState("Lớp 6A2");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeChild = children.find((c) => c.id === selectedChildId) || children[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const newMsg: TeacherMessage = {
      id: `m-${Date.now()}`,
      sender: currentUser?.fullName || "Phụ huynh (Bạn)",
      role: `Phụ huynh bé ${activeChild.name}`,
      timestamp: "Vừa xong",
      content: inputMsg.trim(),
      isTeacher: false,
    };

    setMessages([...messages, newMsg]);
    setInputMsg("");
    setToastMessage("Đã gửi tin nhắn đến Giáo viên phụ trách thành công!");
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLinkNewChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentCode.trim() || !newStudentName.trim()) return;

    const newChild: LinkedChild = {
      id: `child-${Date.now()}`,
      name: newStudentName.trim(),
      studentCode: newStudentCode.trim().toUpperCase(),
      grade: newGrade,
      school: "Trường THCS Chu Văn An",
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newStudentName}`,
      weeklyHours: 1.5,
      targetHours: 5.0,
      energyPoints: 1200,
      streakDays: 2,
      completedLessonsThisWeek: 3,
    };

    setChildren([...children, newChild]);
    setSelectedChildId(newChild.id);
    setIsLinkModalOpen(false);
    setNewStudentCode("");
    setNewStudentName("");
    setToastMessage(`Đã liên kết tài khoản học sinh ${newChild.name} (${newChild.studentCode}) thành công!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 text-xs text-slate-800">
      {/* Header & Child Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-purple-100 text-purple-800 font-bold px-2.5 py-0.5 rounded text-[10px] uppercase">
              Cổng Giám Sát Học Tập K-12
            </span>
            <span className="text-slate-400 font-medium">Bảo vệ quyền riêng tư & Đồng hành cùng con</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-purple-600" />
            Cổng Phụ Huynh (Parent Portal)
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Phụ huynh: <strong className="text-slate-800">{currentUser?.fullName || "Bác Trần Quang Huy"}</strong> · Theo dõi học tập minh bạch không áp lực
          </p>
        </div>

        {/* Child Selector & Link Button */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedChildId}
            onChange={(e) => setSelectedChildId(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
          >
            {children.map((c) => (
              <option key={c.id} value={c.id}>
                Bé: {c.name} ({c.grade}) - {c.studentCode}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsLinkModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Liên Kết Thêm Con</span>
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-between animate-fade">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-600 hover:text-emerald-900 font-black">
            ✕
          </button>
        </div>
      )}

      {/* Child Profile Summary Bar */}
      <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src={activeChild.avatarUrl} alt="" className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-purple-950">{activeChild.name}</h3>
              <span className="bg-purple-200 text-purple-900 font-mono font-bold text-[10px] px-2 py-0.5 rounded">
                {activeChild.studentCode}
              </span>
            </div>
            <p className="text-xs text-purple-800 mt-0.5">
              {activeChild.grade} · {activeChild.school}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="text-right">
            <span className="text-purple-600 font-bold text-[11px]">Năng lượng tích lũy</span>
            <p className="text-base font-black text-purple-900 flex items-center justify-end gap-1">
              ⭐ {activeChild.energyPoints.toLocaleString()} pts
            </p>
          </div>
          <div className="w-px h-8 bg-purple-200" />
          <div className="text-right">
            <span className="text-purple-600 font-bold text-[11px]">Chuỗi ngày học liên tục</span>
            <p className="text-base font-black text-amber-600 flex items-center justify-end gap-1">
              <Flame className="w-4 h-4 fill-amber-500" /> {activeChild.streakDays} ngày
            </p>
          </div>
        </div>
      </div>

      {/* 4 Weekly KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-slate-500 font-bold text-[11px]">
            <span>Thời lượng học tuần</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {activeChild.weeklyHours} <span className="text-sm font-bold text-slate-500">/ {activeChild.targetHours} giờ</span>
          </p>
          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden mt-1">
            <div
              className="bg-purple-600 h-full rounded-full"
              style={{ width: `${Math.min(100, (activeChild.weeklyHours / activeChild.targetHours) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-emerald-600 font-bold pt-1">Đạt 90% mục tiêu tuần</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-slate-500 font-bold text-[11px]">
            <span>Bài học đã hoàn thành</span>
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-600">{activeChild.completedLessonsThisWeek} bài</p>
          <p className="text-[10px] text-slate-500 font-medium">+2 bài so với tuần trước</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-slate-500 font-bold text-[11px]">
            <span>Mức độ chuyên cần</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600">Tuyệt vời</p>
          <p className="text-[10px] text-emerald-700 font-bold">Học đều đặn mỗi ngày</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-slate-500 font-bold text-[11px]">
            <span>Gia sư AI đồng hành</span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600">Socratic 2.0</p>
          <p className="text-[10px] text-emerald-700 font-bold">Không giải hộ · Gợi ý tư duy</p>
        </div>
      </div>

      {/* 2 Columns: Skill Mastery Breakdown & Screentime Control */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skill Mastery List (2 Cols) */}
        <div className="lg:col-span-2 border border-slate-200 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              Báo Cáo Năng Lực & Độ Tinh Thông Từng Chủ Đề
            </h3>
            <span className="text-slate-400 text-[11px]">Cập nhật theo thời gian thực</span>
          </div>

          <div className="space-y-3">
            {INITIAL_SKILLS.map((sk, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-purple-300 transition space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                      {sk.subject}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-xs mt-1">{sk.topic}</h4>
                  </div>

                  {sk.status === "MASTERED" && (
                    <span className="bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded text-[10px]">
                      Tinh Thông ({sk.score}%) 🏆
                    </span>
                  )}
                  {sk.status === "PROFICIENT" && (
                    <span className="bg-blue-100 text-blue-800 font-extrabold px-2 py-0.5 rounded text-[10px]">
                      Thành Thạo ({sk.score}%) ⚡
                    </span>
                  )}
                  {sk.status === "IMPROVING" && (
                    <span className="bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded text-[10px]">
                      Đang Tiến Bộ ({sk.score}%) 📈
                    </span>
                  )}
                  {sk.status === "NEEDS_HELP" && (
                    <span className="bg-rose-100 text-rose-800 font-extrabold px-2 py-0.5 rounded text-[10px]">
                      Cần Củng Cố ({sk.score}%) 💡
                    </span>
                  )}
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      sk.score >= 90 ? "bg-emerald-500" : sk.score >= 80 ? "bg-blue-500" : sk.score >= 70 ? "bg-amber-500" : "bg-rose-500"
                    }`}
                    style={{ width: `${sk.score}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-100 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>{sk.recommendation}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Screentime & Eye Protection Guard */}
        <div className="border border-slate-200 rounded-xl p-4 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              Kiểm Soát Thời Gian Màn Hình (Screentime)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Bảo vệ mắt và hình thành thói quen lành mạnh</p>
          </div>

          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Giới hạn thời gian học:</span>
                <span className="text-purple-600 font-extrabold">{screentimeLimit} phút / ngày</span>
              </div>
              <input
                type="range"
                min={30}
                max={120}
                step={15}
                value={screentimeLimit}
                onChange={(e) => setScreentimeLimit(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>30 phút</span>
                <span>60 phút</span>
                <span>90 phút</span>
                <span>120 phút</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-blue-600" />
                  Quy tắc 20-20-20 (Nghỉ mắt)
                </span>
                <input
                  type="checkbox"
                  checked={eyeProtectionEnabled}
                  onChange={(e) => setEyeProtectionEnabled(e.target.checked)}
                  className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Tự động tạm dừng bài học và hiện màn hình hướng dẫn bé chớp mắt, nhìn xa 20 giây sau mỗi 20 phút học.
              </p>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-[11px] space-y-1">
              <p className="font-bold flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                Môi trường an toàn 100% K-12:
              </p>
              <p>Hệ thống hoàn toàn không có quảng cáo, không có nội dung độc hại và tuân thủ chuẩn an toàn trẻ em quốc tế COPPA / GDPR-K.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Teacher-Parent Communication Channel */}
      <div className="border border-slate-200 rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#1865F2]" />
            <h3 className="font-extrabold text-sm text-slate-900">Kênh Trao Đổi Trực Tiếp Với Giáo Viên Phụ Trách</h3>
          </div>
          <span className="text-slate-400 text-[11px]">Cô Nguyễn Thị Mai · Lớp 5A1</span>
        </div>

        {/* Message Thread */}
        <div className="space-y-3 max-h-60 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`p-3 rounded-xl max-w-xl text-xs space-y-1 ${
                m.isTeacher ? "bg-white border border-slate-200 text-slate-800 mr-auto" : "bg-purple-600 text-white ml-auto"
              }`}
            >
              <div className="flex items-center justify-between gap-4 text-[10px]">
                <strong className={m.isTeacher ? "text-blue-600" : "text-purple-200"}>
                  {m.sender} ({m.role})
                </strong>
                <span className={m.isTeacher ? "text-slate-400" : "text-purple-200"}>{m.timestamp}</span>
              </div>
              <p className="text-xs leading-relaxed">{m.content}</p>
            </div>
          ))}
        </div>

        {/* Message Input Form */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            required
            placeholder="Gửi tin nhắn hoặc thắc mắc về tình hình học tập của con tới cô giáo..."
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Gửi Tin Nhắn</span>
          </button>
        </form>
      </div>

      {/* Modal: Liên Kết Thêm Con */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-purple-600" />
                Liên Kết Tài Khoản Học Sinh Mới
              </h3>
              <button onClick={() => setIsLinkModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleLinkNewChild} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mã định danh học sinh K-12 (Student Code):</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: HS-2026-089"
                  value={newStudentCode}
                  onChange={(e) => setNewStudentCode(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none uppercase"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Mã học sinh được in trên thẻ học sinh hoặc do nhà trường cấp.</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Họ và tên học sinh:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Trần Bảo Vy"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Khối lớp hiện tại:</label>
                <select
                  value={newGrade}
                  onChange={(e) => setNewGrade(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="Lớp 1A">Lớp 1 (Tiểu Học)</option>
                  <option value="Lớp 2A">Lớp 2 (Tiểu Học)</option>
                  <option value="Lớp 3A">Lớp 3 (Tiểu Học)</option>
                  <option value="Lớp 4A">Lớp 4 (Tiểu Học)</option>
                  <option value="Lớp 5A1">Lớp 5 (Tiểu Học)</option>
                  <option value="Lớp 6A2">Lớp 6 (THCS)</option>
                  <option value="Lớp 10A1">Lớp 10 (THPT)</option>
                  <option value="Lớp 12A1">Lớp 12 (Ôn thi THPTQG)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Xác nhận liên kết</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

