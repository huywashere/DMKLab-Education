"use client";

import React, { useState } from "react";
import { User } from "@/types";
import { api } from "@/lib/api";
import { 
  Eye, 
  EyeOff, 
  Lock, 
  User as UserIcon, 
  ShieldCheck, 
  ArrowLeft, 
  AlertCircle,
  CheckCircle2,
  Sparkles
} from "lucide-react";

interface LoginPageProps {
  onSuccess: (user: User) => void;
  onGoToRegister: () => void;
  onBackToHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  onGoToRegister,
  onBackToHome,
}) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!usernameOrEmail.trim() || !password) {
      setErrorMessage("Vui lòng điền đầy đủ tên đăng nhập và mật khẩu.");
      return;
    }

    setIsLoading(true);
    try {
      const { user } = await api.login(usernameOrEmail.trim(), password);
      onSuccess(user);
    } catch (err: any) {
      setErrorMessage(err.message || "Tài khoản hoặc mật khẩu không chính xác.");
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = (username: string, pass: string) => {
    setUsernameOrEmail(username);
    setPassword(pass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-[calc(100vh-120px)] bg-[#F7F8FA] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Back button */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#1865F2] transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang chủ</span>
        </button>

        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Xác thực JWT HMAC-512</span>
        </div>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 sm:p-10 relative overflow-hidden">
        {/* Khan Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#14BF96] via-[#1865F2] to-[#8B5CF6]" />

        {/* Brand Sprout & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-full bg-[#14BF96] items-center justify-center text-white shadow-md mb-3">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22V12M12 12C12 7 7 4 2 5C3 10 7 12 12 12ZM12 12C12 7 17 4 22 5C21 10 17 12 12 12Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-black text-[#0A2540] tracking-tight">
            Đăng nhập vào DMKLab Education
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 font-medium">
            Hệ sinh thái học tập trực tuyến thông minh K–12
          </p>
        </div>

        {/* Social Login Buttons (Authentic Khan Academy style) */}
        <div className="space-y-2.5 mb-6">
          <button
            type="button"
            onClick={() => fillDemoAccount("student_an", "password123")}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 rounded-full font-bold text-xs text-slate-700 shadow-2xs transition cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Tiếp tục với Google</span>
          </button>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount("teacher_mai", "password123")}
              className="py-2 px-3 border border-slate-300 rounded-full font-bold text-[11px] text-[#0066CC] hover:bg-blue-50/50 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span className="font-extrabold text-sm">C</span>
              <span>Clever</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount("admin", "password123")}
              className="py-2 px-3 border border-slate-300 rounded-full font-bold text-[11px] text-[#1877F2] hover:bg-blue-50/50 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span className="font-extrabold text-sm">f</span>
              <span>Facebook</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount("hocsinh1", "password123")}
              className="py-2 px-3 border border-slate-300 rounded-full font-bold text-[11px] text-slate-800 hover:bg-slate-100 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span className="font-extrabold text-sm"></span>
              <span>Apple</span>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-wider font-bold">
            <span className="bg-white px-3 text-slate-400">HOẶC</span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Email hoặc tên đăng nhập
            </label>
            <div className="relative">
              <input
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="Nhập username hoặc email..."
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1865F2] focus:border-transparent transition"
              />
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Mật khẩu
              </label>
              <a href="#" onClick={(e) => { e.preventDefault(); alert("Vui lòng liên hệ quản trị viên hoặc dùng tài khoản mẫu: admin / password123"); }} className="text-[11px] font-bold text-[#1865F2] hover:underline">
                Quên mật khẩu?
              </a>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu của bạn..."
                required
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1865F2] focus:border-transparent transition"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 bg-[#1865F2] hover:bg-[#1557D0] active:scale-[0.99] text-white font-extrabold text-sm rounded-full shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Đăng nhập</span>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials Banner */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
            Chọn nhanh tài khoản mẫu (Click để điền):
          </p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            <button
              onClick={() => fillDemoAccount("admin", "password123")}
              className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition"
            >
              👑 Admin
            </button>
            <button
              onClick={() => fillDemoAccount("teacher_mai", "password123")}
              className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
            >
              👩‍🏫 Giáo viên Mai
            </button>
            <button
              onClick={() => fillDemoAccount("student_an", "password123")}
              className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition"
            >
              🎓 Học sinh An
            </button>
            <button
              onClick={() => fillDemoAccount("hocsinh1", "password123")}
              className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition"
            >
              ⭐ Học sinh 1
            </button>
          </div>
        </div>

        {/* Footer switch to Register */}
        <div className="mt-6 text-center text-xs text-slate-500">
          <span>Chưa có tài khoản? </span>
          <button
            onClick={onGoToRegister}
            className="font-bold text-[#1865F2] hover:underline cursor-pointer"
          >
            Đăng ký tham gia ngay
          </button>
        </div>
      </div>
    </div>
  );
};
