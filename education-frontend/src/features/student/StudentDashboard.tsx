"use client";

import React from "react";
import { User, Grade, Subject, Lesson } from "@/types";
import { MOCK_SUBJECTS, MOCK_COURSE, MOCK_LESSONS } from "@/lib/mock-data";
import {
  Play,
  Award,
  CheckCircle2,
  ArrowRight,
  Calculator,
  Atom,
  BookOpen,
  Globe,
  Compass,
  Sparkles,
  Flame,
  Clock,
  Target,
} from "lucide-react";

interface StudentDashboardProps {
  currentUser: User;
  selectedGrade: Grade;
  onOpenLesson: (lesson: Lesson) => void;
  onOpenAiChat: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  selectedGrade,
  onOpenLesson,
  onOpenAiChat,
}) => {
  // Lesson to resume (Bài học đang dở dang)
  const currentLesson = MOCK_LESSONS[1]; // Bài 2: Quy đồng mẫu số

  const getSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case "Calculator":
        return <Calculator className="w-6 h-6" />;
      case "Atom":
        return <Atom className="w-6 h-6" />;
      case "BookOpen":
        return <BookOpen className="w-6 h-6" />;
      case "Globe":
        return <Globe className="w-6 h-6" />;
      default:
        return <Compass className="w-6 h-6" />;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Welcome & Khan-style Hero Banner */}
      <div className="bg-gradient-to-r from-[#0B2147] to-[#182B49] text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#14BF96_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-2xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#14BF96] text-xs font-bold border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mục tiêu tuần này: Hoàn thành 4 kỹ năng toán học</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Chào mừng trở lại, {currentUser.fullName}!
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Học từng bước một với các video bài giảng ngắn gọn và bài tập thực hành theo phương pháp
            gợi mở.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/5">
              <Flame className="w-4 h-4 text-[#FFC700] fill-[#FFC700]" />
              <span>Chuỗi {currentUser.streakDays} ngày học chăm chỉ</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/5">
              <Award className="w-4 h-4 text-[#14BF96]" />
              <span>{currentUser.energyPoints.toLocaleString()} Điểm năng lượng</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Tiếp Tục Bài Học Đang Học (Resume Learning Card) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-slate-300 transition space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#14BF96] animate-pulse" />
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Tiếp tục bài giảng gần nhất
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Đang ở phút 3:00 / 10:53
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-100 text-blue-700">
                Toán học · Lớp 5
              </span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                Cấp độ: Đang thành thạo (Proficient)
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">{currentLesson.title}</h3>
            <p className="text-xs sm:text-sm text-slate-600 line-clamp-1">
              {currentLesson.description}
            </p>

            {/* Progress Bar */}
            <div className="pt-2 space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-500">
                <span>Tiến độ bài học</span>
                <span>65%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#14BF96] rounded-full transition-all duration-500"
                  style={{ width: "65%" }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenLesson(currentLesson)}
              className="khan-btn-primary flex items-center gap-2 text-sm px-6 py-3 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Học tiếp ngay</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Danh Mục Môn Học Theo Khối Lớp Đang Chọn */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Môn học trọng tâm · {selectedGrade.name}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chương trình chuẩn hóa K-12 kết hợp luyện tập từng kỹ năng
            </p>
          </div>

          {/* Khan Mastery Levels Legend */}
          <div className="hidden lg:flex items-center gap-4 text-xs font-medium text-slate-500 bg-slate-100/80 px-3 py-1.5 rounded-xl">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Chưa học
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Làm quen
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Thành thạo
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#14BF96]" /> Tinh thông
            </span>
          </div>
        </div>

        {/* Grid Subjects */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MOCK_SUBJECTS.map((sub) => {
            const percent = Math.round((sub.completedLessons / sub.totalLessons) * 100);
            return (
              <div
                key={sub.id}
                onClick={() => onOpenLesson(MOCK_LESSONS[0])}
                className="khan-card p-5 cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105"
                      style={{ backgroundColor: sub.color }}
                    >
                      {getSubjectIcon(sub.icon)}
                    </div>
                    <span className="text-xs font-bold text-slate-400 group-hover:text-[#14BF96] flex items-center gap-1 transition">
                      Khám phá <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-[#14BF96] transition">
                      {sub.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {sub.completedLessons} / {sub.totalLessons} bài học hoàn thành
                    </p>
                  </div>
                </div>

                <div className="pt-4 space-y-2 border-t border-slate-100 mt-4">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Độ thành thạo</span>
                    <span className="text-slate-900 font-bold">{percent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: sub.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Cây Chương Trình Học Mẫu (Curriculum Tree) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#14BF96]" />
              {MOCK_COURSE.title}
            </h2>
            <p className="text-xs text-slate-500 mt-1">{MOCK_COURSE.description}</p>
          </div>
        </div>

        <div className="space-y-4">
          {MOCK_COURSE.chapters.map((chapter) => (
            <div key={chapter.id} className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 font-bold text-sm text-slate-800 border-b border-slate-200 flex items-center justify-between">
                <span>{chapter.title}</span>
                <span className="text-xs font-normal text-slate-500">
                  {chapter.lessons.length} bài giảng & thực hành
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {chapter.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    onClick={() => onOpenLesson(lesson)}
                    className="p-4 hover:bg-slate-50/80 transition flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                        {lesson.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Play className="w-4 h-4 fill-slate-500 text-slate-500 ml-0.5" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 hover:text-[#14BF96] transition">
                          {lesson.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          Video · {Math.floor(lesson.durationSeconds / 60)} phút ·{" "}
                          {lesson.quiz ? "Có bài kiểm tra quiz" : "Lý thuyết"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          lesson.masteryLevel === "MASTERED"
                            ? "bg-emerald-100 text-emerald-700"
                            : lesson.masteryLevel === "PROFICIENT"
                              ? "bg-blue-100 text-blue-700"
                              : lesson.masteryLevel === "FAMILIAR"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {lesson.masteryLevel === "MASTERED"
                          ? "Tinh thông 🏆"
                          : lesson.masteryLevel === "PROFICIENT"
                            ? "Thành thạo ⚡"
                            : lesson.masteryLevel === "FAMILIAR"
                              ? "Làm quen 💡"
                              : "Chưa học"}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
