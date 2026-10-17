"use client";

import React, { useState, useEffect } from "react";
import { User, MediaAsset } from "@/types";
import { MOCK_MEDIA_ASSETS } from "@/lib/mock-data";
import { api, AdminOverviewReport, AdminUserItem, BackendAuditLog } from "@/lib/api";
import { 
  Users, 
  Video, 
  BookOpen, 
  Activity, 
  ShieldCheck, 
  Upload, 
  FileVideo, 
  Cpu, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Database,
  Search,
  DollarSign,
  Bot,
  Layers,
  ArrowUpRight,
  Send,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  GraduationCap,
  UserCheck,
  Plus,
  Trash2,
  Eye,
  Award,
  Flame,
  Check
} from "lucide-react";

interface AdminDashboardProps {
  currentUser: User;
  onExitAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onExitAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'media' | 'curriculum' | 'rbac' | 'teacher' | 'parent' | 'audit' | 'ai'>('overview');
  
  // Live Backend Data States
  const [overview, setOverview] = useState<AdminOverviewReport | null>(null);
  const [userList, setUserList] = useState<AdminUserItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<BackendAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // Content Management (Curriculum) States (Mục 5 PDF)
  const [managedLessons, setManagedLessons] = useState([
    {
      id: "l-01",
      title: "Bài 1: Khái niệm Phân số và Các tính chất cơ bản",
      grade: "Lớp 5",
      subject: "Toán học",
      durationSeconds: 720,
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      published: true,
      quizCount: 3,
    },
    {
      id: "l-02",
      title: "Bài 2: So sánh hai phân số khác mẫu số & Rút gọn",
      grade: "Lớp 5",
      subject: "Toán học",
      durationSeconds: 600,
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      published: true,
      quizCount: 2,
    },
    {
      id: "l-03",
      title: "Bài 3: Phép cộng và trừ hai phân số cùng mẫu số",
      grade: "Lớp 5",
      subject: "Toán học",
      durationSeconds: 540,
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      published: true,
      quizCount: 2,
    },
    {
      id: "l-04",
      title: "Bài 4: Hỗn số và các dạng bài toán thực tế K-12",
      grade: "Lớp 5",
      subject: "Toán học",
      durationSeconds: 800,
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      published: false,
      quizCount: 1,
    },
  ]);
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonGrade, setNewLessonGrade] = useState("Lớp 5");
  const [newLessonSubject, setNewLessonSubject] = useState("Toán học");
  const [newLessonDuration, setNewLessonDuration] = useState("12");
  const [newLessonUrl, setNewLessonUrl] = useState("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  const [selectedCurriculumGrade, setSelectedCurriculumGrade] = useState("Lớp 5");
  const [teacherReminderStatus, setTeacherReminderStatus] = useState<string | null>(null);

  // Media Upload State
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadedAsset, setUploadedAsset] = useState<any | null>(null);

  // Admin AI Chat State
  const [adminAiMessages, setAdminAiMessages] = useState<{ role: 'user' | 'assistant'; text: string; time: string }[]>([
    {
      role: 'assistant',
      text: 'Xin chào Quản trị viên! Tôi là Trợ lý AI Quản trị K-12. Tôi có thể hỗ trợ giải thích quy trình vận hành, chính sách bảo mật RBAC, hoặc hướng dẫn kiểm tra hiệu năng hệ thống.',
      time: '09:00',
    }
  ]);
  const [adminAiInput, setAdminAiInput] = useState("");
  const [isAdminAiTyping, setIsAdminAiTyping] = useState(false);

  // Load Initial Data from Live Backend
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [ovData, usersData, logsData] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminUsers(roleFilter, searchQuery),
        api.getAdminAuditLogs(),
      ]);

      if (ovData) setOverview(ovData);
      if (usersData && usersData.length > 0) setUserList(usersData);
      if (logsData && logsData.length > 0) setAuditLogs(logsData);
    } catch (e) {
      console.error("Lỗi tải dữ liệu admin:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [roleFilter]);

  // S3 Presigned URL Upload Simulation (Mục 8.2 & 7 trong PDF)
  const handleSimulatePresignedUpload = async () => {
    setUploadStatus("Đang gọi Spring Boot API /api/v1/admin/media/upload-url...");
    setUploadProgress(20);

    try {
      const result = await api.requestPresignedUploadUrl(
        "toan_lop_5_phan_so_nang_cao.mp4",
        "video/mp4",
        125000000
      );

      setTimeout(() => {
        setUploadStatus(`Đã nhận Presigned URL S3! Đang đẩy 125 MB thẳng lên Object Storage (bỏ qua Tomcat)...`);
        setUploadProgress(65);

        setTimeout(() => {
          setUploadStatus("Upload hoàn tất! Worker đang chuyển mã HLS Adaptive Multi-bitrate (480p-1080p)...");
          setUploadProgress(95);

          setTimeout(() => {
            setUploadProgress(100);
            setUploadedAsset(result);
            setUploadStatus("Video đã xử lý thành công và sẵn sàng phát trên CDN!");
            api.getAdminAuditLogs().then(setAuditLogs);
          }, 1000);
        }, 1200);
      }, 800);
    } catch {
      setUploadStatus("Lỗi cấp Presigned URL. Vui lòng kiểm tra lại dịch vụ backend.");
      setUploadProgress(null);
    }
  };

  // Toggle user active status (Mục 5 & 10.1 PDF)
  const handleToggleUser = async (userId: string, currentActive: boolean) => {
    try {
      const updated = await api.toggleUserStatus(userId, !currentActive);
      setUserList((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      const freshLogs = await api.getAdminAuditLogs();
      if (freshLogs.length > 0) setAuditLogs(freshLogs);
    } catch (err: any) {
      alert("Không thể thay đổi trạng thái: " + err.message);
    }
  };

  // Send message to Admin AI Assistant (Mục 9.2 PDF)
  const handleSendAdminAi = async (promptText?: string) => {
    const text = promptText || adminAiInput;
    if (!text.trim()) return;

    const userMsg = {
      role: 'user' as const,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setAdminAiMessages((prev) => [...prev, userMsg]);
    if (!promptText) setAdminAiInput("");
    setIsAdminAiTyping(true);

    try {
      const res = await api.sendAdminChat(text);
      if (res && res.reply) {
        setAdminAiMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: res.reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        setIsAdminAiTyping(false);
        return;
      }
    } catch {
      // Local fallback
    }

    setTimeout(() => {
      let reply = "Theo kiến trúc K-12: Mọi thao tác quản trị nhạy cảm (như thay đổi quyền, xóa nội dung) đều phải thông qua API nghiệp vụ có kiểm tra JWT Bearer và ghi nhận vào Audit Log.";
      if (text.includes("token") || text.includes("OpenAI")) {
        reply = "Cấu hình OpenAI Quota: Giới hạn 30 câu hỏi/ngày/học sinh được quản lý tại AiService. Quản trị viên có thể điều chỉnh qua biến môi trường OPENAI_DAILY_QUOTA_PER_STUDENT.";
      } else if (text.includes("quyền") || text.includes("thu hồi")) {
        reply = "Quy trình thu hồi quyền: Sử dụng tính năng Vô hiệu hóa tài khoản trong tab 'Người Dùng & Phân Quyền'. Hành động này sẽ lập tức chặn phiên làm việc và ghi vết kiểm toán.";
      }

      setAdminAiMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsAdminAiTyping(false);
    }, 700);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner Header */}
      <div className="bg-[#0B2147] text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-extrabold bg-[#14BF96] text-white uppercase tracking-wider">
              Cổng Quản Trị Hệ Thống (CMS)
            </span>
            <span className="text-xs text-slate-300">Modular Monolith Architecture · Spring Boot 3.3.4</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight mt-1">
            Trung Tâm Vận Hành & Quản Lý K–12
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Quản trị nội dung, media streaming HLS, phân quyền RBAC và kiểm soát chi phí AI.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={loadDashboardData}
            title="Làm mới dữ liệu từ Database"
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onExitAdmin}
            className="khan-btn-secondary text-xs cursor-pointer"
          >
            Quay lại giao diện Học sinh
          </button>
        </div>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-2 no-scrollbar text-xs font-bold">
        {[
          { key: 'overview', label: 'Tổng Quan Hệ Thống', icon: Activity },
          { key: 'media', label: 'Quản Lý Media & Video HLS', icon: Video },
          { key: 'curriculum', label: 'Quản Lý Bài Học & Khóa Học', icon: BookOpen },
          { key: 'rbac', label: 'Người Dùng & Phân Quyền', icon: Users },
          { key: 'teacher', label: 'Không Gian Giáo Viên', icon: GraduationCap },
          { key: 'parent', label: 'Cổng Phụ Huynh', icon: UserCheck },
          { key: 'audit', label: 'Nhật Ký Kiểm Toán (Audit)', icon: ShieldCheck },
          { key: 'ai', label: 'Trợ Lý AI Quản Trị', icon: Bot },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-[#0B2147] text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#14BF96]' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. Tab Tổng Quan (Overview KPIs) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="khan-card p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Tổng Người Dùng / Học sinh</span>
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900">
                {overview ? `${overview.totalUsers} TV (${overview.totalStudents} HS)` : '4 TV (2 HS)'}
              </p>
              <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> Dữ liệu trực tiếp từ PostgreSQL
              </div>
            </div>

            <div className="khan-card p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Bài Học & Quizzes</span>
                <Video className="w-4 h-4 text-[#14BF96]" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900">
                {overview ? `${overview.totalLessons} bài (${overview.totalQuizzesCompleted} đã thi)` : '5 bài'}
              </p>
              <div className="text-[11px] text-slate-500 font-medium">
                100% Adaptive Bitrate (480p-1080p)
              </div>
            </div>

            <div className="khan-card p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Chi phí AI OpenAI</span>
                <DollarSign className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900">
                ${overview ? overview.aiMonthlyCostUsd.toFixed(2) : '14.20'} / ${overview ? overview.aiMonthlyQuotaUsd.toFixed(2) : '50.00'}
              </p>
              <div className="text-[11px] text-emerald-600 font-bold">
                Dưới hạn mức ngân sách tháng
              </div>
            </div>

            <div className="khan-card p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Trạng thái Hạ tầng</span>
                <Database className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl font-extrabold text-emerald-600">Ổn định</p>
              <div className="text-[11px] text-slate-500 font-medium">
                {overview ? overview.postgresStatus : 'HikariCP Active · PostgreSQL 17'}
              </div>
            </div>
          </div>

          {/* Infrastructure & Architecture Health Monitor */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#14BF96]" />
              Giám Sát Hạ Tầng Sản Xuất (Theo Mục 12 trong Tài Liệu Kiến Trúc)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="font-bold text-slate-700">Ứng dụng Spring Boot</p>
                <div className="flex justify-between text-slate-500">
                  <span>JVM Heap Memory:</span>
                  <span className="font-bold text-slate-800">
                    {overview ? `${overview.jvmMemoryUsedMb} MB / ${overview.jvmMemoryMaxMb} MB` : '53 MB / 4042 MB'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>P95 Response Latency:</span>
                  <span className="font-bold text-emerald-600">42 ms</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="font-bold text-slate-700">Cơ sở dữ liệu PostgreSQL</p>
                <div className="flex justify-between text-slate-500">
                  <span>Flyway Migration:</span>
                  <span className="font-bold text-emerald-600">
                    {overview ? overview.flywayStatus : 'V3 (Áp dụng đầy đủ)'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Tổng Điểm Năng Lượng Tích Lũy:</span>
                  <span className="font-bold text-emerald-600">
                    {overview ? `${overview.totalEnergyPoints.toLocaleString()} pts` : '27,550 pts'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="font-bold text-slate-700">Object Storage & CDN</p>
                <div className="flex justify-between text-slate-500">
                  <span>Tỉ lệ CDN Cache Hit:</span>
                  <span className="font-bold text-emerald-600">
                    {overview ? `${overview.cdnCacheHitRate}%` : '96.8%'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Dung lượng lưu trữ:</span>
                  <span className="font-bold text-slate-800">48.8 GB / 500 GB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Tab Quản Lý Media & Video */}
      {activeTab === 'media' && (
        <div className="space-y-6">
          {/* Direct Presigned URL Upload */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#14BF96]" />
                  Tải Lên Video Bài Giảng Mới (Luồng Presigned URL Trực Tiếp S3)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Theo Mục 8.2: Trình duyệt tải thẳng lên Object Storage, Spring Boot không nghẽn băng thông.
                </p>
              </div>
            </div>

            <div className="p-8 border-2 border-dashed border-slate-200 hover:border-[#14BF96] rounded-2xl text-center space-y-3 bg-slate-50/50 transition">
              <FileVideo className="w-12 h-12 text-slate-400 mx-auto" />
              <div>
                <p className="text-sm font-bold text-slate-700">
                  Kéo thả file video bài giảng (.mp4, .mov) vào đây
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Dung lượng tối đa: 2 GB · Tự động đóng gói đa độ phân giải HLS (480p, 720p, 1080p)
                </p>
              </div>

              {uploadProgress !== null ? (
                <div className="max-w-md mx-auto space-y-2 pt-2">
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#14BF96] rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs font-semibold text-emerald-700">{uploadStatus}</p>
                  {uploadedAsset && (
                    <div className="p-3 bg-emerald-50 rounded-lg text-left text-[11px] font-mono text-slate-700 space-y-1">
                      <p><span className="font-bold">Storage Key:</span> {uploadedAsset.storageKey}</p>
                      <p><span className="font-bold">HLS Playlist:</span> {uploadedAsset.hlsStreamingUrl}</p>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleSimulatePresignedUpload}
                  className="khan-btn-primary text-xs px-6 py-2.5 cursor-pointer mt-2"
                >
                  Yêu Cầu Presigned S3 URL & Tải Thử Nghiệm
                </button>
              )}
            </div>
          </div>

          {/* Media Assets Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-sm text-slate-800">
              Danh Sách Video Assets & Trạng Thái Transcoding
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Tên File Gốc</th>
                    <th className="p-3.5">Storage Key (S3)</th>
                    <th className="p-3.5">Dung Lượng</th>
                    <th className="p-3.5">Trạng Thái</th>
                    <th className="p-3.5">CDN HLS Endpoint</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {MOCK_MEDIA_ASSETS.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5 font-bold text-slate-900">{m.originalFilename}</td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-500">{m.storageKey}</td>
                      <td className="p-3.5">{Math.round(m.fileSizeBytes / (1024 * 1024))} MB</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.status === 'READY' ? 'bg-emerald-100 text-emerald-700' :
                          m.status === 'TRANSCODING' ? 'bg-amber-100 text-amber-700 animate-pulse' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {m.status === 'READY' ? 'Sẵn Sàng (Ready)' : 'Đang chuyển mã HLS...'}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-blue-600">
                        {m.hlsUrl || "Chờ xử lý..."}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. Tab Người Dùng & Phân Quyền (RBAC) */}
      {activeTab === 'rbac' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Phân Quyền Vai Trò (RBAC) & Bảo Mật Dữ Liệu Học Sinh
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Theo Mục 4 & Mục 10: Backend kiểm tra quyền từng tài nguyên, kiểm tra quyền sở hữu dữ liệu (ngăn chặn tấn công IDOR).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
              >
                <option value="ALL">Tất cả vai trò</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                <option value="ADMIN">ADMIN</option>
                <option value="TEACHER">TEACHER</option>
                <option value="STUDENT">STUDENT</option>
                <option value="PARENT">PARENT</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="p-3">Họ và Tên</th>
                  <th className="p-3">Tên đăng nhập / Email</th>
                  <th className="p-3">Vai Trò (Role)</th>
                  <th className="p-3">Điểm Năng Lượng</th>
                  <th className="p-3">Trạng Thái</th>
                  <th className="p-3 text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {userList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <img 
                          src={u.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} 
                          alt="" 
                          className="w-7 h-7 rounded-full bg-slate-100" 
                        />
                        <span>{u.fullName}</span>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-600">
                      <div>@{u.username}</div>
                      <div className="text-slate-400">{u.email}</div>
                    </td>
                    <td className="p-3">
                      <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        u.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                        u.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-800' :
                        u.role === 'TEACHER' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-amber-600">
                      {u.energyPoints.toLocaleString()} pts
                    </td>
                    <td className="p-3">
                      <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        u.active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {u.active ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleToggleUser(u.id, u.active)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded transition cursor-pointer ${
                          u.active
                            ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}
                      >
                        {u.active ? 'Vô hiệu hóa' : 'Kích hoạt'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Tab Nhật Ký Kiểm Toán (Audit Logs) */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#14BF96]" />
                Nhật Ký Kiểm Toán Hệ Thống (Audit Logs - Mục 5 & 10.1)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Ghi lại mọi thay đổi quyền, cấp URL và thao tác quản trị nhằm đảm bảo khả năng truy vết và bảo vệ dữ liệu.
              </p>
            </div>
            <span className="text-xs font-mono bg-slate-100 px-2.5 py-1 rounded text-slate-600">
              {auditLogs.length} bản ghi DB
            </span>
          </div>

          <div className="space-y-3">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Chưa có nhật ký kiểm toán mới.</p>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 font-mono text-[11px] bg-slate-200 px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                      <span className="text-slate-500">tài nguyên</span>
                      <span className="font-bold text-blue-700">{log.resourceType}</span>
                      {log.ipAddress && (
                        <span className="text-[10px] text-slate-400 font-mono">({log.ipAddress})</span>
                      )}
                    </div>
                    <p className="text-slate-700 font-medium">{log.details}</p>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono self-end sm:self-auto">
                    {new Date(log.createdAt).toLocaleString('vi-VN')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 5. Tab Trợ Lý AI Quản Trị (Admin AI) */}
      {activeTab === 'ai' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Trợ Lý AI Quản Trị (Admin Assistant - Mục 9.2)
              </h3>
              <p className="text-xs text-slate-500">
                Hỗ trợ tra cứu tài liệu vận hành và hướng dẫn cấu hình hệ thống (Không tự ý thực thi SQL).
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 space-y-3 text-xs text-purple-900">
            <p className="font-bold">Các câu hỏi mẫu dành cho quản trị viên:</p>
            <div className="flex flex-wrap gap-2">
              {[
                "Làm thế nào để tăng hạn mức token OpenAI cho kỳ thi?",
                "Quy trình thu hồi quyền của tài khoản giáo viên đã nghỉ việc?",
                "Hướng dẫn kiểm tra log truy vấn chậm qua PostgreSQL EXPLAIN",
                "Cách xem báo cáo tổng quan hệ thống qua API"
              ].map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendAdminAi(q)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-purple-200 text-purple-800 hover:bg-purple-100 transition cursor-pointer text-left"
                >
                  "{q}"
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Chat Messages */}
          <div className="space-y-3 max-h-80 overflow-y-auto p-4 bg-slate-50 rounded-xl border border-slate-200">
            {adminAiMessages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 text-xs ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl max-w-[80%] space-y-1 ${
                    m.role === 'user'
                      ? 'bg-[#0B2147] text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                  <span className={`text-[10px] block text-right ${m.role === 'user' ? 'text-slate-300' : 'text-slate-400'}`}>
                    {m.time}
                  </span>
                </div>
              </div>
            ))}

            {isAdminAiTyping && (
              <div className="flex gap-2 items-center text-xs text-purple-700 italic">
                <Bot className="w-4 h-4 animate-spin" />
                <span>Trợ lý AI đang tra cứu hướng dẫn hệ thống...</span>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={adminAiInput}
              onChange={(e) => setAdminAiInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendAdminAi()}
              placeholder="Nhập câu hỏi quản trị hoặc yêu cầu hướng dẫn nghiệp vụ..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-600 outline-none"
            />
            <button
              onClick={() => handleSendAdminAi()}
              disabled={!adminAiInput.trim() || isAdminAiTyping}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Gửi</span>
            </button>
          </div>
        </div>
      )}

      {/* 6. Tab Quản Lý Nội Dung & Bài Học (Content Management CRUD - Mục 5 PDF) */}
      {activeTab === 'curriculum' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#14BF96]" />
                Quản Trị Nội Dung Bài Học & Khóa Học (Content Management - Mục 5)
              </h3>
              <p className="text-slate-500 mt-0.5">
                Quản lý bài giảng video, câu hỏi quiz và trạng thái xuất bản theo từng khối lớp K-12.
              </p>
            </div>

            <button
              onClick={() => setShowAddLessonModal(true)}
              className="khan-btn-primary text-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Bài Giảng Mới</span>
            </button>
          </div>

          {/* Grade Selector Pills */}
          <div className="space-y-2">
            <p className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">Chọn khối lớp quản lý:</p>
            <div className="flex overflow-x-auto gap-1.5 pb-2 no-scrollbar">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedCurriculumGrade(`Lớp ${g}`)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition shrink-0 cursor-pointer ${
                    selectedCurriculumGrade === `Lớp ${g}`
                      ? 'bg-[#1865F2] text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Lớp {g}
                </button>
              ))}
            </div>
          </div>

          {/* Lessons Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Tên Bài Giảng</th>
                  <th className="p-3">Môn & Khối Lớp</th>
                  <th className="p-3">Thời Lượng</th>
                  <th className="p-3">Số Câu Quiz</th>
                  <th className="p-3">Trạng Thái Xuất Bản</th>
                  <th className="p-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {managedLessons
                  .filter((l) => l.grade === selectedCurriculumGrade)
                  .map((lesson) => (
                    <tr key={lesson.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-blue-50 text-[#1865F2] flex items-center justify-center shrink-0">
                            <Video className="w-3.5 h-3.5" />
                          </div>
                          <span>{lesson.title}</span>
                        </div>
                      </td>
                      <td className="p-3 font-medium text-slate-600">
                        {lesson.subject} · {lesson.grade}
                      </td>
                      <td className="p-3 text-slate-500 font-mono">
                        {Math.round(lesson.durationSeconds / 60)} phút
                      </td>
                      <td className="p-3">
                        <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded">
                          {lesson.quizCount} câu hỏi
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => {
                            setManagedLessons((prev) =>
                              prev.map((l) => (l.id === lesson.id ? { ...l, published: !l.published } : l))
                            );
                          }}
                          className={`flex items-center gap-1 font-bold px-2.5 py-1 rounded transition cursor-pointer ${
                            lesson.published
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                        >
                          {lesson.published ? <Check className="w-3 h-3" /> : null}
                          <span>{lesson.published ? 'Đã Xuất Bản' : 'Bản Nháp (Chưa công khai)'}</span>
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Bạn có chắc chắn muốn xóa bài giảng: "${lesson.title}"?`)) {
                              setManagedLessons((prev) => prev.filter((l) => l.id !== lesson.id));
                            }
                          }}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                          title="Xóa bài giảng"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Modal Thêm Bài Giảng Mới */}
          {showAddLessonModal && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="font-extrabold text-slate-900 text-base">Thêm Bài Giảng Mới Vào Chương Trình K-12</h4>
                  <button onClick={() => setShowAddLessonModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Tiêu đề bài giảng:</label>
                    <input
                      type="text"
                      value={newLessonTitle}
                      onChange={(e) => setNewLessonTitle(e.target.value)}
                      placeholder="VD: Phép nhân và chia hai phân số"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#1865F2]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Khối lớp:</label>
                      <select
                        value={newLessonGrade}
                        onChange={(e) => setNewLessonGrade(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                          <option key={g} value={`Lớp ${g}`}>Lớp {g}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Môn học:</label>
                      <select
                        value={newLessonSubject}
                        onChange={(e) => setNewLessonSubject(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                      >
                        <option value="Toán học">Toán học</option>
                        <option value="Khoa học Tự nhiên">Khoa học Tự nhiên</option>
                        <option value="Ngữ văn">Ngữ văn</option>
                        <option value="Tiếng Anh">Tiếng Anh</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Thời lượng ước tính (phút):</label>
                    <input
                      type="number"
                      value={newLessonDuration}
                      onChange={(e) => setNewLessonDuration(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#1865F2]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">URL Video (HLS CDN hoặc MP4):</label>
                    <input
                      type="text"
                      value={newLessonUrl}
                      onChange={(e) => setNewLessonUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#1865F2]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setShowAddLessonModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => {
                      if (!newLessonTitle.trim()) {
                        alert("Vui lòng nhập tiêu đề bài giảng!");
                        return;
                      }
                      const newObj = {
                        id: `l-${Date.now()}`,
                        title: newLessonTitle,
                        grade: newLessonGrade,
                        subject: newLessonSubject,
                        durationSeconds: (parseInt(newLessonDuration) || 10) * 60,
                        videoUrl: newLessonUrl,
                        published: true,
                        quizCount: 2,
                      };
                      setManagedLessons((prev) => [newObj, ...prev]);
                      setShowAddLessonModal(false);
                      setNewLessonTitle("");
                    }}
                    className="khan-btn-primary text-xs px-5 py-2 cursor-pointer"
                  >
                    Lưu & Xuất Bản Ngay
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 7. Tab Không Gian Giáo Viên (Teacher Classroom - Mục 4 PDF) */}
      {activeTab === 'teacher' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#1865F2]" />
                Không Gian Lớp Học Của Giáo Viên (Teacher Classroom - Mục 4 PDF)
              </h3>
              <p className="text-slate-500 mt-0.5">
                Giáo viên phụ trách: Cô Nguyễn Thị Mai · Lớp 5A1 (Toán & Khoa học Tự nhiên)
              </p>
            </div>

            {teacherReminderStatus && (
              <span className="bg-emerald-50 text-emerald-700 font-bold px-3 py-1.5 rounded-full border border-emerald-200 animate-fade">
                {teacherReminderStatus}
              </span>
            )}
          </div>

          {/* Teacher KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-400 font-bold text-[11px]">Sĩ số lớp 5A1</span>
              <p className="text-xl font-extrabold text-slate-900">32 học sinh</p>
              <p className="text-[10px] text-emerald-600 font-bold">100% tài khoản kích hoạt</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-400 font-bold text-[11px]">Tỷ lệ hoàn thành bài tập</span>
              <p className="text-xl font-extrabold text-blue-600">87.5%</p>
              <p className="text-[10px] text-slate-500 font-medium">+5% so với tuần trước</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-400 font-bold text-[11px]">Điểm trắc nghiệm trung bình</span>
              <p className="text-xl font-extrabold text-emerald-600">8.8 / 10</p>
              <p className="text-[10px] text-emerald-600 font-bold">Đạt chuẩn Tinh Thông</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-400 font-bold text-[11px]">Học sinh cần trợ giúp AI</span>
              <p className="text-xl font-extrabold text-amber-600">2 em</p>
              <p className="text-[10px] text-slate-500 font-medium">Chủ đề: Rút gọn phân số</p>
            </div>
          </div>

          {/* Student Roster Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-3 bg-slate-100 font-bold text-slate-800 text-xs flex justify-between items-center">
              <span>Danh Sách Học Sinh & Kết Quả Luyện Tập Tuần Này</span>
              <button
                onClick={() => {
                  setTeacherReminderStatus("Đã gửi thông báo nhắc học bài đến tất cả học sinh chưa hoàn thành!");
                  setTimeout(() => setTeacherReminderStatus(null), 4000);
                }}
                className="khan-btn-secondary text-[11px] px-3 py-1 cursor-pointer"
              >
                Gửi Lời Nhắc Học Tập Cho Cả Lớp
              </button>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Học Sinh</th>
                  <th className="p-3">Bài Đã Học</th>
                  <th className="p-3">Điểm Quiz Gần Nhất</th>
                  <th className="p-3">Chuỗi Ngày Học</th>
                  <th className="p-3">Mức Độ Tinh Thông</th>
                  <th className="p-3 text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=an" alt="" className="w-6 h-6 rounded-full" />
                    <span>Trần Văn An</span>
                  </td>
                  <td className="p-3 font-medium">12 / 12 bài (100%)</td>
                  <td className="p-3 font-bold text-emerald-600">10 / 10 pts 🏆</td>
                  <td className="p-3 font-bold text-amber-600 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> 7 ngày
                  </td>
                  <td className="p-3">
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                      Tinh Thông (Mastered)
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button className="text-blue-600 hover:underline font-bold text-[11px]">Xem sổ tay học</button>
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=hocsinh1" alt="" className="w-6 h-6 rounded-full" />
                    <span>Nguyen Van A</span>
                  </td>
                  <td className="p-3 font-medium">8 / 12 bài (66%)</td>
                  <td className="p-3 font-bold text-blue-600">8 / 10 pts ⚡</td>
                  <td className="p-3 font-bold text-amber-600 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> 4 ngày
                  </td>
                  <td className="p-3">
                    <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-[10px]">
                      Thành Thạo (Proficient)
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button className="text-blue-600 hover:underline font-bold text-[11px]">Xem sổ tay học</button>
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=ngoc" alt="" className="w-6 h-6 rounded-full" />
                    <span>Lê Bảo Ngọc</span>
                  </td>
                  <td className="p-3 font-medium">11 / 12 bài (91%)</td>
                  <td className="p-3 font-bold text-emerald-600">10 / 10 pts 🏆</td>
                  <td className="p-3 font-bold text-amber-600 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> 9 ngày
                  </td>
                  <td className="p-3">
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                      Tinh Thông (Mastered)
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button className="text-blue-600 hover:underline font-bold text-[11px]">Xem sổ tay học</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. Tab Cổng Phụ Huynh (Parent Portal - Mục 4 PDF) */}
      {activeTab === 'parent' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-purple-100 text-purple-800 font-bold px-2.5 py-0.5 rounded text-[10px] uppercase">
                  Quyền Phụ Huynh Đã Xác Thực (RBAC PARENT)
                </span>
                <span className="text-slate-400">Quan hệ: Phụ huynh - Học sinh</span>
              </div>
              <h3 className="font-bold text-base text-slate-900 mt-1 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-purple-600" />
                Cổng Theo Dõi Học Tập Của Phụ Huynh (Parent Portal)
              </h3>
              <p className="text-slate-500">
                Theo dõi sát sao tiến độ học tập, điểm số bài thi và sự kiên trì của con: <span className="font-bold text-slate-900">Trần Văn An (Lớp 5)</span>
              </p>
            </div>

            <div className="flex items-center gap-2 bg-purple-50 p-2.5 rounded-xl border border-purple-100">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=an" alt="" className="w-8 h-8 rounded-full border border-purple-300" />
              <div>
                <p className="font-bold text-purple-900">Học sinh: Trần Văn An</p>
                <p className="text-[10px] text-purple-700">Mã liên kết: #K12-AN-3333</p>
              </div>
            </div>
          </div>

          {/* Child Weekly Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-400 font-bold text-[11px]">Chuỗi ngày học liên tục</span>
              <p className="text-2xl font-extrabold text-amber-600 flex items-center gap-1.5">
                <Flame className="w-5 h-5 fill-amber-500 text-amber-500" /> 7 Ngày
              </p>
              <p className="text-[10px] text-emerald-600 font-bold">Chăm chỉ không bỏ ngày nào</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-400 font-bold text-[11px]">Tổng thời gian tuần này</span>
              <p className="text-2xl font-extrabold text-blue-600">4 giờ 20 phút</p>
              <p className="text-[10px] text-slate-500 font-medium">Trung bình 37 phút/ngày</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-400 font-bold text-[11px]">Điểm năng lượng tích lũy</span>
              <p className="text-2xl font-extrabold text-[#14BF96]">2,500 pts</p>
              <p className="text-[10px] text-emerald-600 font-bold">Top 5% học sinh tiêu biểu</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-400 font-bold text-[11px]">Tỷ lệ đỗ bài kiểm tra</span>
              <p className="text-2xl font-extrabold text-purple-600">100%</p>
              <p className="text-[10px] text-slate-500 font-medium">Vượt qua cả 4 bài thi trắc nghiệm</p>
            </div>
          </div>

          {/* Recent Quiz Scores and Badges */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl border border-slate-200 space-y-3">
              <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#FFC700]" /> Lịch sử bài tập con vừa hoàn thành
              </p>
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">Toán 5: Khái niệm Phân số và Mẫu số</p>
                    <p className="text-[10px] text-slate-400">Thời gian làm bài: 8 phút · 3 câu hỏi</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full text-xs">
                    100% (3/3 đúng)
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">Toán 5: So sánh hai phân số khác mẫu số</p>
                    <p className="text-[10px] text-slate-400">Thời gian làm bài: 12 phút · 2 câu hỏi</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full text-xs">
                    100% (2/2 đúng)
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 space-y-3">
              <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#14BF96]" /> Huy hiệu con đã mở khóa
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-center space-y-1">
                  <span className="text-xl">🏆</span>
                  <p className="font-bold text-amber-900 text-[11px]">Nhà Thám Hiểm</p>
                  <p className="text-[9px] text-amber-700">Hoàn thành bài đầu tiên</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-center space-y-1">
                  <span className="text-xl">⚡</span>
                  <p className="font-bold text-blue-900 text-[11px]">Chiến Binh 7 Ngày</p>
                  <p className="text-[9px] text-blue-700">Học liên tục 7 ngày</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-center space-y-1">
                  <span className="text-xl">🌟</span>
                  <p className="font-bold text-emerald-900 text-[11px]">Bậc Thầy Quiz</p>
                  <p className="text-[9px] text-emerald-700">Đạt điểm tuyệt đối</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
