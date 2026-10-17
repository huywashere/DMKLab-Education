"use client";

import React, { useState } from "react";
import { useBookmarks } from "@/lib/bookmarks/BookmarksContext";
import {
  X,
  Bookmark,
  FileText,
  Trash2,
  Play,
  Clock,
  Search,
  FolderHeart,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface BookmarksModalProps {
  onSelectLesson?: (lessonId: string) => void;
}

export const BookmarksModal: React.FC<BookmarksModalProps> = ({ onSelectLesson }) => {
  const {
    isBookmarksModalOpen,
    closeBookmarksModal,
    bookmarkedLessons,
    toggleBookmark,
    notes,
    deleteNote,
  } = useBookmarks();

  const [activeTab, setActiveTab] = useState<"bookmarks" | "notes">("bookmarks");
  const [searchTerm, setSearchTerm] = useState("");

  if (!isBookmarksModalOpen) return null;

  const filteredBookmarks = bookmarkedLessons.filter(
    (b) =>
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNotes = notes.filter(
    (n) =>
      n.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.lessonTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLessonClicked = (lessonId: string) => {
    closeBookmarksModal();
    if (onSelectLesson) {
      onSelectLesson(lessonId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        className="bg-white dark:bg-[#0F172A] rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in zoom-in-95 duration-150 text-slate-800 dark:text-slate-100 max-h-[88vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <FolderHeart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Nội Dung Đã Lưu & Sổ Tay Ghi Chú
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ôn tập nhanh các bài học yêu thích và kiến thức trọng tâm cần xem lại
              </p>
            </div>
          </div>
          <button
            onClick={closeBookmarksModal}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher & Search input */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            <button
              onClick={() => setActiveTab("bookmarks")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "bookmarks"
                  ? "bg-white dark:bg-slate-900 text-[#1865F2] dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Bài học đã lưu ({bookmarkedLessons.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("notes")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "notes"
                  ? "bg-white dark:bg-slate-900 text-[#1865F2] dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Ghi chú của tôi ({notes.length})</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm nội dung..."
              className="w-full sm:w-56 pl-8 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:bg-white dark:focus:bg-slate-700 border border-transparent focus:border-[#1865F2]"
            />
          </div>
        </div>

        {/* Content List Area */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {activeTab === "bookmarks" ? (
            filteredBookmarks.length > 0 ? (
              filteredBookmarks.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 hover:border-[#1865F2]/50 hover:shadow-sm transition flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Bookmark className="w-4 h-4 fill-amber-500 text-amber-500" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase">
                        <span>{item.subject}</span>
                        <span>•</span>
                        <span>{item.grade}</span>
                        <span>•</span>
                        <span className="font-normal">{item.savedAt}</span>
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                        {item.title}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleLessonClicked(item.id)}
                      className="px-3 py-1.5 rounded-xl bg-[#1865F2] hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-xs"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>Học ngay</span>
                    </button>
                    <button
                      onClick={() => toggleBookmark(item)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                      title="Bỏ lưu bài học"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 space-y-2 text-slate-400">
                <Bookmark className="w-10 h-10 mx-auto opacity-30" />
                <p className="text-xs font-medium">Chưa có bài học nào được đánh dấu.</p>
                <p className="text-[11px] text-slate-500">
                  Hãy nhấn nút "Lưu bài học" khi đang xem bài giảng để xem lại sau!
                </p>
              </div>
            )
          ) : filteredNotes.length > 0 ? (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-2 group"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-slate-900 dark:text-slate-100 truncate">
                      {note.lessonTitle}
                    </span>
                    {typeof note.timestampSeconds === "number" && (
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-[#1865F2] dark:text-blue-400 font-mono text-[10px] font-bold flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" />
                        {Math.floor(note.timestampSeconds / 60)}:
                        {(note.timestampSeconds % 60).toString().padStart(2, "0")}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">{note.createdAt}</span>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-slate-400 hover:text-rose-500 transition cursor-pointer p-1"
                      title="Xóa ghi chú"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  {note.content}
                </p>

                <button
                  onClick={() => handleLessonClicked(note.lessonId)}
                  className="text-[11px] font-bold text-[#1865F2] hover:underline flex items-center gap-1 cursor-pointer pt-1"
                >
                  <span>Xem lại đoạn video bài học</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-12 space-y-2 text-slate-400">
              <FileText className="w-10 h-10 mx-auto opacity-30" />
              <p className="text-xs font-medium">Bạn chưa ghi chú cho bài học nào.</p>
              <p className="text-[11px] text-slate-500">
                Mở bài học và vào tab "Ghi chú cá nhân" để lưu kiến thức quan trọng nhé!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
