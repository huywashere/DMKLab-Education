"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { User } from "@/types";
import { MOCK_USERS } from "@/lib/mock-data";
import { api } from "@/lib/api";
import { AdminDashboard, AdminTabType } from "@/features/admin/AdminDashboard";
import { useTheme } from "@/lib/theme/ThemeContext";
import {
  Activity,
  Video,
  BookOpen,
  Users,
  GraduationCap,
  UserCheck,
  ShieldCheck,
  Bot,
  ExternalLink,
  RefreshCw,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  Server,
  Database,
  Search,
  ChevronRight,
  Sparkles,
  LayoutDashboard,
  Lock,
  RotateCcw,
} from "lucide-react";

export default function StandaloneAdminPortalPage() {
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS.admin);
  const [activeTab, setActiveTab] = useState<AdminTabType>("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { theme, toggleTheme, isDark } = useTheme();

  useEffect(() => {
    api
      .getMyProfile()
      .then((profile) => {
        if (profile) {
          setCurrentUser(profile);
        }
      })
      .catch(() => {
        setCurrentUser(MOCK_USERS.admin);
      });
  }, []);

  const navMenuItems = [
    {
      group: "VẬN HÀNH & GIÁM SÁT",
      items: [
        {
          key: "overview" as AdminTabType,
          label: "Tổng Quan Hệ Thống",
          icon: Activity,
          badge: "Live",
        },
        { key: "audit" as AdminTabType, label: "Nhật Ký Kiểm Toán (Audit)", icon: ShieldCheck },
        {
          key: "security" as AdminTabType,
          label: "Bảo Vệ Dữ Liệu (COPPA)",
          icon: Lock,
          badge: "AES",
        },
        {
          key: "reliability" as AdminTabType,
          label: "Độ Tin Cậy & Phục Hồi",
          icon: RotateCcw,
          badge: "DR",
        },
      ],
    },
    {
      group: "TRÍ TUỆ NHÂN TẠO & CHẤT LƯỢNG",
      items: [
        {
          key: "ai_quality" as AdminTabType,
          label: "Kiểm Định Chất Lượng AI",
          icon: Sparkles,
          badge: "K-12",
        },
        { key: "ai" as AdminTabType, label: "Trợ Lý AI Quản Trị", icon: Bot, badge: "AI" },
      ],
    },
    {
      group: "NỘI DUNG & BÀI GIẢNG",
      items: [
        { key: "curriculum" as AdminTabType, label: "Quản Lý Khóa Học & Bài Học", icon: BookOpen },
        {
          key: "media" as AdminTabType,
          label: "Pipeline Video HLS & CDN",
          icon: Video,
          badge: "HLS",
        },
      ],
    },
    {
      group: "NGƯỜI DÙNG & PHÂN QUYỀN",
      items: [
        { key: "rbac" as AdminTabType, label: "Quản Lý Người Dùng & Phiên", icon: Users },
        { key: "teacher" as AdminTabType, label: "Không Gian Giáo Viên", icon: GraduationCap },
        { key: "parent" as AdminTabType, label: "Cổng Phụ Huynh K-12", icon: UserCheck },
      ],
    },
  ];

  const currentTabLabel =
    navMenuItems.flatMap((g) => g.items).find((item) => item.key === activeTab)?.label ||
    "Tổng Quan Hệ Thống";

  return (
    <div className="min-h-screen flex bg-[#F4F6F8] dark:bg-[#070D18] text-slate-800 dark:text-slate-100 font-sans antialiased">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Standalone Admin Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#0B1528] dark:bg-[#060B14] text-white border-r border-slate-800 transition-all duration-300 ${
          mobileMenuOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0"
        } ${isSidebarOpen ? "lg:w-72" : "lg:w-20"}`}
      >
        {/* Sidebar Header: Logo & Branding */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80 shrink-0">
          <Link href="/admin" className="flex items-center gap-2.5 overflow-hidden group">
            <img
              src="/img-web/duc_mai_khoi_lab-removebg-removebg-preview.png"
              alt="DMKLab"
              className="h-8 w-auto object-contain shrink-0"
            />
            {isSidebarOpen && (
              <div className="flex flex-col min-w-0 transition-opacity duration-200">
                <span className="text-xs font-black tracking-wider uppercase text-blue-400 truncate">
                  DMKLab Backoffice
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-tight truncate">
                  Cổng Quản Trị K–12
                </span>
              </div>
            )}
          </Link>

          {/* Toggle sidebar button (desktop) */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title={isSidebarOpen ? "Thu gọn thanh menu" : "Mở rộng thanh menu"}
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Close button (mobile) */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
          {navMenuItems.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {isSidebarOpen && (
                <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {group.group}
                </p>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      setActiveTab(item.key);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer group ${
                      isActive
                        ? "bg-[#1865F2] text-white shadow-md shadow-blue-500/20"
                        : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                    }`}
                    title={!isSidebarOpen ? item.label : undefined}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition ${isActive ? "text-white" : "text-slate-400 group-hover:text-blue-400"}`}
                      />
                      {isSidebarOpen && <span className="truncate">{item.label}</span>}
                    </div>

                    {isSidebarOpen && item.badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                          isActive ? "bg-white/20 text-white" : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer: System Status & User Info */}
        <div className="p-3 border-t border-slate-800/80 bg-[#080E1C] shrink-0 space-y-3">
          {isSidebarOpen ? (
            <>
              {/* Server health indicators */}
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] space-y-1.5">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Spring Boot 3.3.4</span>
                  </span>
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-blue-400" />
                    <span>PostgreSQL 17</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">Online</span>
                </div>
              </div>

              {/* Admin User Card */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="w-8 h-8 rounded-full object-cover border border-slate-700 bg-slate-800 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{currentUser.fullName}</p>
                    <span className="inline-block text-[10px] font-bold text-blue-400 bg-blue-950/80 px-1.5 py-0.2 rounded">
                      SUPER_ADMIN
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    api.clearToken();
                    window.location.href = "/";
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition cursor-pointer"
                  title="Đăng xuất khỏi Admin"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"
                title="Hệ thống Online"
              />
              <button
                onClick={() => {
                  api.clearToken();
                  window.location.href = "/";
                }}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition cursor-pointer"
                title="Đăng xuất"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Admin Workspace Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          isSidebarOpen ? "lg:ml-72" : "lg:ml-20"
        }`}
      >
        {/* Dedicated Admin Topbar */}
        <header className="sticky top-0 z-30 h-16 bg-white dark:bg-[#0B1120] border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4 transition-colors">
          {/* Left: Mobile hamburger & Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#1E293B] hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-400 dark:text-slate-500">
                Cổng Quản Trị
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
              <span className="font-bold text-[#0A2540] dark:text-slate-100 bg-slate-100 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg">
                {currentTabLabel}
              </span>
            </div>
          </div>

          {/* Right: Actions, Theme, Switch to Public Web */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Refresh DB Data Button */}
            <button
              onClick={() => setRefreshKey((prev) => prev + 1)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 bg-slate-100 hover:bg-slate-200 dark:bg-[#1E293B] dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs transition cursor-pointer"
              title="Làm mới dữ liệu từ Database"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
              <span>Đồng bộ DB</span>
            </button>

            {/* Dark/Light Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-[#1E293B] dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              title={isDark ? "Giao diện Sáng" : "Giao diện Tối"}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 shrink-0" />

            {/* Direct Switch to Public Student Web */}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-[#1865F2] hover:bg-[#0B4ED7] text-white border border-[#1865F2] transition shadow-xs whitespace-nowrap active:scale-95"
              title="Mở giao diện học viên công khai"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Xem Website Học Viên</span>
            </Link>
          </div>
        </header>

        {/* Content Body: Embedded Admin Engine with standalone configuration */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <AdminDashboard
            key={refreshKey}
            currentUser={currentUser}
            onExitAdmin={() => {
              window.location.href = "/";
            }}
            hideHeaderBanner={true}
            currentTab={activeTab}
            onTabChange={setActiveTab}
          />
        </main>

        {/* Dedicated Admin Footer */}
        <footer className="py-4 px-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 DMKLab Education System. Cổng Quản Trị Vận Hành K–12.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Phiên bản: CMS v2.4.0</span>
            <span>•</span>
            <span>Spring Boot 3.3.4 Modular Monolith</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
