"use client";

import React, { useState } from "react";
import { User } from "@/types";
import {
  GraduationCap,
  Users,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  PlusCircle,
  Send,
  Flame,
  Award,
  BookOpen,
  Calendar,
  Search,
  Filter,
  Download,
  Clock,
  Sparkles,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

interface TeacherWorkspaceProps {
  currentUser?: User;
  onSelectStudent?: (studentId: string) => void;
}

interface StudentRecord {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  completedLessons: number;
  totalLessons: number;
  avgQuizScore: number;
  streakDays: number;
  masteryStatus: "MASTERED" | "PROFICIENT" | "NEEDS_HELP";
  lastActive: string;
  parentLinked: boolean;
}

interface HomeworkAssignment {
  id: string;
  title: string;
  subject: string;
  className: string;
  dueDate: string;
  assignedCount: number;
  submittedCount: number;
  avgScore: number;
}

const INITIAL_CLASSES = [
  { id: "c-5a1", name: "Lớp 5A1", grade: "Khối 5 (Tiểu Học)", subject: "Toán Học & Khoa Học", studentCount: 32 },
  { id: "c-10a1", name: "Lớp 10A1", grade: "Khối 10 (THPT)", subject: "Toán Đại Số & Hình Học", studentCount: 38 },
  { id: "c-10a2", name: "Lớp 10A2", grade: "Khối 10 (THPT)", subject: "Vật Lý 10 (Cơ Học)", studentCount: 36 },
];

const INITIAL_STUDENTS: StudentRecord[] = [
  {
    id: "std-01",
    name: "Trần Văn An",
    username: "student_an",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=an",
    completedLessons: 12,
    totalLessons: 12,
    avgQuizScore: 9.8,
    streakDays: 7,
    masteryStatus: "MASTERED",
    lastActive: "10 phút trước",
    parentLinked: true,
  },
  {
    id: "std-02",
    name: "Lê Bảo Ngọc",
    username: "ngoc_le",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=ngoc",
    completedLessons: 11,
    totalLessons: 12,
    avgQuizScore: 9.2,
    streakDays: 9,
    masteryStatus: "MASTERED",
    lastActive: "1 giờ trước",
    parentLinked: true,
  },
  {
    id: "std-03",
    name: "Nguyễn Minh Tuấn",
    username: "tuan_minh",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=tuan",
    completedLessons: 9,
    totalLessons: 12,
    avgQuizScore: 8.4,
    streakDays: 5,
    masteryStatus: "PROFICIENT",
    lastActive: "3 giờ trước",
    parentLinked: true,
  },
  {
    id: "std-04",
    name: "Phạm Hải Đăng",
    username: "dang_hai",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=dang",
    completedLessons: 5,
    totalLessons: 12,
    avgQuizScore: 6.2,
    streakDays: 1,
    masteryStatus: "NEEDS_HELP",
    lastActive: "Hôm qua",
    parentLinked: false,
  },
  {
    id: "std-05",
    name: "Hoàng Thục Quyên",
    username: "quyen_hoang",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=quyen",
    completedLessons: 10,
    totalLessons: 12,
    avgQuizScore: 8.9,
    streakDays: 4,
    masteryStatus: "PROFICIENT",
    lastActive: "2 giờ trước",
    parentLinked: true,
  },
  {
    id: "std-06",
    name: "Đặng Quốc Hưng",
    username: "hung_dang",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=hung",
    completedLessons: 6,
    totalLessons: 12,
    avgQuizScore: 5.8,
    streakDays: 2,
    masteryStatus: "NEEDS_HELP",
    lastActive: "Hôm qua",
    parentLinked: true,
  },
];

const INITIAL_ASSIGNMENTS: HomeworkAssignment[] = [
  {
    id: "hw-01",
    title: "Bài tập 15 phút: Rút gọn phân số & Phép chia số thập phân",
    subject: "Toán Học Lớp 5",
    className: "Lớp 5A1",
    dueDate: "23:59 - 12/11/2026",
    assignedCount: 32,
    submittedCount: 28,
    avgScore: 8.7,
  },
  {
    id: "hw-02",
    title: "Luyện tập cuối tuần: Các dạng toán chuyển động đều",
    subject: "Toán Học Lớp 5",
    className: "Lớp 5A1",
    dueDate: "23:59 - 15/11/2026",
    assignedCount: 32,
    submittedCount: 19,
    avgScore: 8.1,
  },
];

export const TeacherWorkspace: React.FC<TeacherWorkspaceProps> = ({
  currentUser,
}) => {
  const [selectedClassId, setSelectedClassId] = useState("c-5a1");
  const [students, setStudents] = useState<StudentRecord[]>(INITIAL_STUDENTS);
  const [assignments, setAssignments] = useState<HomeworkAssignment[]>(INITIAL_ASSIGNMENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "MASTERED" | "PROFICIENT" | "NEEDS_HELP">("ALL");

  // Notifications / feedback modal states
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDueDate, setNewDueDate] = useState("2026-11-15");
  const [newPassingScore, setNewPassingScore] = useState(80);

  // Message modal state
  const [messageStudent, setMessageStudent] = useState<StudentRecord | null>(null);
  const [messageText, setMessageText] = useState("");

  const activeClass = INITIAL_CLASSES.find((c) => c.id === selectedClassId) || INITIAL_CLASSES[0];

  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "ALL" || s.masteryStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSendReminderAll = () => {
    setFeedbackToast("Đã gửi thông báo nhắc nhở làm bài tập về nhà tới 13 học sinh chưa hoàn thành qua ứng dụng và email phụ huynh!");
    setTimeout(() => setFeedbackToast(null), 4500);
  };

  const handleExportGradebookCsv = () => {
    const headers = "ID,Ho Va Ten,Tai Khoan,So Bai Da Hoc,Tong So Bai,Diem Quiz TB,Chuoi Ngay,Trang Thai,Lan Hoat Dong Cuoi\n";
    const rows = students
      .map(
        (s) =>
          `"${s.id}","${s.name}","${s.username}","${s.completedLessons}","${s.totalLessons}","${s.avgQuizScore}","${s.streakDays}","${s.masteryStatus}","${s.lastActive}"`
      )
      .join("\n");
    const blob = new Blob(["\uFEFF" + headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Bang_Diem_${activeClass.name.replace(/\s+/g, "_")}_DMKLab.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setFeedbackToast(`Đã xuất bảng điểm ${activeClass.name} thành công dưới dạng CSV!`);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newHw: HomeworkAssignment = {
      id: `hw-${Date.now()}`,
      title: newTitle.trim(),
      subject: activeClass.subject,
      className: activeClass.name,
      dueDate: `23:59 - ${newDueDate}`,
      assignedCount: activeClass.studentCount,
      submittedCount: 0,
      avgScore: 0,
    };

    setAssignments([newHw, ...assignments]);
    setIsAssignModalOpen(false);
    setNewTitle("");
    setFeedbackToast(`Đã giao bài tập mới thành công cho toàn thể ${activeClass.studentCount} học sinh ${activeClass.name}!`);
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  const handleSendMessageToStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageStudent || !messageText.trim()) return;

    setFeedbackToast(`Đã gửi nhận xét tới học sinh ${messageStudent.name} và phụ huynh liên kết thành công!`);
    setMessageStudent(null);
    setMessageText("");
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 text-xs text-slate-800">
      {/* Header & Class Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded text-[10px] uppercase">
              Không Gian Sư Phạm K-12
            </span>
            <span className="text-slate-400 font-medium">Hệ thống Quản lý Giảng dạy & Lớp học</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-[#1865F2]" />
            Bảng Điều Khiển Giáo Viên (Teacher Workspace)
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Giáo viên phụ trách: <span className="font-bold text-slate-800">{currentUser?.fullName || "Cô Nguyễn Thị Mai"}</span> · Bộ môn: {activeClass.subject}
          </p>
        </div>

        {/* Class Selection & Primary Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#1865F2] outline-none"
          >
            {INITIAL_CLASSES.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} ({cls.studentCount} học sinh) - {cls.grade}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="bg-[#1865F2] hover:bg-[#1557D0] text-white font-extrabold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Giao Bài Mới</span>
          </button>

          <button
            onClick={handleExportGradebookCsv}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Xuất Sổ Điểm CSV</span>
          </button>
        </div>
      </div>

      {/* Toast alert */}
      {feedbackToast && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-between animate-fade">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackToast}</span>
          </div>
          <button onClick={() => setFeedbackToast(null)} className="text-emerald-600 hover:text-emerald-900 font-black">
            ✕
          </button>
        </div>
      )}

      {/* 4 KPIs Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-slate-500 font-bold text-[11px]">
            <span>Sĩ số {activeClass.name}</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{activeClass.studentCount} học sinh</p>
          <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 100% đã kích hoạt tài khoản
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-slate-500 font-bold text-[11px]">
            <span>Tỷ lệ hoàn thành tuần</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-blue-600">87.5%</p>
          <p className="text-[10px] text-slate-500 font-medium">+6.2% so với tuần trước</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-slate-500 font-bold text-[11px]">
            <span>Điểm trắc nghiệm TB</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600">8.8 / 10</p>
          <p className="text-[10px] text-emerald-700 font-bold">Chuẩn Tinh Thông Quốc Gia</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-slate-500 font-bold text-[11px]">
            <span>Cần trợ giảng AI kèm</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600">2 học sinh</p>
          <p className="text-[10px] text-rose-700 font-bold">Điểm dưới 6.5 (Cần phụ đạo)</p>
        </div>
      </div>

      {/* Active Assignments Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#1865F2]" />
            Bài Tập Về Nhà & Đề Kiểm Tra 15 Phút Đang Mở
          </h3>
          <span className="text-slate-400 text-[11px] font-medium">{assignments.length} nhiệm vụ đang giao</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map((hw) => (
            <div key={hw.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-800">
                    {hw.subject}
                  </span>
                  <h4 className="font-bold text-slate-900 text-xs mt-1.5">{hw.title}</h4>
                </div>
                <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1 shrink-0">
                  <Clock className="w-3 h-3" />
                  {hw.dueDate}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span>Tiến độ nộp bài:</span>
                  <span className="font-bold text-slate-900">
                    {hw.submittedCount} / {hw.assignedCount} học sinh ({Math.round((hw.submittedCount / hw.assignedCount) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#1865F2] h-full rounded-full transition-all duration-500"
                    style={{ width: `${(hw.submittedCount / hw.assignedCount) * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px]">
                <span className="text-slate-500">
                  Điểm TB bài nộp: <strong className="text-emerald-600">{hw.avgScore > 0 ? `${hw.avgScore} / 10` : "Chưa có bài nộp"}</strong>
                </span>
                <button
                  onClick={handleSendReminderAll}
                  className="text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Nhắc học sinh chưa nộp</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Student Roster Table & Search/Filter */}
      <div className="border border-slate-200 rounded-xl overflow-hidden space-y-0">
        <div className="p-3.5 bg-slate-100 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-slate-600" />
            <h3 className="font-extrabold text-slate-900 text-xs">Sổ Điểm & Theo Dõi Tinh Thông Từng Học Sinh</h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm học sinh theo tên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 outline-none focus:ring-1 focus:ring-blue-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            {/* Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="py-1.5 px-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 outline-none"
            >
              <option value="ALL">Tất cả mức độ</option>
              <option value="MASTERED">Tinh Thông (Mastered)</option>
              <option value="PROFICIENT">Thành Thạo</option>
              <option value="NEEDS_HELP">Cần Phụ Đạo</option>
            </select>

            <button
              onClick={handleSendReminderAll}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer transition"
            >
              Nhắc Học Cả Lớp
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Học Sinh</th>
                <th className="p-3">Tiến Độ Bài Học</th>
                <th className="p-3">Điểm Quiz TB</th>
                <th className="p-3">Chuỗi Ngày Học</th>
                <th className="p-3">Mức Tinh Thông</th>
                <th className="p-3">Phụ Huynh</th>
                <th className="p-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredStudents.map((std) => (
                <tr key={std.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3 font-bold text-slate-900 flex items-center gap-2.5">
                    <img src={std.avatarUrl} alt="" className="w-7 h-7 rounded-full bg-slate-100" />
                    <div>
                      <p className="font-extrabold text-slate-900">{std.name}</p>
                      <p className="text-[10px] text-slate-400 font-normal">@{std.username} · Hoạt động {std.lastActive}</p>
                    </div>
                  </td>

                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-[#1865F2] h-full rounded-full"
                          style={{ width: `${(std.completedLessons / std.totalLessons) * 100}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-800 text-[11px]">
                        {std.completedLessons}/{std.totalLessons} bài ({Math.round((std.completedLessons / std.totalLessons) * 100)}%)
                      </span>
                    </div>
                  </td>

                  <td className="p-3 font-extrabold">
                    <span className={std.avgQuizScore >= 8.5 ? "text-emerald-600" : std.avgQuizScore >= 7 ? "text-blue-600" : "text-rose-600"}>
                      {std.avgQuizScore} / 10
                    </span>
                  </td>

                  <td className="p-3 font-bold text-amber-600 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{std.streakDays} ngày</span>
                  </td>

                  <td className="p-3">
                    {std.masteryStatus === "MASTERED" && (
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                        Tinh Thông (Mastered)
                      </span>
                    )}
                    {std.masteryStatus === "PROFICIENT" && (
                      <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-[10px]">
                        Thành Thạo
                      </span>
                    )}
                    {std.masteryStatus === "NEEDS_HELP" && (
                      <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded text-[10px]">
                        Cần Phụ Đạo
                      </span>
                    )}
                  </td>

                  <td className="p-3">
                    {std.parentLinked ? (
                      <span className="text-emerald-600 font-bold text-[10px] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Đã kết nối
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium text-[10px]">Chưa kết nối</span>
                    )}
                  </td>

                  <td className="p-3 text-right">
                    <button
                      onClick={() => setMessageStudent(std)}
                      className="text-[#1865F2] hover:text-[#1557D0] font-bold text-[11px] hover:underline cursor-pointer flex items-center gap-1 ml-auto"
                    >
                      <Send className="w-3 h-3" />
                      <span>Gửi lời nhắn</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Giao Bài Tập Mới */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-[#1865F2]" />
                Giao Bài Tập & Kiểm Tra Mới ({activeClass.name})
              </h3>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiêu đề bài tập / Kiểm tra:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Ôn tập 15 phút: Bất phương trình bậc nhất hai ẩn"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#1865F2] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hạn nộp bài:</label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#1865F2] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Điểm đạt chuẩn (%):</label>
                  <input
                    type="number"
                    min={50}
                    max={100}
                    value={newPassingScore}
                    onChange={(e) => setNewPassingScore(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#1865F2] outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 space-y-1 text-[11px]">
                <p className="font-bold">🎯 Chế độ giao bài tự động K-12:</p>
                <p>Học sinh sẽ nhận thông báo trên bảng điều khiển và bot Gia Sư Socratic AI sẽ sẵn sàng gợi ý từng bước nếu học sinh gặp bế tắc khi làm bài tập này.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1865F2] hover:bg-[#1557D0] text-white font-extrabold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Xác nhận giao bài</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Gửi Lời Nhắn Học Sinh */}
      {messageStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Send className="w-4 h-4 text-[#1865F2]" />
                Gửi Lời Nhắn / Nhận Xét Sư Phạm
              </h3>
              <button onClick={() => setMessageStudent(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <img src={messageStudent.avatarUrl} alt="" className="w-10 h-10 rounded-full" />
              <div>
                <p className="font-bold text-slate-900 text-xs">{messageStudent.name}</p>
                <p className="text-[11px] text-slate-500">
                  Lớp: {activeClass.name} · Điểm TB: <strong className="text-emerald-600">{messageStudent.avgQuizScore}/10</strong>
                </p>
              </div>
            </div>

            <form onSubmit={handleSendMessageToStudent} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nội dung nhận xét & động viên:</label>
                <textarea
                  rows={4}
                  required
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Ví dụ: Thầy/Cô khen em đã nắm rất tốt phần rút gọn phân số! Hãy cố gắng duy trì chuỗi học 7 ngày này nhé."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#1865F2] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMessageStudent(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1865F2] hover:bg-[#1557D0] text-white font-extrabold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi tin nhắn</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

