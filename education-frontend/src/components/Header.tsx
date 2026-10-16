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
  UserPlus,
  Bell,
  PlayCircle,
  CheckCircle,
  BookMarked,
  Sun,
  Moon
} from "lucide-react";
import { MOCK_LESSONS } from "@/lib/mock-data";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useTheme } from "@/lib/theme/ThemeContext";

interface HeaderProps {
  currentUser: User | null;
  onSwitchUser: (role: UserRole) => void;
  activeView: 'student' | 'dashboard' | 'lesson' | 'admin' | 'login' | 'register' | 'profile' | 'about' | 'articles' | 'contact';
  onChangeView: (view: 'student' | 'dashboard' | 'lesson' | 'admin' | 'login' | 'register' | 'profile' | 'about' | 'articles' | 'contact') => void;
  selectedGrade: Grade;
  onSelectGrade: (grade: Grade) => void;
  onOpenAiChat: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
  onSelectLesson?: (lesson: any) => void;
  onOpenAbout?: () => void;
  onOpenArticles?: () => void;
  onOpenContact?: () => void;
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
  onSelectLesson,
  onOpenAbout,
  onOpenArticles,
  onOpenContact,
}) => {
  const { lang, setLang, t } = useLanguage();
  const { theme, toggleTheme, isDark } = useTheme();
  const [showCoursesMenu, setShowCoursesMenu] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: "n1",
      title: "Duy trì chuỗi học tập!",
      desc: "Bạn đã duy trì chuỗi 7 ngày học liên tục. Hãy học một bài hôm nay để nhận thêm điểm năng lượng!",
      time: "10 phút trước",
      unread: true,
      type: "streak",
    },
    {
      id: "n2",
      title: "Bài giảng mới môn Toán 5",
      desc: "Thầy Nam vừa thêm bài giảng mới: 'Khái niệm phân số & So sánh phân số'.",
      time: "2 giờ trước",
      unread: true,
      type: "lesson",
    },
    {
      id: "n3",
      title: "Huy hiệu Tinh Thông!",
      desc: "Chúc mừng bạn đạt danh hiệu 'Học Viên Năng Nổ' (2,500 điểm năng lượng).",
      time: "Hôm qua",
      unread: false,
      type: "badge",
    },
  ]);

  const searchResults = searchTerm.trim() === "" ? [] : MOCK_LESSONS.filter(l => 
    l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.description && l.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-[#0B1120] border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Official DMKLab Brand Logo + Courses Dropdown + Nav Links */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0">
          {/* DMKLab Brand Logo (Click to Home) */}
          <button
            onClick={() => onChangeView('student')}
            className="flex items-center gap-2 group cursor-pointer shrink-0"
            title="DMKLab Education - Về Trang Chủ"
          >
            <img
              src="/img-web/duc_mai_khoi_lab-removebg-removebg-preview.png"
              alt="DMKLab Education"
              className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div className="hidden sm:flex flex-col text-left border-l border-slate-200 dark:border-slate-700 pl-2">
              <span className="text-xs font-black text-[#1865F2] dark:text-blue-400 uppercase tracking-wider leading-none">
                Education
              </span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 tracking-wider font-semibold uppercase mt-0.5">
                K–12 Platform
              </span>
            </div>
          </button>

          {/* Courses Dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowCoursesMenu(!showCoursesMenu)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-[#0A2540] dark:text-[#E2E8F0] hover:text-[#1865F2] dark:hover:text-[#60A5FA] font-extrabold text-xs sm:text-sm rounded-full transition cursor-pointer whitespace-nowrap"
            >
              <span>{t('nav_courses', 'Môn học')}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showCoursesMenu ? 'rotate-180' : ''}`} />
            </button>

            {showCoursesMenu && (
              <div 
                className="absolute left-0 mt-2 w-80 md:w-96 bg-white dark:bg-[#131E35] text-slate-800 dark:text-slate-100 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-5 z-50 text-xs grid grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-150"
                onMouseLeave={() => setShowCoursesMenu(false)}
              >
                <div className="space-y-3">
                  <p className="font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider text-[11px]">
                    {t('nav_featured_fields', 'Lĩnh vực nổi bật')}
                  </p>
                  <div className="space-y-1">
                    <button 
                      onClick={() => setShowCoursesMenu(false)}
                      className="w-full text-left p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-800 dark:text-slate-100 font-semibold transition"
                    >
                      <Calculator className="w-4 h-4 text-[#1865F2]" />
                      <span>{t('nav_math_k12', 'Toán: Lớp 1 – Lớp 12')}</span>
                    </button>
                    <button 
                      onClick={() => setShowCoursesMenu(false)}
                      className="w-full text-left p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-800 dark:text-slate-100 font-semibold transition"
                    >
                      <Atom className="w-4 h-4 text-emerald-600" />
                      <span>{t('nav_science_stem', 'Khoa học & Tự nhiên')}</span>
                    </button>
                    <button 
                      onClick={() => setShowCoursesMenu(false)}
                      className="w-full text-left p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-800 dark:text-slate-100 font-semibold transition"
                    >
                      <Globe className="w-4 h-4 text-purple-600" />
                      <span>{t('nav_english_lang', 'Tiếng Anh & Ngôn ngữ')}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3 border-l border-slate-100 dark:border-slate-750 pl-4">
                  <p className="font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider text-[11px]">
                    {t('nav_current_grade', 'Khối Lớp Hiện Tại')}
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
                            : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {lang === 'en' ? `Grade ${g}` : `Lớp ${g}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Links inside Courses Dropdown */}
                <div className="col-span-2 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                  <span>{t('nav_explore_more', 'Khám phá thêm về DMKLab:')}</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        onChangeView('about');
                        setShowCoursesMenu(false);
                      }}
                      className="text-[#1865F2] dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      {t('nav_about', 'Giới thiệu')}
                    </button>
                    <button
                      onClick={() => {
                        onChangeView('articles');
                        setShowCoursesMenu(false);
                      }}
                      className="text-[#1865F2] dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      {t('nav_articles', 'Bài viết')}
                    </button>
                    <button
                      onClick={() => {
                        onChangeView('contact');
                        setShowCoursesMenu(false);
                      }}
                      className="text-[#1865F2] dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      {t('nav_contact', 'Liên hệ')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Nav links: Giới thiệu, Bài viết, Liên hệ */}
          <nav className="hidden xl:flex items-center gap-1 shrink-0">
            <button
              onClick={() => onChangeView('about')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                activeView === 'about'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-[#1865F2] dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-300 hover:text-[#1865F2] dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {t('nav_about', 'Giới thiệu')}
            </button>
            <button
              onClick={() => onChangeView('articles')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                activeView === 'articles'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-[#1865F2] dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-300 hover:text-[#1865F2] dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {t('nav_articles', 'Bài viết')}
            </button>
            <button
              onClick={() => onChangeView('contact')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                activeView === 'contact'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-[#1865F2] dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-300 hover:text-[#1865F2] dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {t('nav_contact', 'Liên hệ')}
            </button>
          </nav>
        </div>

        {/* Center: Search Bar (Flexible, centered, responsive) */}
        <div className="hidden md:flex flex-1 max-w-xs lg:max-w-sm mx-2 lg:mx-4 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            placeholder={t('nav_search_placeholder', 'Tìm kiếm môn học, bài giảng...')}
            className="w-full bg-[#F7F8FA] dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-xs rounded-full pl-9 pr-8 py-2 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#1865F2] focus:bg-white dark:focus:bg-slate-800 transition shadow-2xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setShowSearchResults(false);
              }}
              className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer font-bold"
            >
              ✕
            </button>
          )}

          {/* Live Search Results Dropdown */}
          {showSearchResults && searchTerm.trim() !== "" && (
            <div 
              className="absolute left-0 top-11 w-80 md:w-96 bg-white dark:bg-[#131E35] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-3 z-50 text-xs space-y-2 animate-in fade-in zoom-in-95 duration-150"
              onMouseLeave={() => setShowSearchResults(false)}
            >
              <div className="flex items-center justify-between px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Kết quả tìm kiếm ({searchResults.length})</span>
                <span>Nhấn để học ngay</span>
              </div>

              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-slate-400">
                  Không tìm thấy bài học nào phù hợp với "{searchTerm}"
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-1">
                  {searchResults.map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => {
                        if (onSelectLesson) onSelectLesson(lesson);
                        setShowSearchResults(false);
                        setSearchTerm("");
                      }}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-start gap-3 group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1865F2] dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#1865F2] group-hover:text-white transition">
                        <PlayCircle className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#1865F2] dark:group-hover:text-blue-400 truncate transition">
                          {lesson.title}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                          {lesson.description || "Bài giảng video lý thuyết và thực hành chuẩn K-12"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">
                            {Math.round((lesson.durationSeconds || 600) / 60)} phút
                          </span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                            {lesson.masteryLevel === 'MASTERED' ? 'Đã tinh thông 🏆' : 'Đang học'}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: AI Khanmigo, Gamification, Auth Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-2.5 shrink-0 ml-auto">
          {/* Notification Center */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              title="Trung tâm thông báo"
            >
              <Bell className="w-4 h-4" />
              {notifications.some(n => n.unread) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
              )}
            </button>

            {showNotifications && (
              <div 
                className="absolute right-0 mt-2 w-80 md:w-88 bg-white dark:bg-[#131E35] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 z-50 text-xs space-y-3 animate-in fade-in zoom-in-95 duration-150"
                onMouseLeave={() => setShowNotifications(false)}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">Thông Báo Học Tập</span>
                    <span className="bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {notifications.filter(n => n.unread).length} mới
                    </span>
                  </div>
                  <button 
                    onClick={() => setNotifications(prev => prev.map(n => ({ ...n, unread: false })))}
                    className="text-[11px] text-[#1865F2] dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                  >
                    Đánh dấu đã đọc
                  </button>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <div 
                      key={n.id}
                      className={`p-3 rounded-xl border transition ${
                        n.unread 
                          ? 'bg-blue-50/50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/50' 
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-slate-900 dark:text-slate-100">{n.title}</p>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">{n.time}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-1 leading-relaxed">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* DMK AI Tutor Quick Button */}
          <button
            onClick={onOpenAiChat}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 text-[#1865F2] dark:text-blue-300 text-xs font-bold transition shrink-0 whitespace-nowrap cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#1865F2] dark:text-blue-400" />
            <span>DMK AI Tutor</span>
          </button>

          {/* Language Switcher (Tiếng Việt mặc định & English) */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 hover:border-blue-400 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-bold text-slate-700 dark:text-slate-200 transition shrink-0 whitespace-nowrap cursor-pointer shadow-2xs"
              title={t('lang_select_title', 'Chọn ngôn ngữ')}
            >
              <Globe className="w-3.5 h-3.5 text-[#1865F2]" />
              <span className="font-extrabold">{lang === 'vi' ? '🇻🇳 VN' : '🇬🇧 EN'}</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${showLangMenu ? 'rotate-180' : ''}`} />
            </button>

            {showLangMenu && (
              <div 
                className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#131E35] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-2 z-50 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150"
                onMouseLeave={() => setShowLangMenu(false)}
              >
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {t('lang_select_title', 'Chọn ngôn ngữ')}
                </div>
                <button
                  onClick={() => {
                    setLang('vi');
                    setShowLangMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between font-semibold transition cursor-pointer ${
                    lang === 'vi' ? 'bg-blue-50 dark:bg-blue-950/50 text-[#1865F2] dark:text-blue-400 font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">🇻🇳</span>
                    <span>Tiếng Việt <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">(Mặc định)</span></span>
                  </span>
                  {lang === 'vi' && <CheckCircle className="w-3.5 h-3.5 text-[#1865F2] dark:text-blue-400" />}
                </button>

                <button
                  onClick={() => {
                    setLang('en');
                    setShowLangMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between font-semibold transition cursor-pointer ${
                    lang === 'en' ? 'bg-blue-50 dark:bg-blue-950/50 text-[#1865F2] dark:text-blue-400 font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">🇬🇧</span>
                    <span>English</span>
                  </span>
                  {lang === 'en' && <CheckCircle className="w-3.5 h-3.5 text-[#1865F2] dark:text-blue-400" />}
                </button>
              </div>
            )}
          </div>

          {/* Theme Switcher Toggle (Dark / Light Mode) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-amber-400 transition shrink-0 cursor-pointer shadow-2xs"
            title={isDark ? t('theme_light', 'Giao diện Sáng') : t('theme_dark', 'Giao diện Tối')}
            aria-label={t('theme_toggle', 'Chuyển giao diện sáng/tối')}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600 fill-slate-100" />
            )}
          </button>

          {/* If user is logged in */}
          {currentUser ? (
            <>
              {/* Gamification Points & Streak */}
              <div className="hidden xl:flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 rounded-full border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs font-bold" title="Chuỗi ngày học">
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{currentUser.streakDays || 1}</span>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 rounded-full border border-blue-200 dark:border-blue-800/60 text-[#1865F2] dark:text-blue-300 text-xs font-bold" title="Điểm năng lượng">
                  <span className="text-[#FFC700]">★</span>
                  <span>{(currentUser.energyPoints || 1000).toLocaleString()}</span>
                </div>
              </div>

              {/* Dashboard Navigation Button */}
              {currentUser && (
                <button
                  onClick={() => {
                    if (currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'TEACHER') {
                      onChangeView(activeView === 'admin' ? 'student' : 'admin');
                    } else {
                      onChangeView(activeView === 'dashboard' ? 'student' : 'dashboard');
                    }
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full transition border shrink-0 whitespace-nowrap cursor-pointer ${
                    activeView === 'dashboard' || activeView === 'admin'
                      ? 'bg-[#1865F2] text-white border-transparent shadow-xs'
                      : 'bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                  }`}
                  title={
                    activeView === 'dashboard' || activeView === 'admin'
                      ? "Trang Chủ Khóa Học"
                      : currentUser.role === 'STUDENT'
                      ? "Bảng Điều Khiển"
                      : "Cổng Quản Trị"
                  }
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">
                    {activeView === 'dashboard' || activeView === 'admin'
                      ? "Trang Chủ Khóa Học"
                      : currentUser.role === 'STUDENT'
                      ? "Bảng Điều Khiển"
                      : "Cổng Quản Trị"}
                  </span>
                </button>
              )}

              {/* User Profile Avatar & Dropdown */}
              <div className="relative shrink-0">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-[#1865F2] transition cursor-pointer"
                >
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </button>

                {showUserDropdown && (
                  <div 
                    className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#131E35] text-slate-800 dark:text-slate-100 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150"
                    onMouseLeave={() => setShowUserDropdown(false)}
                  >
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                      <p className="font-bold text-slate-900 dark:text-slate-100">{currentUser.fullName}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">@{currentUser.username}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                        Vai trò: {currentUser.role}
                      </span>
                    </div>

                    <div className="py-1 space-y-1">
                      <button
                        onClick={() => {
                          if (currentUser.role === 'STUDENT') {
                            onChangeView('dashboard');
                          } else {
                            onChangeView('admin');
                          }
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200 cursor-pointer transition"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#1865F2] dark:text-blue-400" />
                        <span>
                          {currentUser.role === 'STUDENT' ? "Bảng Điều Khiển Cá Nhân" : "Bảng Quản Trị Hệ Thống"}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          onOpenProfile();
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200 cursor-pointer transition"
                      >
                        <UserIcon className="w-4 h-4 text-[#14BF96]" />
                        <span>Xem Hồ Sơ & Huy Hiệu</span>
                      </button>

                      <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                      <p className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Chuyển nhanh vai trò:
                      </p>
                      <button
                        onClick={() => {
                          onSwitchUser('STUDENT');
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between font-semibold transition"
                      >
                        <span className="flex items-center gap-2">
                          <GraduationCap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          Học sinh
                        </span>
                        {currentUser.role === 'STUDENT' && <span className="text-[#1865F2] dark:text-blue-400 font-bold">✓</span>}
                      </button>

                      <button
                        onClick={() => {
                          onSwitchUser('TEACHER');
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between font-semibold transition"
                      >
                        <span className="flex items-center gap-2">
                          <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          Giáo viên
                        </span>
                        {currentUser.role === 'TEACHER' && <span className="text-[#1865F2] dark:text-blue-400 font-bold">✓</span>}
                      </button>

                      <button
                        onClick={() => {
                          onSwitchUser('SUPER_ADMIN');
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between font-semibold transition"
                      >
                        <span className="flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                          Quản Trị Viên
                        </span>
                        {currentUser.role === 'SUPER_ADMIN' && <span className="text-[#1865F2] dark:text-blue-400 font-bold">✓</span>}
                      </button>

                      <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                      <button
                        onClick={() => {
                          onLogout();
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-2 font-bold cursor-pointer transition"
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
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onOpenLogin}
                className="px-3.5 py-1.5 text-xs font-extrabold text-[#1865F2] dark:text-blue-400 hover:bg-blue-50/60 dark:hover:bg-blue-950/60 rounded-full transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t('nav_login', 'Đăng nhập')}</span>
              </button>
              <button
                onClick={onOpenRegister}
                className="px-4 py-1.5 text-xs font-extrabold bg-[#1865F2] hover:bg-[#1557D0] text-white rounded-full shadow-xs transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{t('nav_register', 'Đăng ký')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
