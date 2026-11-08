"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { User } from "@/types";
import { MOCK_USERS } from "@/lib/mock-data";
import { api } from "@/lib/api";
import { AdminDashboard, AdminTabType } from "@/features/admin/AdminDashboard";
import { useTheme } from "@/lib/theme/ThemeContext";
import {
  PiChartBarDuotone,
  PiShieldCheckDuotone,
  PiLockKeyDuotone,
  PiArrowsCounterClockwiseDuotone,
  PiSparkleDuotone,
  PiRobotDuotone,
  PiBookOpenDuotone,
  PiVideoCameraDuotone,
  PiUsersFourDuotone,
  PiChalkboardTeacherDuotone,
  PiUserCircleDuotone,
  PiCpuDuotone,
  PiDatabaseDuotone,
  PiArrowsClockwiseDuotone,
  PiSunDimDuotone,
  PiMoonStarsDuotone,
  PiArrowSquareOutDuotone,
  PiSignOutDuotone,
  PiListDuotone,
  PiXBold,
  PiCaretRightBold,
} from "react-icons/pi";

export default function StandaloneAdminPortalPage() {
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS.admin);
  const [activeTab, setActiveTab] = useState<AdminTabType>("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { theme, toggleTheme, isDark } = useTheme();

  useEffect(() => {
    const initAdmin = async () => {
      const token = api.getToken();
      if (!token) {
        try {
          const auth = await api.login("admin", "password123");
          setCurrentUser(auth.user);
          return;
        } catch {
          // Dev fallback when backend is offline
        }
      }
      try {
        const profile = await api.getMyProfile();
        if (profile) {
          setCurrentUser(profile);
        }
      } catch {
        setCurrentUser(MOCK_USERS.admin);
      }
    };

    initAdmin();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    setTimeout(() => setIsRefreshing(false), 700);
  };

  const navMenuItems = [
    {
      group: "VẬN HÀNH & GIÁM SÁT",
      items: [
        {
          key: "overview" as AdminTabType,
          label: "Tổng Quan Hệ Thống",
          icon: PiChartBarDuotone,
          badge: "Live",
          badgeClass: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
          iconColor: "text-blue-400 group-hover:text-blue-300",
        },
        {
          key: "audit" as AdminTabType,
          label: "Nhật Ký Kiểm Toán (Audit)",
          icon: PiShieldCheckDuotone,
          iconColor: "text-emerald-400 group-hover:text-emerald-300",
        },
        {
          key: "security" as AdminTabType,
          label: "Bảo Vệ Dữ Liệu (COPPA)",
          icon: PiLockKeyDuotone,
          badge: "AES",
          badgeClass: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
          iconColor: "text-purple-400 group-hover:text-purple-300",
        },
        {
          key: "reliability" as AdminTabType,
          label: "Độ Tin Cậy & Phục Hồi",
          icon: PiArrowsCounterClockwiseDuotone,
          badge: "DR",
          badgeClass: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
          iconColor: "text-amber-400 group-hover:text-amber-300",
        },
      ],
    },
    {
      group: "TRÍ TUỆ NHÂN TẠO & CHẤT LƯỢNG",
      items: [
        {
          key: "ai_quality" as AdminTabType,
          label: "Kiểm Định Chất Lượng AI",
          icon: PiSparkleDuotone,
          badge: "K-12",
          badgeClass: "bg-sky-500/20 text-sky-400 border border-sky-500/30",
          iconColor: "text-sky-400 group-hover:text-sky-300",
        },
        {
          key: "ai" as AdminTabType,
          label: "Trợ Lý AI Quản Trị",
          icon: PiRobotDuotone,
          badge: "AI",
          badgeClass: "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30",
          iconColor: "text-indigo-400 group-hover:text-indigo-300",
        },
      ],
    },
    {
      group: "NỘI DUNG & BÀI GIẢNG",
      items: [
        {
          key: "curriculum" as AdminTabType,
          label: "Quản Lý Khóa Học & Bài Học",
          icon: PiBookOpenDuotone,
          iconColor: "text-blue-400 group-hover:text-blue-300",
        },
        {
          key: "media" as AdminTabType,
          label: "Pipeline Video HLS & CDN",
          icon: PiVideoCameraDuotone,
          badge: "HLS",
          badgeClass: "bg-rose-500/20 text-rose-400 border border-rose-500/30",
          iconColor: "text-rose-400 group-hover:text-rose-300",
        },
      ],
    },
    {
      group: "NGƯỜI DÙNG & PHÂN QUYỀN",
      items: [
        {
          key: "rbac" as AdminTabType,
          label: "Quản Lý Người Dùng & Phiên",
          icon: PiUsersFourDuotone,
          iconColor: "text-violet-400 group-hover:text-violet-300",
        },
        {
          key: "teacher" as AdminTabType,
          label: "Không Gian Giáo Viên",
          icon: PiChalkboardTeacherDuotone,
          iconColor: "text-teal-400 group-hover:text-teal-300",
        },
        {
          key: "parent" as AdminTabType,
          label: "Cổng Phụ Huynh K-12",
          icon: PiUserCircleDuotone,
          iconColor: "text-amber-400 group-hover:text-amber-300",
        },
      ],
    },
  ];

  const currentTabLabel =
    navMenuItems.flatMap((g) => g.items).find((item) => item.key === activeTab)?.label ||
    "Tổng Quan Hệ Thống";

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] dark:bg-[#070D18] text-slate-800 dark:text-slate-100 font-sans antialiased transition-colors">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Standalone Admin Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#0B1528] dark:bg-[#060B14] text-white border-r border-slate-800/90 transition-all duration-300 ${
          mobileMenuOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0"
        } ${isSidebarOpen ? "lg:w-72" : "lg:w-20"}`}
      >
        {/* Sidebar Header: Logo & Branding */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80 shrink-0">
          <Link href="/admin" className="flex items-center gap-3 overflow-hidden group">
            <img
              src="/img-web/duc_mai_khoi_lab-removebg-removebg-preview.png"
              alt="DMKLab"
              className="h-8.5 w-auto object-contain shrink-0 transition-transform group-hover:scale-105"
            />
            {isSidebarOpen && (
              <div className="flex flex-col min-w-0 transition-opacity duration-200">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-xs font-black tracking-wider uppercase text-blue-400 truncate">
                    Backoffice
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    v2.4
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold tracking-tight truncate mt-1">
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
            <PiListDuotone className="w-5 h-5" />
          </button>

          {/* Close button (mobile) */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <PiXBold className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
          {navMenuItems.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {isSidebarOpen && (
                <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
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
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25"
                        : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                    }`}
                    title={!isSidebarOpen ? item.label : undefined}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-5 h-5 shrink-0 transition ${
                          isActive ? "text-white" : item.iconColor
                        }`}
                      />
                      {isSidebarOpen && <span className="truncate">{item.label}</span>}
                    </div>

                    {isSidebarOpen && item.badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                          isActive ? "bg-white/20 text-white" : item.badgeClass
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
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] space-y-1.5">
                <div className="flex items-center justify-between text-slate-300 font-medium">
                  <span className="flex items-center gap-1.5">
                    <PiCpuDuotone className="w-4 h-4 text-emerald-400" />
                    <span>Spring Boot 3.3.4</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    8080 OK
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300 font-medium">
                  <span className="flex items-center gap-1.5">
                    <PiDatabaseDuotone className="w-4 h-4 text-blue-400" />
                    <span>PostgreSQL 17</span>
                  </span>
                  <span className="text-[10px] text-blue-400 font-bold">HikariCP</span>
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
                    <span className="inline-block text-[10px] font-bold text-blue-400 bg-blue-950/80 px-1.5 py-0.2 rounded border border-blue-800/40">
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
                  <PiSignOutDuotone className="w-4.5 h-4.5" />
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
                <PiSignOutDuotone className="w-5 h-5" />
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
        <header className="sticky top-0 z-30 h-16 bg-white dark:bg-[#0B1528] border-b border-slate-200/90 dark:border-slate-800/90 px-4 sm:px-6 flex items-center justify-between gap-4 transition-colors">
          {/* Left: Mobile hamburger & Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <PiListDuotone className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-400 dark:text-slate-500">
                Cổng Quản Trị
              </span>
              <PiCaretRightBold className="w-3 h-3 text-slate-300 dark:text-slate-600" />
              <span className="font-bold text-[#0A2540] dark:text-slate-100 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 px-2.5 py-1 rounded-lg">
                {currentTabLabel}
              </span>
            </div>
          </div>

          {/* Right: Actions, Theme, Switch to Public Web */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Refresh DB Data Button */}
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs transition cursor-pointer"
              title="Làm mới dữ liệu từ Database"
            >
              <PiArrowsClockwiseDuotone
                className={`w-4 h-4 text-blue-500 dark:text-blue-400 ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              />
              <span className="hidden sm:inline">Đồng bộ DB</span>
            </button>

            {/* Dark/Light Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              title={isDark ? "Giao diện Sáng" : "Giao diện Tối"}
              aria-label="Chuyển giao diện sáng/tối"
            >
              {isDark ? (
                <PiSunDimDuotone className="w-4.5 h-4.5 text-amber-400" />
              ) : (
                <PiMoonStarsDuotone className="w-4.5 h-4.5 text-slate-600" />
              )}
            </button>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 shrink-0" />

            {/* Direct Switch to Public Student Web */}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-[#1865F2] hover:bg-[#0B4ED7] text-white border border-[#1865F2] transition shadow-xs whitespace-nowrap active:scale-95"
              title="Mở giao diện học viên công khai"
            >
              <PiArrowSquareOutDuotone className="w-4 h-4" />
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
