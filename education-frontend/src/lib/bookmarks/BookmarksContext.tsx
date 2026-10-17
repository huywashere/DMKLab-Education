"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface LessonNote {
  id: string;
  lessonId: string;
  lessonTitle: string;
  timestampSeconds?: number;
  content: string;
  createdAt: string;
}

export interface BookmarkedLesson {
  id: string;
  title: string;
  grade: string;
  subject: string;
  savedAt: string;
}

interface BookmarksContextType {
  bookmarkedLessons: BookmarkedLesson[];
  bookmarks: BookmarkedLesson[];
  toggleBookmark: (lesson: { id: string; title: string; grade?: string; subject?: string }) => void;
  isBookmarked: (lessonId: string) => boolean;
  notes: LessonNote[];
  addNote: (lessonId: string, lessonTitle: string, content: string, timestampSeconds?: number) => void;
  deleteNote: (id: string) => void;
  getNotesForLesson: (lessonId: string) => LessonNote[];
  isBookmarksModalOpen: boolean;
  openBookmarksModal: () => void;
  openModal: () => void;
  closeBookmarksModal: () => void;
}

const BookmarksContext = createContext<BookmarksContextType | undefined>(undefined);

const STORAGE_KEY = "dmklab_bookmarks_data";
const NOTES_STORAGE_KEY = "dmklab_notes_data";

export const BookmarksProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bookmarkedLessons, setBookmarkedLessons] = useState<BookmarkedLesson[]>([
    {
      id: "les-01",
      title: "1. Khái niệm Phân số và Các tính chất cơ bản",
      grade: "Lớp 5",
      subject: "Toán học",
      savedAt: "Hôm nay, 09:30",
    },
    {
      id: "les-02",
      title: "2. Quy đồng mẫu số các phân số",
      grade: "Lớp 5",
      subject: "Toán học",
      savedAt: "Hôm qua",
    },
  ]);

  const [notes, setNotes] = useState<LessonNote[]>([
    {
      id: "note-01",
      lessonId: "les-01",
      lessonTitle: "1. Khái niệm Phân số và Các tính chất cơ bản",
      timestampSeconds: 120,
      content: "Nhớ kỹ: Tử số là phần lấy ra (ở trên), Mẫu số là tổng số phần bằng nhau (ở dưới, luôn khác 0).",
      createdAt: "10:15 - 17/10/2026",
    },
    {
      id: "note-02",
      lessonId: "les-01",
      lessonTitle: "1. Khái niệm Phân số và Các tính chất cơ bản",
      timestampSeconds: 330,
      content: "Ví dụ bánh Pizza chia 4 phần: Ăn 1 miếng là 1/4 cái bánh. Cần ôn lại trước kỳ kiểm tra giữa kỳ!",
      createdAt: "10:22 - 17/10/2026",
    },
  ]);

  const [isBookmarksModalOpen, setIsBookmarksModalOpen] = useState(false);

  useEffect(() => {
    try {
      const savedB = localStorage.getItem(STORAGE_KEY);
      if (savedB) setBookmarkedLessons(JSON.parse(savedB));

      const savedN = localStorage.getItem(NOTES_STORAGE_KEY);
      if (savedN) setNotes(JSON.parse(savedN));
    } catch {
      // Fallback
    }
  }, []);

  const toggleBookmark = (lesson: { id: string; title: string; grade?: string; subject?: string }) => {
    setBookmarkedLessons((prev) => {
      const exists = prev.some((l) => l.id === lesson.id);
      let updated: BookmarkedLesson[];
      if (exists) {
        updated = prev.filter((l) => l.id !== lesson.id);
      } else {
        updated = [
          ...prev,
          {
            id: lesson.id,
            title: lesson.title,
            grade: lesson.grade || "Lớp 5",
            subject: lesson.subject || "Toán học",
            savedAt: "Vừa xong",
          },
        ];
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const isBookmarked = (lessonId: string) => {
    return bookmarkedLessons.some((l) => l.id === lessonId);
  };

  const addNote = (lessonId: string, lessonTitle: string, content: string, timestampSeconds?: number) => {
    const newNote: LessonNote = {
      id: `note-${Date.now()}`,
      lessonId,
      lessonTitle,
      timestampSeconds,
      content,
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " - Hôm nay",
    };
    setNotes((prev) => {
      const updated = [newNote, ...prev];
      try {
        localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      try {
        localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const getNotesForLesson = (lessonId: string) => {
    return notes.filter((n) => n.lessonId === lessonId);
  };

  const openBookmarksModal = () => setIsBookmarksModalOpen(true);
  const closeBookmarksModal = () => setIsBookmarksModalOpen(false);

  return (
    <BookmarksContext.Provider
      value={{
        bookmarkedLessons,
        bookmarks: bookmarkedLessons,
        toggleBookmark,
        isBookmarked,
        notes,
        addNote,
        deleteNote,
        getNotesForLesson,
        isBookmarksModalOpen,
        openBookmarksModal,
        openModal: openBookmarksModal,
        closeBookmarksModal,
      }}
    >
      {children}
    </BookmarksContext.Provider>
  );
};

export const useBookmarks = (): BookmarksContextType => {
  const context = useContext(BookmarksContext);
  if (!context) {
    throw new Error("useBookmarks must be used within a BookmarksProvider");
  }
  return context;
};
