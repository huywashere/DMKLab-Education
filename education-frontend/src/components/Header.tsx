"use client";

import React, { useState } from "react";
import { User, UserRole, Grade } from "@/types";
import { 
  Search, 
  ChevronDown, 
  Sparkles, 
  Flame, 
  LayoutDashboard, 
  GraduationCap, 
  UserCheck, 
  ShieldCheck, 
  BookOpen, 
  Compass, 
  Calculator, 
  Atom, 
  Globe,
  User as UserIcon,
  LogOut,
  Key,
  LogIn,
  UserPlus
} from "lucide-react";

interface HeaderProps {
  currentUser: User | null;
  onSwitchUser: (role: UserRole) => void;
  activeView: 'student' | 'lesson' | 'admin' | 'login' | 'register' | 'profile';
  onChangeView: (view: 'student' | 'lesson' | 'admin' | 'login' | 'register' | 'profile') => void;
  selectedGrade: Grade;
  onSelectGrade: (grade: Grade) => void;
  onOpenAiChat: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSwitchUser,
  activeView,
  onChangeView,
  selectedGrade,
  onSelectGrade,
  onOpenAiChat,
  onOpenLogin,
  onOpenRegister,
  onOpenProfile,
  onLogout,
}) => {
  const [showCoursesMenu, setShowCoursesMenu] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Left: Courses Dropdown & Search Bar */}
        <div className="flex items-center gap-4 lg:gap-6">
          {/* Khan Academy "Courses" Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowCoursesMenu(!showCoursesMenu)}
              className="flex items-center gap-2 px-3 py-2 text-[#0A2540] hover:text-[#1865F2] font-extrabold text-sm rounded-full transition cursor-pointer"
            >
              <span>Môn học</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showCoursesMenu ? 'rotate-180' : ''}`} />
            </button>

            {showCoursesMenu && (
              <div 
                className="absolute left-0 mt-2 w-80 md:w-96 bg-white text-slate-800 rounded-3xl shadow-2xl border border-slate-200 p-5 z-50 text-xs grid grid-cols-2 gap-4"
                onMouseLeave={() => setShowCoursesMenu(false)}
              >
                <div className="space-y-3">
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                    Lĩnh vực nổi bật
                  </p>
                  <div className="space-y-1">
                    <button 
                      onClick={() => setShowCoursesMenu(false)}
                      className="w-full text-left p-2 rounded-xl hover:bg-slate-50 flex items-center gap-2 text-slate-800 font-semibold"
                    >
                      <Calculator className="w-4 h-4 text-[#1865F2]" />
                      <span>Toán: Lớp 1 – Lớp 12</span>
                    </button>
                    <button 
                      onClick={() => setShowCoursesMenu(false)}
                      className="w-full text-left p-2 rounded-xl hover:bg-slate-50 flex items-center gap-2 text-slate-800 font-semibold"
                    >
                      <Atom className="w-4 h-4 text-emerald-600" />
                      <span>Khoa học & Tự nhiên</span>
                    </button>
                    <button 
                      onClick={() => setShowCoursesMenu(false)}
                      className="w-full text-left p-2 rounded-xl hover:bg-slate-50 flex items-center gap-2 text-slate-800 font-semibold"
                    >
                      <Globe className="w-4 h-4 text-purple-600" />
                      <span>Tiếng Anh & Ngôn ngữ</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3 border-l border-slate-100 pl-4">
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                    Khối Lớp Hiện Tại
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                      <button
                        key={g}
                        onClick={() => {
                          onSelectGrade({ id: `g-${g}`, name: `Lớp ${g}`, code: `GRADE_${g}`, level: g <= 5 ? 'PRIMARY' : g <= 9 ? 'SECONDARY' : 'HIGH_SCHOOL', displayOrder: g });
                          setShowCoursesMenu(false);
                        }}
                        className={`p-1.5 rounded-lg text-center font-bold text-xs transition ${
                          selectedGrade?.name === `Lớp ${g}`
                            ? 'bg-[#1865F2] text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        Lớp {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Search Input */}
          <div className="hidden md:flex relative w-52 lg:w-64">
            <input
              type="text"
              placeholder="Tìm kiếm môn học, bài giảng..."
              className="w-full bg-[#F7F8FA] text-slate-800 placeholder-slate-400 text-xs rounded-full pl-9 pr-4 py-2 border border-slate-200 focus:outline-none focus:border-[#1865F2] focus:bg-white transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Center: Official Khan Academy Emblem & Brand */}
        <div className="flex items-center">
          <button
            onClick={() => onChangeView('student')}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            {/* Khan Sprout Logo SVG */}
            <div className="w-8 h-8 rounded-full bg-[#14BF96] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22V12M12 12C12 7 7 4 2 5C3 10 7 12 12 12ZM12 12C12 7 17 4 22 5C21 10 17 12 12 12Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xl font-extrabold text-[#0A2540] tracking-tight leading-none">
                Khan Academy <span className="text-[#14BF96] font-semibold text-xs ml-0.5">K-12</span>
              </span>
              <span className="text-[9px] text-slate-400 tracking-wider font-semibold uppercase">
                Giáo Dục Chuẩn Hóa
              </span>
            </div>
          </button>
        </div>

        {/* Right: AI Khanmigo, Gamification, Auth Controls */}
        <div className="flex items-center gap-3">
          {/* Khanmigo AI Tutor Quick Button */}
          <button
            onClick={onOpenAiChat}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-[#0B6A56] hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#14BF96]" />
            <span>Khanmigo AI</span>
          </button>

          {/* If user is logged in */}
          {currentUser ? (
            <>
              {/* Gamification Points & Streak */}
              <div className="hidden lg:flex items-center gap-2">
                <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 rounded-full border border-amber-200 text-amber-800 text-xs font-bold" title="Chuỗi ngày học">
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{currentUser.streakDays || 1}</span>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 rounded-full border border-blue-200 text-[#1865F2] text-xs font-bold" title="Điểm năng lượng">
                  <span className="text-[#FFC700]">★</span>
                  <span>{(currentUser.energyPoints || 1000).toLocaleString()}</span>
                </div>
              </div>

              {/* Admin CMS Button */}
              {(currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'TEACHER') && (
                <button
                  onClick={() => onChangeView(activeView === 'admin' ? 'student' : 'admin')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full transition border ${
                    activeView === 'admin'
                      ? 'bg-[#1865F2] text-white border-transparent'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{activeView === 'admin' ? "Trang Học Sinh" : "Cổng Quản Trị"}</span>
                </button>
              )}

              {/* User Profile Avatar & Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-[#1865F2] transition cursor-pointer"
                >
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 bg-slate-50"
                  />
                </button>

                {showUserDropdown && (
                  <div 
                    className="absolute right-0 mt-2 w-64 bg-white text-slate-800 rounded-3xl shadow-2xl border border-slate-200 p-2 z-50 text-xs"
                    onMouseLeave={() => setShowUserDropdown(false)}
                  >
                    <div className="p-3 border-b border-slate-100">
                      <p className="font-bold text-slate-900">{currentUser.fullName}</p>
                      <p className="text-[11px] text-slate-500">@{currentUser.username}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700">
                        Vai trò: {currentUser.role}
                      </span>
                    </div>

                    <div className="py-1 space-y-1">
                      <button
                        onClick={() => {
                          onOpenProfile();
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 flex items-center gap-2 font-bold text-slate-700 cursor-pointer"
                      >
                        <UserIcon className="w-4 h-4 text-[#1865F2]" />
                        <span>Xem Hồ Sơ & Huy Hiệu</span>
                      </button>

                      <div className="border-t border-slate-100 my-1" />

                      <p className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Chuyển nhanh vai trò:
                      </p>
                      <button
                        onClick={() => {
                          onSwitchUser('STUDENT');
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-slate-100 flex items-center justify-between font-semibold"
                      >
                        <span className="flex items-center gap-2">
                          <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                          Học sinh
                        </span>
                        {currentUser.role === 'STUDENT' && <span className="text-[#1865F2] font-bold">✓</span>}
                      </button>

                      <button
                        onClick={() => {
                          onSwitchUser('TEACHER');
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-slate-100 flex items-center justify-between font-semibold"
                      >
                        <span className="flex items-center gap-2">
                          <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                          Giáo viên
                        </span>
                        {currentUser.role === 'TEACHER' && <span className="text-[#1865F2] font-bold">✓</span>}
                      </button>

                      <button
                        onClick={() => {
                          onSwitchUser('SUPER_ADMIN');
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-slate-100 flex items-center justify-between font-semibold"
                      >
                        <span className="flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                          Quản Trị Viên
                        </span>
                        {currentUser.role === 'SUPER_ADMIN' && <span className="text-[#1865F2] font-bold">✓</span>}
                      </button>

                      <div className="border-t border-slate-100 my-1" />

                      <button
                        onClick={() => {
                          onLogout();
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-bold cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Logged out state: Khan Academy Login & Signup buttons */
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenLogin}
                className="px-3.5 py-1.5 text-xs font-extrabold text-[#1865F2] hover:bg-blue-50/60 rounded-full transition cursor-pointer flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng nhập</span>
              </button>
              <button
                onClick={onOpenRegister}
                className="px-4 py-1.5 text-xs font-extrabold bg-[#1865F2] hover:bg-[#1557D0] text-white rounded-full shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Đăng ký</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
