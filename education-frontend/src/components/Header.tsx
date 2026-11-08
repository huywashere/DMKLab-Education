"use client";

import React, { useState, useEffect, useRef } from "react";
import { User, UserRole, Grade } from "@/types";
import {
  Search,
  ChevronDown,
  Sparkles,
  BookOpen,
  Atom,
  Globe,
  User as UserIcon,
  LogOut,
  LogIn,
  Bell,
  PlayCircle,
  CheckCircle,
  Bookmark,
  Sliders,
  Settings,
  Mail,
  MessageSquare,
  Check,
  Home,
  Menu,
  X,
  Smartphone,
  Sun,
  Moon,
  Building2,
  Command,
  ExternalLink,
  ArrowRight,
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
  RiDashboardFill,
  RiSearchLine,
  RiRobot2Fill,
  RiBookOpenFill,
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
    | "books"
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
      | "books"
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
  const [activeDropdown, setActiveDropdown] = useState<"products" | "resources" | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Command Palette & Search State (Linear / Raycast developer pattern)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // Hotkey listener for Cmd+K / Ctrl+K (Linear / Raycast standard)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setCommandPaletteOpen(false);
        setActiveDropdown(null);
        setShowUserDropdown(false);
        setShowNotifications(false);
        setShowLangMenu(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Auto-focus input when Command Palette opens
  useEffect(() => {
    if (commandPaletteOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchTerm("");
    }
  }, [commandPaletteOpen]);

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
      ? MOCK_LESSONS.slice(0, 4) // Show recommendations by default
      : MOCK_LESSONS.filter(
          (l) =>
            l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (l.description && l.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          FULL-BLEED STICKY HEADER — Developer-First Standard (Linear & Vercel)
          Solid surface, hairline border, 56px height, high visual balance
      ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full bg-white dark:bg-[#070D18] border-b border-slate-200/90 dark:border-slate-800/90 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          
          {/* LEFT: Brand Identity & Primary Nav Links */}
          <div className="flex items-center gap-4 lg:gap-7 shrink-0">
            {/* Mobile Drawer Trigger (Only on < lg screens) */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Mở menu"
              aria-label="Mở menu điều hướng"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Brand Logo & Version Pill */}
            <button
              type="button"
              onClick={() => {
                setActiveDropdown(null);
                onChangeView("student");
              }}
              className="flex items-center gap-2 group cursor-pointer shrink-0"
              title="DMKLab Education - Về Trang Chủ"
            >
              <img
                src="/img-web/duc_mai_khoi_lab-removebg-removebg-preview.png"
                alt="DMKLab Education"
                className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/80">
                K–12
              </span>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 shrink-0 relative">
              {/* 1. Trang chủ */}
              <button
                type="button"
                onClick={() => {
                  setActiveDropdown(null);
                  onChangeView("student");
                }}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition cursor-pointer ${
                  activeView === "student" && !activeDropdown
                    ? "bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-white font-semibold"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                {lang === "en" ? "Home" : "Trang chủ"}
              </button>

              {/* 2. Khóa học (Dropdown) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === "products" ? null : "products")}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[13px] font-medium transition cursor-pointer ${
                    activeDropdown === "products"
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <span>{lang === "en" ? "Courses" : "Khóa học"}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                      activeDropdown === "products" ? "rotate-180 text-slate-900 dark:text-white" : ""
                    }`}
                  />
                </button>

                {/* Popover: Khóa học */}
                {activeDropdown === "products" && (
                  <div
                    className="absolute left-0 top-full mt-2 w-[28rem] bg-white dark:bg-[#0B172E] text-slate-900 dark:text-white rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (onSelectLesson) onSelectLesson(MOCK_LESSONS[0]);
                          onChangeView("student");
                          setActiveDropdown(null);
                        }}
                        className="w-full text-left flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1865F2] dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                          <TbMathFunction className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#1865F2] dark:group-hover:text-blue-400 transition-colors">
                            {lang === "en" ? "K–12 Mathematics" : "Toán học K–12"}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                            {lang === "en"
                              ? "Foundational arithmetic, algebra, geometry & national calculus exams"
                              : "Đại số, hình học không gian & giải tích ôn thi THPT Quốc gia"}
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (onSelectLesson) onSelectLesson(MOCK_LESSONS[2] || MOCK_LESSONS[0]);
                          onChangeView("student");
                          setActiveDropdown(null);
                        }}
                        className="w-full text-left flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#14BF96] dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                          <Atom className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#14BF96] dark:group-hover:text-emerald-400 transition-colors">
                            {lang === "en" ? "Natural Sciences & STEM" : "Khoa học & STEM"}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                            {lang === "en"
                              ? "Physics, chemistry, cellular biology and interactive natural sciences"
                              : "Vật lý lý thuyết, Hóa học hợp chất, Sinh học di truyền & STEM"}
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (onSelectLesson) onSelectLesson(MOCK_LESSONS[1] || MOCK_LESSONS[0]);
                          onChangeView("student");
                          setActiveDropdown(null);
                        }}
                        className="w-full text-left flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-[#7433FF] dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                          <RiRobot2Fill className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#7433FF] dark:group-hover:text-purple-400 transition-colors">
                            {lang === "en" ? "Coding & AI Academy" : "Lập trình & Trí Tuệ Nhân Tạo"}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                            {lang === "en"
                              ? "Python programming, computational logic & interactive AI Tutor"
                              : "Học Python căn bản, thuật toán tư duy & giải đề cùng Socratic AI"}
                          </p>
                        </div>
                      </button>
                    </div>

                    {/* Quick Select Grade Grid */}
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {lang === "en" ? "Quick select grade:" : "Chọn nhanh khối lớp:"}
                        </span>
                        <span className="text-[10px] font-semibold text-[#1865F2] dark:text-blue-400">
                          {selectedGrade?.name || "Lớp 10"}
                        </span>
                      </div>
                      <div className="grid grid-cols-6 sm:grid-cols-12 gap-1">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => {
                              onSelectGrade({
                                id: `g-${g}`,
                                name: `Lớp ${g}`,
                                code: `GRADE_${g}`,
                                level: g <= 5 ? "PRIMARY" : g <= 9 ? "SECONDARY" : "HIGH_SCHOOL",
                                displayOrder: g,
                              });
                              setActiveDropdown(null);
                            }}
                            className={`py-1 text-center font-bold text-[11px] rounded transition cursor-pointer ${
                              selectedGrade?.name === `Lớp ${g}`
                                ? "bg-[#1865F2] text-white"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                            }`}
                          >
                            L{g}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Lộ trình */}
              <button
                type="button"
                onClick={() => {
                  setActiveDropdown(null);
                  onChangeView("dashboard");
                }}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition cursor-pointer ${
                  activeView === "dashboard" && !activeDropdown
                    ? "bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-white font-semibold"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                {lang === "en" ? "Roadmap" : "Lộ trình"}
              </button>

              {/* 4. Bài viết */}
              <button
                type="button"
                onClick={() => {
                  setActiveDropdown(null);
                  onChangeView("articles");
                }}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition cursor-pointer ${
                  activeView === "articles" && !activeDropdown
                    ? "bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-white font-semibold"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                {lang === "en" ? "Articles" : "Bài viết"}
              </button>

              {/* 5. Tủ sách K-12 & Trình bày sách */}
              <button
                type="button"
                onClick={() => {
                  setActiveDropdown(null);
                  onChangeView("books");
                }}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  activeView === "books" && !activeDropdown
                    ? "bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-white font-semibold"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <span>{lang === "en" ? "Textbooks" : "Tủ sách K-12"}</span>
                <span className="text-[10px] uppercase font-black px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300">
                  Mới
                </span>
              </button>

              {/* 5. Tài nguyên (Dropdown) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === "resources" ? null : "resources")}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[13px] font-medium transition cursor-pointer ${
                    activeDropdown === "resources"
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <span>{lang === "en" ? "Resources" : "Tài nguyên"}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                      activeDropdown === "resources" ? "rotate-180 text-slate-900 dark:text-white" : ""
                    }`}
                  />
                </button>

                {activeDropdown === "resources" && (
                  <div
                    className="absolute left-0 top-full mt-2 w-72 bg-white dark:bg-[#0B172E] text-slate-900 dark:text-white rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onChangeView("about");
                        setActiveDropdown(null);
                      }}
                      className="w-full text-left flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer group"
                    >
                      <Building2 className="w-4 h-4 text-slate-500 group-hover:text-[#1865F2] dark:group-hover:text-blue-400" />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {lang === "en" ? "About DMKLab" : "Giới thiệu DMKLab"}
                        </p>
                        <p className="text-[10px] text-slate-400">Sứ mệnh giáo dục miễn phí</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onChangeView("contact");
                        setActiveDropdown(null);
                      }}
                      className="w-full text-left flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer group"
                    >
                      <MessageSquare className="w-4 h-4 text-slate-500 group-hover:text-[#1865F2] dark:group-hover:text-blue-400" />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {lang === "en" ? "Contact & Support" : "Liên hệ & Hỗ trợ"}
                        </p>
                        <p className="text-[10px] text-slate-400">Tư vấn lộ trình học tập 24/7</p>
                      </div>
                    </button>

                    <a
                      href="http://localhost:8080/swagger-ui.html"
                      target="_blank"
                      rel="noreferrer"
                      className="w-full text-left flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer group border-t border-slate-100 dark:border-slate-800 mt-1"
                    >
                      <div className="flex items-center gap-3">
                        <Globe className="w-4 h-4 text-slate-500 group-hover:text-[#1865F2]" />
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">OpenAPI Docs</p>
                          <p className="text-[10px] text-slate-400">Tài liệu API Spring Boot</p>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </a>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* CENTER: Linear / Raycast Style Command Palette Trigger */}
          <div className="flex-1 max-w-xs sm:max-w-sm hidden md:flex items-center justify-center">
            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              className="w-full bg-slate-100 hover:bg-slate-200/80 dark:bg-[#111927] dark:hover:bg-[#182336] text-slate-500 dark:text-slate-400 rounded-lg px-3 py-1.5 text-xs flex items-center justify-between border border-slate-200/90 dark:border-slate-800 transition cursor-pointer shadow-2xs group"
              title="Tìm kiếm bài học (Nhấn phím ⌘K hoặc Ctrl+K)"
            >
              <div className="flex items-center gap-2 truncate">
                <RiSearchLine className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 shrink-0" />
                <span className="truncate">{t("nav_search_placeholder", "Tìm bài học, chủ đề...")}</span>
              </div>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white dark:bg-[#070D18] text-slate-500 dark:text-slate-400 rounded border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* RIGHT: Refined Actions & Consolidated User Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">

            {/* Notification Center */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Thông báo"
                aria-label="Thông báo"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-[#070D18]" />
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div
                  className="absolute right-0 mt-2 w-80 sm:w-88 bg-white dark:bg-[#0B172E] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3.5 z-50 text-xs space-y-3 animate-in fade-in zoom-in-95 duration-150"
                  onMouseLeave={() => setShowNotifications(false)}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 dark:text-slate-100 text-xs">
                        Thông Báo
                      </span>
                      {unreadNotifCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
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

                  {/* Filters */}
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                    {[
                      { key: "all", label: `Tất cả` },
                      { key: "unread", label: `Chưa đọc` },
                      { key: "lesson", label: "Bài học" },
                      { key: "system", label: "Hệ thống" },
                    ].map((cat) => (
                      <button
                        key={cat.key}
                        onClick={() => setNotifCategory(cat.key as any)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap transition cursor-pointer ${
                          notifCategory === cat.key
                            ? "bg-[#1865F2] text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Notification List */}
                  <div className="space-y-1.5 max-h-60 overflow-y-auto">
                    {filteredNotifications.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-[11px]">
                        Không có thông báo nào.
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
                          className={`p-2 rounded-xl border transition cursor-pointer ${
                            n.unread
                              ? "bg-blue-50/60 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900"
                              : "bg-slate-50/70 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:bg-slate-100"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <p className="font-bold text-[11px] text-slate-900 dark:text-slate-100 truncate">
                              {n.title}
                            </p>
                            <span className="text-[9px] text-slate-400 shrink-0">{n.time}</span>
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 text-[10px] mt-0.5 line-clamp-2">
                            {n.desc}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        setShowChannelsModal(true);
                      }}
                      className="w-full py-1 text-center text-[10px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                    >
                      Cài đặt kênh thông báo (Web / Email / Zalo) →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title={isDark ? "Giao diện Sáng" : "Giao diện Tối"}
              aria-label="Chuyển giao diện sáng/tối"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Hairline Divider */}
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 shrink-0" />

            {/* User Profile / Auth State */}
            {currentUser ? (
              <div className="relative shrink-0">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-1.5 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  title={currentUser.fullName}
                >
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showUserDropdown ? "rotate-180" : ""}`} />
                </button>

                {/* Consolidated Developer-First User Menu */}
                {showUserDropdown && (
                  <div
                    className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#0B172E] text-slate-800 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150"
                    onMouseLeave={() => setShowUserDropdown(false)}
                  >
                    {/* User Header */}
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                      <p className="font-bold text-slate-900 dark:text-white truncate">
                        {currentUser.fullName}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">@{currentUser.username}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-slate-100 dark:bg-slate-800 text-[#1865F2] dark:text-blue-400">
                        {currentUser.role}
                      </span>
                    </div>

                    {/* Quick Tools & Shortcuts */}
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
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center justify-between font-medium text-slate-700 dark:text-slate-200 cursor-pointer transition"
                      >
                        <span className="flex items-center gap-2">
                          <RiDashboardFill className="w-4 h-4 text-[#1865F2]" />
                          <span>{currentUser.role === "ADMIN" ? "Cổng Quản Trị" : "Bảng Điều Khiển"}</span>
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      <button
                        onClick={() => {
                          onOpenProfile();
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200 cursor-pointer transition"
                      >
                        <UserIcon className="w-4 h-4 text-emerald-500" />
                        <span>Hồ sơ & Huy hiệu</span>
                      </button>

                      <button
                        onClick={() => {
                          openBookmarksModal();
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center justify-between font-medium text-slate-700 dark:text-slate-200 cursor-pointer transition"
                      >
                        <span className="flex items-center gap-2">
                          <Bookmark className="w-4 h-4 text-amber-500" />
                          <span>Bài học đã lưu</span>
                        </span>
                        {bookmarks.length > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            {bookmarks.length}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          openShortcuts();
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200 cursor-pointer transition"
                      >
                        <Sliders className="w-4 h-4 text-slate-500" />
                        <span>Phím tắt & Trợ năng (?)</span>
                      </button>

                      <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                      {/* Language Switch */}
                      <button
                        onClick={() => {
                          setLang(lang === "vi" ? "en" : "vi");
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center justify-between font-medium text-slate-700 dark:text-slate-200 cursor-pointer transition"
                      >
                        <span className="flex items-center gap-2">
                          <RiTranslate2 className="w-4 h-4 text-blue-500" />
                          <span>Ngôn ngữ</span>
                        </span>
                        <span className="font-bold text-[10px] text-slate-500 uppercase">
                          {lang === "vi" ? "Tiếng Việt" : "English"}
                        </span>
                      </button>

                      <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                      {/* Role Switcher */}
                      <p className="px-3 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        Chuyển vai trò test:
                      </p>
                      <div className="grid grid-cols-3 gap-1 px-2 pb-1">
                        <button
                          onClick={() => {
                            onSwitchUser("STUDENT");
                            setShowUserDropdown(false);
                          }}
                          className={`py-1 text-center font-bold text-[10px] rounded transition cursor-pointer ${
                            currentUser.role === "STUDENT"
                              ? "bg-[#1865F2] text-white"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                          }`}
                        >
                          Học sinh
                        </button>
                        <button
                          onClick={() => {
                            onSwitchUser("TEACHER");
                            setShowUserDropdown(false);
                          }}
                          className={`py-1 text-center font-bold text-[10px] rounded transition cursor-pointer ${
                            currentUser.role === "TEACHER"
                              ? "bg-[#1865F2] text-white"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                          }`}
                        >
                          Giáo viên
                        </button>
                        <button
                          onClick={() => {
                            onSwitchUser("SUPER_ADMIN");
                            setShowUserDropdown(false);
                          }}
                          className={`py-1 text-center font-bold text-[10px] rounded transition cursor-pointer ${
                            currentUser.role === "SUPER_ADMIN"
                              ? "bg-[#1865F2] text-white"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                          }`}
                        >
                          Admin
                        </button>
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                      {/* Logout */}
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
            ) : (
              /* Logged Out Actions */
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenLogin}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                >
                  {lang === "en" ? "Sign in" : "Đăng nhập"}
                </button>
                <button
                  onClick={onOpenRegister}
                  className="px-3.5 py-1.5 text-xs font-bold bg-[#05ac60] hover:bg-[#049653] text-white rounded-lg shadow-xs transition cursor-pointer active:scale-95"
                >
                  {lang === "en" ? "Get started" : "Bắt đầu"}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          COMMAND PALETTE DIALOG (Linear / Raycast Hotkey Modal)
          Triggered with ⌘K or click on search bar
      ───────────────────────────────────────────────────────────── */}
      {commandPaletteOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center pt-16 sm:pt-24 p-4 animate-in fade-in duration-100">
          <div
            className="w-full max-w-xl bg-white dark:bg-[#0B172E] text-slate-900 dark:text-white rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 border-b border-slate-200 dark:border-slate-800">
              <RiSearchLine className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm bài học, chủ đề, môn học hoặc phím tắt..."
                className="w-full px-3 py-3.5 bg-transparent text-sm focus:outline-none placeholder-slate-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white px-1 cursor-pointer"
                >
                  ✕
                </button>
              )}
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400 border border-slate-200 dark:border-slate-700 ml-2">
                ESC
              </kbd>
            </div>

            {/* Quick Filter Categories */}
            <div className="p-3 max-h-80 overflow-y-auto space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                {searchTerm ? `Kết quả tìm kiếm (${searchResults.length})` : "Gợi ý phổ biến"}
              </div>

              <div className="space-y-1">
                {searchResults.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      if (onSelectLesson) onSelectLesson(lesson);
                      setCommandPaletteOpen(false);
                      setSearchTerm("");
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1865F2] dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:bg-[#1865F2] group-hover:text-white transition">
                        <PlayCircle className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-[#1865F2] dark:group-hover:text-blue-400 truncate">
                          {lesson.title}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">{lesson.description || "Bài học chuẩn K-12"}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition shrink-0" />
                  </button>
                ))}
              </div>

              {/* Quick Actions in Command Palette */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">
                  Thao tác nhanh
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => {
                      setCommandPaletteOpen(false);
                      onOpenAiChat();
                    }}
                    className="p-2 text-left rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    <RiSparklingFill className="w-3.5 h-3.5 text-[#1865F2]" />
                    <span>Mở Socratic AI Tutor</span>
                  </button>
                  <button
                    onClick={() => {
                      setCommandPaletteOpen(false);
                      onChangeView("dashboard");
                    }}
                    className="p-2 text-left rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    <RiDashboardFill className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Xem Bảng Điều Khiển</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer Keybinds */}
            <div className="px-4 py-2.5 bg-slate-50 dark:bg-[#070D18] border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-3">
                <span>Dùng <kbd className="font-mono bg-white dark:bg-slate-800 px-1 py-0.2 rounded border">↑↓</kbd> để di chuyển</span>
                <span><kbd className="font-mono bg-white dark:bg-slate-800 px-1 py-0.2 rounded border">↵</kbd> để chọn</span>
              </div>
              <span>DMKLab Search</span>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          NOTIFICATION CHANNEL SETTINGS MODAL
      ───────────────────────────────────────────────────────────── */}
      {showChannelsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B172E] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95 text-slate-800 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1865F2] flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Cài Đặt Kênh Thông Báo</h3>
                  <p className="text-[11px] text-slate-400">Chọn các kênh bạn muốn nhận tin tức</p>
                </div>
              </div>
              <button
                onClick={() => setShowChannelsModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {channelSavedMsg && (
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Đã lưu tùy chọn kênh thông báo!</span>
              </div>
            )}

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Website & Ứng dụng</p>
                  <p className="text-[10px] text-slate-400">Chuông thông báo & streak hàng ngày</p>
                </div>
                <input
                  type="checkbox"
                  checked={channelSettings.website}
                  onChange={(e) => setChannelSettings((prev) => ({ ...prev, website: e.target.checked }))}
                  className="w-4 h-4 accent-[#1865F2] cursor-pointer"
                />
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Email hàng tuần</p>
                  <p className="text-[10px] text-slate-400">Báo cáo tổng kết tiến độ học tập</p>
                </div>
                <input
                  type="checkbox"
                  checked={channelSettings.email}
                  onChange={(e) => setChannelSettings((prev) => ({ ...prev, email: e.target.checked }))}
                  className="w-4 h-4 accent-[#1865F2] cursor-pointer"
                />
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Zalo OA Thông Báo</p>
                  <p className="text-[10px] text-slate-400">Nhắc nhở học tập mỗi tối 19:30</p>
                </div>
                <input
                  type="checkbox"
                  checked={channelSettings.zalo}
                  onChange={(e) => setChannelSettings((prev) => ({ ...prev, zalo: e.target.checked }))}
                  className="w-4 h-4 accent-[#1865F2] cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowChannelsModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold cursor-pointer"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  try {
                    localStorage.setItem("dmklab_notification_channels", JSON.stringify(channelSettings));
                  } catch {}
                  setChannelSavedMsg(true);
                  setTimeout(() => {
                    setShowChannelsModal(false);
                    setChannelSavedMsg(false);
                  }, 1000);
                }}
                className="px-4 py-1.5 rounded-lg bg-[#1865F2] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Lưu cấu hình
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MOBILE SLIDE-OUT DRAWER
      ───────────────────────────────────────────────────────────── */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setMobileDrawerOpen(false)} />
          <div className="relative w-72 max-w-[80vw] bg-white dark:bg-[#070D18] text-slate-800 dark:text-slate-100 p-5 shadow-2xl flex flex-col justify-between h-full z-10 animate-in slide-in-from-left duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <img
                    src="/img-web/duc_mai_khoi_lab-removebg-removebg-preview.png"
                    alt="DMKLab Education"
                    className="h-7 w-auto object-contain"
                  />
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                    K–12
                  </span>
                </div>
                <button onClick={() => setMobileDrawerOpen(false)} className="p-1 cursor-pointer">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1 text-xs font-semibold">
                <button
                  onClick={() => {
                    onChangeView("student");
                    setMobileDrawerOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 cursor-pointer ${
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
                    onChangeView("dashboard");
                    setMobileDrawerOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 cursor-pointer ${
                    activeView === "dashboard"
                      ? "bg-blue-50 dark:bg-blue-950/60 text-[#1865F2] font-bold"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  }`}
                >
                  <RiDashboardFill className="w-4 h-4 text-emerald-500" />
                  <span>Lộ Trình Học Tập</span>
                </button>

                <button
                  onClick={() => {
                    openBookmarksModal();
                    setMobileDrawerOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <Bookmark className="w-4 h-4 text-amber-500" />
                    <span>Bài Học Đã Lưu</span>
                  </span>
                  {bookmarks.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800">
                      {bookmarks.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    onChangeView("articles");
                    setMobileDrawerOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  Bài Viết & Tài Liệu
                </button>

                <button
                  onClick={() => {
                    onChangeView("books");
                    setMobileDrawerOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer flex items-center justify-between"
                >
                  <span>Tủ Sách K-12 & Trình Bày Sách</span>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300">
                    Mới
                  </span>
                </button>

                <button
                  onClick={() => {
                    onChangeView("about");
                    setMobileDrawerOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  Giới Thiệu DMKLab
                </button>

                <button
                  onClick={() => {
                    onChangeView("contact");
                    setMobileDrawerOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  Liên Hệ & Hỗ Trợ
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
              DMKLab Education K–12 Standard
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MOBILE BOTTOM NAVIGATION (Persistent thumb bar)
      ───────────────────────────────────────────────────────────── */}
      <nav
        aria-label="Điều hướng di động"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#070D18] border-t border-slate-200 dark:border-slate-800 py-1.5 px-3 flex items-center justify-around shadow-lg"
      >
        <button
          onClick={() => onChangeView("student")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition cursor-pointer ${
            activeView === "student" ? "text-[#1865F2] font-bold" : "text-slate-500 dark:text-slate-400"
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Trang chủ</span>
        </button>

        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex flex-col items-center gap-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 transition cursor-pointer"
        >
          <RiSearchLine className="w-4 h-4" />
          <span>Tìm kiếm</span>
        </button>

        <button
          onClick={onOpenAiChat}
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-[#1865F2] dark:text-blue-400 transition cursor-pointer"
        >
          <div className="w-7 h-7 -mt-2 rounded-full bg-[#1865F2] text-white flex items-center justify-center shadow-xs border border-[#1865F2]">
            <RiSparklingFill className="w-4 h-4 text-white" />
          </div>
          <span>Gia sư AI</span>
        </button>

        <button
          onClick={openBookmarksModal}
          className="relative flex flex-col items-center gap-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 transition cursor-pointer"
        >
          <Bookmark className="w-4 h-4" />
          {bookmarks.length > 0 && (
            <span className="absolute -top-1 right-2 min-w-3 h-3 px-0.5 rounded-full bg-amber-500 text-white text-[8px] font-bold flex items-center justify-center">
              {bookmarks.length}
            </span>
          )}
          <span>Đã lưu</span>
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
    </>
  );
};
