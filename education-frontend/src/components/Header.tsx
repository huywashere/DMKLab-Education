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
  Bookmark,
  Sliders,
  Settings,
  Mail,
  MessageSquare,
  Check,
  HelpCircle,
  Filter,
  Home,
  Menu,
  X,
  Smartphone,
  Sun,
  Moon,
} from "lucide-react";
import {
  FaFireFlameCurved,
  FaStar,
  FaGraduationCap,
  FaChalkboardUser,
  FaUserShield,
  FaArrowRightFromBracket,
} from "react-icons/fa6";
import {
  RiSparklingFill,
  RiTranslate2,
  RiNotification3Line,
  RiDashboardFill,
  RiSearchLine,
  RiAtomLine,
  RiBookOpenLine,
} from "react-icons/ri";
import { TbMathFunction } from "react-icons/tb";
import { MOCK_LESSONS } from "@/lib/mock-data";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useTheme } from "@/lib/theme/ThemeContext";
import { useBookmarks } from "@/lib/bookmarks/BookmarksContext";
import { useAccessibility } from "@/lib/a11y/AccessibilityContext";

interface HeaderProps {
  currentUser: User | null;
  onSwitchUser: (role: UserRole) => void;
  activeView:
    | "student"
    | "dashboard"
    | "lesson"
    | "admin"
    | "login"
    | "register"
    | "profile"
    | "about"
    | "articles"
    | "contact";
  onChangeView: (
    view:
      | "student"
      | "dashboard"
      | "lesson"
      | "admin"
      | "login"
      | "register"
      | "profile"
      | "about"
      | "articles"
      | "contact"
  ) => void;
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
  const { bookmarks, openModal: openBookmarksModal } = useBookmarks();
  const { openShortcuts } = useAccessibility();
  const [notifCategory, setNotifCategory] = useState<"all" | "unread" | "lesson" | "system">("all");
  const [showChannelsModal, setShowChannelsModal] = useState(false);
  const [channelSettings, setChannelSettings] = useState({
    website: true,
    email: true,
    zalo: true,
  });
  const [channelSavedMsg, setChannelSavedMsg] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const [notifications, setNotifications] = useState([
    {
      id: "n1",
      title: "Duy trì chuỗi học tập!",
      desc: "Bạn đã duy trì chuỗi 7 ngày học liên tục. Hãy học một bài hôm nay để nhận thêm điểm năng lượng!",
      time: "10 phút trước",
      unread: true,
      type: "streak",
      category: "system",
    },
    {
      id: "n2",
      title: "Bài giảng mới môn Toán 5",
      desc: "Thầy Nam vừa thêm bài giảng mới: 'Khái niệm phân số & So sánh phân số'.",
      time: "2 giờ trước",
      unread: true,
      type: "lesson",
      category: "lesson",
    },
    {
      id: "n3",
      title: "Huy hiệu Tinh Thông!",
      desc: "Chúc mừng bạn đạt danh hiệu 'Học Viên Năng Nổ' (2,500 điểm năng lượng).",
      time: "Hôm qua",
      unread: false,
      type: "badge",
      category: "system",
    },
    {
      id: "n4",
      title: "Nhiệm vụ tuần: Khoa học tự nhiên",
      desc: "Bài tập thực hành 'Năng lượng Mặt trời và Trái đất' đã sẵn sàng.",
      time: "2 ngày trước",
      unread: false,
      type: "lesson",
      category: "lesson",
    },
    {
      id: "n5",
      title: "Bảo mật tài khoản DMKLab",
      desc: "Xác thực JWT Bearer & RBAC hoạt động ổn định. Phiên làm việc của bạn an toàn.",
      time: "3 ngày trước",
      unread: false,
      type: "security",
      category: "system",
    },
  ]);

  const filteredNotifications = notifications.filter((n) => {
    if (notifCategory === "unread") return n.unread;
    if (notifCategory === "lesson") return n.category === "lesson";
    if (notifCategory === "system") return n.category === "system";
    return true;
  });

  const unreadNotifCount = notifications.filter((n) => n.unread).length;

