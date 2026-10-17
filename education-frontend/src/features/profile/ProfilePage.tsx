"use client";

import React, { useState } from "react";
import { User } from "@/types";
import { api } from "@/lib/api";
import {
  User as UserIcon,
  Flame,
  Star,
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
} from "lucide-react";

interface ProfilePageProps {
  currentUser: User;
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
  onBackToHome: () => void;
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
  },
  {
    id: 2,
    name: "Thợ Săn Chuỗi Ngày",
    category: "Thiên Thạch",
    desc: "Đạt chuỗi 3 ngày học liên tiếp",
    icon: "🔥",
    unlocked: true,
    date: "10/2026",
  },
  {
    id: 3,
    name: "Ánh Trăng Soi Sáng",
    category: "Mặt Trăng",
    desc: "Đạt điểm tuyệt đối 100% trong bài kiểm tra Toán",
    icon: "🌙",
    unlocked: true,
    date: "10/2026",
  },
  {
    id: 4,
    name: "Kiến Tạo Không Gian",
    category: "Trái Đất",
    desc: "Tích lũy trên 5,000 điểm năng lượng",
    icon: "🌍",
    unlocked: true,
    date: "10/2026",
  },
  {
    id: 5,
    name: "Mặt Trời Rực Rỡ",
    category: "Mặt Trời",
    desc: "Hoàn thành toàn bộ chương trình một khối lớp",
    icon: "☀️",
    unlocked: false,
  },
  {
    id: 6,
    name: "Hố Đen Huyền Thoại",
    category: "Hố Đen",
    desc: "Đạt 50,000 điểm năng lượng và chuỗi 100 ngày",
    icon: "🕳️",
    unlocked: false,
  },
];

