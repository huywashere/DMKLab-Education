"use client";

import React, { useState, useEffect } from "react";
import { User, Grade } from "@/types";
import { MOCK_USERS, MOCK_GRADES } from "@/lib/mock-data";
import { api } from "@/lib/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BookReaderPage } from "@/features/books/BookReaderPage";
import { SocraticChatbot } from "@/features/student/SocraticChatbot";

export default function DedicatedBooksPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(MOCK_USERS.student);
  const [selectedGrade, setSelectedGrade] = useState<Grade>(MOCK_GRADES[4]);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [activeBookTitle, setActiveBookTitle] = useState("Sách Giáo Khoa Toán Học 10 - Tập 1");
  const [activeChapterTitle, setActiveChapterTitle] = useState("Chương I: Mệnh Đề và Tập Hợp");
  const [activeSubject, setActiveSubject] = useState("Toán học");

  useEffect(() => {
    api
      .getMyProfile()
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
        activeView="books"
        onChangeView={(v) => {
          if (v === "about") window.location.href = "/about";
          else if (v === "contact") window.location.href = "/contact";
          else if (v === "dashboard") window.location.href = "/dashboard";
          else if (v === "articles") window.location.href = "/articles";
          else if (v === "books") window.location.href = "/books";
          else window.location.href = "/";
        }}
        selectedGrade={selectedGrade}
        onSelectGrade={setSelectedGrade}
        onOpenAiChat={() => setIsAiChatOpen(true)}
        onOpenLogin={() => {
          window.location.href = "/";
        }}
        onOpenRegister={() => {
          window.location.href = "/";
        }}
        onOpenProfile={() => {
          window.location.href = "/";
        }}
        onLogout={() => {
          api.clearToken();
          window.location.href = "/";
        }}
      />

      <main className="flex-1">
        <BookReaderPage
          onBackToHome={() => {
            window.location.href = "/";
          }}
          onActiveContextChange={(bTitle, cTitle, subj, gNum) => {
            setActiveBookTitle(bTitle);
            setActiveChapterTitle(cTitle);
            setActiveSubject(subj);
          }}
        />
      </main>

      <SocraticChatbot
        currentUser={currentUser || MOCK_USERS.student}
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
        onOpen={() => setIsAiChatOpen(true)}
        activeBookTitle={activeBookTitle}
        activeChapterTitle={activeChapterTitle}
        activeSubject={activeSubject}
      />

      <Footer
        onOpenAbout={() => {
          window.location.href = "/about";
        }}
        onOpenArticles={() => {
          window.location.href = "/articles";
        }}
        onOpenContact={() => {
          window.location.href = "/contact";
        }}
      />
    </div>
  );
}