  const searchResults =
    searchTerm.trim() === ""
      ? []
      : MOCK_LESSONS.filter(
          (l) =>
            l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (l.description && l.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800/90 shadow-2xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Left: Official DMKLab Brand Logo + Courses Dropdown + Nav Links */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0">
          {/* Mobile Drawer Trigger (Only on < lg screens) */}
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="lg:hidden p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Mở menu"
            aria-label="Mở menu điều hướng"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* DMKLab + Khan Academy Brand Logo (Click to Home) */}
          <button
            onClick={() => onChangeView("student")}
            className="flex items-center gap-2.5 group cursor-pointer shrink-0"
            title="DMKLab Khan Academy - Về Trang Chủ"
          >
            {/* Authentic Khan Academy Green Sprout Icon */}
            <div className="w-8 h-8 rounded-lg bg-[#14BF96]/15 flex items-center justify-center text-[#14BF96] group-hover:scale-105 transition-transform shadow-xs">
              <svg className="w-5 h-5 text-[#14BF96]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.5 2 5.5 4.5 4.5 8c2.5-.5 5.5.5 7.5 2.5 2-2 5-3 7.5-2.5C18.5 4.5 15.5 2 12 2zm0 8.5c-2-2-5-3-7.5-2.5C4.2 9.5 4 11.5 4 14c0 4.5 4 8 8 8s8-3.5 8-8c0-2.5-.2-4.5-.5-6-2.5-.5-5.5.5-7.5 2.5z" />
              </svg>
            </div>

            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-base font-extrabold text-[#0B2149] dark:text-white tracking-tight">
                  DMKLab
                </span>
                <span className="text-sm font-bold text-[#1865F2] dark:text-blue-400">
                  Khan Academy
                </span>
              </div>
              <span className="text-[9px] text-slate-500 dark:text-slate-400 tracking-wider font-semibold uppercase mt-0.5">
                K–12 Việt Nam
              </span>
            </div>
          </button>

          {/* Courses Dropdown Trigger */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowCoursesMenu(!showCoursesMenu)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-[#1865F2] dark:hover:text-blue-400 rounded-lg hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition cursor-pointer whitespace-nowrap"
            >
              <span>{t("nav_courses", "Môn học")}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${showCoursesMenu ? "rotate-180 text-[#1865F2]" : ""}`}
              />
            </button>

            {showCoursesMenu && (
              <div
                className="absolute left-0 mt-2 w-80 md:w-96 bg-white dark:bg-[#131E35] text-slate-800 dark:text-slate-100 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-5 z-50 text-xs grid grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-150"
                onMouseLeave={() => setShowCoursesMenu(false)}
              >
                <div className="space-y-3">
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                    {t("nav_featured_fields", "Lĩnh vực nổi bật")}
                  </p>
                  <div className="space-y-1">
                    <button
                      onClick={() => setShowCoursesMenu(false)}
                      className="w-full text-left p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-800 dark:text-slate-100 font-semibold transition"
                    >
                      <TbMathFunction className="w-4 h-4 text-[#1865F2]" />
                      <span>{t("nav_math_k12", "Toán: Lớp 1 – Lớp 12")}</span>
                    </button>
                    <button
                      onClick={() => setShowCoursesMenu(false)}
                      className="w-full text-left p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-800 dark:text-slate-100 font-semibold transition"
                    >
                      <RiAtomLine className="w-4 h-4 text-emerald-600" />
                      <span>{t("nav_science_stem", "Khoa học & Tự nhiên")}</span>
                    </button>
                    <button
                      onClick={() => setShowCoursesMenu(false)}
                      className="w-full text-left p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-800 dark:text-slate-100 font-semibold transition"
                    >
                      <Globe className="w-4 h-4 text-purple-600" />
                      <span>{t("nav_english_lang", "Tiếng Anh & Ngôn ngữ")}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3 border-l border-slate-100 dark:border-slate-750 pl-4">
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                    {t("nav_current_grade", "Khối Lớp")}
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                      <button
                        key={g}
                        onClick={() => {
                          onSelectGrade({
                            id: `g-${g}`,
                            name: `Lớp ${g}`,
                            code: `GRADE_${g}`,
                            level: g <= 5 ? "PRIMARY" : g <= 9 ? "SECONDARY" : "HIGH_SCHOOL",
                            displayOrder: g,
                          });
                          setShowCoursesMenu(false);
                        }}
                        className={`p-1.5 rounded-lg text-center font-bold text-xs transition ${
                          selectedGrade?.name === `Lớp ${g}`
                            ? "bg-[#1865F2] text-white shadow-xs"
                            : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        {lang === "en" ? `Grade ${g}` : `Lớp ${g}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Links inside Courses Dropdown */}
                <div className="col-span-2 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  <span>{t("nav_explore_more", "Khám phá thêm về DMKLab:")}</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        onChangeView("about");
                        setShowCoursesMenu(false);
                      }}
                      className="text-[#1865F2] dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      {t("nav_about", "Giới thiệu")}
                    </button>
                    <button
                      onClick={() => {
                        onChangeView("articles");
                        setShowCoursesMenu(false);
                      }}
                      className="text-[#1865F2] dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      {t("nav_articles", "Bài viết")}
                    </button>
                    <button
                      onClick={() => {
                        onChangeView("contact");
                        setShowCoursesMenu(false);
                      }}
                      className="text-[#1865F2] dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      {t("nav_contact", "Liên hệ")}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Nav links: Giới thiệu, Bài viết, Liên hệ - Clean modern text links without colorful bubbles */}
          <nav className="hidden lg:flex items-center gap-1 shrink-0">
            <button
              onClick={() => onChangeView("about")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                activeView === "about"
                  ? "text-[#1865F2] dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/40 font-bold"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/50"
              }`}
            >
              {t("nav_about", "Giới thiệu")}
            </button>
            <button
              onClick={() => onChangeView("articles")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                activeView === "articles"
                  ? "text-[#1865F2] dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/40 font-bold"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/50"
              }`}
            >
              {t("nav_articles", "Bài viết")}
            </button>
            <button
              onClick={() => onChangeView("contact")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                activeView === "contact"
                  ? "text-[#1865F2] dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/40 font-bold"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/50"
              }`}
            >
              {t("nav_contact", "Liên hệ")}
            </button>
          </nav>
        </div>

        {/* Center: Search Bar (Clean integrated box) */}
        <div className="hidden md:flex flex-1 max-w-xs lg:max-w-sm mx-2 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            placeholder={t("nav_search_placeholder", "Tìm kiếm bài học...")}
            className="w-full bg-slate-100/90 dark:bg-slate-800/70 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-xs rounded-lg pl-8.5 pr-8 py-1.5 border border-slate-200/80 dark:border-slate-700/60 focus:outline-none focus:border-[#1865F2] focus:bg-white dark:focus:bg-slate-900 transition"
          />
          <RiSearchLine className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setShowSearchResults(false);
              }}
              className="absolute right-2.5 top-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer font-bold"
            >
              ✕
            </button>
          )}

