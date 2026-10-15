"use client";

import React, { useState, useRef, useEffect } from "react";
import { Lesson, Course } from "@/types";
import { MOCK_COURSE, MOCK_LESSONS } from "@/lib/mock-data";
import confetti from "canvas-confetti";
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Maximize, 
  CheckCircle2, 
  HelpCircle, 
  FileText, 
  Sparkles, 
  Award,
  Clock,
  Send,
  ChevronRight,
  Lightbulb
} from "lucide-react";

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
  
  // Video Player States
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(activeLesson.positionSeconds || 0);
  const [duration, setDuration] = useState(activeLesson.durationSeconds || 600);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Quiz States
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<Record<string, boolean>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [masteryState, setMasteryState] = useState(activeLesson.masteryLevel);

  // 1. Heartbeat tiến độ xem video (Mục 8.4 trong PDF - gửi mỗi 10-15s)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying && videoRef.current) {
        const pos = Math.floor(videoRef.current.currentTime);
        setSaveStatus(`Đã lưu tiến độ lúc ${formatTime(pos)}`);
        setTimeout(() => setSaveStatus(null), 3000);
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skipTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.currentTime + seconds, duration));
    }
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || activeLesson.durationSeconds);
      if (activeLesson.positionSeconds > 0) {
        videoRef.current.currentTime = activeLesson.positionSeconds;
      }
    }
  };

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

  const handleSubmitQuiz = () => {
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
          {/* Khan-style Video Player */}
          <div className="bg-black rounded-2xl overflow-hidden shadow-xl border border-slate-800 relative group">
            <video
              ref={videoRef}
              src={activeLesson.videoUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              className="w-full aspect-video object-cover cursor-pointer"
              onClick={togglePlay}
            />

            {/* Custom Control Overlay */}
            <div className="p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent space-y-2 text-white">
              {/* Timeline Scrubber */}
              <div className="relative w-full h-1.5 bg-white/20 rounded-full cursor-pointer hover:h-2 transition-all">
                <div
                  className="h-full bg-[#14BF96] rounded-full relative"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow" />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                {/* Left Controls */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition text-white"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                  </button>

                  <button onClick={() => skipTime(-10)} className="hover:text-[#14BF96] transition" title="Lùi 10 giây">
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button onClick={() => skipTime(10)} className="hover:text-[#14BF96] transition" title="Tiến 10 giây">
                    <RotateCw className="w-4 h-4" />
                  </button>

                  <div className="text-slate-300 font-medium text-xs ml-1">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>

                {/* Right Controls: Speed, Volume, Fullscreen */}
                <div className="flex items-center gap-3">
                  {/* Speed Selector */}
                  <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded text-[11px] font-semibold">
                    {[0.75, 1, 1.25, 1.5].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => handleRateChange(rate)}
                        className={`px-1 rounded ${playbackRate === rate ? 'text-[#14BF96] font-bold' : 'text-slate-300'}`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.muted = !isMuted;
                        setIsMuted(!isMuted);
                      }
                    }}
                    className="hover:text-[#14BF96] transition"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        if (document.fullscreenElement) {
                          document.exitFullscreen();
                        } else {
                          videoRef.current.requestFullscreen();
                        }
                      }
                    }}
                    className="hover:text-[#14BF96] transition"
                  >
                    <Maximize className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
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
                /* Tab Notes */
                <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
                  <h3 className="font-bold text-base text-slate-900">
                    Trọng tâm kiến thức: {activeLesson.title}
                  </h3>
                  <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 space-y-2 text-xs text-blue-900">
                    <p className="font-bold">Quy tắc vàng cần ghi nhớ:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Tử số chỉ số phần được lấy ra hoặc đề cập đến.</li>
                      <li>Mẫu số chỉ tổng số phần bằng nhau được chia ra từ một đơn vị (mẫu số luôn khác 0).</li>
                      <li>Phân số có tử số nhỏ hơn mẫu số luôn bé hơn 1. Phân số có tử lớn hơn mẫu luôn lớn hơn 1.</li>
                    </ul>
                  </div>
                  <p className="text-xs text-slate-600">
                    {activeLesson.description}
                  </p>
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
