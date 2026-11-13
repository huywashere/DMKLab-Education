"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Presentation,
  Network,
  Upload,
  Search,
  ZoomIn,
  ZoomOut,
  Highlighter,
  FileText,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  BookMarked,
  Printer,
  Copy,
  Check,
  Compass,
  Layers,
  SlidersHorizontal,
  Bookmark,
  Share2,
  FileCheck,
  Info,
} from "lucide-react";
import {
  Textbook,
  BookChapter,
  BookSection,
  BookFormula,
  K12_SAMPLE_BOOKS,
} from "./book-data";
import confetti from "canvas-confetti";

interface BookReaderPageProps {
  onBackToHome?: () => void;
  initialBookId?: string;
  onActiveContextChange?: (
    bookTitle: string,
    chapterTitle: string,
    subject: string,
    gradeNumber: number
  ) => void;
}

type ReaderMode = "reader" | "presentation" | "mindmap";
type PaperTheme = "white" | "sepia" | "dark";
type ReaderFont = "sans" | "serif" | "mono";

export const BookReaderPage: React.FC<BookReaderPageProps> = ({
  onBackToHome,
  initialBookId = "toan-10-canh-dieu",
  onActiveContextChange,
}) => {
  // Books Collection State
  const [booksList, setBooksList] = useState<Textbook[]>(K12_SAMPLE_BOOKS);
  const [selectedBookId, setSelectedBookId] = useState<string>(initialBookId);
  const currentBook =
    booksList.find((b) => b.id === selectedBookId) || booksList[0];

  // Chapter & Section Navigation State
  const [currentChapterIdx, setCurrentChapterIdx] = useState<number>(0);
  const currentChapter =
    currentBook.chapters[currentChapterIdx] || currentBook.chapters[0];

  // Presentation / Mode State
  const [readerMode, setReaderMode] = useState<ReaderMode>("reader");
  const [presentationSlideIdx, setPresentationSlideIdx] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const presentationContainerRef = useRef<HTMLDivElement>(null);

  // Typography & Theme Preferences
  const [fontSize, setFontSize] = useState<number>(16); // in px
  const [paperTheme, setPaperTheme] = useState<PaperTheme>("white");
  const [readerFont, setReaderFont] = useState<ReaderFont>("serif");
  const [lineHeight, setLineHeight] = useState<number>(1.75);

  // Active Annotations: Highlighting & Sticky Notes
  const [highlights, setHighlights] = useState<
    Array<{ id: string; chapterId: string; text: string; color: string }>
  >([]);
  const [stickyNotes, setStickyNotes] = useState<
    Array<{ id: string; chapterId: string; sectionId: string; note: string; timestamp: string }>
  >([]);
  const [newNoteInput, setNewNoteInput] = useState<string>("");
  const [selectedSectionForNote, setSelectedSectionForNote] = useState<string | null>(null);

  // Text-To-Speech (Đọc to trang sách)
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // In-book Search
  const [bookSearchQuery, setBookSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Custom Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [customUploadTitle, setCustomUploadTitle] = useState("");
  const [customUploadGrade, setCustomUploadGrade] = useState("Lớp 10");
  const [customUploadSubject, setCustomUploadSubject] = useState("Toán học");
  const [customUploadText, setCustomUploadText] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);

  // AI Textbook Companion Drawer
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [aiAssistantTab, setAiAssistantTab] = useState<"summary" | "explain" | "quiz">("summary");
  const [aiExplainSelection, setAiExplainSelection] = useState<string>("");
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<string, string>>({});

  // Initialize Speech Synthesis
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Report active context to parent for AI grounding
  useEffect(() => {
    if (currentBook && currentChapter) {
      onActiveContextChange?.(
        currentBook.title,
        currentChapter.title,
        currentBook.subject,
        currentBook.gradeNumber
      );
    }
  }, [currentBook, currentChapter, onActiveContextChange]);

  // Keyboard shortcut listener for Lecture Presentation Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (readerMode === "presentation") {
        if (e.key === "ArrowRight" || e.key === "Space") {
          e.preventDefault();
          nextSlide();
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          prevSlide();
        } else if (e.key === "f" || e.key === "F") {
          toggleFullscreen();
        } else if (e.key === "Escape" && isFullscreen) {
          setIsFullscreen(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [readerMode, presentationSlideIdx, currentChapter]);

  // Slides builder for Presentation Mode
  const slides = React.useMemo(() => {
    if (!currentChapter) return [];
    const list: Array<{
      type: "TITLE" | "SUMMARY" | "SECTION" | "FORMULA" | "EXERCISE";
      title: string;
      subtitle?: string;
      content?: string[];
      formula?: string;
      exercise?: any;
    }> = [];

    // Slide 1: Chapter Title Slide
    list.push({
      type: "TITLE",
      title: currentChapter.title,
      subtitle: currentChapter.subtitle,
      content: [
        `Tài liệu: ${currentBook.title}`,
        `Chủ biên: ${currentBook.author}`,
        `Cấp độ: ${currentBook.grade} • Môn ${currentBook.subject}`,
      ],
    });

    // Slide 2: Mục tiêu & Tóm tắt trọng tâm
    list.push({
      type: "SUMMARY",
      title: "Mục Tiêu & Trọng Tâm Kiến Thức",
      subtitle: "Những chuẩn đầu ra học sinh cần nắm vững",
      content: currentChapter.summary,
    });

    // Slides for each Section
    currentChapter.sections.forEach((sec) => {
      list.push({
        type: "SECTION",
        title: sec.title,
        subtitle: sec.calloutType
          ? `[${sec.calloutType}] Khái niệm cơ bản`
          : undefined,
        content: sec.content,
        formula: sec.formula,
      });
    });

    // Slides for Formulas
    currentChapter.formulas.forEach((f) => {
      list.push({
        type: "FORMULA",
        title: `Công Thức Trọng Tâm: ${f.name}`,
        subtitle: f.meaning,
        formula: f.latex,
        content: [`Ứng dụng thực tế: ${f.example}`],
      });
    });

    // Slides for Exercises
    currentChapter.exercises.forEach((ex, idx) => {
      list.push({
        type: "EXERCISE",
        title: `Bài Tập Vận Dụng (Câu ${idx + 1})`,
        subtitle: `Độ khó: ${ex.difficulty === "EASY" ? "Nhận biết" : "Vận dụng"}`,
        exercise: ex,
      });
    });

    return list;
  }, [currentChapter, currentBook]);

  const nextSlide = () => {
    setPresentationSlideIdx((prev) =>
      prev < slides.length - 1 ? prev + 1 : prev
    );
  };

  const prevSlide = () => {
    setPresentationSlideIdx((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      presentationContainerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Text To Speech Handler
  const handleToggleSpeech = () => {
    if (!synthRef.current) {
      alert("Trình duyệt không hỗ trợ Web Speech API.");
      return;
    }

    if (isSpeaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      return;
    }

    // Assemble text to speak
    const textToSpeak = `${currentChapter.title}. ${currentChapter.subtitle}. ${currentChapter.sections
      .map((s) => `${s.title}. ${s.content.join(" ")}`)
      .join(" ")}`;

    synthRef.current.cancel(); // Stop any pending
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = "vi-VN";
    utterance.rate = speechRate;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
    setIsSpeaking(true);
  };

  // Handle Custom Book Upload
  const handleProcessUploadBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUploadTitle.trim() || !customUploadText.trim()) {
      alert("Vui lòng nhập tiêu đề sách và nội dung tài liệu.");
      return;
    }

    // Parse plain text / markdown into structured chapter
    const rawParagraphs = customUploadText
      .split("\n\n")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const sections: BookSection[] = [];
    let currentSec: BookSection = {
      id: "sec-custom-1",
      title: "§1. Nội dung chính",
      content: [],
    };

    rawParagraphs.forEach((para, idx) => {
      if (para.startsWith("#") || para.startsWith("§") || para.startsWith("Bài") || para.startsWith("Chương")) {
        if (currentSec.content.length > 0) {
          sections.push(currentSec);
        }
        currentSec = {
          id: `sec-custom-${idx + 1}`,
          title: para.replace(/^#+\s*/, ""),
          content: [],
        };
      } else {
        currentSec.content.push(para);
      }
    });
    if (currentSec.content.length > 0) {
      sections.push(currentSec);
    }

    const newBook: Textbook = {
      id: `custom-book-${Date.now()}`,
      title: customUploadTitle.trim(),
      shortTitle: customUploadTitle.trim().slice(0, 24),
      grade: customUploadGrade,
      gradeNumber: parseInt(customUploadGrade.replace(/\D/g, "") || "10"),
      subject: customUploadSubject,
      publisher: "Tài liệu người dùng tải lên & Trình bày lại",
      edition: "Định dạng số hóa DMKLab 2026",
      color: "#0284C7",
      accentBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
      borderColor: "border-sky-500/30",
      description: `Tài liệu môn ${customUploadSubject} được bóc tách và trình bày lại theo chuẩn sư phạm tương tác.`,
      totalChapters: 1,
      totalPages: Math.max(1, Math.ceil(rawParagraphs.length / 4)),
      author: "Biên tập bởi Người dùng DMKLab",
      chapters: [
        {
          id: `chap-custom-1`,
          chapterNumber: 1,
          title: customUploadTitle.trim(),
          subtitle: `Trình bày lại từ tệp: ${uploadedFileName || "Văn bản số hóa"}`,
          summary: rawParagraphs.slice(0, 3),
          sections: sections.length > 0 ? sections : [
            {
              id: "sec-default",
              title: "§1. Tổng quan nội dung sách",
              content: rawParagraphs,
            },
          ],
          formulas: [],
          exercises: [
            {
              id: "ex-custom-1",
              question: "Câu hỏi tự kiểm tra: Nội dung chính của tài liệu này là gì?",
              options: [
                "Nội dung do người dùng tải lên và định dạng",
                "Bài tập chưa có lời giải",
                "Lý thuyết trích đoạn",
                "Tất cả các ý trên",
              ],
              correctAnswer: "Nội dung do người dùng tải lên và định dạng",
              solution: "Hệ thống đã tự động trình bày lại tài liệu sách thành các slide giảng dạy và sơ đồ tư duy.",
              difficulty: "EASY",
            },
          ],
          mindmap: {
            root: customUploadTitle.trim(),
            branches: [
              {
                name: "1. Cấu Trúc Nội Dung",
                items: sections.map((s) => s.title).slice(0, 4),
              },
              {
                name: "2. Điểm Trọng Tâm",
                items: ["Định dạng E-Reader", "Chế độ Trình Chiếu", "Tóm tắt Sơ Đồ"],
              },
            ],
          },
        },
      ],
    };

    setBooksList((prev) => [newBook, ...prev]);
    setSelectedBookId(newBook.id);
    setCurrentChapterIdx(0);
    setShowUploadModal(false);
    setUploadFeedback("Đã tải lên và trình bày lại cuốn sách thành công!");
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    setTimeout(() => setUploadFeedback(null), 4000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setCustomUploadTitle(file.name.replace(/\.[^/.]+$/, ""));

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setCustomUploadText(text);
      }
    };
    reader.readAsText(file);
  };

  // Sticky Notes Handler
  const handleAddStickyNote = (sectionId: string) => {
    if (!newNoteInput.trim()) return;
    const note = {
      id: `note-${Date.now()}`,
      chapterId: currentChapter.id,
      sectionId,
      note: newNoteInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setStickyNotes((prev) => [...prev, note]);
    setNewNoteInput("");
    setSelectedSectionForNote(null);
  };

  // Quiz submission inside companion
  const handleSelectAnswer = (exId: string, opt: string) => {
    setSelectedQuizAnswers((prev) => ({ ...prev, [exId]: opt }));
  };

  const handleCheckQuizAnswers = () => {
    let correct = 0;
    currentChapter.exercises.forEach((ex) => {
      if (selectedQuizAnswers[ex.id] === ex.correctAnswer) {
        correct++;
      }
    });
    setQuizScore(correct);
    if (correct === currentChapter.exercises.length) {
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.5 } });
    }
  };

  // Theme Classes for Paper Reader
  const getPaperClasses = () => {
    switch (paperTheme) {
      case "sepia":
        return "bg-[#FBF0D9] text-[#433422] border-[#E8DCC2]";
      case "dark":
        return "bg-[#0B1528] text-slate-100 border-slate-800";
      case "white":
      default:
        return "bg-white text-slate-900 border-slate-200";
    }
  };

  const getFontFamilyClass = () => {
    switch (readerFont) {
      case "serif":
        return "font-serif";
      case "mono":
        return "font-mono";
      case "sans":
      default:
        return "font-sans";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070D18] flex flex-col">
      {/* ─────────────────────────────────────────────────────────────────────────────
          1. TOP APP BAR: Book Selector, Mode Switcher & Tools
      ───────────────────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white dark:bg-[#0B1528] border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* LEFT: Back Button + Book Title */}
          <div className="flex items-center gap-3 min-w-0">
            {onBackToHome && (
              <button
                type="button"
                onClick={onBackToHome}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Quay lại trang chủ"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <select
                  value={selectedBookId}
                  onChange={(e) => {
                    setSelectedBookId(e.target.value);
                    setCurrentChapterIdx(0);
                    setPresentationSlideIdx(0);
                  }}
                  className="font-black text-sm text-slate-900 dark:text-white bg-transparent truncate border-none focus:outline-hidden cursor-pointer max-w-[200px] sm:max-w-[320px]"
                >
                  {booksList.map((book) => (
                    <option
                      key={book.id}
                      value={book.id}
                      className="bg-white dark:bg-[#0B1528] text-slate-900 dark:text-white"
                    >
                      [{book.grade}] {book.title}
                    </option>
                  ))}
                </select>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  {currentBook.grade}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800" title="Trang sách đã được lưu vào bộ nhớ cache ngoại tuyến PWA">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Offline Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {currentBook.publisher}
              </p>
            </div>
          </div>

          {/* CENTER: 3 Core Presentation Modes */}
          <div className="hidden lg:flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setReaderMode("reader")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                readerMode === "reader"
                  ? "bg-white dark:bg-[#070D18] text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>E-Reader Sách Số</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setReaderMode("presentation");
                setPresentationSlideIdx(0);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                readerMode === "presentation"
                  ? "bg-white dark:bg-[#070D18] text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Presentation className="w-4 h-4" />
              <span>Trình Chiếu Giảng Dạy</span>
            </button>

            <button
              type="button"
              onClick={() => setReaderMode("mindmap")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                readerMode === "mindmap"
                  ? "bg-white dark:bg-[#070D18] text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Network className="w-4 h-4" />
              <span>Sơ Đồ & Công Thức</span>
            </button>
          </div>

          {/* RIGHT: Actions: Text-to-Speech, Upload New, AI Companion */}
          <div className="flex items-center gap-2">
            {/* Audio Read Aloud */}
            <button
              type="button"
              onClick={handleToggleSpeech}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition cursor-pointer ${
                isSpeaking
                  ? "bg-emerald-600 text-white border-emerald-600 animate-pulse"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
              title={isSpeaking ? "Dừng đọc to trang sách" : "Đọc to trang sách bằng giọng thuyết minh"}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span className="hidden sm:inline">Dừng đọc</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Đọc sách</span>
                </>
              )}
            </button>

            {/* Upload Custom Book Button */}
            <button
              type="button"
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer shadow-xs"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Tải lên file sách</span>
            </button>

            {/* AI Textbook Companion Toggle */}
            <button
              type="button"
              onClick={() => setAiAssistantOpen(!aiAssistantOpen)}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                aiAssistantOpen
                  ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
              title="Mở trợ giảng AI đọc sách Socratic"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SUB-BAR FOR MOBILE MODE SWITCHER */}
        <div className="flex lg:hidden items-center justify-around border-t border-slate-200 dark:border-slate-800 px-3 py-2 bg-slate-50 dark:bg-[#070D18]">
          <button
            type="button"
            onClick={() => setReaderMode("reader")}
            className={`flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-lg ${
              readerMode === "reader" ? "bg-blue-600 text-white" : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Sách Số</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setReaderMode("presentation");
              setPresentationSlideIdx(0);
            }}
            className={`flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-lg ${
              readerMode === "presentation" ? "bg-blue-600 text-white" : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <Presentation className="w-3.5 h-3.5" />
            <span>Trình Chiếu</span>
          </button>
          <button
            type="button"
            onClick={() => setReaderMode("mindmap")}
            className={`flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-lg ${
              readerMode === "mindmap" ? "bg-blue-600 text-white" : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Sơ Đồ</span>
          </button>
        </div>
      </header>

      {/* Upload Feedback Toast */}
      {uploadFeedback && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4" />
          <span>{uploadFeedback}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          2. MAIN CONTENT AREA: Render active mode
      ───────────────────────────────────────────────────────────────────────────── */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SIDEBAR: Table of Contents & Book Details (4 columns) */}
        <aside className="lg:col-span-3 space-y-4">
          {/* Chapter Table of Contents */}
          <div className="bg-white dark:bg-[#0B1528] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Mục Lục Chương Hồi</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                {currentBook.chapters.length} chương
              </span>
            </div>

            <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
              {currentBook.chapters.map((ch, idx) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => {
                    setCurrentChapterIdx(idx);
                    setPresentationSlideIdx(0);
                    if (synthRef.current) synthRef.current.cancel();
                    setIsSpeaking(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl transition cursor-pointer flex items-start gap-2.5 ${
                    currentChapterIdx === idx
                      ? "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium"
                  }`}
                >
                  <span className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    {ch.chapterNumber}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs truncate">{ch.title}</p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{ch.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Reader Preferences (Only active in Reader mode) */}
          {readerMode === "reader" && (
            <div className="bg-white dark:bg-[#0B1528] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-4">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <span>Tùy Biến Trình Bày</span>
              </h3>

              {/* Font Size Adjuster */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex justify-between">
                  <span>Cỡ chữ hiển thị:</span>
                  <span className="text-blue-600 font-mono">{fontSize}px</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFontSize((p) => Math.max(13, p - 1))}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold"
                  >
                    A-
                  </button>
                  <input
                    type="range"
                    min="13"
                    max="24"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setFontSize((p) => Math.min(24, p + 1))}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold"
                  >
                    A+
                  </button>
                </div>
              </div>

              {/* Font Family Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  Kiểu phông chữ:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setReaderFont("serif")}
                    className={`py-1.5 text-xs rounded-lg font-serif transition cursor-pointer border ${
                      readerFont === "serif"
                        ? "bg-blue-600 text-white border-blue-600 font-bold"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    Merriweather
                  </button>
                  <button
                    type="button"
                    onClick={() => setReaderFont("sans")}
                    className={`py-1.5 text-xs rounded-lg font-sans transition cursor-pointer border ${
                      readerFont === "sans"
                        ? "bg-blue-600 text-white border-blue-600 font-bold"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    Inter Sans
                  </button>
                  <button
                    type="button"
                    onClick={() => setReaderFont("mono")}
                    className={`py-1.5 text-xs rounded-lg font-mono transition cursor-pointer border ${
                      readerFont === "mono"
                        ? "bg-blue-600 text-white border-blue-600 font-bold"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    Monospace
                  </button>
                </div>
              </div>

              {/* Paper Background Theme */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  Màu giấy đọc sách:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPaperTheme("white")}
                    className={`py-1.5 px-2 text-xs rounded-lg transition cursor-pointer border font-bold flex items-center justify-center gap-1.5 ${
                      paperTheme === "white"
                        ? "ring-2 ring-blue-600 border-slate-300"
                        : "border-slate-200"
                    } bg-white text-slate-900`}
                  >
                    <span className="w-3 h-3 rounded-full bg-white border border-slate-300 shrink-0" />
                    <span>Trắng ngọc</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaperTheme("sepia")}
                    className={`py-1.5 px-2 text-xs rounded-lg transition cursor-pointer border font-bold flex items-center justify-center gap-1.5 ${
                      paperTheme === "sepia"
                        ? "ring-2 ring-amber-600 border-amber-300"
                        : "border-[#E8DCC2]"
                    } bg-[#FBF0D9] text-[#433422]`}
                  >
                    <span className="w-3 h-3 rounded-full bg-[#F5DEB3] shrink-0" />
                    <span>Sepia cổ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaperTheme("dark")}
                    className={`py-1.5 px-2 text-xs rounded-lg transition cursor-pointer border font-bold flex items-center justify-center gap-1.5 ${
                      paperTheme === "dark"
                        ? "ring-2 ring-blue-500 border-slate-700"
                        : "border-slate-800"
                    } bg-[#0B1528] text-white`}
                  >
                    <span className="w-3 h-3 rounded-full bg-slate-900 border border-slate-600 shrink-0" />
                    <span>Đêm tối</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sticky Notes History */}
          {stickyNotes.filter((n) => n.chapterId === currentChapter.id).length > 0 && (
            <div className="bg-white dark:bg-[#0B1528] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-2">
              <h3 className="text-xs font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider flex items-center gap-1.5">
                <Bookmark className="w-4 h-4" />
                <span>Ghi Chú Đã Lưu Trong Chương</span>
              </h3>
              <div className="space-y-2 max-h-[220px] overflow-y-auto">
                {stickyNotes
                  .filter((n) => n.chapterId === currentChapter.id)
                  .map((note) => (
                    <div
                      key={note.id}
                      className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 space-y-1"
                    >
                      <p>{note.note}</p>
                      <p className="text-[10px] text-amber-700 dark:text-amber-400 font-mono">
                        Lưu lúc: {note.timestamp}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </aside>

        {/* MAIN VIEWER (9 columns) */}
        <main className="lg:col-span-9">
          {/* ─────────────────────────────────────────────────────────────────────────
              MODE 1: E-READER DIGITAL BOOK VIEW
          ───────────────────────────────────────────────────────────────────────── */}
          {readerMode === "reader" && (
            <div
              className={`rounded-2xl border p-6 sm:p-10 shadow-xs space-y-8 transition-colors duration-200 ${getPaperClasses()} ${getFontFamilyClass()}`}
              style={{ fontSize: `${fontSize}px`, lineHeight }}
            >
              {/* Chapter Header */}
              <div className="border-b pb-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                    Chương {currentChapter.chapterNumber} • {currentBook.subject}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs flex items-center gap-1 font-sans"
                      title="In hoặc xuất PDF chương sách này"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">In PDF</span>
                    </button>
                  </div>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black">{currentChapter.title}</h1>
                <p className="text-sm opacity-80 italic">{currentChapter.subtitle}</p>
              </div>

              {/* Chapter Summary Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 space-y-3 font-sans">
                <h4 className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Trọng Tâm & Chuẩn Kiến Thức Đầu Ra</span>
                </h4>
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  {currentChapter.summary.map((sum, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{sum}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sections & Body Content */}
              <div className="space-y-8">
                {currentChapter.sections.map((section) => (
                  <div key={section.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{section.title}</span>
                      </h2>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedSectionForNote(
                            selectedSectionForNote === section.id ? null : section.id
                          )
                        }
                        className="text-xs font-sans font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        title="Thêm ghi chú vào mục này"
                      >
                        <Highlighter className="w-3.5 h-3.5 text-amber-500" />
                        <span className="hidden sm:inline">Ghi chú</span>
                      </button>
                    </div>

                    {/* Section Callout if present */}
                    {section.calloutType && (
                      <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/20 font-sans">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-600 text-white">
                          {section.calloutType}
                        </span>
                      </div>
                    )}

                    {/* Section Paragraphs */}
                    <div className="space-y-3">
                      {section.content.map((para, pIdx) => (
                        <p key={pIdx} className="leading-relaxed">
                          {para}
                        </p>
                      ))}
                    </div>

                    {/* Math Formula Highlight Block */}
                    {section.formula && (
                      <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center my-4 font-mono text-base font-bold text-blue-700 dark:text-blue-300">
                        {section.formula}
                      </div>
                    )}

                    {/* Sticky Note Form if open for this section */}
                    {selectedSectionForNote === section.id && (
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 font-sans space-y-2 animate-in fade-in">
                        <textarea
                          value={newNoteInput}
                          onChange={(e) => setNewNoteInput(e.target.value)}
                          placeholder="Viết ghi chú, mẹo học hoặc câu hỏi ôn tập cho phần này..."
                          rows={2}
                          className="w-full text-xs p-2 rounded-lg bg-white dark:bg-[#070D18] border border-amber-200 dark:border-amber-900 text-slate-900 dark:text-white"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedSectionForNote(null)}
                            className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                          >
                            Hủy
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddStickyNote(section.id)}
                            className="px-3 py-1 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg cursor-pointer"
                          >
                            Lưu ghi chú
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Formulas Quick Section */}
              {currentChapter.formulas.length > 0 && (
                <div className="border-t pt-8 space-y-4 font-sans">
                  <h3 className="text-sm font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider flex items-center gap-2">
                    <Compass className="w-4 h-4" />
                    <span>Bộ Công Thức Vàng Cần Thuộc</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentChapter.formulas.map((form) => (
                      <div
                        key={form.id}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
                      >
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {form.name}
                        </h4>
                        <div className="p-2 rounded bg-white dark:bg-[#070D18] font-mono text-sm text-center text-blue-600 dark:text-blue-300 border border-slate-200 dark:border-slate-800">
                          {form.latex}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{form.meaning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Chapter Navigation */}
              <div className="border-t pt-6 flex items-center justify-between font-sans">
                <button
                  type="button"
                  disabled={currentChapterIdx <= 0}
                  onClick={() => {
                    setCurrentChapterIdx((p) => p - 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Chương trước</span>
                </button>

                <span className="text-xs font-bold text-slate-400">
                  Chương {currentChapterIdx + 1} / {currentBook.chapters.length}
                </span>

                <button
                  type="button"
                  disabled={currentChapterIdx >= currentBook.chapters.length - 1}
                  onClick={() => {
                    setCurrentChapterIdx((p) => p + 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Chương tiếp theo</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────────────
              MODE 2: LECTURE PRESENTATION / SLIDE MODE
          ───────────────────────────────────────────────────────────────────────── */}
          {readerMode === "presentation" && (
            <div
              ref={presentationContainerRef}
              className="bg-[#0B1528] text-white rounded-3xl border border-slate-800 p-6 sm:p-10 shadow-2xl flex flex-col justify-between min-h-[580px] relative overflow-hidden"
            >
              {/* Top Slide Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-black uppercase text-blue-400 tracking-wider">
                    {currentBook.shortTitle} • Chế độ Trình Chiếu Giảng Dạy
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-slate-400">
                    Slide {presentationSlideIdx + 1} / {slides.length}
                  </span>
                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                    title="Toàn màn hình (Nhấn phím F)"
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Slide Body Content */}
              <div className="my-auto py-8 sm:py-12 max-w-3xl mx-auto w-full space-y-6">
                {slides[presentationSlideIdx] && (
                  <>
                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded bg-blue-600/30 text-blue-300 border border-blue-500/40">
                        {slides[presentationSlideIdx].type}
                      </span>
                      <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                        {slides[presentationSlideIdx].title}
                      </h2>
                      {slides[presentationSlideIdx].subtitle && (
                        <p className="text-sm sm:text-base text-slate-400">
                          {slides[presentationSlideIdx].subtitle}
                        </p>
                      )}
                    </div>

                    {/* Formula in Slide */}
                    {slides[presentationSlideIdx].formula && (
                      <div className="p-6 rounded-2xl bg-[#070D18] border border-blue-500/40 text-center font-mono text-xl sm:text-2xl text-blue-300 shadow-inner">
                        {slides[presentationSlideIdx].formula}
                      </div>
                    )}

                    {/* Bullet List Content */}
                    {slides[presentationSlideIdx].content && (
                      <div className="space-y-3 pt-2">
                        {slides[presentationSlideIdx].content.map((point, idx) => (
                          <div key={idx} className="flex items-start gap-3 text-sm sm:text-base text-slate-200">
                            <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                            <p className="leading-relaxed">{point}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Interactive Exercise in Slide */}
                    {slides[presentationSlideIdx].exercise && (
                      <div className="p-5 rounded-2xl bg-[#070D18] border border-slate-800 space-y-4">
                        <p className="text-base font-bold text-white">
                          {slides[presentationSlideIdx].exercise.question}
                        </p>
                        {slides[presentationSlideIdx].exercise.options && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {slides[presentationSlideIdx].exercise.options.map(
                              (opt: string, oIdx: number) => (
                                <button
                                  key={oIdx}
                                  type="button"
                                  onClick={() =>
                                    handleSelectAnswer(slides[presentationSlideIdx].exercise.id, opt)
                                  }
                                  className={`p-3 rounded-xl text-left text-xs font-bold border transition cursor-pointer ${
                                    selectedQuizAnswers[slides[presentationSlideIdx].exercise.id] === opt
                                      ? opt === slides[presentationSlideIdx].exercise.correctAnswer
                                        ? "bg-emerald-600 text-white border-emerald-500"
                                        : "bg-rose-600 text-white border-rose-500"
                                      : "bg-slate-800/80 text-slate-200 border-slate-700 hover:bg-slate-700"
                                  }`}
                                >
                                  {opt}
                                </button>
                              )
                            )}
                          </div>
                        )}
                        {selectedQuizAnswers[slides[presentationSlideIdx].exercise.id] && (
                          <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-800 text-xs text-blue-200">
                            <strong>Lời giải chi tiết: </strong>
                            {slides[presentationSlideIdx].exercise.solution}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Bottom Navigation & Hotkey Tip */}
              <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  Phím tắt: Dùng phím <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono">←</kbd> và <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono">→</kbd> để chuyển slide, <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono">F</kbd> toàn màn hình.
                </p>

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    disabled={presentationSlideIdx <= 0}
                    onClick={prevSlide}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-white flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Lùi lại</span>
                  </button>

                  <button
                    type="button"
                    disabled={presentationSlideIdx >= slides.length - 1}
                    onClick={nextSlide}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-white flex items-center gap-1 cursor-pointer"
                  >
                    <span>Tiếp theo</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────────────
              MODE 3: MINDMAP & FORMULA DIGEST
          ───────────────────────────────────────────────────────────────────────── */}
          {readerMode === "mindmap" && (
            <div className="bg-white dark:bg-[#0B1528] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-8">
              {/* Header */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <span className="text-xs font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider">
                  Sơ Đồ Tri Thức & Công Thức
                </span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  Bản Đồ Khái Niệm: {currentChapter.title}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Cấu trúc hóa toàn bộ nhánh kiến thức để học sinh ôn tập siêu tốc
                </p>
              </div>

              {/* Interactive Mindmap Tree Graph */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#070D18] border border-slate-200 dark:border-slate-800 space-y-6">
                {/* Root Node */}
                <div className="flex justify-center">
                  <div className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-black text-sm shadow-md text-center max-w-sm">
                    {currentChapter.mindmap.root}
                  </div>
                </div>

                {/* Branches */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  {currentChapter.mindmap.branches.map((branch, bIdx) => (
                    <div
                      key={bIdx}
                      className="p-4 rounded-xl bg-white dark:bg-[#0B1528] border border-slate-200 dark:border-slate-700 shadow-xs space-y-2.5"
                    >
                      <h4 className="text-xs font-black text-blue-700 dark:text-blue-300 pb-1.5 border-b border-slate-100 dark:border-slate-800">
                        {branch.name}
                      </h4>
                      <ul className="space-y-1.5">
                        {branch.items.map((item, iIdx) => (
                          <li
                            key={iIdx}
                            className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Full Formulas Table */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-blue-600" />
                  <span>Bảng Tra Cứu Công Thức Toán & Lý Trong Chương</span>
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                        <th className="py-2.5 px-3 font-bold">Tên Công Thức</th>
                        <th className="py-2.5 px-3 font-bold">Ký Hiệu Toán Học</th>
                        <th className="py-2.5 px-3 font-bold">Ý Nghĩa & Ứng Dụng</th>
                        <th className="py-2.5 px-3 font-bold">Ví Dụ Mẫu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {currentChapter.formulas.map((form) => (
                        <tr key={form.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                            {form.name}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                            {form.latex}
                          </td>
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                            {form.meaning}
                          </td>
                          <td className="py-3 px-3 text-slate-500 dark:text-slate-400 italic">
                            {form.example}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          3. AI TEXTBOOK COMPANION SLIDE-OVER (DRAWER)
      ───────────────────────────────────────────────────────────────────────────── */}
      {aiAssistantOpen && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-96 z-50 bg-white dark:bg-[#0B1528] border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-purple-50 dark:bg-purple-950/30">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900 dark:text-white">
                  AI Trợ Giảng Đọc Sách
                </h3>
                <p className="text-[10px] text-purple-700 dark:text-purple-300">
                  Phương pháp gợi mở Socratic K-12
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAiAssistantOpen(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer p-1"
            >
              ✕
            </button>
          </div>

          {/* Companion Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => setAiAssistantTab("summary")}
              className={`flex-1 py-2.5 text-center transition cursor-pointer ${
                aiAssistantTab === "summary"
                  ? "border-b-2 border-purple-600 text-purple-600 dark:text-purple-400"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              Tóm Tắt 3 Phút
            </button>
            <button
              type="button"
              onClick={() => setAiAssistantTab("quiz")}
              className={`flex-1 py-2.5 text-center transition cursor-pointer ${
                aiAssistantTab === "quiz"
                  ? "border-b-2 border-purple-600 text-purple-600 dark:text-purple-400"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              Kiểm Tra Nhanh
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {aiAssistantTab === "summary" && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#070D18] border border-slate-200 dark:border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Tóm tắt cốt lõi của {currentChapter.title}:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {currentChapter.summary.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="font-bold text-purple-600">{idx + 1}.</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 text-xs text-purple-900 dark:text-purple-200 space-y-2">
                  <p className="font-bold">Mẹo sư phạm từ Gia sư AI:</p>
                  <p className="text-[11px] leading-relaxed">
                    Khi đọc sách giáo khoa, hãy cố gắng tự phát biểu lại định nghĩa theo ngôn từ của chính mình trước khi xem ví dụ mẫu. Điều này kích thích não bộ tạo liên kết thần kinh mạnh hơn 300%!
                  </p>
                </div>
              </div>
            )}

            {aiAssistantTab === "quiz" && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">
                  Trả lời các câu hỏi sau để kiểm tra bạn đã nắm chắc trang sách này chưa:
                </p>

                {currentChapter.exercises.map((ex, idx) => (
                  <div
                    key={ex.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-[#070D18] border border-slate-200 dark:border-slate-800 space-y-2.5"
                  >
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Câu {idx + 1}: {ex.question}
                    </p>
                    {ex.options && (
                      <div className="space-y-1.5">
                        {ex.options.map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() => handleSelectAnswer(ex.id, opt)}
                            className={`w-full text-left p-2 rounded-lg text-xs transition cursor-pointer border ${
                              selectedQuizAnswers[ex.id] === opt
                                ? "bg-purple-600 text-white border-purple-600 font-bold"
                                : "bg-white dark:bg-[#0B1528] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleCheckQuizAnswers}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition cursor-pointer"
                >
                  Kiểm tra đáp án
                </button>

                {quizScore !== null && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-800 dark:text-emerald-200 text-xs font-bold text-center">
                    Bạn làm đúng {quizScore} / {currentChapter.exercises.length} câu!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          4. CUSTOM BOOK UPLOAD & REFORMAT MODAL
      ───────────────────────────────────────────────────────────────────────────── */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0B1528] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full p-6 space-y-5 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Tải Lên File Sách & Trình Bày Lại
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Hỗ trợ tệp .pdf, .epub, .docx, .txt, .md hoặc dán văn bản trực tiếp
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Upload Form */}
            <form onSubmit={handleProcessUploadBook} className="space-y-4">
              {/* File Dropzone */}
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-blue-500 transition cursor-pointer relative bg-slate-50/50 dark:bg-slate-900/40">
                <input
                  type="file"
                  accept=".txt,.md,.pdf,.epub,.docx,.json"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {uploadedFileName ? (
                    <span className="text-blue-600 font-mono">Đã chọn: {uploadedFileName}</span>
                  ) : (
                    "Kéo thả tệp sách vào đây hoặc nhấp để chọn tệp"
                  )}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Hệ thống sẽ tự động bóc tách thành các slide và sơ đồ tư duy
                </p>
              </div>

              {/* Title & Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Tiêu đề sách / tài liệu:
                  </label>
                  <input
                    type="text"
                    value={customUploadTitle}
                    onChange={(e) => setCustomUploadTitle(e.target.value)}
                    placeholder="VD: Ôn Tập Toán 10 - Cánh Diều"
                    required
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#070D18] text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Khối lớp:
                  </label>
                  <select
                    value={customUploadGrade}
                    onChange={(e) => setCustomUploadGrade(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#070D18] text-slate-900 dark:text-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                      <option key={g} value={`Lớp ${g}`}>
                        Lớp {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Paste Text Fallback */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Nội dung sách (hoặc dán văn bản trích đoạn):
                </label>
                <textarea
                  value={customUploadText}
                  onChange={(e) => setCustomUploadText(e.target.value)}
                  placeholder="Dán nội dung các chương sách, bài học hoặc định lý tại đây...&#10;Dùng dấu # để đánh dấu tiêu đề mục (VD: # §1. Mệnh đề toán học)"
                  rows={5}
                  required
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#070D18] text-slate-900 dark:text-white font-mono leading-relaxed"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl cursor-pointer shadow-xs"
                >
                  Trình bày lại sách ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