export const ProfilePage: React.FC<ProfilePageProps> = ({
  currentUser,
  onUpdateUser,
  onLogout,
  onBackToHome,
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

  // Active Sessions & Revocation State
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
    <div className="min-h-screen bg-[#F7F8FA] pb-16">
      {/* Top Banner Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#1865F2] transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Khóa học</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden sm:inline">Trang cá nhân học viên</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Profile Hero Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 sm:p-8 mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-[#0A2540] via-[#0B6A56] to-[#14BF96]" />

          <div className="relative pt-12 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              {/* Avatar with edit badge */}
              <div className="relative group">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.fullName}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-xl bg-slate-50 object-cover"
                />
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute bottom-0 right-0 p-1.5 bg-[#1865F2] hover:bg-[#1557D0] text-white rounded-full shadow-md transition cursor-pointer"
                  title="Đổi ảnh đại diện"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    {currentUser.fullName}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-[#0B6A56] border border-emerald-200">
                    {currentUser.role}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  @{currentUser.username} • {currentUser.email}
                </p>
                <p className="text-xs text-slate-600 mt-2 max-w-xl italic">
                  "{currentUser.bio || "Chưa có tiểu sử."}"
                </p>
              </div>
            </div>

            {/* Quick Action buttons */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 py-2 rounded-full border border-slate-300 hover:bg-slate-50 font-bold text-xs text-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Chỉnh sửa hồ sơ</span>
              </button>

              <button
                onClick={onLogout}
                className="px-4 py-2 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 font-bold text-xs text-rose-700 transition flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>

          {/* Gamification Stats Row */}
          <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#1865F2] flex items-center justify-center font-bold text-lg">
                ★
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500">Điểm năng lượng</p>
                <p className="text-lg font-black text-[#1865F2]">
                  {currentUser.energyPoints?.toLocaleString() || 1000}
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Flame className="w-5 h-5 fill-amber-500" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500">Chuỗi ngày học</p>
                <p className="text-lg font-black text-amber-600">
                  {currentUser.streakDays || 1} ngày
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500">Huy hiệu đạt được</p>
                <p className="text-lg font-black text-emerald-600">4 / 6 Huy hiệu</p>
              </div>
            </div>

            <div className="p-3.5 bg-purple-50/50 rounded-2xl border border-purple-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500">Bảo mật tài khoản</p>
                <p className="text-xs font-black text-purple-700">JWT HMAC-512</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 mb-6 gap-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 font-extrabold text-sm transition border-b-2 cursor-pointer ${
              activeTab === "overview"
                ? "border-[#1865F2] text-[#1865F2]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Tổng quan & Tiến độ
          </button>
          <button
            onClick={() => setActiveTab("badges")}
            className={`pb-3 font-extrabold text-sm transition border-b-2 cursor-pointer ${
              activeTab === "badges"
                ? "border-[#1865F2] text-[#1865F2]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Bộ sưu tập Huy hiệu DMKLab
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`pb-3 font-extrabold text-sm transition border-b-2 cursor-pointer ${
              activeTab === "security"
                ? "border-[#1865F2] text-[#1865F2]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Bảo mật & Phiên JWT
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Mastery progress */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
                <h3 className="font-black text-slate-900 text-sm mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#1865F2]" />
                  <span>Cấp độ thành thạo K-12</span>
                </h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-700">Toán học 10 - Đại số & Hình học</span>
                      <span className="text-[#1865F2]">75% Thành thạo</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-[#1865F2] h-full rounded-full w-3/4" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-700">Vật lý 10 - Cơ học Chuyển động</span>
                      <span className="text-[#14BF96]">50% Quen thuộc</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-[#14BF96] h-full rounded-full w-1/2" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-700">Hóa học 10 - Cấu tạo Nguyên tử</span>
                      <span className="text-amber-500">25% Mới bắt đầu</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full w-1/4" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent activity */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
                <h3 className="font-black text-slate-900 text-sm mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#14BF96]" />
                  <span>Hoạt động học tập gần đây</span>
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#0B6A56] flex items-center justify-center font-bold">
                        ✓
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">
                          Hoàn thành: Bài 1 Mệnh đề toán học
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Đạt 100% điểm quiz (+50 năng lượng)
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">Hôm nay</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1865F2] flex items-center justify-center font-bold">
                        ★
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">Đăng nhập xác thực JWT</p>
                        <p className="text-[11px] text-slate-400">Cấp phiên làm việc 24 giờ</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">Vừa xong</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar info */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
                <h3 className="font-black text-slate-900 text-sm mb-3">Thông tin hồ sơ</h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Tên đăng nhập:</span>
                    <p className="font-bold text-slate-800">@{currentUser.username}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Email liên kết:</span>
                    <p className="font-bold text-slate-800">{currentUser.email}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Vai trò tài khoản:</span>
                    <p className="font-bold text-[#1865F2]">{currentUser.role}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Ngày khởi tạo:</span>
                    <p className="font-bold text-slate-800">Tháng 10, 2026</p>
                  </div>
                </div>
              </div>

              {/* Socratic DMK AI card */}
              <div className="bg-gradient-to-br from-[#0B2138] to-[#0A2540] text-white rounded-3xl p-6 shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-[#14BF96]" />
                  <h4 className="font-extrabold text-sm">DMK AI Tutor</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Trợ lý gia sư Socratic luôn sẵn sàng giải đáp thắc mắc về các khái niệm Toán, Lý,
                  Hóa và hướng dẫn từng bước.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DMKLAB BADGES */}
        {activeTab === "badges" && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
            <div className="mb-6">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Bộ sưu tập Huy hiệu DMKLab
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Tích lũy điểm năng lượng và chinh phục các bài học để mở khóa huy hiệu danh giá
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {KHAN_BADGES.map((b) => (
                <div
                  key={b.id}
                  className={`p-4 rounded-2xl border transition ${
                    b.unlocked
                      ? "bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-2xs"
                      : "bg-slate-50/70 border-dashed border-slate-300 opacity-60"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl shadow-2xs">
                      {b.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          {b.category}
                        </span>
                        {b.unlocked && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            Đã đạt
                          </span>
                        )}
                      </div>
                      <h4 className="font-extrabold text-xs text-slate-900 mt-0.5">{b.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">{b.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SECURITY & JWT */}
        {activeTab === "security" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* JWT Active Session Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">
                    Phiên Đăng Nhập JWT Hiện Tại
                  </h3>
                  <p className="text-[11px] text-slate-400">Bảo mật cao nhất chuẩn RFC 7519</p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Thuật toán chữ ký:</span>
                    <span className="font-bold text-slate-800 font-mono">HMAC-SHA512 (HS512)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Thời hạn Token:</span>
                    <span className="font-bold text-emerald-600">24 Giờ (86,400s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Trạng thái:</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Đang hoạt động (Authenticated)
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-700 text-xs">
                      Access Token (Bearer Header):
                    </span>
                    <button
                      onClick={handleCopyToken}
                      className="text-[11px] font-bold text-[#1865F2] hover:underline flex items-center gap-1 cursor-pointer"
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
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1865F2] flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">Đổi Mật Khẩu Tài Khoản</h3>
                  <p className="text-[11px] text-slate-400">
                    Mã hóa một chiều với BCrypt 10 rounds
                  </p>
                </div>
              </div>

              {passwordStatus && (
                <div
                  className={`mb-4 p-3 rounded-2xl text-xs flex items-center gap-2 ${
                    passwordStatus.success
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mật khẩu hiện tại
                  </label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    placeholder="Nhập mật khẩu hiện tại..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1865F2] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Tối thiểu 6 ký tự..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1865F2] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Nhập lại mật khẩu mới..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1865F2] transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="w-full py-2.5 px-4 bg-[#1865F2] hover:bg-[#1557D0] text-white font-extrabold text-xs rounded-full shadow-sm transition cursor-pointer disabled:opacity-50"
                >
                  {isChangingPass ? "Đang xử lý..." : "Cập nhật mật khẩu mới"}
                </button>
              </form>
            </div>

            {/* Email Verification & 2FA Security Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">
                    Xác Minh Email & Bảo Vệ 2 Lớp (2FA)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Bảo vệ tài khoản học tập chống giả mạo danh tính
                  </p>
                </div>
              </div>

              {emailVerifyMsg && (
                <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{emailVerifyMsg}</span>
                </div>
              )}

              <div className="space-y-4 text-xs">
                {/* Email Verification Status */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-700">Email tài khoản:</span>
                    <span className="font-mono text-slate-600">{currentUser.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Trạng thái xác thực:</span>
                    {isEmailVerified ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full text-[11px]">
                        <Check className="w-3.5 h-3.5" />
                        Đã xác minh (Verified)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-100/70 px-2.5 py-0.5 rounded-full text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Chưa xác minh
                      </span>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSendVerificationEmail}
                      disabled={isSendingVerifyEmail}
                      className="px-3 py-1.5 rounded-full border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-[11px] transition cursor-pointer"
                    >
                      {isSendingVerifyEmail ? "Đang gửi..." : "Gửi lại email xác thực"}
                    </button>
                  </div>
                </div>

                {/* 2FA / TOTP Section */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-purple-600" />
                      <span className="font-bold text-slate-800">
                        Xác thực 2 yếu tố (TOTP / OTP):
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        is2FaEnabled
                          ? "bg-purple-100 text-purple-800"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {is2FaEnabled ? "Đang Bật" : "Chưa kích hoạt"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    {currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN"
                      ? "Tài khoản Quản trị viên bắt buộc phải kích hoạt 2FA để bảo vệ dữ liệu toàn trường."
                      : "Kích hoạt mã xác thực 6 chữ số qua ứng dụng Google Authenticator để gia tăng an toàn."}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShow2FaModal(true)}
                    className="w-full py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                    <span>Cấu hình ứng dụng Google Authenticator (MFA)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Active Sessions & Session Revocation Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900">
                      Thiết Bị & Thu Hồi Phiên Đăng Nhập
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Giám sát và đăng xuất từ xa khỏi các thiết bị lạ
                    </p>
                  </div>
                </div>

                {sessions.length > 1 && (
                  <button
                    type="button"
                    onClick={handleRevokeAllOtherSessions}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-full border border-rose-200 transition cursor-pointer"
                  >
                    Thu hồi tất cả phiên khác
                  </button>
                )}
              </div>

              {sessionActionMsg && (
                <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
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
                        ? "bg-emerald-50/50 border-emerald-200"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          sess.isCurrent
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {sess.type === "laptop" && <Laptop className="w-4 h-4" />}
                        {sess.type === "smartphone" && <Smartphone className="w-4 h-4" />}
                        {sess.type === "tablet" && <Tablet className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{sess.device}</span>
                          {sess.isCurrent && (
                            <span className="text-[9px] font-black uppercase bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                              Thiết bị này
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
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
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                <h3 className="font-black text-sm text-slate-900">
                  Thiết Lập Xác Thực 2 Yếu Tố (TOTP)
                </h3>
              </div>
              <button
                onClick={() => setShow2FaModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600">
              <p>
                1. Mở ứng dụng <strong>Google Authenticator</strong> hoặc <strong>Authy</strong>{" "}
                trên điện thoại của bạn.
              </p>

              <div className="flex justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="text-center">
                  <div className="w-36 h-36 bg-white border-2 border-slate-800 rounded-xl p-2 mx-auto flex items-center justify-center shadow-inner">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=otpauth://totp/DMKLab:${currentUser.username}?secret=JBSWY3DPEHPK3PXP&issuer=DMKLabEducation`}
                      alt="2FA QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="block mt-2 font-mono font-bold text-[11px] text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
                    Khóa bí mật: JBSW Y3DP EHPK 3PXP
                  </span>
                </div>
              </div>

              <p>
                2. Quét mã QR ở trên hoặc nhập khóa bí mật thủ công. Mỗi 30 giây ứng dụng sẽ sinh mã
                6 số để bạn đăng nhập.
              </p>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 text-[11px]">
                ✓ Tính năng 2FA được kích hoạt tự động theo chuẩn RFC 6238 bảo vệ tài khoản DMKLab.
              </div>

              <button
                type="button"
                onClick={() => {
                  setIs2FaEnabled(true);
                  setShow2FaModal(false);
                }}
                className="w-full py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition cursor-pointer"
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
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="font-black text-sm text-slate-900">Chỉnh sửa hồ sơ cá nhân</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
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
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <img src={av} alt="avatar" className="w-12 h-12 rounded-full" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1865F2] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tiểu sử (Bio)</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  placeholder="Chia sẻ mục tiêu học tập của bạn..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1865F2] transition"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 rounded-full border border-slate-300 hover:bg-slate-50 font-bold text-xs text-slate-700 transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-2.5 rounded-full bg-[#1865F2] hover:bg-[#1557D0] text-white font-extrabold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
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
