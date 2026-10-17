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
  Trash2
} from "lucide-react";
import { PlyrVideoPlayer, PlyrPlayerHandle } from "@/components/PlyrVideoPlayer";
import { useBookmarks } from "@/lib/bookmarks/BookmarksContext";
import { useAccessibility } from "@/lib/a11y/AccessibilityContext";

interface LessonRoomProps {
  currentLesson: Lesson;
  onBack: () => void;
  onOpenAiChat: () => void;
  onCompleteLesson: (lessonId: string) => void;
}

export const LessonRoom: React.FC<LessonRoomProps> = ({
  currentLesson: initialLesson,
  onBack,
  onOpenAiChat,
  onCompleteLesson,
}) => {
  const [activeLesson, setActiveLesson] = useState<Lesson>(initialLesson);
  const [activeTab, setActiveTab] = useState<'notes' | 'quiz'>('quiz');
  
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
  const lessonNotes = getNotesForLesson(activeLesson.id);

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    addNote(activeLesson.id, activeLesson.title, newNoteText.trim(), Math.floor(currentTime));
    setNewNoteText("");
  };

  // Mốc thời gian chương học (Mục 8.3 PDF)
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

  // 1. Heartbeat tiến độ xem video (Mục 8.4 trong PDF - gửi mỗi 10-15s)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying && playerRef.current) {
        const pos = Math.floor(playerRef.current.getCurrentTime());
        const dur = Math.floor(playerRef.current.getDuration() || activeLesson.durationSeconds || 600);
        api.updateLessonProgress(activeLesson.id, pos, dur, false);
        setSaveStatus(`Đã lưu tiến độ lúc ${formatTime(pos)}`);
        setTimeout(() => setSaveStatus(null), 3000);
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [isPlaying, activeLesson.id, activeLesson.durationSeconds]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // 2. Xử lý Quiz & Kiểm tra đáp án
  const handleSelectOption = (questionId: string, optionId: string) => {
    if (isAnswerSubmitted[questionId]) return;
    setSelectedOptions((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeLesson.quiz) return;
    const newSubmitted: Record<string, boolean> = {};
    let correctCount = 0;

    activeLesson.quiz.questions.forEach((q) => {
      newSubmitted[q.id] = true;
      const selected = selectedOptions[q.id];
      const correctOpt = q.options.find((o) => o.isCorrect);
      if (selected && correctOpt && selected === correctOpt.id) {
        correctCount++;
      }
    });

    setIsAnswerSubmitted(newSubmitted);
    const score = Math.round((correctCount / activeLesson.quiz.questions.length) * 100);
    setQuizScore(score);

    // Call live backend assessment if authenticated
    try {
      const answersPayload = Object.entries(selectedOptions).map(([qId, optId]) => ({
        questionId: qId,
        selectedAnswer: optId.replace('opt-', '').toUpperCase(),
      }));
      await api.submitQuiz(activeLesson.id, answersPayload);
      const pos = playerRef.current ? Math.floor(playerRef.current.getCurrentTime()) : 0;
      await api.updateLessonProgress(activeLesson.id, pos, duration, score >= activeLesson.quiz.passingScore);
    } catch {
      // Local state already updated
    }

    if (score >= activeLesson.quiz.passingScore) {
      // Bắn pháo hoa ăn mừng chuẩn Khan Academy
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
    <div className="space-y-6 pb-16">
      {/* Top Nav: Back button & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Quay lại danh mục</span>
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span>Toán Lớp 5</span>
              <ChevronRight className="w-3 h-3" />
              <span>Chương 1</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-1">
              {activeLesson.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {saveStatus && (
            <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full animate-fade">
              {saveStatus}
            </span>
          )}
          <button
            onClick={() => toggleBookmark({ id: activeLesson.id, title: activeLesson.title })}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 text-xs font-bold cursor-pointer border ${
              isBookmarked(activeLesson.id)
                ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
            }`}
            title={isBookmarked(activeLesson.id) ? "Bỏ lưu bài học" : "Lưu vào danh sách cần xem lại"}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked(activeLesson.id) ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span>{isBookmarked(activeLesson.id) ? 'Đã lưu bài học' : 'Lưu xem lại'}</span>
          </button>

          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
            masteryState === 'MASTERED' ? 'bg-emerald-100 text-emerald-700' :
            masteryState === 'PROFICIENT' ? 'bg-blue-100 text-blue-700' :
            'bg-amber-100 text-amber-700'
          }`}>
            {masteryState === 'MASTERED' ? 'Đã Tinh Thông 🏆' :
             masteryState === 'PROFICIENT' ? 'Thành Thạo ⚡' : 'Đang Làm Quen 💡'}
          </span>
        </div>
      </div>

      {/* Main Grid: Video + Side Lessons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Video Player & Interactive Tabs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trình phát video Plyr hiện đại (https://www.plyrjs.com) */}
          <PlyrVideoPlayer
            ref={playerRef}
            src={activeLesson.videoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
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
              api.updateLessonProgress(activeLesson.id, Math.floor(duration), Math.floor(duration), true);
            }}
          />

          {/* Chapter Timeline Markers Bar (Mục 8.3 PDF) */}
          <div className="bg-slate-900 text-white p-3 rounded-2xl flex items-center gap-2 overflow-x-auto text-xs no-scrollbar shadow-sm border border-slate-800">
            <span className="text-slate-400 font-bold shrink-0 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#1865F2]" /> Chương học:
            </span>
            {CHAPTERS.map((ch, idx) => (
              <button
                key={idx}
                onClick={() => jumpToChapter(ch.time)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-medium transition shrink-0 cursor-pointer ${
                  currentTime >= ch.time && (idx === CHAPTERS.length - 1 || currentTime < CHAPTERS[idx + 1].time)
                    ? 'bg-[#1865F2] text-white font-bold shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-slate-300'
                }`}
              >
                {ch.title}
              </button>
            ))}
          </div>

          {/* Interactive Learning Tabs */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="flex border-b border-slate-200 bg-slate-50/50">
              <button
                onClick={() => setActiveTab('quiz')}
                className={`flex-1 py-3.5 px-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition ${
                  activeTab === 'quiz'
                    ? 'border-[#14BF96] text-[#0B2147] bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <HelpCircle className="w-4 h-4 text-[#14BF96]" />
                <span>Bài tập thực hành ({activeLesson.quiz?.questions.length || 0} câu)</span>
              </button>

              <button
                onClick={() => setActiveTab('notes')}
                className={`flex-1 py-3.5 px-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition ${
                  activeTab === 'notes'
                    ? 'border-[#14BF96] text-[#0B2147] bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Tóm tắt lý thuyết & Ghi chú</span>
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'quiz' ? (
                <div className="space-y-6">
                  {activeLesson.quiz ? (
                    <>
                      <div className="space-y-6">
                        {activeLesson.quiz.questions.map((q, idx) => {
                          const isSubmitted = isAnswerSubmitted[q.id];
                          const selected = selectedOptions[q.id];

                          return (
                            <div key={q.id} className="p-5 rounded-xl border border-slate-200 space-y-4 bg-slate-50/30">
                              <div className="flex items-start justify-between gap-4">
                                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                                  Câu {idx + 1}: {q.questionText}
                                </h3>
                                <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                  {q.points} điểm
                                </span>
                              </div>

                              {/* Options */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {q.options.map((opt) => {
                                  const isSelected = selected === opt.id;
                                  let optionClass = "border-slate-200 bg-white hover:border-[#14BF96]/50 text-slate-700";

                                  if (isSubmitted) {
                                    if (opt.isCorrect) {
                                      optionClass = "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold";
                                    } else if (isSelected && !opt.isCorrect) {
                                      optionClass = "border-rose-400 bg-rose-50 text-rose-800";
                                    }
                                  } else if (isSelected) {
                                    optionClass = "border-[#14BF96] bg-[#14BF96]/10 text-[#0B2147] font-bold ring-2 ring-[#14BF96]";
                                  }

                                  return (
                                    <button
                                      key={opt.id}
                                      onClick={() => handleSelectOption(q.id, opt.id)}
                                      className={`p-3.5 rounded-xl border text-left text-sm transition flex items-center justify-between cursor-pointer ${optionClass}`}
                                    >
                                      <span>{opt.text}</span>
                                      {isSubmitted && opt.isCorrect && (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Pedagogical Explanation */}
                              {isSubmitted && (
                                <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                                  <p className="font-bold flex items-center gap-1.5">
                                    <Lightbulb className="w-4 h-4 text-amber-500" />
                                    Giải thích chi tiết:
                                  </p>
                                  <p className="leading-relaxed">{q.explanation}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Quiz Submit & Results */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                        {quizScore !== null ? (
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-slate-700">
                              Kết quả: {quizScore}/100 điểm
                            </span>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                              quizScore >= activeLesson.quiz.passingScore 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {quizScore >= activeLesson.quiz.passingScore ? "Đạt chuẩn Tinh Thông! 🎉" : "Cần rèn luyện thêm"}
                            </span>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-500">
                            Hãy chọn đáp án và bấm kiểm tra để nâng mức thành thạo kỹ năng.
                          </div>
                        )}

                        <div className="flex items-center gap-3">
                          <button
                            onClick={onOpenAiChat}
                            className="khan-btn-secondary text-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Hỏi Gia sư AI gợi ý</span>
                          </button>

                          <button
                            onClick={handleSubmitQuiz}
                            className="khan-btn-primary text-xs px-6 py-2.5 cursor-pointer"
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
              ) : (
                /* Tab Notes & Personal Bookmarks */
                <div className="space-y-6 text-slate-700 text-sm leading-relaxed">
                  {/* Trọng tâm kiến thức */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center justify-between">
                      <span>Trọng tâm kiến thức: {activeLesson.title}</span>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-[#1865F2]">
                        GDPT 2018
                      </span>
                    </h3>
                    <div className="p-4 bg-blue-50/60 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/60 space-y-2 text-xs text-blue-900 dark:text-blue-200">
                      <p className="font-bold">Quy tắc vàng cần ghi nhớ:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Tử số chỉ số phần được lấy ra hoặc đề cập đến.</li>
                        <li>Mẫu số chỉ tổng số phần bằng nhau được chia ra từ một đơn vị (mẫu số luôn khác 0).</li>
                        <li>Phân số có tử số nhỏ hơn mẫu số luôn bé hơn 1. Phân số có tử lớn hơn mẫu luôn lớn hơn 1.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Sổ tay ghi chú cá nhân */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#1865F2]" />
                        <span>Sổ tay ghi chú cá nhân của em ({lessonNotes.length})</span>
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        Lưu tự động & đồng bộ đám mây
                      </span>
                    </div>

                    {/* New Note Form */}
                    <form onSubmit={handleSaveNote} className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-600 dark:text-slate-300">
                          Thêm ghi chú mới:
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900 text-[#1865F2] dark:text-blue-300 font-mono text-[10px] font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Mốc video: {formatTime(Math.floor(currentTime))}
                        </span>
                      </div>
                      <textarea
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        placeholder="Nhập ghi chú hoặc công thức quan trọng em vừa nghe thấy trong video..."
                        rows={2}
                        className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-[#1865F2]"
                      />
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={!newNoteText.trim()}
                          className="px-4 py-1.5 rounded-lg bg-[#1865F2] hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Lưu ghi chú này</span>
                        </button>
                      </div>
                    </form>

                    {/* Saved Notes List */}
                    <div className="space-y-2">
                      {lessonNotes.map((note) => (
                        <div
                          key={note.id}
                          className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1 flex-1">
                            {typeof note.timestampSeconds === "number" && (
                              <button
                                onClick={() => jumpToChapter(note.timestampSeconds!)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-[#1865F2] dark:text-blue-300 font-mono text-[10px] font-bold hover:underline cursor-pointer"
                                title="Nhấp để phát video từ mốc này"
                              >
                                <Play className="w-2.5 h-2.5 fill-current" />
                                <span>{formatTime(note.timestampSeconds)}</span>
                              </button>
                            )}
                            <p className="text-slate-800 dark:text-slate-200 font-medium">
                              {note.content}
                            </p>
                            <span className="text-[10px] text-slate-400 block">{note.createdAt}</span>
                          </div>

                          <button
                            onClick={() => deleteNote(note.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer"
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
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Curriculum Progress Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center justify-between">
              <span>Nội dung chương 1</span>
              <span className="text-xs font-normal text-slate-500">
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
                    className={`p-3 rounded-xl border text-xs transition cursor-pointer flex items-center justify-between gap-3 ${
                      isActive
                        ? 'border-[#14BF96] bg-[#14BF96]/5 text-[#0B2147] font-bold shadow-xs'
                        : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        {les.isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Play className="w-3 h-3 fill-slate-400 text-slate-400 ml-0.5" />
                        )}
                      </div>
                      <span className="line-clamp-1">{les.title}</span>
                    </div>

                    <span className="text-[10px] text-slate-400 shrink-0">
                      {Math.floor(les.durationSeconds / 60)}p
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Socratic AI Tutor Floating Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <div className="w-7 h-7 rounded-lg bg-[#14BF96] flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span>Gia Sư AI Học Tập</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn đang gặp khó khăn khi làm bài tập hoặc chưa hiểu một khái niệm trong video?
            </p>
            <button
              onClick={onOpenAiChat}
              className="w-full khan-btn-primary text-xs py-2.5 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Mở Trợ lý AI gợi mở</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