          {/* Live Search Results Dropdown */}
          {showSearchResults && searchTerm.trim() !== "" && (
            <div
              className="absolute left-0 top-10 w-80 md:w-96 bg-white dark:bg-[#131E35] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-3 z-50 text-xs space-y-2 animate-in fade-in zoom-in-95 duration-150"
              onMouseLeave={() => setShowSearchResults(false)}
            >
              <div className="flex items-center justify-between px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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
                      className="w-full text-left p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-start gap-2.5 group cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#1865F2] dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#1865F2] group-hover:text-white transition">
                        <PlayCircle className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-[#1865F2] dark:group-hover:text-blue-400 truncate transition">
                          {lesson.title}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                          {lesson.description || "Bài giảng chuẩn K-12"}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Grouped Tools with subtle dividers */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 ml-auto">
          {/* AI Tutor Button - Clean modern button with soft accent */}
          <button
            onClick={onOpenAiChat}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50/70 hover:bg-blue-100/70 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 text-[#1865F2] dark:text-blue-400 text-xs font-semibold border border-blue-200/60 dark:border-blue-800/50 transition shrink-0 cursor-pointer"
            title="Mở Gia sư AI Socratic"
          >
            <RiSparklingFill className="w-3.5 h-3.5 text-[#1865F2] dark:text-blue-400" />
            <span className="hidden sm:inline">AI Tutor</span>
          </button>

          {/* Hairline Divider */}
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 shrink-0" />

          {/* Utilities: Bookmarks, Accessibility, Notifications, Language, Theme */}
          <div className="flex items-center gap-1">
            {/* Bookmarks & Saved Notes Trigger */}
            <button
              onClick={openBookmarksModal}
              className="relative p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition cursor-pointer"
              title={`Bài học & Ghi chú đã lưu (${bookmarks.length})`}
              aria-label="Bài học đã lưu"
            >
              <Bookmark className="w-4 h-4" />
              {bookmarks.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-amber-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                  {bookmarks.length}
                </span>
              )}
            </button>

            {/* Accessibility & Keyboard Shortcuts Trigger */}
            <button
              onClick={openShortcuts}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-[#1865F2] dark:hover:text-blue-400 transition cursor-pointer"
              title="Hỗ trợ tiếp cận & Phím tắt (?)"
              aria-label="Hỗ trợ tiếp cận"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Notification Center */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                title="Thông báo tập trung"
                aria-label="Thông báo"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-[#0B1120]" />
                )}
              </button>

              {showNotifications && (
                <div
                  className="absolute right-0 mt-2 w-84 sm:w-92 bg-white dark:bg-[#131E35] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-3.5 z-50 text-xs space-y-3 animate-in fade-in zoom-in-95 duration-150"
                  onMouseLeave={() => setShowNotifications(false)}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 dark:text-slate-100 text-xs">
                        Thông Báo Tập Trung
                      </span>
                      {unreadNotifCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                          {unreadNotifCount} mới
                        </span>
                      )}
                    </div>
                    {unreadNotifCount > 0 && (
                      <button
                        onClick={() =>
                          setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
                        }
                        className="text-[11px] text-[#1865F2] dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                      >
                        Đã đọc tất cả
                      </button>
                    )}
                  </div>

                  {/* Notification Category Filters */}
                  <div className="flex items-center gap-1 pb-1 overflow-x-auto no-scrollbar">
                    {[
                      { key: "all", label: `Tất cả (${notifications.length})` },
                      { key: "unread", label: `Chưa đọc (${unreadNotifCount})` },
                      { key: "lesson", label: "Bài học" },
                      { key: "system", label: "Hệ thống" },
                    ].map((cat) => (
                      <button
                        key={cat.key}
                        onClick={() => setNotifCategory(cat.key as any)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap transition cursor-pointer ${
                          notifCategory === cat.key
                            ? "bg-[#1865F2] text-white shadow-2xs"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Notifications List */}
                  <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar">
                    {filteredNotifications.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-[11px]">
                        Không có thông báo nào trong danh mục này.
                      </div>
                    ) : (
                      filteredNotifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() =>
                            setNotifications((prev) =>
                              prev.map((x) => (x.id === n.id ? { ...x, unread: false } : x))
                            )
                          }
                          className={`p-2.5 rounded-xl border transition cursor-pointer ${
                            n.unread
                              ? "bg-blue-50/50 dark:bg-blue-950/30 border-blue-200/80 dark:border-blue-900/50"
                              : "bg-slate-50/70 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:bg-slate-100/70"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <p
                              className={`font-bold text-[11px] truncate ${n.unread ? "text-blue-900 dark:text-blue-200" : "text-slate-800 dark:text-slate-200"}`}
                            >
                              {n.title}
                            </p>
                            <span className="text-[9px] text-slate-400 shrink-0">{n.time}</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 text-[10px] mt-1 leading-relaxed">
                            {n.desc}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Channel Preferences Trigger */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        setShowChannelsModal(true);
                      }}
                      className="w-full py-1.5 px-2 rounded-lg bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer text-[11px]"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      <span>Cài đặt kênh thông báo (Website / Email / Zalo)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Language Switcher */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                title={t("lang_select_title", "Chọn ngôn ngữ")}
              >
                <RiTranslate2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{lang === "vi" ? "VN" : "EN"}</span>
                <ChevronDown
                  className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${showLangMenu ? "rotate-180" : ""}`}
                />
              </button>

              {showLangMenu && (
                <div
                  className="absolute right-0 mt-2 w-44 bg-white dark:bg-[#131E35] rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 z-50 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150"
                  onMouseLeave={() => setShowLangMenu(false)}
                >
                  <button
                    onClick={() => {
                      setLang("vi");
                      setShowLangMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between font-medium transition cursor-pointer ${
                      lang === "vi"
                        ? "bg-blue-50 dark:bg-blue-950/50 text-[#1865F2] dark:text-blue-400 font-bold"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    <span>🇻🇳 Tiếng Việt</span>
                    {lang === "vi" && (
                      <CheckCircle className="w-3.5 h-3.5 text-[#1865F2] dark:text-blue-400" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setLang("en");
                      setShowLangMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between font-medium transition cursor-pointer ${
                      lang === "en"
                        ? "bg-blue-50 dark:bg-blue-950/50 text-[#1865F2] dark:text-blue-400 font-bold"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    <span>🇬🇧 English</span>
                    {lang === "en" && (
                      <CheckCircle className="w-3.5 h-3.5 text-[#1865F2] dark:text-blue-400" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Theme Toggle (Dark / Light Mode) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-amber-400 transition cursor-pointer"
              title={isDark ? t("theme_light", "Giao diện Sáng") : t("theme_dark", "Giao diện Tối")}
              aria-label={t("theme_toggle", "Chuyển giao diện sáng/tối")}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>
          </div>

          {/* If user is logged in */}
          {currentUser ? (
            <>
              {/* Hairline Divider */}
              <div className="hidden xl:block h-4 w-px bg-slate-200 dark:bg-slate-800 shrink-0" />

              {/* UNIFIED GAMIFICATION BADGE (Single quiet neutral chip - No rainbow colors!) */}
              <div
                className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100/80 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-200"
                title={`Chuỗi ${currentUser.streakDays || 1} ngày học • ${(currentUser.energyPoints || 1000).toLocaleString()} điểm năng lượng`}
              >
                <div className="flex items-center gap-1 text-slate-700 dark:text-slate-200">
                  <FaFireFlameCurved className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{currentUser.streakDays || 1}</span>
                </div>
                <span className="text-slate-300 dark:text-slate-600 text-[10px]">•</span>
                <div className="flex items-center gap-1 text-slate-700 dark:text-slate-200">
                  <FaStar className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>{(currentUser.energyPoints || 1000).toLocaleString()}</span>
                </div>
              </div>

              {/* Hairline Divider */}
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 shrink-0" />

              {/* Dashboard Navigation Button - Subtle outline, not a harsh pill */}
              <button
                onClick={() => {
                  if (currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN") {
                    window.location.href = "/admin";
                  } else {
                    onChangeView(activeView === "dashboard" ? "student" : "dashboard");
                  }
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition border cursor-pointer whitespace-nowrap bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                title={
                  currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN"
                    ? "Mở Cổng Quản Trị Riêng Biệt (/admin)"
                    : currentUser.role === "STUDENT"
                      ? "Bảng Điều Khiển"
                      : "Không Gian Giáo Viên"
                }
              >
                <RiDashboardFill className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span className="hidden xl:inline">
                  {currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN"
                    ? "Cổng Quản Trị ↗"
                    : currentUser.role === "STUDENT"
                      ? "Bảng Điều Khiển"
                      : "Bảng Giáo Viên"}
                </span>
              </button>

              {/* User Profile Avatar & Dropdown */}
              <div className="relative shrink-0">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center p-0.5 rounded-full hover:ring-2 hover:ring-[#1865F2] transition cursor-pointer"
                  title={currentUser.fullName}
                >
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </button>

                {showUserDropdown && (
                  <div
                    className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#131E35] text-slate-800 dark:text-slate-100 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150"
                    onMouseLeave={() => setShowUserDropdown(false)}
                  >
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                      <p className="font-bold text-slate-900 dark:text-slate-100">
                        {currentUser.fullName}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        @{currentUser.username}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                        Vai trò: {currentUser.role}
                      </span>
                    </div>

                    <div className="py-1 space-y-0.5">
                      <button
                        onClick={() => {
                          if (currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN") {
                            window.location.href = "/admin";
                          } else {
                            onChangeView("dashboard");
                          }
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200 cursor-pointer transition"
                      >
                        <RiDashboardFill className="w-4 h-4 text-[#1865F2] dark:text-blue-400" />
                        <span>
                          {currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN"
                            ? "Cổng Quản Trị Hệ Thống (/admin) ↗"
                            : "Bảng Điều Khiển Cá Nhân"}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          onOpenProfile();
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200 cursor-pointer transition"
                      >
                        <UserIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Xem Hồ Sơ & Huy Hiệu</span>
                      </button>

                      <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                      <p className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Chuyển vai trò:
                      </p>
                      <button
                        onClick={() => {
                          onSwitchUser("STUDENT");
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between font-medium transition cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <FaGraduationCap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          Học sinh
                        </span>
                        {currentUser.role === "STUDENT" && (
                          <span className="text-[#1865F2] dark:text-blue-400 font-bold">✓</span>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          onSwitchUser("TEACHER");
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between font-medium transition cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <FaChalkboardUser className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          Giáo viên
                        </span>
                        {currentUser.role === "TEACHER" && (
                          <span className="text-[#1865F2] dark:text-blue-400 font-bold">✓</span>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          onSwitchUser("SUPER_ADMIN");
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between font-medium transition cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <FaUserShield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                          Quản Trị Viên
                        </span>
                        {currentUser.role === "SUPER_ADMIN" && (
                          <span className="text-[#1865F2] dark:text-blue-400 font-bold">✓</span>
                        )}
                      </button>

                      <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                      <button
                        onClick={() => {
                          onLogout();
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-2 font-semibold cursor-pointer transition"
                      >
                        <FaArrowRightFromBracket className="w-3.5 h-3.5" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Logged out state */
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onOpenLogin}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-[#1865F2] dark:hover:text-blue-400 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t("nav_login", "Đăng nhập")}</span>
              </button>
              <button
                onClick={onOpenRegister}
                className="px-3.5 py-1.5 text-xs font-semibold bg-[#1865F2] hover:bg-[#1557D0] text-white rounded-lg shadow-2xs transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{t("nav_register", "Đăng ký")}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Centralized Notification Channel Preferences Modal */}
      {showChannelsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131E35] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-5 animate-in fade-in zoom-in-95 text-slate-800 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1865F2] dark:text-blue-400 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                    Cài Đặt Kênh Nhận Thông Báo
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Quản lý nhận thông báo trên website, email hoặc kênh phù hợp
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowChannelsModal(false);
                  setChannelSavedMsg(false);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {channelSavedMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Đã lưu tùy chọn kênh thông báo thành công!</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              {/* Channel 1: Website */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#1865F2]" />
                    <span>Thông báo trong Website</span>
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Hiển thị chuông thông báo, bài học mới, và nhắc nhở duy trì chuỗi học tập
                    (Streak).
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={channelSettings.website}
                  onChange={(e) =>
                    setChannelSettings((prev) => ({ ...prev, website: e.target.checked }))
                  }
                  className="w-4 h-4 accent-[#1865F2] rounded cursor-pointer shrink-0"
                />
              </div>

              {/* Channel 2: Email */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-purple-600" />
                    <span>Thông báo qua Email</span>
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Gửi thư tổng kết tiến độ hàng tuần, báo cáo phụ huynh và cảnh báo bảo mật tài
                    khoản.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={channelSettings.email}
                  onChange={(e) =>
                    setChannelSettings((prev) => ({ ...prev, email: e.target.checked }))
                  }
                  className="w-4 h-4 accent-purple-600 rounded cursor-pointer shrink-0"
                />
              </div>

              {/* Channel 3: Zalo / Di động */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Kênh Zalo OA & Ứng dụng Di động</span>
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Tin nhắn nhắc học mỗi tối 19:30, chúc mừng mở khóa huy hiệu mới qua Zalo
                    Official Account.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={channelSettings.zalo}
                  onChange={(e) =>
                    setChannelSettings((prev) => ({ ...prev, zalo: e.target.checked }))
                  }
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer shrink-0"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setShowChannelsModal(false);
                  setChannelSavedMsg(false);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 text-xs transition cursor-pointer"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  try {
                    localStorage.setItem(
                      "dmklab_notification_channels",
                      JSON.stringify(channelSettings)
                    );
                  } catch {}
                  setChannelSavedMsg(true);
                  setTimeout(() => {
                    setShowChannelsModal(false);
                    setChannelSavedMsg(false);
                  }, 1200);
                }}
                className="px-5 py-2 rounded-xl bg-[#1865F2] hover:bg-[#1557D0] text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Lưu Cấu Hình</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer (Slide-out menu for tablet/mobile) */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-white dark:bg-[#0B1528] text-slate-800 dark:text-slate-100 p-5 shadow-2xl flex flex-col justify-between h-full z-10 animate-in slide-in-from-left duration-200">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <img
                    src="/img-web/duc_mai_khoi_lab-removebg-removebg-preview.png"
                    alt="DMKLab"
                    className="h-7 w-auto object-contain"
                  />
                  <span className="text-xs font-black text-[#1865F2] dark:text-blue-400 uppercase tracking-wider">
                    DMKLab K-12
                  </span>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1 text-xs font-semibold">
                <button
                  onClick={() => {
                    onChangeView("student");
                    setMobileDrawerOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
                    activeView === "student"
                      ? "bg-blue-50 dark:bg-blue-950/60 text-[#1865F2] font-bold"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  }`}
                >
                  <Home className="w-4 h-4 text-[#1865F2]" />
                  <span>Trang Chủ Học Sinh</span>
                </button>

                <button
                  onClick={() => {
                    openBookmarksModal();
                    setMobileDrawerOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-200 transition cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <Bookmark className="w-4 h-4 text-amber-500" />
                    <span>Bài Học Đã Lưu & Ghi Chú</span>
                  </span>
                  {bookmarks.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      {bookmarks.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    openShortcuts();
                    setMobileDrawerOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 transition cursor-pointer"
                >
                  <Sliders className="w-4 h-4 text-[#1865F2]" />
                  <span>Hỗ Trợ Tiếp Cận & Phím Tắt (?)</span>
                </button>

                <div className="border-t border-slate-100 dark:border-slate-800 my-2" />

                <button
                  onClick={() => {
                    onChangeView("about");
                    setMobileDrawerOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition cursor-pointer"
                >
                  Giới Thiệu Nền Tảng
                </button>

                <button
                  onClick={() => {
                    onChangeView("articles");
                    setMobileDrawerOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition cursor-pointer"
                >
                  Bài Viết & Tài Liệu
                </button>

                <button
                  onClick={() => {
                    onChangeView("contact");
                    setMobileDrawerOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition cursor-pointer"
                >
                  Liên Hệ & Góp Ý
                </button>

                <div className="border-t border-slate-100 dark:border-slate-800 my-2" />

                <button
                  onClick={() => {
                    window.location.href = "/admin";
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 flex items-center justify-between text-slate-800 dark:text-slate-200 transition font-bold cursor-pointer"
                >
                  <span>Cổng Quản Trị Hệ Thống (/admin)</span>
                  <span>↗</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
              DMKLab Education K–12 Platform
            </div>
          </div>
        </div>
      )}

      {/* Mobile Fixed Bottom Navigation Bar (Đa thiết bị: Điện thoại & Máy tính bảng nhỏ) */}
      <nav
        aria-label="Điều hướng di động"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800/90 py-1.5 px-3 flex items-center justify-around shadow-lg"
      >
        <button
          onClick={() => onChangeView("student")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition cursor-pointer ${
            activeView === "student"
              ? "text-[#1865F2] font-bold"
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Trang chủ</span>
        </button>

        <button
          onClick={() => setShowCoursesMenu(!showCoursesMenu)}
          className="flex flex-col items-center gap-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 transition cursor-pointer"
        >
          <BookOpen className="w-4 h-4" />
          <span>Môn học</span>
        </button>

        <button
          onClick={openBookmarksModal}
          className="relative flex flex-col items-center gap-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 transition cursor-pointer"
        >
          <Bookmark className="w-4 h-4" />
          {bookmarks.length > 0 && (
            <span className="absolute -top-1 right-2 min-w-3.5 h-3.5 px-0.5 rounded-full bg-amber-500 text-white text-[8px] font-black flex items-center justify-center">
              {bookmarks.length}
            </span>
          )}
          <span>Đã lưu</span>
        </button>

        <button
          onClick={onOpenAiChat}
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-[#1865F2] dark:text-blue-400 transition cursor-pointer"
        >
          <div className="w-7 h-7 -mt-2 rounded-full bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 flex items-center justify-center shadow-xs">
            <RiSparklingFill className="w-4 h-4 text-[#1865F2]" />
          </div>
          <span>Gia sư AI</span>
        </button>

        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative flex flex-col items-center gap-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 transition cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          {unreadNotifCount > 0 && (
            <span className="absolute -top-1 right-2 w-2 h-2 bg-rose-500 rounded-full" />
          )}
          <span>Thông báo</span>
        </button>

        <button
          onClick={() => {
            if (currentUser) {
              onOpenProfile();
            } else {
              onOpenLogin();
            }
          }}
          className="flex flex-col items-center gap-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 transition cursor-pointer"
        >
          <UserIcon className="w-4 h-4" />
          <span>{currentUser ? "Cá nhân" : "Đăng nhập"}</span>
        </button>
      </nav>
    </header>
  );
};
