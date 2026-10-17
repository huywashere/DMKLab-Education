"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { User, Grade } from "@/types";
import { MOCK_USERS, MOCK_GRADES } from "@/lib/mock-data";
import { api } from "@/lib/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AdminDashboard } from "@/features/admin/AdminDashboard";
import { SocraticChatbot } from "@/features/student/SocraticChatbot";
import { 
  ShieldCheck, 
  ArrowLeft,
  LayoutDashboard,
  Home
} from "lucide-react";

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS.admin);
  const [selectedGrade, setSelectedGrade] = useState<Grade>(MOCK_GRADES[4]);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);

  useEffect(() => {
    api.getMyProfile()
      .then((profile) => {
        if (profile) {
          setCurrentUser(profile);
        }
      })
      .catch(() => {
        // Fallback to default mock admin
        setCurrentUser(MOCK_USERS.admin);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FA] dark:bg-[#070D18]">
      <Header
        currentUser={currentUser}
        onSwitchUser={(role) => {
          if (role === 'STUDENT') {
            setCurrentUser(MOCK_USERS.student);
          } else if (role === 'TEACHER') {
            setCurrentUser(MOCK_USERS.teacher);
          } else if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
            setCurrentUser(MOCK_USERS.admin);
          }
        }}
        activeView="admin"
        onChangeView={(v) => {
          if (v === 'student') window.location.href = '/';
          else if (v === 'dashboard') window.location.href = '/dashboard';
          else if (v === 'profile') window.location.href = '/';
        }}
        selectedGrade={selectedGrade}
        onSelectGrade={setSelectedGrade}
        onOpenAiChat={() => setIsAiChatOpen(true)}
        onOpenLogin={() => { window.location.href = '/'; }}
        onOpenRegister={() => { window.location.href = '/'; }}
        onOpenProfile={() => { window.location.href = '/'; }}
        onLogout={() => {
          api.clearToken();
          window.location.href = '/';
        }}
      />

      {/* Breadcrumb Sub-bar */}
      <div className="bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs">
            <Link 
              href="/"
              className="inline-flex items-center gap-1.5 font-bold text-slate-500 dark:text-slate-400 hover:text-[#1865F2] dark:hover:text-blue-400 transition"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </Link>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <Link 
              href="/dashboard"
              className="inline-flex items-center gap-1.5 font-bold text-slate-500 dark:text-slate-400 hover:text-[#1865F2] dark:hover:text-blue-400 transition"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="inline-flex items-center gap-1.5 font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Cổng Quản Trị Hệ Thống (Admin Portal)</span>
            </span>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#1865F2] dark:hover:text-blue-400 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Thoát về Trang Chủ Khóa Học</span>
          </Link>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AdminDashboard
          currentUser={currentUser}
          onExitAdmin={() => {
            window.location.href = '/';
          }}
        />
      </main>

      <SocraticChatbot
        currentUser={currentUser}
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
        onOpen={() => setIsAiChatOpen(true)}
      />

      <Footer />
    </div>
  );
}
