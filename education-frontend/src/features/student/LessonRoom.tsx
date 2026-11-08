"use client";

import React, { useState, useRef, useEffect } from "react";
import { Lesson } from "@/types";
import { MOCK_LESSONS } from "@/lib/mock-data";
import { api } from "@/lib/api";
import confetti from "canvas-confetti";
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  HelpCircle,
  FileText,
  Sparkles,
  Clock,
  ChevronRight,
  Lightbulb,
  Bookmark,
  Plus,
  Trash2,
  RotateCcw,
  Sliders,
  Check,
  BrainCircuit,
  Eye,
  BookOpen,
  ExternalLink,
  Presentation,
  Network,
} from "lucide-react";
import { PlyrVideoPlayer, PlyrPlayerHandle } from "@/components/PlyrVideoPlayer";
import { useBookmarks } from "@/lib/bookmarks/BookmarksContext";
import { useAccessibility } from "@/lib/a11y/AccessibilityContext";
import { ShimmerButton } from "@/components/ui";

interface LessonRoomProps {
  currentLesson: Lesson;
  onBack: () => void;
  onOpenAiChat: () => void;
  onCompleteLesson: (lessonId: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// BRILLIANT-STYLE INTERACTIVE FRACTION MANIPULATOR (ACTIVE LEARNING WIDGET)
// ─────────────────────────────────────────────────────────────────────────────
const FractionVisualizerWidget: React.FC = () => {
  const [denominator, setDenominator] = useState<number>(6);
  const [selectedSlices, setSelectedSlices] = useState<number[]>([0, 1, 2]); // default 3/6 = 1/2

  const toggleSlice = (idx: number) => {
    setSelectedSlices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const numerator = selectedSlices.length;

  // Tính ước chung lớn nhất (GCD) để rút gọn phân số
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const commonDivisor = numerator > 0 ? gcd(numerator, denominator) : 1;
  const simplifiedNumerator = numerator / commonDivisor;
  const simplifiedDenominator = denominator / commonDivisor;
  const isEquivalentToOneHalf = numerator * 2 === denominator;

  const resetWidget = () => {
    setSelectedSlices([0, 1, 2]);
    setDenominator(6);
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#F9F7F5] dark:bg-[#08152B] p-5 sm:p-6 space-y-5">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#1865F2] flex items-center justify-center text-white font-bold text-xs shadow-xs">
            ½
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>Mô Phỏng Trực Quan: Rút Gọn & Quy Đồng Mẫu Số</span>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-[#1865F2] dark:text-blue-300">
                Thực hành tay
              </span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Nhấp vào các ô để tô màu tử số và quan sát sự biến đổi phân số tương đương
            </p>
          </div>
        </div>

        <button
          onClick={resetWidget}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Đặt lại</span>
        </button>
      </div>

      {/* Control: Denominator Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-[#1865F2]" />
          <span>Chọn số phần chia (Mẫu số):</span>
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {[2, 3, 4, 6, 8, 12].map((d) => (
            <button
              key={d}
              onClick={() => {
                setDenominator(d);
                // Giữ lại các slice hợp lệ
                setSelectedSlices((prev) => prev.filter((i) => i < d));
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                denominator === d
                  ? "bg-[#1865F2] text-white border-[#1865F2] shadow-xs scale-105"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400"
              }`}
            >
              Chia {d} phần
            </button>
          ))}
        </div>
      </div>

      {/* Visual Interactive Fraction Bar */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs font-bold text-slate-600 dark:text-slate-400">
          <span>Thanh phân số trực quan ({numerator}/{denominator}):</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-black">
            Đã chọn {numerator} phần
          </span>
        </div>

        {/* Clickable Slices Bar */}
        <div className="w-full h-14 bg-white dark:bg-slate-900 rounded-2xl p-1.5 border border-slate-300 dark:border-slate-700 flex gap-1 shadow-inner overflow-hidden">
          {Array.from({ length: denominator }).map((_, i) => {
            const isSelected = selectedSlices.includes(i);
            return (
              <button
                key={i}
                onClick={() => toggleSlice(i)}
                className={`flex-1 h-full rounded-xl transition-all duration-200 flex flex-col items-center justify-center font-black text-xs cursor-pointer select-none border ${
                  isSelected
                    ? "bg-[#14BF96] text-white border-[#0FA882] shadow-sm scale-[0.98]"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border-dashed border-slate-300 dark:border-slate-600"
                }`}
                title={`Nhấp để ${isSelected ? "bỏ chọn" : "chọn"} phần ${i + 1}`}
              >
                <span>{i + 1}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Realtime Live Insight Box */}
      <div className="rounded-xl bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Fraction Equation */}
          <div className="flex items-center gap-3 text-lg font-black text-slate-900 dark:text-white">
            <div className="flex flex-col items-center leading-none">
              <span className="text-[#14BF96] pb-1">{numerator}</span>
              <span className="w-6 h-0.5 bg-slate-900 dark:bg-white" />
              <span className="pt-1">{denominator}</span>
            </div>

            <span className="text-slate-400">=</span>

            <div className="flex flex-col items-center leading-none">
              <span className="text-[#1865F2] pb-1">{simplifiedNumerator}</span>
              <span className="w-6 h-0.5 bg-slate-900 dark:bg-white" />
              <span className="pt-1">{simplifiedDenominator}</span>
            </div>
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-0.5">
            <p className="font-bold text-slate-900 dark:text-white">
              {simplifiedNumerator === numerator
                ? "Đây đã là phân số tối giản!"
                : `Rút gọn bằng cách chia cả tử và mẫu cho ${commonDivisor}`}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isEquivalentToOneHalf
                ? "Tuyệt vời! Phân số này có giá trị đúng bằng một nửa (1/2)."
                : `Giá trị tương đương: ${((numerator / denominator) * 100).toFixed(1)}%`}
            </p>
          </div>
        </div>

        {isEquivalentToOneHalf && (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
            Chuẩn Một Nửa (50%) ✨
          </span>
        )}
      </div>
    </div>
  );
};

export const LessonRoom: React.FC<LessonRoomProps> = ({
  currentLesson: initialLesson,
  onBack,
  onOpenAiChat,
  onCompleteLesson,
}) => {
  const [activeLesson, setActiveLesson] = useState<Lesson>(initialLesson);
  const [activeTab, setActiveTab] = useState<"quiz" | "visualizer" | "notes" | "textbook">("visualizer");

  // Plyr Video Player Reference & States
  const playerRef = useRef<PlyrPlayerHandle>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(activeLesson.positionSeconds || 0);
  const [duration, setDuration] = useState(activeLesson.durationSeconds || 600);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Bookmarks & Personal Notes
  const { isBookmarked, toggleBookmark, addNote, getNotesForLesson, deleteNote } = useBookmarks();
  const { subtitlesDefault } = useAccessibility();
  const [newNoteText, setNewNoteText] = useState("");
  const [noteCooldownSec, setNoteCooldownSec] = useState<number>(0);
  const [noteRateLimitAlert, setNoteRateLimitAlert] = useState<string | null>(null);
  const lessonNotes = getNotesForLesson(activeLesson.id);

  useEffect(() => {
    if (noteCooldownSec <= 0) return;
    const interval = setInterval(() => {
      setNoteCooldownSec((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [noteCooldownSec]);

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    if (noteCooldownSec > 0) {
      setNoteRateLimitAlert(
        `Chống spam: Vui lòng đợi ${noteCooldownSec}s trước khi tạo ghi chú tiếp theo.`
      );
      return;
    }

    addNote(activeLesson.id, activeLesson.title, newNoteText.trim(), Math.floor(currentTime));
    setNewNoteText("");
    setNoteCooldownSec(3); // 3s cooldown between notes
    setNoteRateLimitAlert(null);
  };

  // Mốc thời gian chương học
  const CHAPTERS = [
    { time: 0, title: "00:00 - Giới thiệu bài học" },
    { time: 120, title: "02:00 - Khái niệm Tử số và Mẫu số" },
    { time: 330, title: "05:30 - Ví dụ thực tế: Cắt bánh Pizza" },
    { time: 480, title: "08:00 - Rút gọn phân số & Tổng kết" },
  ];

  const jumpToChapter = (seconds: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(seconds);
      setCurrentTime(seconds);
      playerRef.current.play();
      setIsPlaying(true);
    }
  };

  // Quiz States
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<Record<string, boolean>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [masteryState, setMasteryState] = useState(activeLesson.masteryLevel);

  // Heartbeat tiến độ xem video mỗi 12s
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying && playerRef.current) {
        const pos = Math.floor(playerRef.current.getCurrentTime());
        const dur = Math.floor(
          playerRef.current.getDuration() || activeLesson.durationSeconds || 600
        );
        api.updateLessonProgress(activeLesson.id, pos, dur, false);
        setSaveStatus(`Đã lưu tiến độ lúc ${formatTime(pos)}`);
        setTimeout(() => setSaveStatus(null), 3000);
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [isPlaying, activeLesson.id, activeLesson.durationSeconds]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (isAnswerSubmitted[questionId]) return;
    setSelectedOptions((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeLesson.quiz) return;

    let correctCount = 0;
    const submittedState: Record<string, boolean> = {};

    activeLesson.quiz.questions.forEach((q) => {
      submittedState[q.id] = true;
      const selected = selectedOptions[q.id];
      const correctOpt = q.options.find((o) => o.isCorrect);
      if (selected && correctOpt && selected === correctOpt.id) {
        correctCount += 1;
      }
    });

    setIsAnswerSubmitted(submittedState);
    const totalQ = activeLesson.quiz.questions.length;
    const score = Math.round((correctCount / (totalQ || 1)) * 100);
    setQuizScore(score);

    try {
      const answersPayload = Object.entries(selectedOptions).map(([qId, optId]) => ({
        questionId: qId,
        selectedAnswer: optId.replace("opt-", "").toUpperCase(),
      }));
      await api.submitQuiz(activeLesson.id, answersPayload);
      const pos = playerRef.current ? Math.floor(playerRef.current.getCurrentTime()) : 0;
      await api.updateLessonProgress(
        activeLesson.id,
        pos,
        duration,
        score >= activeLesson.quiz.passingScore
      );
    } catch {
      // Local state fallback
    }

    if (score >= activeLesson.quiz.passingScore) {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#14BF96", "#FFC700", "#1865F2", "#059669"],
      });
      setMasteryState("MASTERED");
      onCompleteLesson(activeLesson.id);
    } else {
      setMasteryState("FAMILIAR");
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* ─────────────────────────────────────────────────────────────
          1. TOP BAR: BREADCRUMB, ACTIONS & SOLID STATUS BADGE
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0B172E] p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3.5">
          <button
            onClick={onBack}
            className="px-3.5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all active:scale-[0.98] flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>

          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
              <span>Toán Lớp 5</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span>Chương 1: Phân Số</span>
            </div>
            <h1 className="text-base sm:text-xl font-black text-slate-900 dark:text-white line-clamp-1 tracking-tight">
              {activeLesson.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Live Concurrent Learners Badge (Golang Live Gateway Port 8087) */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>128 bạn đang cùng học</span>
          </div>
          {saveStatus && (
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              {saveStatus}
            </span>
          )}

          <button
            onClick={() => toggleBookmark({ id: activeLesson.id, title: activeLesson.title })}
            className={`px-3.5 py-2 rounded-full transition-all flex items-center gap-1.5 text-xs font-black cursor-pointer border ${
              isBookmarked(activeLesson.id)
                ? "bg-amber-400 text-slate-950 border-amber-500 shadow-xs"
                : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
            }`}
          >
            <Bookmark
              className={`w-3.5 h-3.5 ${isBookmarked(activeLesson.id) ? "fill-current" : ""}`}
            />
            <span>{isBookmarked(activeLesson.id) ? "Đã lưu bài học" : "Lưu xem lại"}</span>
          </button>

          <span
            className={`text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full border ${
              masteryState === "MASTERED"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                : masteryState === "PROFICIENT"
                  ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800"
                  : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
            }`}
          >
            {masteryState === "MASTERED"
              ? "Đã Tinh Thông 🏆"
              : masteryState === "PROFICIENT"
                ? "Thành Thạo ⚡"
                : "Đang Làm Quen 💡"}
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN CONTENT GRID (VIDEO + SIDE CURRICULUM)
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Video Player + Interactive Workspace */}
        <div className="lg:col-span-8 space-y-6">
          {/* Plyr Video Player */}
          <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md bg-black">
            <PlyrVideoPlayer
              ref={playerRef}
              src={
                activeLesson.videoUrl ||
                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
              }
              title={activeLesson.title}
              initialTime={activeLesson.positionSeconds || 0}
              chapters={CHAPTERS}
              defaultSubtitles={subtitlesDefault}
              onTimeUpdate={(curTime, dur) => {
                setCurrentTime(curTime);
                if (dur > 0 && dur !== duration) {
                  setDuration(dur);
                }
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => {
                setIsPlaying(false);
                api.updateLessonProgress(
                  activeLesson.id,
                  Math.floor(duration),
                  Math.floor(duration),
                  true
                );
              }}
            />
          </div>

          {/* Solid Chapter Timeline Markers Bar */}
          <div className="bg-[#081C3D] dark:bg-[#071328] text-white p-3 sm:p-3.5 rounded-2xl flex items-center gap-2 overflow-x-auto text-xs no-scrollbar shadow-xs border border-slate-700/60 dark:border-slate-800">
            <span className="text-slate-400 font-bold shrink-0 text-[11px] uppercase tracking-wider flex items-center gap-1.5 px-2">
              <Clock className="w-3.5 h-3.5 text-[#1865F2]" /> Chương học:
            </span>
            {CHAPTERS.map((ch, idx) => (
              <button
                key={idx}
                onClick={() => jumpToChapter(ch.time)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all shrink-0 cursor-pointer border ${
                  currentTime >= ch.time &&
                  (idx === CHAPTERS.length - 1 || currentTime < CHAPTERS[idx + 1].time)
                    ? "bg-[#1865F2] text-white border-[#1865F2] shadow-xs"
                    : "bg-[#0B2349] hover:bg-[#12366E] text-slate-200 border-[#193F77]"
                }`}
              >
                {ch.title}
              </button>
            ))}
          </div>

          {/* Interactive Workspace Tabs (Visualizer / Quiz / Notes) */}
          <div className="bg-white dark:bg-[#0B172E] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            {/* Tab Navigation */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-2 gap-2">
              <button
                onClick={() => setActiveTab("visualizer")}
                className={`flex-1 py-3 px-4 text-xs sm:text-sm font-black rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === "visualizer"
                    ? "bg-white dark:bg-[#0B172E] text-[#1865F2] shadow-xs border border-slate-200 dark:border-slate-700"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Eye className="w-4 h-4 text-[#1865F2]" />
                <span>Mô phỏng tương tác (Brilliant)</span>
              </button>

              <button
                onClick={() => setActiveTab("quiz")}
                className={`flex-1 py-3 px-4 text-xs sm:text-sm font-black rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === "quiz"
                    ? "bg-white dark:bg-[#0B172E] text-[#14BF96] shadow-xs border border-slate-200 dark:border-slate-700"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <HelpCircle className="w-4 h-4 text-[#14BF96]" />
                <span>Trắc nghiệm ({activeLesson.quiz?.questions.length || 0} câu)</span>
              </button>

              <button
                onClick={() => setActiveTab("notes")}
                className={`flex-1 py-3 px-4 text-xs sm:text-sm font-black rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === "notes"
                    ? "bg-white dark:bg-[#0B172E] text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-slate-700"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <FileText className="w-4 h-4 text-amber-500" />
                <span>Lý thuyết & Ghi chú</span>
              </button>

              <button
                onClick={() => setActiveTab("textbook")}
                className={`flex-1 py-3 px-4 text-xs sm:text-sm font-black rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === "textbook"
                    ? "bg-white dark:bg-[#0B172E] text-purple-600 dark:text-purple-400 shadow-xs border border-slate-200 dark:border-slate-700"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <BookOpen className="w-4 h-4 text-purple-600" />
                <span>Sách Giáo Khoa (Trình Bày Lại)</span>
              </button>
            </div>

            <div className="p-6">
              {/* TAB 1: VISUALIZER (BRILLIANT ACTIVE LEARNING) */}
              {activeTab === "visualizer" && (
                <div className="space-y-4">
                  <FractionVisualizerWidget />
                </div>
              )}

              {/* TAB 2: QUIZ COMPONENT */}
              {activeTab === "quiz" && (
                <div className="space-y-6">
                  {activeLesson.quiz ? (
                    <>
                      <div className="space-y-5">
                        {activeLesson.quiz.questions.map((q, idx) => {
                          const isSubmitted = isAnswerSubmitted[q.id];
                          const selected = selectedOptions[q.id];

                          return (
                            <div
                              key={q.id}
                              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 bg-slate-50/50 dark:bg-slate-900/40"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
                                  Câu {idx + 1}: {q.questionText}
                                </h3>
                                <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                  {q.points} điểm
                                </span>
                              </div>

                              {/* Options */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {q.options.map((opt) => {
                                  const isSelected = selected === opt.id;
                                  let optionClass =
                                    "border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B172E] hover:border-[#14BF96] text-slate-700 dark:text-slate-200";

                                  if (isSubmitted) {
                                    if (opt.isCorrect) {
                                      optionClass =
                                        "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-black";
                                    } else if (isSelected && !opt.isCorrect) {
                                      optionClass =
                                        "border-rose-400 bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200";
                                    }
                                  } else if (isSelected) {
                                    optionClass =
                                      "border-[#1865F2] bg-blue-50 dark:bg-blue-950/60 text-[#1865F2] dark:text-blue-300 font-black ring-2 ring-[#1865F2]";
                                  }

                                  return (
                                    <button
                                      key={opt.id}
                                      onClick={() => handleSelectOption(q.id, opt.id)}
                                      className={`p-4 rounded-xl border text-left text-sm transition-all flex items-center justify-between cursor-pointer active:scale-[0.99] ${optionClass}`}
                                    >
                                      <span>{opt.text}</span>
                                      {isSubmitted && opt.isCorrect && (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Explanation Box */}
                              {isSubmitted && (
                                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-950 dark:text-emerald-200 space-y-1">
                                  <p className="font-black flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
                                    <Lightbulb className="w-4 h-4 text-amber-500" />
                                    Giải thích sư phạm:
                                  </p>
                                  <p className="leading-relaxed">{q.explanation}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Quiz Submit & Results */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        {quizScore !== null ? (
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-black text-slate-800 dark:text-slate-200">
                              Kết quả: {quizScore}/100 điểm
                            </span>
                            <span
                              className={`text-xs font-black px-3.5 py-1.5 rounded-full border ${
                                quizScore >= activeLesson.quiz.passingScore
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
                                  : "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
                              }`}
                            >
                              {quizScore >= activeLesson.quiz.passingScore
                                ? "Đạt chuẩn Tinh Thông! 🎉"
                                : "Cần rèn luyện thêm 💡"}
                            </span>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            Chọn đáp án và bấm kiểm tra để nâng mức thành thạo kỹ năng.
                          </div>
                        )}

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <button
                            onClick={onOpenAiChat}
                            className="flex-1 sm:flex-none px-4 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-[#14BF96]" />
                            <span>Hỏi gợi ý từ AI</span>
                          </button>

                          <button
                            onClick={handleSubmitQuiz}
                            className="flex-1 sm:flex-none px-6 py-2.5 rounded-full bg-[#14BF96] hover:bg-[#0FA882] active:scale-[0.98] text-slate-950 font-black text-xs transition shadow-sm cursor-pointer"
                          >
                            Kiểm tra kết quả
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-slate-500 text-sm">
                      Bài học này không có bài kiểm tra trắc nghiệm.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: NOTES & THEORY */}
              {activeTab === "notes" && (
                <div className="space-y-6 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                  {/* Trọng tâm kiến thức */}
                  <div className="space-y-3">
                    <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center justify-between">
                      <span>Trọng tâm kiến thức: {activeLesson.title}</span>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-[#1865F2] border border-blue-200 dark:border-blue-900">
                        Chuẩn GDPT 2018
                      </span>
                    </h3>
                    <div className="p-4 bg-blue-50/60 dark:bg-blue-950/40 rounded-2xl border border-blue-100 dark:border-blue-900/60 space-y-2 text-xs text-blue-900 dark:text-blue-200">
                      <p className="font-bold">Quy tắc vàng cần ghi nhớ:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Tử số chỉ số phần được lấy ra hoặc đề cập đến.</li>
                        <li>
                          Mẫu số chỉ tổng số phần bằng nhau được chia ra từ một đơn vị (mẫu số luôn
                          khác 0).
                        </li>
                        <li>
                          Khi nhân hoặc chia cả tử số và mẫu số cho cùng một số tự nhiên khác 0, ta được một phân số bằng phân số đã cho.
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Sổ tay ghi chú cá nhân */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#1865F2]" />
                        <span>Sổ tay ghi chú cá nhân của em ({lessonNotes.length})</span>
                      </h4>
                      <span className="text-[11px] text-slate-400 font-semibold">
                        Lưu tự động & đồng bộ đám mây
                      </span>
                    </div>

                    {/* New Note Form */}
                    <form
                      onSubmit={handleSaveNote}
                      className="space-y-2.5 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          Thêm ghi chú mới:
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-[#1865F2] dark:text-blue-300 font-mono text-[10px] font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Mốc video: {formatTime(Math.floor(currentTime))}
                        </span>
                      </div>
                      <textarea
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        placeholder="Nhập ghi chú hoặc công thức quan trọng em vừa nghe thấy trong video..."
                        rows={2}
                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-[#1865F2] transition"
                      />
                      {noteRateLimitAlert && (
                        <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                          {noteRateLimitAlert}
                        </p>
                      )}
                      <div className="flex justify-end items-center gap-2">
                        {noteCooldownSec > 0 && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            Chống spam: {noteCooldownSec}s
                          </span>
                        )}
                        <button
                          type="submit"
                          disabled={!newNoteText.trim() || noteCooldownSec > 0}
                          className="px-4 py-1.5 rounded-full bg-[#1865F2] hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>
                            {noteCooldownSec > 0 ? `Chờ (${noteCooldownSec}s)` : "Lưu ghi chú"}
                          </span>
                        </button>
                      </div>
                    </form>

                    {/* Saved Notes List */}
                    <div className="space-y-2">
                      {lessonNotes.map((note) => (
                        <div
                          key={note.id}
                          className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1 flex-1">
                            {typeof note.timestampSeconds === "number" && (
                              <button
                                onClick={() => jumpToChapter(note.timestampSeconds!)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-[#1865F2] dark:text-blue-300 font-mono text-[10px] font-bold hover:underline cursor-pointer"
                                title="Nhấp để phát video từ mốc này"
                              >
                                <Play className="w-2.5 h-2.5 fill-current" />
                                <span>{formatTime(note.timestampSeconds)}</span>
                              </button>
                            )}
                            <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                              {note.content}
                            </p>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              {note.createdAt}
                            </span>
                          </div>

                          <button
                            onClick={() => deleteNote(note.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                            title="Xóa ghi chú"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: TEXTBOOK DIGITAL REFORMATTER */}
              {activeTab === "textbook" && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="p-5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-purple-600 text-white">
                        Sách giáo khoa số hóa
                      </span>
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        Tài Liệu SGK Đi Kèm: {activeLesson.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Nội dung bài học được trích xuất và trình bày lại theo chuẩn sư phạm tương tác DMKLab
                      </p>
                    </div>

                    <button
                      onClick={() => (window.location.href = "/books")}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition cursor-pointer shadow-xs self-start sm:self-auto shrink-0"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Mở Studio Đọc Sách Đầy Đủ</span>
                    </button>
                  </div>

                  {/* Textbook Section Preview */}
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 bg-white dark:bg-[#070D18] font-serif leading-relaxed">
                    <h4 className="text-lg font-black font-sans text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
                      §1. Khái niệm phân số và tính chất cơ bản của phân số
                    </h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      Một chiếc bánh pizza được cắt thành 6 miếng đều nhau. Nếu em lấy đi 2 miếng, ta nói em đã lấy 2/6 chiếc bánh. Số 2 ở trên là TỬ SỐ (chỉ số phần được lấy), số 6 ở dưới là MẪU SỐ (chỉ tổng số phần bằng nhau được chia ra, mẫu số luôn khác 0).
                    </p>
                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 font-mono text-center text-sm font-bold text-blue-700 dark:text-blue-300 font-sans">
                      a / b = (a × m) / (b × m) = (a : n) / (b : n) (m, n ≠ 0)
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      <strong>Tính chất vàng:</strong> Khi nhân hoặc chia cả tử và mẫu của một phân số với cùng một số tự nhiên khác 0, giá trị của phân số đó hoàn toàn KHÔNG THAY ĐỔI.
                    </p>
                  </div>

                  {/* 3 Quick Launch Modes */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => (window.location.href = "/books")}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 bg-slate-50 dark:bg-slate-800/40 text-left space-y-1 transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 text-blue-600 font-bold text-xs">
                        <FileText className="w-4 h-4" />
                        <span>Chế Độ E-Reader</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Đọc sách cỡ chữ lớn, màu giấy Sepia, ghi chú bên lề
                      </p>
                    </button>

                    <button
                      onClick={() => (window.location.href = "/books")}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-500 bg-slate-50 dark:bg-slate-800/40 text-left space-y-1 transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 text-purple-600 font-bold text-xs">
                        <Presentation className="w-4 h-4" />
                        <span>Chế Độ Trình Chiếu</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Chiếu slide giảng dạy 16:9 toàn màn hình cho lớp học
                      </p>
                    </button>

                    <button
                      onClick={() => (window.location.href = "/books")}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/40 text-left space-y-1 transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                        <Network className="w-4 h-4" />
                        <span>Sơ Đồ & Công Thức</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Bản đồ khái niệm phân nhánh và bảng công thức ôn tập
                      </p>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Curriculum Progress & Socratic AI Card */}
        <div className="lg:col-span-4 space-y-5">
          {/* Chapter Outline Card */}
          <div className="bg-white dark:bg-[#0B172E] rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
            <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center justify-between tracking-tight">
              <span>Nội dung chương 1</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {MOCK_LESSONS.length} bài học
              </span>
            </h3>

            <div className="space-y-2">
              {MOCK_LESSONS.map((les) => {
                const isActive = les.id === activeLesson.id;
                return (
                  <div
                    key={les.id}
                    onClick={() => {
                      setActiveLesson(les);
                      setSelectedOptions({});
                      setIsAnswerSubmitted({});
                      setQuizScore(null);
                    }}
                    className={`p-3.5 rounded-2xl border text-xs transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isActive
                        ? "border-[#1865F2] bg-blue-50/60 dark:bg-blue-950/40 text-[#1865F2] dark:text-blue-300 font-bold shadow-xs"
                        : "border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        {les.isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Play className="w-3 h-3 fill-slate-400 text-slate-400 ml-0.5" />
                        )}
                      </div>
                      <span className="line-clamp-1">{les.title}</span>
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {Math.floor(les.durationSeconds / 60)}p
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Socratic AI Tutor Solid Card */}
          <div className="rounded-3xl bg-[#081C3D] dark:bg-[#071328] text-white p-6 border border-slate-700/60 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#14BF96] flex items-center justify-center text-slate-950">
                <Sparkles className="w-4 h-4 text-slate-950" />
              </div>
              <div>
                <h4 className="font-black text-sm text-white tracking-tight">Gia Sư AI Socratic</h4>
                <p className="text-[11px] text-slate-400 font-medium">Định hướng tư duy từng bước</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              Bạn đang gặp khó khăn khi làm bài tập hoặc chưa hiểu trực giác của phép rút gọn phân số?
            </p>

            <button
              onClick={onOpenAiChat}
              className="w-full py-3 rounded-full bg-[#14BF96] hover:bg-[#0FA882] active:scale-[0.98] text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <BrainCircuit className="w-4 h-4" />
              <span>Hỏi Trợ Lý AI gợi mở</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
