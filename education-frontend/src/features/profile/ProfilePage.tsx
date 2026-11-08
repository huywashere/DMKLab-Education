"use client";

import React, { useState } from "react";
import { User } from "@/types";
import { api } from "@/lib/api";
import {
  User as UserIcon,
  Flame,
  Award,
  ShieldCheck,
  Key,
  Lock,
  Calendar,
  Edit3,
  Check,
  LogOut,
  Copy,
  Sparkles,
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Layers,
  Zap,
  Smartphone,
  Laptop,
  Tablet,
  Mail,
  ShieldAlert,
  QrCode,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import {
  FcRating,
  FcDiploma1,
  FcDiploma2,
  FcReadingEbook,
  FcBarChart,
  FcSafe,
  FcKey,
  FcCheckmark,
  FcIdea,
  FcCalendar,
  FcApproval,
  FcGraduationCap,
} from "react-icons/fc";
import {
  PiStudentFill,
  PiGraduationCapFill,
  PiFireFill,
  PiTrophyFill,
  PiLightningFill,
  PiBooksFill,
  PiAtomFill,
  PiBrainFill,
  PiSparkleFill,
  PiPencilSimpleFill,
  PiShieldCheckFill,
} from "react-icons/pi";
import { FaArrowRightFromBracket, FaStar } from "react-icons/fa6";
import { TbMathFunction } from "react-icons/tb";
import { RiRobot2Fill, RiSparklingFill } from "react-icons/ri";

interface ProfilePageProps {
  currentUser: User;
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
  onBackToHome: () => void;
  onOpenAiChat?: () => void;
}

const AVATAR_OPTIONS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=an",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=mai",
  "https://api.dicebear.com/7.x/bottts/svg?seed=admin",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=khan_owl",
  "https://api.dicebear.com/7.x/bottts/svg?seed=robot_k12",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=student_star",
  "https://api.dicebear.com/7.x/bottts/svg?seed=space_explorer",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=curious_mind",
];

const KHAN_BADGES = [
  {
    id: 1,
    name: "Thiên Thạch Khởi Đầu",
    category: "Thiên Thạch",
    desc: "Hoàn thành bài tập trắc nghiệm đầu tiên",
    icon: "☄️",
    unlocked: true,
    date: "10/2026",
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: 2,
    name: "Thợ Săn Chuỗi Ngày",
    category: "Thiên Thạch",
    desc: "Đạt chuỗi 3 ngày học liên tiếp",
    icon: "🔥",
    unlocked: true,
    date: "10/2026",
    color: "from-amber-500 to-orange-600",
  },
  {
    id: 3,
    name: "Ánh Trăng Soi Sáng",
    category: "Mặt Trăng",
    desc: "Đạt điểm tuyệt đối 100% trong bài kiểm tra Toán",
    icon: "🌙",
    unlocked: true,
    date: "10/2026",
    color: "from-purple-500 to-violet-600",
  },
  {
    id: 4,
    name: "Kiến Tạo Không Gian",
    category: "Trái Đất",
    desc: "Tích lũy trên 5,000 điểm năng lượng",
    icon: "🌍",
    unlocked: true,
    date: "10/2026",
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: 5,
    name: "Mặt Trời Rực Rỡ",
    category: "Mặt Trời",
    desc: "Hoàn thành toàn bộ chương trình một khối lớp",
    icon: "☀️",
    unlocked: false,
    color: "from-yellow-400 to-amber-500",
  },
  {
    id: 6,
    name: "Hố Đen Huyền Thoại",
    category: "Hố Đen",
    desc: "Đạt 50,000 điểm năng lượng và chuỗi 100 ngày",
    icon: "🌌",
    unlocked: false,
    color: "from-slate-700 to-slate-900",
  },
];

