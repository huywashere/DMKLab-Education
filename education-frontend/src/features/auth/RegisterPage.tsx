"use client";

import React, { useState, useEffect } from "react";
import { User, UserRole } from "@/types";
import { api } from "@/lib/api";
import {
  Eye,
  EyeOff,
  Lock,
  User as UserIcon,
  Mail,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
  GraduationCap,
  Briefcase,
  Heart,
  Check,
  Clock,
  ShieldAlert,
} from "lucide-react";

interface RegisterPageProps {
  onSuccess: (user: User) => void;
  onGoToLogin: () => void;
  onBackToHome: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onSuccess,
  onGoToLogin,
  onBackToHome,
}) => {
  const [selectedRole, setSelectedRole] = useState<"STUDENT" | "TEACHER" | "PARENT">("STUDENT");
  const [selectedGrade, setSelectedGrade] = useState<number>(5);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cooldownSec, setCooldownSec] = useState<number>(0);
  const [submitAttempts, setSubmitAttempts] = useState<number>(0);

  // Rate-limiting countdown timer
  useEffect(() => {
    if (cooldownSec <= 0) return;
    const interval = setInterval(() => {
      setCooldownSec((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSec]);

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score += 25;
    if (password.length >= 10) score += 25;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score += 25;
    if (/[^A-Za-z0-9]/.test(password)) score += 25;
    return score;
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Kiểm tra Cooldown
    if (cooldownSec > 0) {
      setErrorMessage(
        `Hệ thống đang tạm khóa tạo tài khoản để chống spam. Vui lòng đợi ${cooldownSec} giây.`
      );
      return;
    }

    // 2. Kiểm tra Honeypot Bot Trap
    if (honeypot.trim().length > 0) {
      setErrorMessage("Yêu cầu bị từ chối do phát hiện hành vi tự động (Anti-bot honeypot).");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Mật khẩu phải có độ dài tối thiểu 6 ký tự để bảo đảm an toàn.");
      return;
    }

    setIsLoading(true);
    try {
      const { user } = await api.register({
        username: username.trim(),
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        role: selectedRole,
      });
      onSuccess(user);
    } catch (err: any) {
      const newAttempts = submitAttempts + 1;
      setSubmitAttempts(newAttempts);

      if (err.message && err.message.includes("429")) {
        setCooldownSec(180); // 3 phút nếu backend trả 429
        setErrorMessage(err.message);
      } else if (newAttempts >= 3) {
        setCooldownSec(60); // 1 phút cooldown sau 3 lần thử
        setErrorMessage(
          "Bạn đã gửi yêu cầu quá nhiều lần. Vui lòng đợi 60 giây trước khi thử lại."
        );
      } else {
        setErrorMessage(
          err.message || "Đăng ký không thành công. Vui lòng kiểm tra lại thông tin."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] bg-[#F7F8FA] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Top navigation */}
      <div className="w-full max-w-xl mb-4 flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#1865F2] transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang chủ</span>
        </button>

        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Tiêu chuẩn bảo mật K–12</span>
        </div>
      </div>

      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 sm:p-10 relative overflow-hidden">
        {/* Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#14BF96] via-[#1865F2] to-[#8B5CF6]" />

        {/* Title & Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-3">
            <img
              src="/img-web/duc_mai_khoi_lab-removebg-removebg-preview.png"
              alt="DMKLab"
              className="h-11 w-auto object-contain"
            />
          </div>
          <h1 className="text-2xl font-black text-[#0A2540] tracking-tight">
            Tham gia DMKLab Education
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Xây dựng nền tảng tri thức vững chắc cho tương lai của bạn
          </p>
        </div>

        {/* 1. DMKLab Role Selector */}
        <div className="mb-7">
          <label className="block text-xs font-bold text-slate-700 mb-2.5 text-center">
            Tham gia DMKLab Education với tư cách là:
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setSelectedRole("STUDENT")}
              className={`p-3.5 rounded-2xl border-2 text-center transition flex flex-col items-center gap-1.5 cursor-pointer ${
                selectedRole === "STUDENT"
                  ? "border-[#1865F2] bg-blue-50/40 text-[#1865F2] shadow-xs"
                  : "border-slate-200 hover:border-slate-300 text-slate-600"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center ${selectedRole === "STUDENT" ? "bg-[#1865F2] text-white" : "bg-slate-100 text-slate-600"}`}
              >
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xs">Học sinh</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole("TEACHER")}
              className={`p-3.5 rounded-2xl border-2 text-center transition flex flex-col items-center gap-1.5 cursor-pointer ${
                selectedRole === "TEACHER"
                  ? "border-[#14BF96] bg-emerald-50/40 text-[#0B6A56] shadow-xs"
                  : "border-slate-200 hover:border-slate-300 text-slate-600"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center ${selectedRole === "TEACHER" ? "bg-[#14BF96] text-white" : "bg-slate-100 text-slate-600"}`}
              >
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xs">Giáo viên</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole("PARENT")}
              className={`p-3.5 rounded-2xl border-2 text-center transition flex flex-col items-center gap-1.5 cursor-pointer ${
                selectedRole === "PARENT"
                  ? "border-[#8B5CF6] bg-purple-50/40 text-[#6D28D9] shadow-xs"
                  : "border-slate-200 hover:border-slate-300 text-slate-600"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center ${selectedRole === "PARENT" ? "bg-[#8B5CF6] text-white" : "bg-slate-100 text-slate-600"}`}
              >
                <Heart className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xs">Phụ huynh</span>
            </button>
          </div>
        </div>

        {/* Grade selector for student */}
        {selectedRole === "STUDENT" && (
          <div className="mb-6 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Bạn đang học lớp mấy?
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setSelectedGrade(g)}
                  className={`py-1.5 rounded-lg text-center font-bold text-xs transition cursor-pointer ${
                    selectedGrade === g
                      ? "bg-[#1865F2] text-white"
                      : "bg-white hover:bg-slate-200 text-slate-700 border border-slate-200"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Họ và tên</label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Minh An"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1865F2] transition"
                />
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tên đăng nhập (Username)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
                  }
                  placeholder="minhan2026"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1865F2] transition font-mono"
                />
                <span className="text-slate-400 font-bold absolute left-3 top-2.5 text-xs">@</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Địa chỉ Email</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1865F2] transition"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Mật khẩu</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự..."
                required
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1865F2] transition"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Strength Meter */}
            {password && (
              <div className="mt-2 space-y-1">
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      strength <= 25
                        ? "bg-rose-500 w-1/4"
                        : strength <= 50
                          ? "bg-amber-500 w-2/4"
                          : strength <= 75
                            ? "bg-blue-500 w-3/4"
                            : "bg-emerald-500 w-full"
                    }`}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500">
                  <span>Độ bảo mật mật khẩu:</span>
                  <span
                    className={`font-bold ${
                      strength <= 25
                        ? "text-rose-600"
                        : strength <= 50
                          ? "text-amber-600"
                          : strength <= 75
                            ? "text-blue-600"
                            : "text-emerald-600"
                    }`}
                  >
                    {strength <= 25
                      ? "Yếu"
                      : strength <= 50
                        ? "Trung bình"
                        : strength <= 75
                          ? "Mạnh"
                          : "Rất an toàn"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Anti-spam Honeypot Bot Trap */}
          <div className="hidden" aria-hidden="true" style={{ display: "none" }}>
            <label htmlFor="reg_hp_field">Bot Check</label>
            <input
              id="reg_hp_field"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          {/* Rate Limit Cooldown Notice */}
          {cooldownSec > 0 && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Hệ thống tạm khóa đăng ký chống bot: Vui lòng đợi{" "}
                <strong>{cooldownSec} giây</strong> trước khi thử lại.
              </span>
            </div>
          )}

          <div className="pt-2 text-[11px] text-slate-500 leading-relaxed">
            Bằng cách đăng ký, bạn đồng ý với{" "}
            <a href="#" className="text-[#1865F2] hover:underline">
              Điều khoản dịch vụ
            </a>{" "}
            và{" "}
            <a href="#" className="text-[#1865F2] hover:underline">
              Chính sách quyền riêng tư
            </a>{" "}
            của DMKLab Education.
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || cooldownSec > 0}
            className="w-full py-3 px-4 bg-[#1865F2] hover:bg-[#1557D0] active:scale-[0.99] text-white font-extrabold text-sm rounded-full shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : cooldownSec > 0 ? (
              <>
                <Clock className="w-4 h-4 text-amber-300" />
                <span>Vui lòng đợi ({cooldownSec}s)...</span>
              </>
            ) : (
              <span>Tạo tài khoản và bắt đầu học</span>
            )}
          </button>

          {/* Anti-Bot Badge */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Anti-Bot & Rate Limit kích hoạt (Tối đa 3 tài khoản / 30 phút)</span>
          </div>
        </form>

        {/* Footer switch to Login */}
        <div className="mt-6 text-center text-xs text-slate-500 pt-5 border-t border-slate-100">
          <span>Đã có tài khoản? </span>
          <button
            onClick={onGoToLogin}
            className="font-bold text-[#1865F2] hover:underline cursor-pointer"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    </div>
  );
};
