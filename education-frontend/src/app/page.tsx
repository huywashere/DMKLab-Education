"use client";

import React, { useState, useEffect } from "react";
import { User, UserRole, Grade, Lesson } from "@/types";
import { MOCK_USERS, MOCK_GRADES, MOCK_LESSONS } from "@/lib/mock-data";
import { api } from "@/lib/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import dynamic from "next/dynamic";
import { KhanHomepage } from "@/features/student/KhanHomepage";

// Fast lightweight loading skeleton for code-split components
const ViewSkeleton = () => (
  <div className="max-w-5xl mx-auto px-4 py-16 space-y-6 animate-pulse">
    <div className="h-8 bg-slate-200 rounded-lg w-1/3 mx-auto" />
    <div className="h-4 bg-slate-200 rounded w-2/3 mx-auto" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
      <div className="h-48 bg-slate-200 rounded-2xl" />
      <div className="h-48 bg-slate-200 rounded-2xl" />
      <div className="h-48 bg-slate-200 rounded-2xl" />
    </div>
  </div>
);

// Code-split dynamic imports: loaded on-demand only when user opens each view
const LessonRoom = dynamic(
  () => import("@/features/student/LessonRoom").then((m) => m.LessonRoom),
  { loading: () => <ViewSkeleton /> }
);
const SocraticChatbot = dynamic(
  () => import("@/features/student/SocraticChatbot").then((m) => m.SocraticChatbot),
  { ssr: false }
);
const StudentDashboard = dynamic(
  () => import("@/features/student/StudentDashboard").then((m) => m.StudentDashboard),
  { loading: () => <ViewSkeleton /> }
);
const AdminDashboard = dynamic(
  () => import("@/features/admin/AdminDashboard").then((m) => m.AdminDashboard),
  { loading: () => <ViewSkeleton /> }
);
const LoginPage = dynamic(
  () => import("@/features/auth/LoginPage").then((m) => m.LoginPage),
  { loading: () => <ViewSkeleton /> }
);
const RegisterPage = dynamic(
  () => import("@/features/auth/RegisterPage").then((m) => m.RegisterPage),
  { loading: () => <ViewSkeleton /> }
);
const ProfilePage = dynamic(
  () => import("@/features/profile/ProfilePage").then((m) => m.ProfilePage),
  { loading: () => <ViewSkeleton /> }
);
const AboutPage = dynamic(
  () => import("@/features/about/AboutPage").then((m) => m.AboutPage),
  { loading: () => <ViewSkeleton /> }
);
const ArticlesPage = dynamic(
  () => import("@/features/articles/ArticlesPage").then((m) => m.ArticlesPage),
  { loading: () => <ViewSkeleton /> }
);
const ContactPage = dynamic(
  () => import("@/features/contact/ContactPage").then((m) => m.ContactPage),
  { loading: () => <ViewSkeleton /> }
);

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<User | null>(MOCK_USERS.student);
  const [selectedGrade, setSelectedGrade] = useState<Grade>(MOCK_GRADES[4]); // Lớp 5
  const [activeView, setActiveView] = useState<
    'home' | 'dashboard' | 'lesson' | 'admin' | 'login' | 'register' | 'profile' | 'about' | 'articles' | 'contact'
  >('home');
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(MOCK_LESSONS[1]);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  useEffect(() => {
    // 1. Check backend connection & live grades
    api.getGrades()
      .then((grades) => {
        if (grades && grades.length > 0) {
          setIsBackendConnected(true);
        }
      })
      .catch(() => {
        setIsBackendConnected(false);
      });

    // 2. Load user profile from JWT token if available
    api.getMyProfile()
      .then((profile) => {
        if (profile) {
          setCurrentUser(profile);
        }
      })
      .catch(() => {
        // keep current default
      });
  }, []);

  const handleSwitchUser = (role: UserRole) => {
    if (role === 'STUDENT') {
      setCurrentUser(MOCK_USERS.student);
      setActiveView('home');
    } else if (role === 'TEACHER') {
      setCurrentUser(MOCK_USERS.teacher);
      setActiveView('admin');
    } else if (role === 'SUPER_ADMIN') {
      setCurrentUser(MOCK_USERS.admin);
      setActiveView('admin');
    }
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setActiveView('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRegisterSuccess = (user: User) => {
    setCurrentUser(user);
    setActiveView('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    api.clearToken();
    setCurrentUser(null);
    setActiveView('login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setActiveView('lesson');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteLesson = () => {
    if (currentUser) {
      setCurrentUser((prev) => prev ? ({
        ...prev,
        energyPoints: prev.energyPoints + 50,
      }) : null);
    }
  };

  const handleOpenAbout = () => {
    setActiveView('about');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenArticles = () => {
    setActiveView('articles');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenContact = () => {
    setActiveView('contact');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Real-time Backend + DB Status Banner */}
      <div className="bg-[#0B2138] text-white text-xs py-1.5 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="font-medium text-slate-200">
              {isBackendConnected 
                ? 'DMKLab Education K–12: Spring Boot 3.3 + PostgreSQL 17 + Prisma ORM (Bảo mật JWT HMAC-512)' 
                : 'Đang kết nối API Backend & Database...'}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-300">
            <a href="http://localhost:8080/swagger-ui.html" target="_blank" rel="noreferrer" className="hover:text-emerald-400 underline transition">
              Swagger API Docs ↗
            </a>
            <span>•</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded text-emerald-400 font-mono">DB: learning_db</span>
          </div>
        </div>
      </div>

      <Header
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        activeView={
          activeView === 'admin'
            ? 'admin'
            : activeView === 'dashboard'
            ? 'dashboard'
            : activeView === 'login'
            ? 'login'
            : activeView === 'register'
            ? 'register'
            : activeView === 'profile'
            ? 'profile'
            : activeView === 'about'
            ? 'about'
            : activeView === 'articles'
            ? 'articles'
            : activeView === 'contact'
            ? 'contact'
            : 'student'
        }
        onChangeView={(v) => {
          if (v === 'admin') setActiveView('admin');
          else if (v === 'dashboard') setActiveView('dashboard');
          else if (v === 'login') setActiveView('login');
          else if (v === 'register') setActiveView('register');
          else if (v === 'profile') setActiveView('profile');
          else if (v === 'about') handleOpenAbout();
          else if (v === 'articles') handleOpenArticles();
          else if (v === 'contact') handleOpenContact();
          else setActiveView('home');
        }}
        selectedGrade={selectedGrade}
        onSelectGrade={setSelectedGrade}
        onOpenAiChat={() => setIsAiChatOpen(true)}
        onOpenLogin={() => setActiveView('login')}
        onOpenRegister={() => setActiveView('register')}
        onOpenProfile={() => setActiveView('profile')}
        onLogout={handleLogout}
        onSelectLesson={handleOpenLesson}
        onOpenAbout={handleOpenAbout}
        onOpenArticles={handleOpenArticles}
        onOpenContact={handleOpenContact}
      />

      <main className="flex-1">
        {activeView === 'home' && (
          <KhanHomepage
            currentUser={currentUser || MOCK_USERS.student}
            selectedGrade={selectedGrade}
            onOpenLesson={handleOpenLesson}
            onOpenAiChat={() => setIsAiChatOpen(true)}
          />
        )}

        {activeView === 'dashboard' && currentUser && (
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <StudentDashboard
              currentUser={currentUser}
              selectedGrade={selectedGrade}
              onOpenLesson={handleOpenLesson}
              onOpenAiChat={() => setIsAiChatOpen(true)}
            />
          </div>
        )}

        {activeView === 'about' && (
          <AboutPage
            onBackToHome={() => {
              setActiveView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenRegister={() => {
              setActiveView('register');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenContact={handleOpenContact}
          />
        )}

        {activeView === 'articles' && (
          <ArticlesPage
            onBackToHome={() => {
              setActiveView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenContact={handleOpenContact}
            onOpenAbout={handleOpenAbout}
          />
        )}

        {activeView === 'contact' && (
          <ContactPage
            onBackToHome={() => {
              setActiveView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenArticles={handleOpenArticles}
            onOpenAbout={handleOpenAbout}
          />
        )}

        {activeView === 'login' && (
          <LoginPage
            onSuccess={handleLoginSuccess}
            onGoToRegister={() => setActiveView('register')}
            onBackToHome={() => setActiveView('home')}
          />
        )}

        {activeView === 'register' && (
          <RegisterPage
            onSuccess={handleRegisterSuccess}
            onGoToLogin={() => setActiveView('login')}
            onBackToHome={() => setActiveView('home')}
          />
        )}

        {activeView === 'profile' && currentUser && (
          <ProfilePage
            currentUser={currentUser}
            onUpdateUser={(updated) => setCurrentUser(updated)}
            onLogout={handleLogout}
            onBackToHome={() => setActiveView('home')}
          />
        )}

        {activeView === 'lesson' && (
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <LessonRoom
              currentLesson={selectedLesson}
              onBack={() => {
                setActiveView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenAiChat={() => setIsAiChatOpen(true)}
              onCompleteLesson={handleCompleteLesson}
            />
          </div>
        )}

        {activeView === 'admin' && currentUser && (
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <AdminDashboard
              currentUser={currentUser}
              onExitAdmin={() => setActiveView('home')}
            />
          </div>
        )}
      </main>

      <SocraticChatbot
        currentUser={currentUser || MOCK_USERS.student}
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
      />

      <Footer
        onOpenAbout={handleOpenAbout}
        onOpenArticles={handleOpenArticles}
        onOpenContact={handleOpenContact}
        onGetStarted={() => {
          if (!currentUser) {
            setActiveView('register');
          } else {
            setActiveView('home');
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