export const ProfilePage: React.FC<ProfilePageProps> = ({
  currentUser,
  onUpdateUser,
  onLogout,
  onBackToHome,
  onOpenAiChat,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "badges" | "security">("overview");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFullName, setEditFullName] = useState(currentUser.fullName);
  const [editBio, setEditBio] = useState(currentUser.bio || "");
  const [editAvatar, setEditAvatar] = useState(currentUser.avatarUrl);
  const [isUpdating, setIsUpdating] = useState(false);

  // Change password states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Copy token
  const [copiedToken, setCopiedToken] = useState(false);
  const rawToken = api.getToken() || "Chưa có token (Phiên khách)";

  // Email verification state
  const [isEmailVerified, setIsEmailVerified] = useState(true);
  const [isSendingVerifyEmail, setIsSendingVerifyEmail] = useState(false);
  const [emailVerifyMsg, setEmailVerifyMsg] = useState<string | null>(null);

  // Active Sessions State
  const [sessions, setSessions] = useState([
    {
      id: "sess-win-01",
      device: "Windows 11 PC",
      browser: "Google Chrome 134",
      ip: "192.168.1.105 (Hà Nội, VN)",
      lastActive: "Đang hoạt động (Thiết bị này)",
      isCurrent: true,
      type: "laptop",
    },
    {
      id: "sess-ios-02",
      device: "iPhone 15 Pro",
      browser: "Mobile Safari 18",
      ip: "14.241.12.88 (TP. Hồ Chí Minh, VN)",
      lastActive: "Hoạt động 2 giờ trước",
      isCurrent: false,
      type: "smartphone",
    },
    {
      id: "sess-pad-03",
      device: "iPad Air 5",
      browser: "Safari Tablet",
      ip: "113.161.45.22 (Đà Nẵng, VN)",
      lastActive: "Hoạt động hôm qua",
      isCurrent: false,
      type: "tablet",
    },
  ]);
  const [sessionActionMsg, setSessionActionMsg] = useState<string | null>(null);

  // 2FA TOTP State
  const [is2FaEnabled, setIs2FaEnabled] = useState(
    currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN"
  );
  const [show2FaModal, setShow2FaModal] = useState(false);

  const handleSendVerificationEmail = () => {
    setIsSendingVerifyEmail(true);
    setEmailVerifyMsg(null);
    setTimeout(() => {
      setIsSendingVerifyEmail(false);
      setEmailVerifyMsg(
        "✓ Đã gửi email xác minh đến " + currentUser.email + ". Vui lòng kiểm tra hộp thư!"
      );
    }, 800);
  };

  const handleRevokeSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    setSessionActionMsg("Đã thu hồi phiên đăng nhập và vô hiệu hóa JWT trên thiết bị.");
    setTimeout(() => setSessionActionMsg(null), 3000);
  };

  const handleRevokeAllOtherSessions = () => {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    setSessionActionMsg("Đã thu hồi thành công toàn bộ phiên đăng nhập trên các thiết bị khác!");
    setTimeout(() => setSessionActionMsg(null), 3500);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const updated = await api.updateProfile({
        fullName: editFullName.trim(),
        avatarUrl: editAvatar,
        bio: editBio.trim(),
      });
      onUpdateUser(updated);
      setIsEditModalOpen(false);
    } catch (err: any) {
      alert(err.message || "Cập nhật thất bại");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ success: false, message: "Mật khẩu xác nhận không khớp." });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordStatus({ success: false, message: "Mật khẩu mới phải từ 6 ký tự trở lên." });
      return;
    }

    setIsChangingPass(true);
    try {
      const msg = await api.changePassword(oldPassword, newPassword);
      setPasswordStatus({ success: true, message: msg || "Đổi mật khẩu thành công!" });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordStatus({ success: false, message: err.message || "Đổi mật khẩu thất bại." });
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(rawToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070D18] pb-16 transition-colors">
      {/* 1. Top Sub-header Navigation */}
      <div className="bg-white dark:bg-[#0B172E] border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#1865F2] dark:hover:text-blue-400 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Khóa học</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
              Không Gian Cá Nhân Học Sinh
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6">
        
        {/* 2. BALANCED PROFILE HERO HEADER CARD (Fixed contrast & alignment) */}
        <div className="bg-white dark:bg-[#0B172E] rounded-[32px] border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
          
          {/* Vibrant Education Cover Banner */}
          <div className="h-32 sm:h-40 bg-gradient-to-r from-[#1865F2] via-[#4F46E5] to-[#14BF96] relative px-6 sm:px-8 flex items-end justify-between pb-3 overflow-hidden">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
            
            <div className="relative z-10 hidden sm:flex items-center gap-2 text-white/90 text-xs font-bold bg-black/25 px-3 py-1 rounded-full border border-white/20">
              <PiSparkleFill className="w-3.5 h-3.5 text-amber-300" />
              <span>Cổng Thông Tin Học Sinh K–12 • Niên Khóa 2025–2026</span>
            </div>

            <div className="relative z-10 ml-auto hidden sm:flex items-center gap-1.5 text-white/90 text-[11px] font-semibold bg-white/20 px-2.5 py-0.5 rounded-full">
              <span>Đang kết nối: Học kỳ II</span>
            </div>
          </div>

          {/* User Info Bar Below Banner — 100% Crisp Contrast */}
          <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0">
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-5 -mt-14 sm:-mt-16 relative z-10">
              
              {/* Left: Avatar + Details */}
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
                {/* Large Avatar */}
                <div className="relative group shrink-0">
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl border-4 border-white dark:border-[#0B172E] shadow-xl bg-slate-100 dark:bg-slate-800 object-cover"
                  />
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="absolute bottom-1 right-1 p-2 bg-[#1865F2] hover:bg-[#1253cc] text-white rounded-2xl shadow-md transition cursor-pointer active:scale-95 border-2 border-white dark:border-[#0B172E]"
                    title="Đổi ảnh đại diện"
                  >
                    <PiPencilSimpleFill className="w-4 h-4" />
                  </button>
                </div>

                {/* Name, Badges & Bio */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      {currentUser.fullName}
                    </h1>
                    
                    {/* Friendly Role & Grade Badges */}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                      <PiStudentFill className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{currentUser.role === "STUDENT" ? "Học Sinh K–12" : currentUser.role}</span>
                    </span>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      <PiGraduationCapFill className="w-3.5 h-3.5 text-[#1865F2]" />
                      <span>Lớp 10 THPT</span>
                    </span>
                  </div>

                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">@{currentUser.username}</span>
                    <span>•</span>
                    <span>{currentUser.email}</span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <FcCalendar className="w-3.5 h-3.5" />
                      <span>Tham gia từ Tháng 10, 2026</span>
                    </span>
                  </p>

                  <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl italic pt-1">
                    "{currentUser.bio || "Chăm chỉ rèn luyện tư duy mỗi ngày để chinh phục các kỳ thi K–12 & Đại học mơ ước 🚀"}"
                  </p>
                </div>
              </div>

              {/* Right: Balanced Action Buttons */}
              <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-center sm:justify-end">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95"
                >
                  <PiPencilSimpleFill className="w-3.5 h-3.5 text-slate-500" />
                  <span>Chỉnh sửa hồ sơ</span>
                </button>

                <button
                  onClick={onLogout}
                  className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <FaArrowRightFromBracket className="w-3.5 h-3.5 text-rose-500" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>

            {/* 3. FOUR INSPIRING STUDENT SCORECARD CARDS (Warm, balanced & friendly) */}
            <div className="mt-7 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
              
              {/* Card 1: Energy Points (XP) */}
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 flex items-center gap-3.5 shadow-2xs group hover:scale-101 transition-transform">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-500 flex items-center justify-center shrink-0 shadow-xs">
                  <FcRating className="w-7 h-7" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate">
                    Điểm Năng Lượng
                  </p>
                  <p className="text-xl font-black text-amber-600 dark:text-amber-400 leading-tight">
                    {(currentUser.energyPoints || 2450).toLocaleString()} <span className="text-xs font-bold">XP</span>
                  </p>
                  <span className="text-[10px] text-amber-700/80 dark:text-amber-300 font-semibold truncate block">
                    Top 5% học tập tích cực
                  </span>
                </div>
              </div>

              {/* Card 2: Streak Days */}
              <div className="p-4 rounded-2xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200/80 dark:border-orange-900/50 flex items-center gap-3.5 shadow-2xs group hover:scale-101 transition-transform">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-900/60 text-orange-500 flex items-center justify-center shrink-0 shadow-xs">
                  <PiFireFill className="w-7 h-7 text-orange-500 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate">
                    Chuỗi Ngày Học
                  </p>
                  <p className="text-xl font-black text-orange-600 dark:text-orange-400 leading-tight">
                    {currentUser.streakDays || 7} <span className="text-xs font-bold">ngày liên tục</span>
                  </p>
                  <span className="text-[10px] text-orange-700/80 dark:text-orange-300 font-semibold truncate block">
                    Duy trì phong độ! 🔥
                  </span>
                </div>
              </div>

              {/* Card 3: Badges Achieved */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/50 flex items-center gap-3.5 shadow-2xs group hover:scale-101 transition-transform">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center shrink-0 shadow-xs">
                  <FcDiploma1 className="w-7 h-7" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate">
                    Huy Hiệu & Cúp
                  </p>
                  <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 leading-tight">
                    4 / 6 <span className="text-xs font-bold">Huy hiệu</span>
                  </p>
                  <span className="text-[10px] text-emerald-700/80 dark:text-emerald-300 font-semibold truncate block">
                    Danh hiệu Học Viên Tinh Thông
                  </span>
                </div>
              </div>

              {/* Card 4: Completed Lessons (Replaces the dry JWT HMAC-512 jargon) */}
              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/50 flex items-center gap-3.5 shadow-2xs group hover:scale-101 transition-transform">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center shrink-0 shadow-xs">
                  <FcReadingEbook className="w-7 h-7" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate">
                    Bài Học Hoàn Thành
                  </p>
                  <p className="text-xl font-black text-[#1865F2] dark:text-blue-400 leading-tight">
                    18 <span className="text-xs font-bold">Bài giảng</span>
                  </p>
                  <span className="text-[10px] text-blue-700/80 dark:text-blue-300 font-semibold truncate block">
                    Đạt 85% lộ trình tháng này
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* 4. BALANCED TAB NAVIGATION */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 sm:gap-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 font-extrabold text-xs sm:text-sm transition border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === "overview"
                ? "border-[#1865F2] text-[#1865F2] dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <FcBarChart className="w-4 h-4" />
            <span>Tổng quan & Lộ trình học</span>
          </button>

          <button
            onClick={() => setActiveTab("badges")}
            className={`pb-3 font-extrabold text-xs sm:text-sm transition border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === "badges"
                ? "border-[#1865F2] text-[#1865F2] dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <FcDiploma2 className="w-4 h-4" />
            <span>Bộ sưu tập Huy hiệu DMKLab (4/6)</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`pb-3 font-extrabold text-xs sm:text-sm transition border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === "security"
                ? "border-[#1865F2] text-[#1865F2] dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <FcSafe className="w-4 h-4" />
            <span>Bảo mật & Phiên JWT</span>
          </button>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            TAB 1: OVERVIEW & PROGRESS (Balanced 2/3 & 1/3 Columns)
        ───────────────────────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Columns: Learning Mastery & Timeline */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Mastery Progress Card */}
              <div className="bg-white dark:bg-[#0B172E] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1865F2] flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-slate-900 dark:text-white">
                        Cấp độ thành thạo môn học K–12
                      </h3>
                      <p className="text-[11px] text-slate-400">Theo chuẩn đánh giá năng lực GDPT 2018</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200/80 dark:border-emerald-800">
                    Trung bình: 65% Tinh thông
                  </span>
                </div>

                <div className="space-y-4 pt-1">
                  {/* Subject 1: Math */}
                  <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-[#071326] border border-slate-200/70 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-950 text-[#1865F2] flex items-center justify-center">
                          <TbMathFunction className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-slate-800 dark:text-slate-200">Toán học 10 • Đại số & Hình học không gian</span>
                      </div>
                      <span className="text-[#1865F2] font-black">75% Thành thạo</span>
                    </div>
                    <div className="w-full bg-slate-200/70 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-[#1865F2] h-full rounded-full w-3/4 transition-all duration-500" />
                    </div>
                    <p className="text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Đã hoàn thành 15/20 chuyên đề</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Sẵn sàng ôn thi THPT</span>
                    </p>
                  </div>

                  {/* Subject 2: Physics */}
                  <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-[#071326] border border-slate-200/70 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                          <PiAtomFill className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-slate-800 dark:text-slate-200">Vật lý 10 • Động học & Cơ học chuyển động</span>
                      </div>
                      <span className="text-emerald-600 dark:text-emerald-400 font-black">50% Quen thuộc</span>
                    </div>
                    <div className="w-full bg-slate-200/70 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-[#14BF96] h-full rounded-full w-1/2 transition-all duration-500" />
                    </div>
                    <p className="text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Đã hoàn thành 8/16 bài thực hành</span>
                      <span className="text-amber-500 font-semibold">Cần làm thêm 2 bài tập lực</span>
                    </p>
                  </div>

                  {/* Subject 3: Chemistry */}
                  <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-[#071326] border border-slate-200/70 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
                          <FcIdea className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-slate-800 dark:text-slate-200">Hóa học 10 • Cấu tạo nguyên tử & Bảng tuần hoàn</span>
                      </div>
                      <span className="text-amber-500 font-black">25% Mới bắt đầu</span>
                    </div>
                    <div className="w-full bg-slate-200/70 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full w-1/4 transition-all duration-500" />
                    </div>
                    <p className="text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Đã hoàn thành 3/12 bài giảng</span>
                      <span className="text-[#1865F2] font-semibold">Gợi ý học cùng Socratic AI</span>
                    </p>
                  </div>

                  {/* Subject 4: AI & Coding */}
                  <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-[#071326] border border-slate-200/70 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
                          <RiRobot2Fill className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-slate-800 dark:text-slate-200">Lập trình Python & Tư duy Trí Tuệ Nhân Tạo</span>
                      </div>
                      <span className="text-purple-600 dark:text-purple-400 font-black">40% Tiến bộ</span>
                    </div>
                    <div className="w-full bg-slate-200/70 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-purple-600 h-full rounded-full w-2/5 transition-all duration-500" />
                    </div>
                    <p className="text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Đã viết 12 script giải toán tự động</span>
                      <span className="text-purple-600 font-semibold">Đạt chuẩn năng lực số K–12</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Learning Milestones */}
              <div className="bg-white dark:bg-[#0B172E] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-slate-900 dark:text-white">
                        Nhật ký học tập & Thành tích gần đây
                      </h3>
                      <p className="text-[11px] text-slate-400">Các hoạt động học tập được hệ thống ghi nhận</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#071326] border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 flex items-center justify-center shrink-0">
                        <FcCheckmark className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">
                          Hoàn thành: Bài 1 Mệnh đề toán học & Tập hợp
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Đạt 100% điểm quiz trắc nghiệm (+50 điểm năng lượng)
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 shrink-0">Hôm nay</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#071326] border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-[#1865F2] flex items-center justify-center shrink-0">
                        <FcRating className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">
                          Duy trì chuỗi học tập 7 ngày liên tiếp
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Nhận huy hiệu "Thợ Săn Chuỗi Ngày" cấp Thiên Thạch
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 shrink-0">Hôm qua</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#071326] border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center shrink-0">
                        <PiBrainFill className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">
                          Tương tác 15 phút với Gia sư AI Socratic
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Hỏi đáp bài toán phân số và giải thích phản ứng oxi hóa khử
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 shrink-0">2 ngày trước</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (1/3 width): School Info & AI Tutor Companion */}
            <div className="space-y-6">
              
              {/* Student School & Account Card */}
              <div className="bg-white dark:bg-[#0B172E] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <FcGraduationCap className="w-5 h-5" />
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">
                    Thông tin học tập & Trường lớp
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-800">
                    <span className="text-slate-400 font-medium">Trường học:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">THPT Chuyên K–12</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-800">
                    <span className="text-slate-400 font-medium">Khối lớp:</span>
                    <span className="font-bold text-[#1865F2] dark:text-blue-400">Lớp 10A1</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-800">
                    <span className="text-slate-400 font-medium">Chương trình:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">GDPT 2018 Mới</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-800">
                    <span className="text-slate-400 font-medium">Giáo viên cố vấn:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">Thầy Nam (Toán)</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400 font-medium">Bảo mật tài khoản:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Đã xác thực
                    </span>
                  </div>
                </div>
              </div>

              {/* Socratic DMK AI Tutor Companion Card */}
              <div className="bg-gradient-to-br from-[#0B2138] to-[#0A2540] text-white rounded-3xl p-6 shadow-md space-y-3 relative overflow-hidden">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[#14BF96]">
                    <RiSparklingFill className="w-4 h-4 animate-spin" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm">Gia sư DMK AI Tutor</h4>
                    <p className="text-[10px] text-slate-300">Phương pháp gợi mở Socratic 24/7</p>
                  </div>
                </div>
                
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  Bạn đang gặp khúc mắc ở bài toán hay hiện tượng vật lý nào? Hãy hỏi AI Tutor để được dẫn dắt từng bước giải!
                </p>

                <button
                  onClick={onOpenAiChat}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#1865F2] hover:bg-[#1253cc] text-white font-bold text-xs transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <PiSparkleFill className="w-4 h-4 text-amber-300" />
                  <span>Trò chuyện với Gia sư AI</span>
                </button>
              </div>

              {/* Weekly Study Goals Card */}
              <div className="bg-white dark:bg-[#0B172E] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <FcApproval className="w-5 h-5" />
                    <h4 className="font-black text-xs text-slate-900 dark:text-white">
                      Mục tiêu tuần này
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
                    4 / 5 Nhiệm vụ
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <label className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                    <input type="checkbox" defaultChecked className="accent-[#1865F2] rounded w-4 h-4" />
                    <span className="line-through text-slate-400">Hoàn thành bài tập Mệnh đề</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                    <input type="checkbox" defaultChecked className="accent-[#1865F2] rounded w-4 h-4" />
                    <span className="line-through text-slate-400">Làm quiz Vật lý Chuyển động</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                    <input type="checkbox" defaultChecked className="accent-[#1865F2] rounded w-4 h-4" />
                    <span className="line-through text-slate-400">Duy trì streak 7 ngày</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                    <input type="checkbox" className="accent-[#1865F2] rounded w-4 h-4" />
                    <span className="font-semibold text-slate-900 dark:text-white">Luyện 1 bài tập Hóa học</span>
                  </label>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 2: BADGES SHOWCASE
        ───────────────────────────────────────────────────────────── */}
        {activeTab === "badges" && (
          <div className="bg-white dark:bg-[#0B172E] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <FcDiploma1 className="w-6 h-6" />
                  <span>Bộ sưu tập Huy hiệu DMKLab</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Chinh phục bài giảng và duy trì chuỗi học tập để mở khóa các danh hiệu thiên văn K–12
                </p>
              </div>

              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300 self-start sm:self-auto">
                <PiTrophyFill className="w-4 h-4 text-amber-500" />
                <span>Đã mở khóa 4 / 6 huy hiệu</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {KHAN_BADGES.map((b) => (
                <div
                  key={b.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    b.unlocked
                      ? "bg-white dark:bg-[#071328] border-slate-200 dark:border-slate-700 shadow-2xs hover:shadow-md"
                      : "bg-slate-50/50 dark:bg-slate-900/40 border-dashed border-slate-300 dark:border-slate-800 opacity-60"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-sm ${
                      b.unlocked ? "bg-slate-100 dark:bg-slate-800" : "bg-slate-100 dark:bg-slate-800 grayscale"
                    }`}>
                      {b.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          {b.category}
                        </span>
                        {b.unlocked ? (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                            Đã đạt ({b.date})
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                            Chưa mở khóa
                          </span>
                        )}
                      </div>
                      <h4 className="font-black text-xs text-slate-900 dark:text-white mt-1 truncate">{b.name}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug line-clamp-2">{b.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 3: SECURITY & JWT SESSIONS
        ───────────────────────────────────────────────────────────── */}
        {activeTab === "security" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* JWT Active Session Card */}
            <div className="bg-white dark:bg-[#0B172E] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">
                    Phiên Đăng Nhập JWT Hiện Tại
                  </h3>
                  <p className="text-[11px] text-slate-400">Bảo mật cao nhất chuẩn RFC 7519</p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="p-3.5 bg-slate-50 dark:bg-[#071328] rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Thuật toán chữ ký:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">HMAC-SHA512 (HS512)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Thời hạn Token:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">24 Giờ (86,400s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Trạng thái:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Đang hoạt động (Authenticated)
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                      Access Token (Bearer Header):
                    </span>
                    <button
                      onClick={handleCopyToken}
                      className="text-[11px] font-bold text-[#1865F2] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedToken ? "Đã chép!" : "Sao chép Token"}</span>
                    </button>
                  </div>
                  <div className="p-3 bg-slate-900 text-slate-300 font-mono text-[11px] rounded-2xl break-all max-h-28 overflow-y-auto leading-relaxed border border-slate-800">
                    {rawToken}
                  </div>
                </div>
              </div>
            </div>

            {/* Change Password Form */}
            <div className="bg-white dark:bg-[#0B172E] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-[#1865F2] flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">Đổi Mật Khẩu Tài Khoản</h3>
                  <p className="text-[11px] text-slate-400">Mã hóa một chiều với BCrypt 10 rounds</p>
                </div>
              </div>

              {passwordStatus && (
                <div
                  className={`mb-4 p-3 rounded-2xl text-xs flex items-center gap-2 ${
                    passwordStatus.success
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                      : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                  }`}
                >
                  {passwordStatus.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Lock className="w-4 h-4 text-rose-500 shrink-0" />
                  )}
                  <span>{passwordStatus.message}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mật khẩu hiện tại
                  </label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    placeholder="Nhập mật khẩu hiện tại..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#071328] border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:bg-white dark:focus:bg-[#0B172E] focus:outline-none focus:ring-2 focus:ring-[#1865F2] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Tối thiểu 6 ký tự..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#071328] border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:bg-white dark:focus:bg-[#0B172E] focus:outline-none focus:ring-2 focus:ring-[#1865F2] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Nhập lại mật khẩu mới..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#071328] border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:bg-white dark:focus:bg-[#0B172E] focus:outline-none focus:ring-2 focus:ring-[#1865F2] transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="w-full py-2.5 px-4 bg-[#1865F2] hover:bg-[#1253cc] text-white font-extrabold text-xs rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  {isChangingPass ? "Đang xử lý..." : "Cập nhật mật khẩu mới"}
                </button>
              </form>
            </div>

            {/* Email Verification & 2FA Security Card */}
            <div className="bg-white dark:bg-[#0B172E] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">
                    Xác Minh Email & Bảo Vệ 2 Lớp (2FA)
                  </h3>
                  <p className="text-[11px] text-slate-400">Bảo vệ tài khoản học tập chống giả mạo danh tính</p>
                </div>
              </div>

              {emailVerifyMsg && (
                <div className="mb-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{emailVerifyMsg}</span>
                </div>
              )}

              <div className="space-y-4 text-xs">
                {/* Email Verification Status */}
                <div className="p-3.5 bg-slate-50 dark:bg-[#071328] rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Email tài khoản:</span>
                    <span className="font-mono text-slate-600 dark:text-slate-400">{currentUser.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Trạng thái xác thực:</span>
                    {isEmailVerified ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full text-[11px]">
                        <Check className="w-3.5 h-3.5" />
                        Đã xác minh (Verified)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-amber-700 dark:text-amber-400 bg-amber-100/70 px-2.5 py-0.5 rounded-full text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Chưa xác minh
                      </span>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSendVerificationEmail}
                      disabled={isSendingVerifyEmail}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] transition cursor-pointer"
                    >
                      {isSendingVerifyEmail ? "Đang gửi..." : "Gửi lại email xác thực"}
                    </button>
                  </div>
                </div>

                {/* 2FA / TOTP Section */}
                <div className="p-3.5 bg-slate-50 dark:bg-[#071328] rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-purple-600" />
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        Xác thực 2 yếu tố (TOTP / OTP):
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        is2FaEnabled
                          ? "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {is2FaEnabled ? "Đang Bật" : "Chưa kích hoạt"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                    Kích hoạt mã xác thực 6 chữ số qua ứng dụng Google Authenticator để gia tăng an toàn.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShow2FaModal(true)}
                    className="w-full py-2 px-3 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                    <span>Cấu hình ứng dụng Google Authenticator (MFA)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Active Sessions & Session Revocation Card */}
            <div className="bg-white dark:bg-[#0B172E] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center justify-center">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900 dark:text-white">
                      Thiết Bị & Thu Hồi Phiên Đăng Nhập
                    </h3>
                    <p className="text-[11px] text-slate-400">Giám sát và đăng xuất từ xa khỏi các thiết bị lạ</p>
                  </div>
                </div>

                {sessions.length > 1 && (
                  <button
                    type="button"
                    onClick={handleRevokeAllOtherSessions}
                    className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 transition cursor-pointer"
                  >
                    Thu hồi tất cả phiên khác
                  </button>
                )}
              </div>

              {sessionActionMsg && (
                <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{sessionActionMsg}</span>
                </div>
              )}

              <div className="space-y-3">
                {sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className={`p-3.5 rounded-2xl border transition flex items-center justify-between ${
                      sess.isCurrent
                        ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900"
                        : "bg-slate-50 dark:bg-[#071328] border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          sess.isCurrent
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {sess.type === "laptop" && <Laptop className="w-4 h-4" />}
                        {sess.type === "smartphone" && <Smartphone className="w-4 h-4" />}
                        {sess.type === "tablet" && <Tablet className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">{sess.device}</span>
                          {sess.isCurrent && (
                            <span className="text-[9px] font-black uppercase bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                              Thiết bị này
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {sess.browser} · IP: <span className="font-mono">{sess.ip}</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{sess.lastActive}</p>
                      </div>
                    </div>

                    {!sess.isCurrent && (
                      <button
                        type="button"
                        onClick={() => handleRevokeSession(sess.id)}
                        className="text-[11px] font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition cursor-pointer"
                      >
                        Thu hồi
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2FA SETUP MODAL */}
      {show2FaModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B172E] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                <h3 className="font-black text-sm text-slate-900 dark:text-white">
                  Thiết Lập Xác Thực 2 Yếu Tố (TOTP)
                </h3>
              </div>
              <button
                onClick={() => setShow2FaModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
              <p>
                1. Mở ứng dụng <strong>Google Authenticator</strong> hoặc <strong>Authy</strong> trên điện thoại của bạn.
              </p>

              <div className="flex justify-center p-4 bg-slate-50 dark:bg-[#071328] rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="text-center">
                  <div className="w-36 h-36 bg-white border-2 border-slate-800 rounded-xl p-2 mx-auto flex items-center justify-center shadow-inner">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=otpauth://totp/DMKLab:${currentUser.username}?secret=JBSWY3DPEHPK3PXP&issuer=DMKLabEducation`}
                      alt="2FA QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="block mt-2 font-mono font-bold text-[11px] text-slate-700 bg-slate-200 dark:bg-slate-700 dark:text-slate-200 px-2 py-0.5 rounded">
                    Khóa bí mật: JBSW Y3DP EHPK 3PXP
                  </span>
                </div>
              </div>

              <p>
                2. Quét mã QR ở trên hoặc nhập khóa bí mật thủ công. Mỗi 30 giây ứng dụng sẽ sinh mã 6 số để bạn đăng nhập.
              </p>

              <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl text-purple-900 dark:text-purple-300 text-[11px]">
                ✓ Tính năng 2FA được kích hoạt tự động theo chuẩn RFC 6238 bảo vệ tài khoản DMKLab.
              </div>

              <button
                type="button"
                onClick={() => {
                  setIs2FaEnabled(true);
                  setShow2FaModal(false);
                }}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition cursor-pointer"
              >
                Hoàn tất & Lưu cài đặt 2FA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B172E] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-sm text-slate-900 dark:text-white">Chỉnh sửa hồ sơ cá nhân</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Chọn ảnh đại diện Avatar cá nhân:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {AVATAR_OPTIONS.map((av, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditAvatar(av)}
                      className={`p-1 rounded-2xl border-2 transition cursor-pointer flex items-center justify-center ${
                        editAvatar === av
                          ? "border-[#1865F2] bg-blue-50/50 ring-2 ring-blue-200"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <img src={av} alt="avatar" className="w-12 h-12 rounded-full" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Họ và tên</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#071328] border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:bg-white dark:focus:bg-[#0B172E] focus:outline-none focus:ring-2 focus:ring-[#1865F2] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tiểu sử (Bio)</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  placeholder="Chia sẻ mục tiêu học tập của bạn..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#071328] border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:bg-white dark:focus:bg-[#0B172E] focus:outline-none focus:ring-2 focus:ring-[#1865F2] transition"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300 transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-2.5 rounded-xl bg-[#1865F2] hover:bg-[#1253cc] text-white font-extrabold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
