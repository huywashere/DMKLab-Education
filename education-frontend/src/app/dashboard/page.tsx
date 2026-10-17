"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { User, UserRole, Grade, Lesson } from "@/types";
import { MOCK_USERS, MOCK_GRADES, MOCK_LESSONS } from "@/lib/mock-data";
import { api } from "@/lib/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StudentDashboard } from "@/features/student/StudentDashboard";
import { AdminDashboard } from "@/features/admin/AdminDashboard";
import { SocraticChatbot } from "@/features/student/SocraticChatbot";
import { 
  GraduationCap, 
  Users, 
  ShieldCheck, 
  HeartHandshake, 
  ArrowLeft,
  Sparkles
} from "lucide-react";

export default function DedicatedDashboardPage() {
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS.student);
  const [selectedGrade, setSelectedGrade] = useState<Grade>(MOCK_GRADES[4]);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [activeRoleTab, setActiveRoleTab] = useState<'STUDENT' | 'TEACHER' | 'PARENT' | 'ADMIN'>('STUDENT');

  useEffect(() => {
    api.getMyProfile()
      .then((profile) => {
        if (profile) {
          setCurrentUser(profile);
          if (profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN') {
            setActiveRoleTab('ADMIN');
          } else if (profile.role === 'TEACHER') {
            setActiveRoleTab('TEACHER');
          } else {
            setActiveRoleTab('STUDENT');
          }
        }
      })
      .catch(() => {
        // fallback to default student
      });
  }, []);

  const handleOpenLesson = (lesson: Lesson) => {
    window.location.href = `/?lessonId=${lesson.id}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FA]">
      <Header
        currentUser={currentUser}
        onSwitchUser={(role) => {
          if (role === 'STUDENT') {
            setCurrentUser(MOCK_USERS.student);
            setActiveRoleTab('STUDENT');
          } else if (role === 'TEACHER') {
            setCurrentUser(MOCK_USERS.teacher);
            setActiveRoleTab('TEACHER');
          } else if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
            setCurrentUser(MOCK_USERS.admin);
            setActiveRoleTab('ADMIN');
          }
        }}
        activeView="dashboard"
        onChangeView={(v) => {
          if (v === 'student') window.location.href = '/';
          else if (v === 'admin') setActiveRoleTab('ADMIN');
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

      {/* Breadcrumb & Navigation Sub-bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link 
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#1865F2] transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Về Trang Chủ Khóa Học</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-bold text-[#0A2540]">
              Bảng Điều Khiển DMKLab Education
            </span>
          </div>

          {/* Quick Role Switch Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => {
                setActiveRoleTab('STUDENT');
                setCurrentUser(MOCK_USERS.student);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                activeRoleTab === 'STUDENT'
                  ? 'bg-white text-[#1865F2] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
              <span>Học Viên</span>
            </button>

            <button
              onClick={() => {
                setActiveRoleTab('TEACHER');
                setCurrentUser(MOCK_USERS.teacher);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                activeRoleTab === 'TEACHER'
                  ? 'bg-white text-[#1865F2] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>Giáo Viên</span>
            </button>

            <button
              onClick={() => {
                setActiveRoleTab('PARENT');
                setCurrentUser({
                  ...MOCK_USERS.student,
                  fullName: "Phụ Huynh Trần Văn Bình",
                  role: "PARENT" as UserRole,
                });
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                activeRoleTab === 'PARENT'
                  ? 'bg-white text-[#1865F2] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5 text-rose-500" />
              <span>Phụ Huynh</span>
            </button>

            <button
              onClick={() => {
                setActiveRoleTab('ADMIN');
                setCurrentUser(MOCK_USERS.admin);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                activeRoleTab === 'ADMIN'
                  ? 'bg-white text-[#1865F2] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Quản Trị</span>
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeRoleTab === 'STUDENT' ? (
          <StudentDashboard
            currentUser={currentUser}
            selectedGrade={selectedGrade}
            onOpenLesson={handleOpenLesson}
            onOpenAiChat={() => setIsAiChatOpen(true)}
          />
        ) : (
          <AdminDashboard
            currentUser={currentUser}
            onExitAdmin={() => window.location.href = '/'}
          />
        )}
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
