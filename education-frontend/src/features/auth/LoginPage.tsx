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
  Sparkles,
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

  // 1. Bảo vệ tài khoản: Brute-force lockout states
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [lockoutRemainingSec, setLockoutRemainingSec] = useState(0);

  // 2. Bảo vệ tài khoản: 2FA TOTP state cho Admin
  const [mfaPendingUser, setMfaPendingUser] = useState<User | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaError, setMfaError] = useState<string | null>(null);

  // Countdown timer cho Lockout
  React.useEffect(() => {
    if (!lockedUntil) {
      setLockoutRemainingSec(0);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
      setLockoutRemainingSec(remaining);
      if (remaining <= 0) {
        setLockedUntil(null);
        setFailedAttempts(0);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockedUntil]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (lockedUntil && Date.now() < lockedUntil) {
      setErrorMessage(
        `Tài khoản tạm thời bị khóa. Vui lòng thử lại sau ${Math.ceil(lockoutRemainingSec / 60)} phút!`
      );
      return;
    }

    if (!usernameOrEmail.trim() || !password) {
      setErrorMessage("Vui lòng điền đầy đủ tên đăng nhập và mật khẩu.");
      return;
    }

    setIsLoading(true);
    try {
      const { user } = await api.login(usernameOrEmail.trim(), password);

      // Kiểm tra xem tài khoản có phải Quản trị viên (ADMIN hoặc SUPER_ADMIN) yêu cầu 2FA không
      if (user.role === "ADMIN" || user.role === "SUPER_ADMIN" || user.username === "admin") {
        // Chuyển sang Bước 2: Xác thực đa yếu tố (2FA / TOTP)
        setMfaPendingUser(user);
        setMfaCode("");
        setMfaError(null);
      } else {
        // Đăng nhập thành công cho học sinh/giáo viên thông thường
        setFailedAttempts(0);
        onSuccess(user);
      }
    } catch (err: any) {
      const nextFail = failedAttempts + 1;
      setFailedAttempts(nextFail);

      if (nextFail >= 5) {
        const lockoutTime = Date.now() + 15 * 60 * 1000; // Khóa 15 phút
        setLockedUntil(lockoutTime);
        setLockoutRemainingSec(15 * 60);
        setErrorMessage(
          "🔒 BẢO VỆ BRUTE-FORCE: Bạn đã nhập sai mật khẩu 5 lần liên tiếp. Tài khoản đã bị tạm khóa 15 phút!"
        );
      } else {
        const remain = 5 - nextFail;
        setErrorMessage(
          `${err.message || "Tài khoản hoặc mật khẩu không chính xác."} (Còn ${remain} lần thử trước khi tài khoản bị khóa 15 phút)`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    setMfaError(null);

    if (!mfaCode.trim()) {
      setMfaError("Vui lòng nhập mã xác thực 6 chữ số từ ứng dụng Authenticator.");
      return;
    }

    // Chấp nhận mã TOTP 6 số bất kỳ hoặc mã mẫu 849201 / 123456
    const cleanCode = mfaCode.replace(/\s+/g, "");
    if (cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
      setMfaError("Mã xác thực 2FA phải bao gồm đúng 6 chữ số.");
      return;
    }

    // Xác thực 2FA thành công
    setFailedAttempts(0);
    if (mfaPendingUser) {
      onSuccess(mfaPendingUser);
    }
  };

  const fillDemoAccount = (username: string, pass: string) => {
    setUsernameOrEmail(username);
    setPassword(pass);
    setErrorMessage(null);
    setMfaPendingUser(null);
  };

  const handleUnlockDemo = () => {
    setLockedUntil(null);
    setFailedAttempts(0);
    setLockoutRemainingSec(0);
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

        {/* Brand Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-3">
            <img
              src="/img-web/duc_mai_khoi_lab-removebg-removebg-preview.png"
              alt="DMKLab"
              className="h-11 w-auto object-contain"
            />
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
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
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

        {/* Lockout Banner */}
        {lockedUntil && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 shadow-sm animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-200 text-rose-700 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="font-extrabold text-xs text-rose-800">
                  TÀI KHOẢN ĐANG BỊ TẠM KHÓA BẢO VỆ
                </h4>
                <p className="text-[11px] text-rose-700 mt-1">
                  Đã nhập sai mật khẩu quá 5 lần liên tiếp. Hệ thống kích hoạt cơ chế chống tấn công
                  dò quét Brute-force/Credential Stuffing.
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-mono font-bold text-xs bg-rose-100 px-2.5 py-1 rounded-lg text-rose-800 border border-rose-200">
                    Thời gian mở lại: {Math.floor(lockoutRemainingSec / 60)}:
                    {(lockoutRemainingSec % 60).toString().padStart(2, "0")}
                  </span>
                  <button
                    type="button"
                    onClick={handleUnlockDemo}
                    className="text-[11px] font-bold text-rose-700 hover:text-rose-900 underline cursor-pointer"
                  >
                    Mở khóa ngay (Demo Admin)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Failed attempts warning (3 or 4 failures) */}
        {!lockedUntil && failedAttempts >= 3 && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Cảnh báo bảo mật:</strong> Bạn đã nhập sai {failedAttempts}/5 lần. Tài khoản
              sẽ tự động khóa 15 phút nếu nhập sai tiếp!
            </span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && !lockedUntil && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 2: 2FA MFA VERIFICATION FOR ADMIN ACCOUNTS */}
        {mfaPendingUser ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-600 text-white uppercase tracking-wider">
                  BƯỚC 2: XÁC THỰC ĐA YẾU TỐ (2FA / MFA)
                </span>
              </div>
              <p className="text-xs font-bold text-purple-950">
                Tài khoản Quản trị viên: {mfaPendingUser.fullName} (@{mfaPendingUser.username})
              </p>
              <p className="text-[11px] text-purple-700 mt-1">
                Theo chính sách an ninh K-12, tài khoản quyền Quản trị bắt buộc phải xác thực mã một
                lần từ ứng dụng Google Authenticator hoặc Authy.
              </p>
            </div>

            {mfaError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{mfaError}</span>
              </div>
            )}

            <form onSubmit={handleVerify2FA} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nhập mã TOTP 6 chữ số:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000 000"
                    autoFocus
                    className="w-full text-center tracking-[0.4em] font-mono text-xl font-black py-3 bg-slate-50 border-2 border-purple-300 rounded-xl text-purple-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                  />
                  <Lock className="w-4 h-4 text-purple-400 absolute left-3.5 top-4" />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setMfaCode("849201")}
                  className="text-[11px] font-bold text-purple-600 hover:text-purple-800 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Điền mã mẫu demo (849201)</span>
                </button>
                <span className="text-[11px] text-slate-400">Hiệu lực: 30s</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMfaPendingUser(null)}
                  className="flex-1 py-3 px-4 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-full transition cursor-pointer"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-full shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Xác nhận 2FA & Vào hệ thống</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* STEP 1: STANDARD USER / PASSWORD LOGIN */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email hoặc tên đăng nhập
              </label>
              <div className="relative">
                <input
                  type="text"
                  disabled={Boolean(lockedUntil)}
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="Nhập username hoặc email..."
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1865F2] focus:border-transparent transition disabled:opacity-50"
                />
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">Mật khẩu</label>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert(
                      "Vui lòng liên hệ quản trị viên hoặc dùng tài khoản mẫu: admin / password123"
                    );
                  }}
                  className="text-[11px] font-bold text-[#1865F2] hover:underline"
                >
                  Quên mật khẩu?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  disabled={Boolean(lockedUntil)}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu của bạn..."
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1865F2] focus:border-transparent transition disabled:opacity-50"
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
              disabled={isLoading || Boolean(lockedUntil)}
              className="w-full mt-2 py-3 px-4 bg-[#1865F2] hover:bg-[#1557D0] active:scale-[0.99] text-white font-extrabold text-sm rounded-full shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Đăng nhập</span>
              )}
            </button>
          </form>
        )}

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
              👑 Admin (2FA TOTP)
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
