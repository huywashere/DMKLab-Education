"use client";

import React, { useState, useEffect } from "react";
import { User, Grade } from "@/types";
import { MOCK_USERS, MOCK_GRADES } from "@/lib/mock-data";
import { api } from "@/lib/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContactPage } from "@/features/contact/ContactPage";
import { SocraticChatbot } from "@/features/student/SocraticChatbot";

export default function DedicatedContactPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(MOCK_USERS.student);
  const [selectedGrade, setSelectedGrade] = useState<Grade>(MOCK_GRADES[4]);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);

  useEffect(() => {
    api.getMyProfile()
      .then((profile) => {
        if (profile) setCurrentUser(profile);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header
        currentUser={currentUser}
        onSwitchUser={() => {}}
        activeView="contact"
        onChangeView={(v) => {
          if (v === 'about') window.location.href = '/about';
          else if (v === 'articles') window.location.href = '/articles';
          else if (v === 'dashboard') window.location.href = '/dashboard';
          else window.location.href = '/';
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

      <main className="flex-1">
        <ContactPage
          onBackToHome={() => { window.location.href = '/'; }}
          onOpenArticles={() => { window.location.href = '/articles'; }}
          onOpenAbout={() => { window.location.href = '/about'; }}
        />
      </main>

      <SocraticChatbot
        currentUser={currentUser || MOCK_USERS.student}
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
      />

      <Footer
        onOpenAbout={() => { window.location.href = '/about'; }}
        onOpenArticles={() => { window.location.href = '/articles'; }}
        onOpenContact={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      />
    </div>
  );
}
