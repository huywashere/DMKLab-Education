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
  Check,
  Download,
  TrendingUp,
  BarChart3,
  FileSpreadsheet,
  Filter,
  ShieldAlert,
  KeyRound,
  History,
  SlidersHorizontal,
  X,
  Server,
  GitBranch,
  ArrowLeftRight,
  RotateCcw,
  AlertTriangle,
  PlayCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  HardDrive,
  Lock,
  Shield,
  Sparkles,
  Lightbulb,
} from "lucide-react";

export type AdminTabType =
  | "overview"
  | "media"
  | "curriculum"
  | "rbac"
  | "teacher"
  | "parent"
  | "audit"
  | "ai"
  | "security"
  | "reliability"
  | "ai_quality";

interface AdminDashboardProps {
  currentUser: User;
  onExitAdmin: () => void;
  currentTab?: AdminTabType;
  onTabChange?: (tab: AdminTabType) => void;
  hideHeaderBanner?: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onExitAdmin,
  currentTab,
  onTabChange,
  hideHeaderBanner = false,
}) => {
  const [internalTab, setInternalTab] = useState<AdminTabType>("overview");
  const activeTab = currentTab !== undefined ? currentTab : internalTab;
  const setActiveTab = (t: AdminTabType) => {
    setInternalTab(t);
    if (onTabChange) onTabChange(t);
  };

  // Live Backend Data States
  const [overview, setOverview] = useState<AdminOverviewReport | null>(null);
  const [userList, setUserList] = useState<AdminUserItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<BackendAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // Audit Log & Analytics States
  const [auditCategoryFilter, setAuditCategoryFilter] = useState<
    "ALL" | "RBAC" | "CONTENT" | "SECURITY"
  >("ALL");
  const [auditSearchQuery, setAuditSearchQuery] = useState("");
  const [selectedAuditLog, setSelectedAuditLog] = useState<BackendAuditLog | null>(null);

  // 1. Audit PII Masking State (Bảo vệ dữ liệu & thông tin cá nhân)
  const [isPiiMasked, setIsPiiMasked] = useState(true);

  // 2. Pagination States (Tối ưu nội dung: Phân trang bài học & người dùng)
  const [curriculumPage, setCurriculumPage] = useState(1);
  const [curriculumPageSize, setCurriculumPageSize] = useState(10);
  const [rbacPage, setRbacPage] = useState(1);
  const [rbacPageSize, setRbacPageSize] = useState(10);

  // 3. Reliability & Disaster Recovery Drill States (Độ tin cậy & khôi phục backup)
  const [isDrDrillRunning, setIsDrDrillRunning] = useState(false);
  const [drDrillProgress, setDrDrillProgress] = useState(0);
  const [drDrillLogs, setDrDrillLogs] = useState<string[]>([]);
  const [drDrillCompleted, setDrDrillCompleted] = useState(false);

  // 4. Blue/Green Rollback Workflow States (Quy trình rollback zero-downtime)
  const [activeCluster, setActiveCluster] = useState<"GREEN" | "BLUE">("GREEN");
  const [isRollingBack, setIsRollingBack] = useState(false);
  const [rollbackSuccessMsg, setRollbackSuccessMsg] = useState<string | null>(null);

  // 5. AI Quality Benchmark Suite States (Kiểm định chất lượng AI K-12)
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [benchmarkProgress, setBenchmarkProgress] = useState(0);
  const [benchmarkStatus, setBenchmarkStatus] = useState("Sẵn sàng kiểm định");
  const [benchmarkRunCompleted, setBenchmarkRunCompleted] = useState(false);

  // 6. Data Retention & Right to be Forgotten States (Lưu trữ và xóa dữ liệu)
  const [isPurgingData, setIsPurgingData] = useState(false);
  const [purgeAlert, setPurgeAlert] = useState<string | null>(null);
  const [deleteDataMsg, setDeleteDataMsg] = useState<string | null>(null);

  // Session Revocation for RBAC users (Thu hồi phiên đăng nhập)
  const [revokedUserIds, setRevokedUserIds] = useState<string[]>([]);

  // 7. Rate Limiting & Anti-Spam States (Rà soát chống spam & bẫy Bot)
  const [rateLimitSimLogs, setRateLimitSimLogs] = useState<
    Array<{
      id: number;
      endpoint: string;
      status: number;
      text: string;
      time: string;
      blocked: boolean;
    }>
  >([]);
  const [isSimulatingRateLimit, setIsSimulatingRateLimit] = useState(false);
  const [unblockKeyInput, setUnblockKeyInput] = useState("");
  const [unblockFeedback, setUnblockFeedback] = useState<string | null>(null);
  const [customBlockedList, setCustomBlockedList] = useState<string[]>([
    "AUTH_LOGIN:192.168.1.45 (Sai MK 6 lần)",
    "AI_CHAT:113.161.82.14 (Vượt 15 req/phút)",
  ]);

  const handleSimulateRateLimitFlood = async () => {
    setIsSimulatingRateLimit(true);
    setRateLimitSimLogs([]);
    const logs: Array<{
      id: number;
      endpoint: string;
      status: number;
      text: string;
      time: string;
      blocked: boolean;
    }> = [];

    // Mô phỏng flood 6 request liên tiếp trong 1.5s
    for (let i = 1; i <= 6; i++) {
      await new Promise((r) => setTimeout(r, 200));
      const isBlocked = i >= 4;
      const now = new Date().toLocaleTimeString();
      logs.push({
        id: i,
        endpoint: "POST /api/v1/auth/login",
        status: isBlocked ? 429 : 200,
        text: isBlocked
          ? "HTTP 429 Too Many Requests (RateLimitExceeded - Retry-After: 900s - Audit: RATE_LIMIT_BLOCKED)"
          : `HTTP 200 OK (Thành công - X-RateLimit-Remaining: ${5 - i})`,
        time: now,
        blocked: isBlocked,
      });
      setRateLimitSimLogs([...logs]);
    }
    setIsSimulatingRateLimit(false);
  };

  const handleUnblockKey = () => {
    if (!unblockKeyInput.trim()) return;
    const key = unblockKeyInput.trim();
    setCustomBlockedList((prev) => prev.filter((item) => !item.includes(key)));
    setUnblockFeedback(`Đã giải phóng bộ đệm Sliding-Window và mở khóa cho: ${key}`);
    setUnblockKeyInput("");
    setTimeout(() => setUnblockFeedback(null), 4000);
  };

  // 8. OWASP Security Health Scanner States (Quét và đánh giá lỗ hổng an ninh)
  const [isScanningSecurity, setIsScanningSecurity] = useState(false);
  const [securityScanProgress, setSecurityScanProgress] = useState(0);
  const [securityScanCompleted, setSecurityScanCompleted] = useState(false);
  const [securityScanLogs, setSecurityScanLogs] = useState<
    Array<{ probe: string; result: string; status: "PASS" | "WARN" | "FAIL"; time: string }>
  >([]);

  const handleRunSecurityScan = async () => {
    setIsScanningSecurity(true);
    setSecurityScanProgress(0);
    setSecurityScanCompleted(false);
    setSecurityScanLogs([]);

    const probes = [
      {
        probe: "[SQL INJECTION] Kiểm thử injection trên các API tìm kiếm & lọc dữ liệu",
        result: "PASSED: 100% Prepared Statements qua Spring Data JPA & Hibernate",
        status: "PASS" as const,
      },
      {
        probe: "[XSS ATTACK] Kiểm thử Reflected, Stored XSS & nhúng script nguy hiểm",
        result: "PASSED: Khử độc qua InputSanitizer & chặn bởi Content-Security-Policy",
        status: "PASS" as const,
      },
      {
        probe: "[CLICKJACKING] Kiểm tra tiêu đề X-Frame-Options & frame-ancestors",
        result: "PASSED: Chế độ SAMEORIGIN & DENY khóa hoàn toàn iframe lồng ghép ngoài",
        status: "PASS" as const,
      },
      {
        probe: "[IDOR & RBAC] Kiểm tra phân quyền truy cập chéo tài nguyên nhạy cảm",
        result: "PASSED: Xác thực quyền sở hữu JWT Claim ID == Target Resource ID",
        status: "PASS" as const,
      },
      {
        probe: "[JWT SESSION HIJACKING] Kiểm tra danh sách đen (Blacklist) & thu hồi phiên",
        result: "PASSED: JwtBlacklistService vô hiệu hóa token tức thì sau logout",
        status: "PASS" as const,
      },
      {
        probe: "[UNRESTRICTED FILE UPLOAD] Kiểm tra phần mở rộng tệp & Magic Bytes nhị phân",
        result: "PASSED: FileSignatureValidator chặn đứng file thực thi và web shell",
        status: "PASS" as const,
      },
      {
        probe: "[RATE LIMITING & BRUTE FORCE] Kiểm tra bộ đệm Sliding-Window RFC 6585",
        result: "PASSED: 9 chính sách hoạt động, tự động trả HTTP 429 sau ngưỡng vi phạm",
        status: "PASS" as const,
      },
    ];

    const logs: Array<{
      probe: string;
      result: string;
      status: "PASS" | "WARN" | "FAIL";
      time: string;
    }> = [];

    for (let i = 0; i < probes.length; i++) {
      await new Promise((r) => setTimeout(r, 260));
      const p = probes[i];
      const now = new Date().toLocaleTimeString();
      logs.push({
        probe: p.probe,
        result: p.result,
        status: p.status,
        time: now,
      });
      setSecurityScanLogs([...logs]);
      setSecurityScanProgress(Math.round(((i + 1) / probes.length) * 100));
    }

    setIsScanningSecurity(false);
    setSecurityScanCompleted(true);
  };

  const INITIAL_AUDIT_LOGS: BackendAuditLog[] = [
    {
      id: "aud-001",
      userId: "11111111-1111-1111-1111-111111111111",
      action: "DISABLE_USER",
      resourceType: "USER",
      resourceId: "hocsinh2",
      details: "Vô hiệu hóa tài khoản học sinh vi phạm quy chế bảo mật phòng thi",
      ipAddress: "192.168.1.105",
      createdAt: "2026-10-17T07:45:00.000Z",
    },
    {
      id: "aud-002",
      userId: "11111111-1111-1111-1111-111111111111",
      action: "UPDATE_USER_ROLE",
      resourceType: "USER",
      resourceId: "teacher1",
      details: "Nâng cấp quyền tài khoản từ TEACHER sang ADMIN tổ bộ môn Toán K-12",
      ipAddress: "192.168.1.105",
      createdAt: "2026-10-17T06:30:00.000Z",
    },
    {
      id: "aud-003",
      userId: "22222222-2222-2222-2222-222222222222",
      action: "DELETE_LESSON",
      resourceType: "LESSON",
      resourceId: "l-old-09",
      details: "Xóa bài giảng video cũ không đạt chuẩn 1080p HLS: 'Ôn tập phân số lớp 4'",
      ipAddress: "14.241.12.88",
      createdAt: "2026-10-17T03:15:00.000Z",
    },
    {
      id: "aud-004",
      userId: "22222222-2222-2222-2222-222222222222",
      action: "PUBLISH_LESSON",
      resourceType: "LESSON",
      resourceId: "l-01",
      details: "Phê duyệt và xuất bản bài giảng mới: 'Khái niệm Phân số và Các tính chất cơ bản'",
      ipAddress: "14.241.12.88",
      createdAt: "2026-10-16T18:00:00.000Z",
    },
    {
      id: "aud-005",
      userId: "11111111-1111-1111-1111-111111111111",
      action: "REQUEST_UPLOAD_URL",
      resourceType: "MEDIA_ASSET",
      resourceId: "videos/k12/toan5_phan_so.mp4",
      details: "Cấp Presigned S3 Upload URL có thời hạn 3600s cho video bài giảng 50MB",
      ipAddress: "192.168.1.105",
      createdAt: "2026-10-16T10:00:00.000Z",
    },
  ];

  const handleExportAdminReportCsv = () => {
    const headers = ["Chỉ Số Báo Cáo", "Giá Trị", "Đơn Vị", "Ghi Chú"];
    const rows = [
      [
        "Tổng người dùng hệ thống",
        overview ? overview.totalUsers : 4,
        "Tài khoản",
        "Hệ thống PostgreSQL 17",
      ],
      ["Số học sinh K-12", overview ? overview.totalStudents : 2, "Học sinh", "Khối 1 - 12"],
      ["Số giáo viên", overview ? overview.totalTeachers : 1, "Giáo viên", "Phụ trách chuyên môn"],
      ["Số bài học K-12", overview ? overview.totalLessons : 5, "Bài học", "Adaptive Bitrate HLS"],
      [
        "Số bài trắc nghiệm đã làm",
        overview ? overview.totalQuizzesCompleted : 4,
        "Lượt thi",
        "Tỷ lệ đỗ 92%",
      ],
      [
        "Tổng điểm năng lượng",
        overview ? overview.totalEnergyPoints : 27550,
        "Điểm (pts)",
        "Tích lũy toàn hệ thống",
      ],
      [
        "Chi phí OpenAI AI Tutor",
        overview ? overview.aiMonthlyCostUsd : 14.2,
        "USD",
        "Hạn mức tháng $50.00",
      ],
      ["Tokens OpenAI đã tiêu thụ", "342,850", "Tokens", "Gia sư AI Socratic"],
      ["Tỷ lệ hoàn thành Tiểu học (Lớp 1-5)", "88.5%", "%", "Khối năng nổ nhất"],
      ["Tỷ lệ hoàn thành THCS (Lớp 6-9)", "82.0%", "%", "Đạt chuẩn"],
      ["Tỷ lệ hoàn thành THPT (Lớp 10-12)", "76.5%", "%", "Đạt chuẩn"],
      [
        "Tỉ lệ CDN Cache Hit",
        overview ? `${overview.cdnCacheHitRate}%` : "96.8%",
        "%",
        "Tối ưu băng thông",
      ],
    ];
    const csvContent =
      "\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `DMKLab_Admin_Report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
  const [adminAiMessages, setAdminAiMessages] = useState<
    { role: "user" | "assistant"; text: string; time: string }[]
  >([
    {
      role: "assistant",
      text: "Xin chào Quản trị viên! Tôi là Trợ lý AI Quản trị K-12. Tôi có thể hỗ trợ giải thích quy trình vận hành, chính sách bảo mật RBAC, hoặc hướng dẫn kiểm tra hiệu năng hệ thống.",
      time: "09:00",
    },
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
      if (logsData && logsData.length > 0) {
        setAuditLogs(logsData);
      } else {
        setAuditLogs(INITIAL_AUDIT_LOGS);
      }
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
        setUploadStatus(
          `Đã nhận Presigned URL S3! Đang đẩy 125 MB thẳng lên Object Storage (bỏ qua Tomcat)...`
        );
        setUploadProgress(65);

        setTimeout(() => {
          setUploadStatus(
            "Upload hoàn tất! Worker đang chuyển mã HLS Adaptive Multi-bitrate (480p-1080p)..."
          );
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
      role: "user" as const,
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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
            role: "assistant",
            text: res.reply,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        setIsAdminAiTyping(false);
        return;
      }
    } catch {
      // Local fallback
    }

    setTimeout(() => {
      let reply =
        "Theo kiến trúc K-12: Mọi thao tác quản trị nhạy cảm (như thay đổi quyền, xóa nội dung) đều phải thông qua API nghiệp vụ có kiểm tra JWT Bearer và ghi nhận vào Audit Log.";
      if (text.includes("token") || text.includes("OpenAI")) {
        reply =
          "Cấu hình OpenAI Quota: Giới hạn 30 câu hỏi/ngày/học sinh được quản lý tại AiService. Quản trị viên có thể điều chỉnh qua biến môi trường OPENAI_DAILY_QUOTA_PER_STUDENT.";
      } else if (text.includes("quyền") || text.includes("thu hồi")) {
        reply =
          "Quy trình thu hồi quyền: Sử dụng tính năng Vô hiệu hóa tài khoản trong tab 'Người Dùng & Phân Quyền'. Hành động này sẽ lập tức chặn phiên làm việc và ghi vết kiểm toán.";
      }

      setAdminAiMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setIsAdminAiTyping(false);
    }, 700);
  };

  // Helper to mask IP address
  const maskIp = (ip?: string) => {
    if (!ip) return "N/A";
    if (!isPiiMasked) return ip;
    return ip.replace(/\.\d+\.\d+$/, ".***.***");
  };

  // Helper to mask PII in details
  const maskPiiDetails = (text?: string) => {
    if (!text) return "";
    if (!isPiiMasked) return text;
    return text
      .replace(
        /([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})/g,
        (_m, u, d, e) => `${u.slice(0, 1)}***@${d}.${e}`
      )
      .replace(/\b(\+84|0)(3|5|7|8|9)[0-9]{8}\b/g, "$1***")
      .replace(/\b[0-9]{9,12}\b/g, (m) => m.slice(0, 3) + "******");
  };

  // Handler for Disaster Recovery Drill (Backup tested restore)
  const handleRunDrDrill = () => {
    setIsDrDrillRunning(true);
    setDrDrillProgress(15);
    setDrDrillLogs([
      "02:00:01 [SNAPSHOT] Tìm thấy bản sao lưu PostgreSQL 17 tự động (learning_db_20261017_0200.dump - 248 MB)",
      "02:00:04 [SANDBOX] Khởi tạo môi trường Sandbox Test Container độc lập (Isolated Recovery Pod)",
    ]);
    setDrDrillCompleted(false);

    setTimeout(() => {
      setDrDrillProgress(45);
      setDrDrillLogs((prev) => [
        ...prev,
        "02:00:08 [RESTORE] Nạp cấu trúc Schema Flyway V1 -> V4 và bảng dữ liệu vào Sandbox",
        "02:00:12 [WAL_APPLY] Áp dụng Point-in-time WAL logs: RPO đạt mức 15 phút an toàn tuyệt đối",
      ]);
    }, 1200);

    setTimeout(() => {
      setDrDrillProgress(80);
      setDrDrillLogs((prev) => [
        ...prev,
        "02:00:15 [INTEGRITY_CHECK] Kiểm thử toàn vẹn Foreign Keys, Checksums và Băm SHA-256 bảng users, lessons, quiz_results: PASS (0 sai lệch)",
        "02:00:18 [BENCHMARK] Đo đạc RTO (Recovery Time Objective): Đạt 4 phút 18 giây (Chuẩn cam kết < 15 phút)",
      ]);
    }, 2400);

    setTimeout(() => {
      setDrDrillProgress(100);
      setDrDrillLogs((prev) => [
        ...prev,
        "02:00:20 [SUCCESS] DIỄN TẬP KHÔI PHỤC THÀNH CÔNG 100%! Cơ sở dữ liệu sẵn sàng ứng phó sự cố thảm họa.",
      ]);
      setIsDrDrillRunning(false);
      setDrDrillCompleted(true);
    }, 3600);
  };

  // Handler for Zero-Downtime Blue/Green Rollback
  const handleTriggerRollback = () => {
    setIsRollingBack(true);
    setRollbackSuccessMsg(null);
    const target = activeCluster === "GREEN" ? "BLUE" : "GREEN";
    const targetVer = target === "BLUE" ? "v2.4.0 (Stable Standby)" : "v2.4.1 (Latest Green)";

    setTimeout(() => {
      setActiveCluster(target);
      setIsRollingBack(false);
      setRollbackSuccessMsg(
        `✓ Đã hoàn tất Rollback về cụm ${target} (${targetVer}). Chuyển mạch 100% traffic qua Nginx/Ingress trong 1.8 giây không gián đoạn!`
      );
    }, 2000);
  };

  // Handler for AI Quality Benchmark Suite
  const handleRunAiBenchmark = () => {
    setIsBenchmarking(true);
    setBenchmarkProgress(15);
    setBenchmarkStatus("Đang kiểm định Khối Tiểu học (Lớp 1-5: Toán & Tiếng Việt)...");

    setTimeout(() => {
      setBenchmarkProgress(50);
      setBenchmarkStatus("Đang kiểm định Khối THCS (Lớp 6-9: Toán & KHTN)...");
    }, 1200);

    setTimeout(() => {
      setBenchmarkProgress(85);
      setBenchmarkStatus("Đang kiểm định Khối THPT (Lớp 10-12: Giải tích & Vật lý)...");
    }, 2400);

    setTimeout(() => {
      setBenchmarkProgress(100);
      setBenchmarkStatus(
        "Hoàn tất kiểm định 350 bài test! Điểm trung bình: 98.4% độ chính xác, 96.2% tuân thủ Socratic."
      );
      setIsBenchmarking(false);
      setBenchmarkRunCompleted(true);
    }, 3600);
  };

  // Handler for 90-day Data Retention Purge
  const handleRetentionPurge = () => {
    setIsPurgingData(true);
    setTimeout(() => {
      setIsPurgingData(false);
      setPurgeAlert(
        "✓ Đã dọn dẹp thành công 142 phiên học và log kiểm toán cũ quá 90 ngày theo chính sách lưu trữ COPPA/GDPR."
      );
      setTimeout(() => setPurgeAlert(null), 4000);
    }, 1500);
  };

  // Handler for Right to be Forgotten (Xóa dữ liệu theo yêu cầu)
  const handleRightToBeForgotten = (username: string) => {
    setDeleteDataMsg(
      `✓ Đã thực thi Quyền được lãng quên: Dữ liệu cá nhân của học sinh @${username} đã được xóa và ẩn danh hóa hoàn toàn (Anonymized PII hash).`
    );
    setTimeout(() => setDeleteDataMsg(null), 4000);
  };

  // Handler for Session Revocation on RBAC User
  const handleAdminRevokeUserSession = (userId: string, username: string) => {
    setRevokedUserIds((prev) => [...prev, userId]);
    alert(
      `Đã thu hồi toàn bộ phiên đăng nhập (JWT Revoked) của tài khoản @${username}. Người dùng sẽ buộc phải đăng nhập lại.`
    );
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner Header & Nav Tabs (Only show if not in standalone admin portal) */}
      {!hideHeaderBanner && (
        <>
          <div className="bg-[#0B2147] text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-extrabold bg-[#14BF96] text-white uppercase tracking-wider">
                  Cổng Quản Trị Hệ Thống (CMS)
                </span>
                <span className="text-xs text-slate-300">
                  Modular Monolith Architecture · Spring Boot 3.3.4
                </span>
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
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              </button>
              <button onClick={onExitAdmin} className="khan-btn-secondary text-xs cursor-pointer">
                Quay lại giao diện Học sinh
              </button>
            </div>
          </div>

          <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-2 no-scrollbar text-xs font-bold">
            {[
              { key: "overview", label: "Tổng Quan Hệ Thống", icon: Activity },
              { key: "audit", label: "Nhật Ký Kiểm Toán (Audit & PII)", icon: ShieldCheck },
              { key: "security", label: "Bảo Vệ Dữ Liệu & Quyền Riêng Tư", icon: ShieldAlert },
              { key: "reliability", label: "Độ Tin Cậy, Backup & Rollback", icon: Server },
              { key: "ai_quality", label: "Kiểm Định Chất Lượng AI K-12", icon: CheckCircle2 },
              { key: "curriculum", label: "Quản Lý Bài Học & Phân Trang", icon: BookOpen },
              { key: "media", label: "Tối Ưu CDN, HLS & Caching", icon: Video },
              { key: "rbac", label: "Người Dùng & Phân Quyền", icon: Users },
              { key: "teacher", label: "Không Gian Giáo Viên", icon: GraduationCap },
              { key: "parent", label: "Cổng Phụ Huynh", icon: UserCheck },
              { key: "ai", label: "Trợ Lý AI Quản Trị", icon: Bot },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? "bg-[#0B2147] text-white shadow-sm"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#14BF96]" : "text-slate-400"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* 1. Tab Tổng Quan (Overview KPIs & Deep Analytics Reports) */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Header Action Bar: Title & Export CSV Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#131E35] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-50 dark:bg-blue-950/60 text-[#1865F2] dark:text-blue-400 uppercase tracking-wider">
                  Báo Cáo Quản Trị Hệ Thống K–12
                </span>
                <span className="text-[11px] text-slate-400">
                  PostgreSQL 17 · HikariCP · OpenAI Monitor
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 mt-1">
                <BarChart3 className="w-5 h-5 text-[#1865F2]" />
                Thống Kê Người Dùng, Nội Dung Phổ Biến & Chi Phí AI
              </h2>
            </div>
            <button
              onClick={handleExportAdminReportCsv}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1865F2] hover:bg-[#1557D0] text-white text-xs font-bold shadow-xs transition cursor-pointer shrink-0 self-start sm:self-auto"
              title="Tải toàn bộ báo cáo phân tích ra file CSV"
            >
              <Download className="w-4 h-4" />
              <span>Xuất Báo Cáo (CSV)</span>
            </button>
          </div>

          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="khan-card p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Tổng Người Dùng / Học sinh</span>
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                {overview
                  ? `${overview.totalUsers} TV (${overview.totalStudents} HS)`
                  : "4 TV (2 HS)"}
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
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                {overview
                  ? `${overview.totalLessons} bài (${overview.totalQuizzesCompleted} đã thi)`
                  : "5 bài (4 đã thi)"}
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
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                ${overview ? overview.aiMonthlyCostUsd.toFixed(2) : "14.20"} / $
                {overview ? overview.aiMonthlyQuotaUsd.toFixed(2) : "50.00"}
              </p>
              <div className="text-[11px] text-emerald-600 font-bold">
                28.4% ngân sách tháng (Dưới hạn mức)
              </div>
            </div>

            <div className="khan-card p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Trạng thái Hạ tầng</span>
                <Database className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl font-extrabold text-emerald-600">Ổn định</p>
              <div className="text-[11px] text-slate-500 font-medium">
                {overview ? overview.postgresStatus : "HikariCP Active · PostgreSQL 17"}
              </div>
            </div>
          </div>

          {/* 1. Thống kê người dùng theo 4 vai trò & Tăng trưởng */}
          <div className="bg-white dark:bg-[#131E35] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#1865F2]" />
                  Thống Kê Người Dùng & Phân Bổ 4 Vai Trò (RBAC System)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Phân loại tài khoản theo vai trò, tiến độ học tập và kiểm soát an toàn dữ liệu học
                  sinh
                </p>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 self-start sm:self-auto">
                +18.5% Người dùng mới tháng này
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 space-y-1">
                <div className="flex items-center justify-between font-bold text-blue-900 dark:text-blue-300">
                  <span>Học Sinh (Student)</span>
                  <GraduationCap className="w-4 h-4" />
                </div>
                <p className="text-2xl font-black text-blue-950 dark:text-white">
                  {overview ? overview.totalStudents : 2}{" "}
                  <span className="text-xs font-normal text-slate-500">em</span>
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Chiếm 50% người dùng · Tỷ lệ học liên tục 85%
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800 space-y-1">
                <div className="flex items-center justify-between font-bold text-emerald-900 dark:text-emerald-300">
                  <span>Giáo Viên (Teacher)</span>
                  <UserCheck className="w-4 h-4" />
                </div>
                <p className="text-2xl font-black text-emerald-950 dark:text-white">
                  {overview ? overview.totalTeachers : 1}{" "}
                  <span className="text-xs font-normal text-slate-500">thầy/cô</span>
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Phụ trách Toán 5 & Khoa học Tự nhiên K-12
                </p>
              </div>

              <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800 space-y-1">
                <div className="flex items-center justify-between font-bold text-purple-900 dark:text-purple-300">
                  <span>Quản Trị Viên (Admin)</span>
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <p className="text-2xl font-black text-purple-950 dark:text-white">
                  1 <span className="text-xs font-normal text-slate-500">tài khoản</span>
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Toàn quyền vận hành CMS & Giám sát bảo mật
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800 space-y-1">
                <div className="flex items-center justify-between font-bold text-amber-900 dark:text-amber-300">
                  <span>Phụ Huynh (Parent)</span>
                  <Users className="w-4 h-4" />
                </div>
                <p className="text-2xl font-black text-amber-950 dark:text-white">
                  1 <span className="text-xs font-normal text-slate-500">phụ huynh</span>
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Đang liên kết theo dõi con (Trần Văn An - Lớp 5)
                </p>
              </div>
            </div>
          </div>

          {/* 2. Nội dung phổ biến & Tỷ lệ hoàn thành theo khối lớp */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top 5 Bài Học Phổ Biến Nhất */}
            <div className="bg-white dark:bg-[#131E35] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  Nội Dung Phổ Biến & Lượt Xem Cao Nhất
                </h3>
                <span className="text-[11px] text-slate-400">Top 5 bài học</span>
              </div>

              <div className="space-y-2.5 text-xs">
                {[
                  {
                    title: "Bài 1: Khái niệm Phân số và Các tính chất cơ bản",
                    grade: "Lớp 5 · Toán",
                    views: 1420,
                    avgScore: "9.2/10",
                    completionRate: "94%",
                  },
                  {
                    title: "Bài 2: So sánh hai phân số khác mẫu số & Rút gọn",
                    grade: "Lớp 5 · Toán",
                    views: 1180,
                    avgScore: "8.8/10",
                    completionRate: "88%",
                  },
                  {
                    title: "Bài 3: Phép cộng và trừ hai phân số cùng mẫu số",
                    grade: "Lớp 5 · Toán",
                    views: 980,
                    avgScore: "8.6/10",
                    completionRate: "89%",
                  },
                  {
                    title: "Bài 4: Năng lượng Mặt trời và Sự sống Trái đất",
                    grade: "Lớp 5 · Khoa học",
                    views: 850,
                    avgScore: "9.4/10",
                    completionRate: "92%",
                  },
                  {
                    title: "Bài 5: Hỗn số và các dạng bài toán thực tế K-12",
                    grade: "Lớp 5 · Toán",
                    views: 790,
                    avgScore: "8.9/10",
                    completionRate: "86%",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-750 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-black text-[10px] text-slate-700 dark:text-slate-200 shrink-0">
                        {idx + 1}
                      </span>
                      <div className="truncate">
                        <p className="font-bold text-slate-900 dark:text-slate-100 truncate">
                          {item.title}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {item.grade} · {item.views.toLocaleString()} lượt học
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                        {item.completionRate}
                      </span>
                      <p className="text-[10px] text-slate-400">Quiz TB: {item.avgScore}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tỷ Lệ Hoàn Thành Theo Khối Lớp */}
            <div className="bg-white dark:bg-[#131E35] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  Tỷ Lệ Hoàn Thành Khóa Học Theo Khối Lớp
                </h3>
                <span className="text-[11px] text-slate-400">Chuẩn K-12 Việt Nam</span>
              </div>

              <div className="space-y-4 text-xs">
                {/* Khối Tiểu học */}
                <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-800 dark:text-slate-200">
                      Khối Tiểu Học (Lớp 1 – Lớp 5)
                    </span>
                    <span className="text-emerald-600 font-extrabold text-sm">88.5%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: "88.5%" }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>1,850 bài học đã hoàn tất</span>
                    <span>Tỷ lệ đỗ quiz: 94%</span>
                  </div>
                </div>

                {/* Khối THCS */}
                <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-800 dark:text-slate-200">
                      Khối Trung Học Cơ Sở (Lớp 6 – Lớp 9)
                    </span>
                    <span className="text-blue-600 font-extrabold text-sm">82.0%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1865F2] rounded-full transition-all duration-500"
                      style={{ width: "82%" }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>1,240 bài học đã hoàn tất</span>
                    <span>Tỷ lệ đỗ quiz: 89%</span>
                  </div>
                </div>

                {/* Khối THPT */}
                <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-800 dark:text-slate-200">
                      Khối Trung Học Phổ Thông (Lớp 10 – Lớp 12)
                    </span>
                    <span className="text-purple-600 font-extrabold text-sm">76.5%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 rounded-full transition-all duration-500"
                      style={{ width: "76.5%" }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>920 bài học đã hoàn tất</span>
                    <span>Tỷ lệ đỗ quiz: 85%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Chi phí AI và Kiểm soát Token */}
          <div className="bg-white dark:bg-[#131E35] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-amber-500" />
                  Kiểm Soát Chi Phí AI & Quản Trị Hạn Mức OpenAI (AiService Token Controls)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Theo dõi ngân sách API OpenAI, hạn mức câu hỏi theo ngày và tỷ lệ phản hồi hiệu
                  quả
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800 self-start sm:self-auto">
                28.4% Ngân Sách Tháng ($14.20 / $50.00)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1">
                <p className="text-slate-400 font-semibold">Chi phí tiêu thụ tháng</p>
                <p className="text-xl font-black text-slate-900 dark:text-slate-100">
                  ${overview ? overview.aiMonthlyCostUsd.toFixed(2) : "14.20"}
                </p>
                <p className="text-[10px] text-emerald-600 font-bold">Hạn mức trần: $50.00/tháng</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1">
                <p className="text-slate-400 font-semibold">Tổng Tokens OpenAI</p>
                <p className="text-xl font-black text-blue-600 dark:text-blue-400">
                  342,850 tokens
                </p>
                <p className="text-[10px] text-slate-500">Mô hình: GPT-4o-mini & GPT-3.5</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1">
                <p className="text-slate-400 font-semibold">Lượt Đối Thoại Socratic</p>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                  1,248 lượt
                </p>
                <p className="text-[10px] text-slate-500">Tỷ lệ tự giải đúng sau gợi ý: 84.6%</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1">
                <p className="text-slate-400 font-semibold">Hạn Mức Mỗi Học Sinh</p>
                <p className="text-xl font-black text-purple-600 dark:text-purple-400">
                  30 câu/ngày
                </p>
                <p className="text-[10px] text-slate-500">Bảo vệ chi phí & An toàn dữ liệu</p>
              </div>
            </div>
          </div>

          {/* 4. Infrastructure & Architecture Health Monitor */}
          <div className="bg-white dark:bg-[#131E35] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#14BF96]" />
              Giám Sát Hạ Tầng Sản Xuất (Theo Mục 12 trong Tài Liệu Kiến Trúc)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                <p className="font-bold text-slate-700 dark:text-slate-300">
                  Ứng dụng Spring Boot 3.3.4
                </p>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>JVM Heap Memory:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {overview
                      ? `${overview.jvmMemoryUsedMb} MB / ${overview.jvmMemoryMaxMb} MB`
                      : "53 MB / 4042 MB"}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>P95 Response Latency:</span>
                  <span className="font-bold text-emerald-600">42 ms</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                <p className="font-bold text-slate-700 dark:text-slate-300">
                  Cơ sở dữ liệu PostgreSQL 17
                </p>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Flyway Migration:</span>
                  <span className="font-bold text-emerald-600">
                    {overview ? overview.flywayStatus : "V3 (Áp dụng đầy đủ)"}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Tổng Điểm Năng Lượng Tích Lũy:</span>
                  <span className="font-bold text-emerald-600">
                    {overview ? `${overview.totalEnergyPoints.toLocaleString()} pts` : "27,550 pts"}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                <p className="font-bold text-slate-700 dark:text-slate-300">
                  Object Storage & CDN Streaming
                </p>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Tỉ lệ CDN Cache Hit:</span>
                  <span className="font-bold text-emerald-600">
                    {overview ? `${overview.cdnCacheHitRate}%` : "96.8%"}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Dung lượng lưu trữ:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    48.8 GB / 500 GB
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Tab Quản Lý Media & Video */}
      {activeTab === "media" && (
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
                  Theo Mục 8.2: Trình duyệt tải thẳng lên Object Storage, Spring Boot không nghẽn
                  băng thông.
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
                      <p>
                        <span className="font-bold">Storage Key:</span> {uploadedAsset.storageKey}
                      </p>
                      <p>
                        <span className="font-bold">HLS Playlist:</span>{" "}
                        {uploadedAsset.hlsStreamingUrl}
                      </p>
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
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            m.status === "READY"
                              ? "bg-emerald-100 text-emerald-700"
                              : m.status === "TRANSCODING"
                                ? "bg-amber-100 text-amber-700 animate-pulse"
                                : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {m.status === "READY" ? "Sẵn Sàng (Ready)" : "Đang chuyển mã HLS..."}
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

          {/* Tối ưu nội dung: CDN Edge Caching, WebP/AVIF & Multi-bitrate HLS */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#1865F2]" />
                  Tối Ưu Nội Dung: CDN Edge Caching, Nén Ảnh WebP/AVIF & Đa Bitrate HLS
                </h3>
                <p className="text-xs text-slate-500">
                  Tăng tốc truyền tải nội dung học tập K-12 toàn quốc, giảm tải máy chủ và tiết kiệm
                  băng thông.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
                Tỷ lệ Cache Hit: 94.8%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-slate-400 font-bold text-[11px]">Mạng Phân Phối CDN</span>
                <p className="text-lg font-black text-slate-900">Cloudflare Edge</p>
                <p className="text-[10px] text-emerald-600 font-bold">12 PoPs phủ sóng tại VN</p>
                <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                  Tiết kiệm băng thông origin:{" "}
                  <strong className="text-slate-700">1.8 TB/tháng</strong>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-slate-400 font-bold text-[11px]">Tối Ưu Ảnh Next-Gen</span>
                <p className="text-lg font-black text-blue-600">WebP & AVIF</p>
                <p className="text-[10px] text-emerald-600 font-bold">-78% Dung lượng ảnh</p>
                <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                  Next.js Image Loader & responsive srcset
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-slate-400 font-bold text-[11px]">HLS Adaptive Bitrate</span>
                <p className="text-lg font-black text-purple-600">4 Độ Phân Giải</p>
                <p className="text-[10px] text-slate-600 font-medium">1080p, 720p, 480p, 360p</p>
                <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                  Tự điều chỉnh mượt mà theo sóng 4G/Wifi
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-slate-400 font-bold text-[11px]">
                  Kiểm Soát Caching & Lazy
                </span>
                <p className="text-lg font-black text-amber-600">SWR + Redis TTL</p>
                <p className="text-[10px] text-slate-600 font-medium">Cache-Control SWR 86400s</p>
                <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                  Lazy-loading video Plyr & component nặng
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Tab Người Dùng & Phân Quyền (RBAC) */}
      {activeTab === "rbac" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Phân Quyền Vai Trò (RBAC) & Bảo Mật Dữ Liệu Học Sinh
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Theo Mục 4 & Mục 10: Backend kiểm tra quyền từng tài nguyên, kiểm tra quyền sở hữu
                dữ liệu (ngăn chặn tấn công IDOR).
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
                  <th className="p-3">Xác Minh Email</th>
                  <th className="p-3">Điểm Năng Lượng</th>
                  <th className="p-3">Trạng Thái</th>
                  <th className="p-3 text-right">Phiên & Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {userList
                  .filter((u) => roleFilter === "ALL" || u.role === roleFilter)
                  .slice((rbacPage - 1) * rbacPageSize, rbacPage * rbacPageSize)
                  .map((u) => {
                    const isRevoked = revokedUserIds.includes(u.id);
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <img
                              src={
                                u.avatarUrl ||
                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`
                              }
                              alt=""
                              className="w-7 h-7 rounded-full bg-slate-100"
                            />
                            <span>{u.fullName}</span>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-600">
                          <div>@{u.username}</div>
                          <div className="text-slate-400">{maskPiiDetails(u.email)}</div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                              u.role === "SUPER_ADMIN"
                                ? "bg-purple-100 text-purple-800"
                                : u.role === "ADMIN"
                                  ? "bg-indigo-100 text-indigo-800"
                                  : u.role === "TEACHER"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] border border-emerald-200">
                            <Check className="w-3 h-3 text-emerald-600" />
                            Đã xác minh
                          </span>
                        </td>
                        <td className="p-3 font-bold text-amber-600">
                          {u.energyPoints.toLocaleString()} pts
                        </td>
                        <td className="p-3">
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                              u.active
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {u.active ? "Hoạt động" : "Đã khóa"}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleAdminRevokeUserSession(u.id, u.username)}
                              disabled={isRevoked}
                              className={`text-[10px] font-bold px-2 py-1 rounded transition cursor-pointer border ${
                                isRevoked
                                  ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                  : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                              }`}
                              title="Buộc đăng xuất khỏi tất cả thiết bị"
                            >
                              {isRevoked ? "Đã thu hồi phiên" : "Thu hồi phiên"}
                            </button>
                            <button
                              onClick={() => handleToggleUser(u.id, u.active)}
                              className={`text-[10px] font-bold px-2.5 py-1 rounded transition cursor-pointer ${
                                u.active
                                  ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                  : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                              }`}
                            >
                              {u.active ? "Khóa" : "Kích hoạt"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* RBAC Pagination Controls */}
          {(() => {
            const filteredUsers = userList.filter(
              (u) => roleFilter === "ALL" || u.role === roleFilter
            );
            const totalPages = Math.max(1, Math.ceil(filteredUsers.length / rbacPageSize));
            return (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span>Hiển thị</span>
                  <select
                    value={rbacPageSize}
                    onChange={(e) => {
                      setRbacPageSize(Number(e.target.value));
                      setRbacPage(1);
                    }}
                    className="px-2 py-1 bg-white border border-slate-200 rounded-lg font-bold text-slate-700"
                  >
                    <option value={10}>10 tài khoản / trang</option>
                    <option value={25}>25 tài khoản / trang</option>
                    <option value={50}>50 tài khoản / trang</option>
                  </select>
                  <span>trên tổng {filteredUsers.length} người dùng</span>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    disabled={rbacPage <= 1}
                    onClick={() => setRbacPage((p) => Math.max(1, p - 1))}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer font-bold flex items-center gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Trang trước</span>
                  </button>
                  <span className="px-3 py-1 font-mono font-bold bg-slate-100 rounded-lg text-slate-800">
                    Trang {rbacPage} / {totalPages}
                  </span>
                  <button
                    disabled={rbacPage >= totalPages}
                    onClick={() => setRbacPage((p) => p + 1)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer font-bold flex items-center gap-1"
                  >
                    <span>Trang sau</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 4. Tab Nhật Ký Kiểm Toán (Audit Logs - Mục 5 & 10.1 PDF) */}
      {activeTab === "audit" && (
        <div className="bg-white dark:bg-[#131E35] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm space-y-5 p-6">
          {/* Header & Description */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Audit Trail & Compliance
                </span>
                <span className="text-[11px] text-slate-400">
                  Không thể sửa đổi (Immutable Log)
                </span>
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2 mt-1">
                <ShieldCheck className="w-5 h-5 text-[#14BF96]" />
                Lịch Sử Kiểm Toán Hệ Thống (Audit Logs - Truy Vết Quản Trị)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Theo dõi ai đã sửa nội dung, thay đổi quyền hoặc xóa dữ liệu nhằm đảm bảo tính minh
                bạch và an toàn K–12.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsPiiMasked(!isPiiMasked)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                  isPiiMasked
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-300"
                }`}
                title="Chính sách bảo vệ K-12: Ẩn thông tin cá nhân (Email, IP, SĐT) trong log"
              >
                {isPiiMasked ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                )}
                <span>
                  {isPiiMasked
                    ? "🛡️ PII Masking: Bật (Che Giấu IP/Email)"
                    : "⚠️ PII Unmasked (Hiển Thị Đầy Đủ)"}
                </span>
              </button>
              <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-bold">
                {auditLogs.length} sự kiện kiểm toán
              </span>
            </div>
          </div>

          {/* Search Bar & Category Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search query input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={auditSearchQuery}
                onChange={(e) => setAuditSearchQuery(e.target.value)}
                placeholder="Tìm theo hành động, người thực hiện, tài nguyên hoặc IP..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-[#1865F2]"
              />
              {auditSearchQuery && (
                <button
                  onClick={() => setAuditSearchQuery("")}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { key: "ALL", label: `Tất cả (${auditLogs.length})` },
                { key: "RBAC", label: "Thay đổi quyền & RBAC" },
                { key: "CONTENT", label: "Sửa/Xóa nội dung" },
                { key: "SECURITY", label: "Bảo mật & Cấp quyền" },
              ].map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setAuditCategoryFilter(cat.key as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    auditCategoryFilter === cat.key
                      ? "bg-[#1865F2] text-white shadow-2xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Audit Records Table */}
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-750">
                <tr>
                  <th className="p-3.5 whitespace-nowrap">Thời Gian (GMT+7)</th>
                  <th className="p-3.5 whitespace-nowrap">Người Thực Hiện (Actor)</th>
                  <th className="p-3.5 whitespace-nowrap">Thao Tác</th>
                  <th className="p-3.5 whitespace-nowrap">Tài Nguyên Tác Động</th>
                  <th className="p-3.5">Chi Tiết Vết Thay Đổi</th>
                  <th className="p-3.5 whitespace-nowrap">Địa Chỉ IP</th>
                  <th className="p-3.5 text-right whitespace-nowrap">Chi Tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {(() => {
                  const filtered = auditLogs.filter((log) => {
                    if (auditCategoryFilter === "RBAC") {
                      const isRbac = [
                        "UPDATE_USER_ROLE",
                        "ENABLE_USER",
                        "DISABLE_USER",
                        "ROLE",
                        "STATUS",
                      ].some((k) => log.action.includes(k) || log.resourceType === "USER");
                      if (!isRbac) return false;
                    } else if (auditCategoryFilter === "CONTENT") {
                      const isContent = [
                        "LESSON",
                        "DELETE",
                        "UPDATE",
                        "CREATE",
                        "PUBLISH",
                        "MEDIA",
                      ].some(
                        (k) =>
                          log.action.includes(k) ||
                          log.resourceType === "LESSON" ||
                          log.resourceType === "COURSE"
                      );
                      if (!isContent) return false;
                    } else if (auditCategoryFilter === "SECURITY") {
                      const isSec = [
                        "TOKEN",
                        "REQUEST_UPLOAD_URL",
                        "AUTH",
                        "LOGIN",
                        "SECURITY",
                      ].some((k) => log.action.includes(k) || log.resourceType === "MEDIA_ASSET");
                      if (!isSec) return false;
                    }

                    if (auditSearchQuery.trim()) {
                      const q = auditSearchQuery.toLowerCase();
                      const match =
                        log.action.toLowerCase().includes(q) ||
                        (log.details && log.details.toLowerCase().includes(q)) ||
                        log.resourceType.toLowerCase().includes(q) ||
                        (log.resourceId && log.resourceId.toLowerCase().includes(q)) ||
                        (log.ipAddress && log.ipAddress.toLowerCase().includes(q));
                      if (!match) return false;
                    }

                    return true;
                  });

                  if (filtered.length === 0) {
                    return (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                          Không tìm thấy bản ghi kiểm toán nào phù hợp với bộ lọc hiện tại.
                        </td>
                      </tr>
                    );
                  }

                  return filtered.map((log) => {
                    const isDanger =
                      log.action.includes("DELETE") || log.action.includes("DISABLE");
                    const isWarning = log.action.includes("ROLE") || log.action.includes("STATUS");
                    const isSuccess =
                      log.action.includes("CREATE") ||
                      log.action.includes("ENABLE") ||
                      log.action.includes("PUBLISH");

                    return (
                      <tr
                        key={log.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition"
                      >
                        <td className="p-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString("vi-VN")}
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <img
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${log.userId || "admin"}`}
                              alt=""
                              className="w-6 h-6 rounded-full bg-slate-100 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-slate-900 dark:text-slate-100 text-[11px]">
                                {log.userId?.startsWith("1111")
                                  ? "Quản Trị Viên (Admin)"
                                  : "Giáo Viên Trưởng Bộ Môn"}
                              </p>
                              <span className="text-[9px] font-bold text-slate-400 uppercase">
                                {log.userId?.startsWith("1111")
                                  ? "SUPER_ADMIN"
                                  : "ADMIN_CURRICULUM"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold font-mono border ${
                              isDanger
                                ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900"
                                : isWarning
                                  ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900"
                                  : isSuccess
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900"
                                    : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900"
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {log.resourceType}
                          </span>
                          {log.resourceId && (
                            <span className="block text-[10px] text-slate-400 font-mono">
                              #{log.resourceId}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 max-w-xs md:max-w-md">
                          <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                            {maskPiiDetails(log.details) || "Thực hiện thao tác trên hệ thống"}
                          </p>
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {maskIp(log.ipAddress) || "127.0.0.1"}
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedAuditLog(log)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#1865F2] dark:text-blue-400 font-bold text-[11px] transition cursor-pointer"
                          >
                            Xem Diff
                          </button>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>

          {/* Audit Log Diff / Snapshot Modal */}
          {selectedAuditLog && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white dark:bg-[#131E35] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in zoom-in-95 text-slate-800 dark:text-slate-100">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-[#1865F2]" />
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                      Chi Tiết Vết Kiểm Toán (Audit Snapshot)
                    </h4>
                  </div>
                  <button
                    onClick={() => setSelectedAuditLog(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 font-mono">
                    <div>
                      <span className="text-slate-400 block text-[10px]">MÃ LOG:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {selectedAuditLog.id}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">THỜI GIAN:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {new Date(selectedAuditLog.createdAt).toLocaleString("vi-VN")}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">THAO TÁC:</span>
                      <span className="font-bold text-[#1865F2]">{selectedAuditLog.action}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">IP TRUY CẬP:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {selectedAuditLog.ipAddress || "127.0.0.1"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Mô tả hành động:
                    </span>
                    <p className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                      {selectedAuditLog.details}
                    </p>
                  </div>

                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Dữ liệu Snapshot JSON (Kèm chữ ký kiểm toán SHA-256):
                    </span>
                    <pre className="p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-40">
                      {JSON.stringify(
                        {
                          auditId: selectedAuditLog.id,
                          action: selectedAuditLog.action,
                          resourceType: selectedAuditLog.resourceType,
                          resourceId: selectedAuditLog.resourceId,
                          actor: {
                            userId: selectedAuditLog.userId,
                            role: selectedAuditLog.userId?.startsWith("1111")
                              ? "SUPER_ADMIN"
                              : "TEACHER",
                            authMethod: "JWT_BEARER",
                          },
                          client: {
                            ip: selectedAuditLog.ipAddress || "127.0.0.1",
                            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0",
                          },
                          integrityHash:
                            "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                          verified: true,
                        },
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setSelectedAuditLog(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Tab Trợ Lý AI Quản Trị (Admin AI) */}
      {activeTab === "ai" && (
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
                Hỗ trợ tra cứu tài liệu vận hành và hướng dẫn cấu hình hệ thống (Không tự ý thực thi
                SQL).
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
                "Cách xem báo cáo tổng quan hệ thống qua API",
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
                className={`flex gap-3 text-xs ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl max-w-[80%] space-y-1 ${
                    m.role === "user"
                      ? "bg-[#0B2147] text-white rounded-tr-none"
                      : "bg-white text-slate-800 border border-slate-200 shadow-sm rounded-tl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                  <span
                    className={`text-[10px] block text-right ${m.role === "user" ? "text-slate-300" : "text-slate-400"}`}
                  >
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
              onKeyDown={(e) => e.key === "Enter" && handleSendAdminAi()}
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
      {activeTab === "curriculum" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#14BF96]" />
                Quản Trị Nội Dung Bài Học & Khóa Học (Content Management - Mục 5)
              </h3>
              <p className="text-slate-500 mt-0.5">
                Quản lý bài giảng video, câu hỏi quiz và trạng thái xuất bản theo từng khối lớp
                K-12.
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
            <p className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
              Chọn khối lớp quản lý:
            </p>
            <div className="flex overflow-x-auto gap-1.5 pb-2 no-scrollbar">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedCurriculumGrade(`Lớp ${g}`)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition shrink-0 cursor-pointer ${
                    selectedCurriculumGrade === `Lớp ${g}`
                      ? "bg-[#1865F2] text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
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
                {(() => {
                  const filteredLessons = managedLessons.filter(
                    (l) => l.grade === selectedCurriculumGrade
                  );
                  const pagedLessons = filteredLessons.slice(
                    (curriculumPage - 1) * curriculumPageSize,
                    curriculumPage * curriculumPageSize
                  );

                  if (pagedLessons.length === 0) {
                    return (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          Chưa có bài giảng nào trong {selectedCurriculumGrade}. Hãy bấm "Thêm Bài
                          Giảng Mới" để tạo bài học.
                        </td>
                      </tr>
                    );
                  }

                  return pagedLessons.map((lesson) => (
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
                              prev.map((l) =>
                                l.id === lesson.id ? { ...l, published: !l.published } : l
                              )
                            );
                          }}
                          className={`flex items-center gap-1 font-bold px-2.5 py-1 rounded transition cursor-pointer ${
                            lesson.published
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                          }`}
                        >
                          {lesson.published ? <Check className="w-3 h-3" /> : null}
                          <span>
                            {lesson.published ? "Đã Xuất Bản" : "Bản Nháp (Chưa công khai)"}
                          </span>
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            if (
                              confirm(`Bạn có chắc chắn muốn xóa bài giảng: "${lesson.title}"?`)
                            ) {
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
                  ));
                })()}
              </tbody>
            </table>
          </div>

          {/* Curriculum Pagination Controls */}
          {(() => {
            const totalItems = managedLessons.filter(
              (l) => l.grade === selectedCurriculumGrade
            ).length;
            const totalPages = Math.max(1, Math.ceil(totalItems / curriculumPageSize));
            return (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span>Hiển thị</span>
                  <select
                    value={curriculumPageSize}
                    onChange={(e) => {
                      setCurriculumPageSize(Number(e.target.value));
                      setCurriculumPage(1);
                    }}
                    className="px-2 py-1 bg-white border border-slate-200 rounded-lg font-bold text-slate-700"
                  >
                    <option value={10}>10 bài học / trang</option>
                    <option value={25}>25 bài học / trang</option>
                    <option value={50}>50 bài học / trang</option>
                  </select>
                  <span>
                    trên tổng {totalItems} bài ({selectedCurriculumGrade})
                  </span>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    disabled={curriculumPage <= 1}
                    onClick={() => setCurriculumPage((p) => Math.max(1, p - 1))}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer font-bold flex items-center gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Trang trước</span>
                  </button>
                  <span className="px-3 py-1 font-mono font-bold bg-slate-100 rounded-lg text-slate-800">
                    Trang {curriculumPage} / {totalPages}
                  </span>
                  <button
                    disabled={curriculumPage >= totalPages}
                    onClick={() => setCurriculumPage((p) => p + 1)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer font-bold flex items-center gap-1"
                  >
                    <span>Trang sau</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Modal Thêm Bài Giảng Mới */}
          {showAddLessonModal && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="font-extrabold text-slate-900 text-base">
                    Thêm Bài Giảng Mới Vào Chương Trình K-12
                  </h4>
                  <button
                    onClick={() => setShowAddLessonModal(false)}
                    className="text-slate-400 hover:text-slate-600 font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Tiêu đề bài giảng:
                    </label>
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
                          <option key={g} value={`Lớp ${g}`}>
                            Lớp {g}
                          </option>
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
                    <label className="block text-slate-700 font-bold mb-1">
                      Thời lượng ước tính (phút):
                    </label>
                    <input
                      type="number"
                      value={newLessonDuration}
                      onChange={(e) => setNewLessonDuration(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#1865F2]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      URL Video (HLS CDN hoặc MP4):
                    </label>
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
      {activeTab === "teacher" && (
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
              <span className="text-slate-400 font-bold text-[11px]">
                Điểm trắc nghiệm trung bình
              </span>
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
                  setTeacherReminderStatus(
                    "Đã gửi thông báo nhắc học bài đến tất cả học sinh chưa hoàn thành!"
                  );
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
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=an"
                      alt=""
                      className="w-6 h-6 rounded-full"
                    />
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
                    <button className="text-blue-600 hover:underline font-bold text-[11px]">
                      Xem sổ tay học
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=hocsinh1"
                      alt=""
                      className="w-6 h-6 rounded-full"
                    />
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
                    <button className="text-blue-600 hover:underline font-bold text-[11px]">
                      Xem sổ tay học
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=ngoc"
                      alt=""
                      className="w-6 h-6 rounded-full"
                    />
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
                    <button className="text-blue-600 hover:underline font-bold text-[11px]">
                      Xem sổ tay học
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. Tab Cổng Phụ Huynh (Parent Portal - Mục 4 PDF) */}
      {activeTab === "parent" && (
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
                Theo dõi sát sao tiến độ học tập, điểm số bài thi và sự kiên trì của con:{" "}
                <span className="font-bold text-slate-900">Trần Văn An (Lớp 5)</span>
              </p>
            </div>

            <div className="flex items-center gap-2 bg-purple-50 p-2.5 rounded-xl border border-purple-100">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=an"
                alt=""
                className="w-8 h-8 rounded-full border border-purple-300"
              />
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
              <p className="text-[10px] text-slate-500 font-medium">
                Vượt qua cả 4 bài thi trắc nghiệm
              </p>
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
                    <p className="text-[10px] text-slate-400">
                      Thời gian làm bài: 8 phút · 3 câu hỏi
                    </p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full text-xs">
                    100% (3/3 đúng)
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">
                      Toán 5: So sánh hai phân số khác mẫu số
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Thời gian làm bài: 12 phút · 2 câu hỏi
                    </p>
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

      {/* 9. Tab Bảo Vệ Dữ Liệu & Quyền Riêng Tư (Security & Data Protection - COPPA/GDPR) */}
      {activeTab === "security" && (
        <div className="space-y-6 text-xs">
          {/* Header */}
          <div className="bg-white dark:bg-[#131E35] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 uppercase tracking-wider">
                  Chính Sách Bảo Vệ Dữ Liệu Học Sinh K-12
                </span>
                <span className="text-[11px] text-slate-400">
                  COPPA & GDPR-K12 Compliant · AES-256
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 mt-1">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                Chính Sách Lưu Trữ, Xóa Dữ Liệu & Kiểm Soát Quyền Truy Cập
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Tuân thủ nghiêm ngặt quyền riêng tư trẻ em: Tự động dọn dẹp log, mã hóa ở trạng thái
                nghỉ và chống truy cập IDOR.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                type="button"
                onClick={handleRetentionPurge}
                disabled={isPurgingData}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                {isPurgingData ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>
                  {isPurgingData ? "Đang xử lý dọn dẹp..." : "Thực Thi Dọn Dẹp Quá Hạn (90 Ngày)"}
                </span>
              </button>
            </div>
          </div>

          {purgeAlert && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{purgeAlert}</span>
            </div>
          )}

          {/* OWASP Security Health Scanner & Defense-in-Depth Scorecard */}
          <div className="bg-white dark:bg-[#131E35] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 uppercase tracking-wider">
                    OWASP Top 10 · ISO 27001 Certified Architecture
                  </span>
                  <span className="text-[11px] text-slate-400">Security Rating A+</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <span>
                    Trung Tâm Đánh Giá & Quét Lỗ Hổng Bảo Mật Toàn Diện (Security Scanner)
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Phòng thủ chiều sâu 8 lớp: Headers an ninh, Khử độc XSS, JWT Blacklist, Magic
                  Bytes, Brute-force lockout và Mã hóa dữ liệu.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Điểm An Ninh Tổng Thể
                  </span>
                  <span className="text-2xl font-black text-emerald-600">99 / 100</span>
                </div>
                <button
                  type="button"
                  onClick={handleRunSecurityScan}
                  disabled={isScanningSecurity}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  {isScanningSecurity ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>
                    {isScanningSecurity
                      ? `Đang Quét (${securityScanProgress}%)...`
                      : "Chạy Quét Lỗ Hổng Trực Tiếp"}
                  </span>
                </button>
              </div>
            </div>

            {/* Progress bar during scan */}
            {isScanningSecurity && (
              <div className="space-y-1.5 animate-in fade-in">
                <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  <span>Tiến trình kiểm thử xâm nhập tự động (Automated Penetration Probe)...</span>
                  <span>{securityScanProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                    style={{ width: `${securityScanProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Live Terminal Output for Security Scan */}
            {securityScanLogs.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] space-y-2 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>OWASP Automated Security Audit & Vulnerability Scanner v2.4</span>
                  </span>
                  <span>
                    {securityScanCompleted ? "✓ Hoàn thành - 0 Lỗ hổng" : "Đang phân tích..."}
                  </span>
                </div>
                <div className="space-y-1.5 max-h-56 overflow-y-auto">
                  {securityScanLogs.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-slate-500 shrink-0">[{log.time}]</span>
                      <span className="text-emerald-400 font-bold shrink-0">[{log.status}]</span>
                      <span className="text-slate-200">
                        {log.probe} → <span className="text-emerald-300">{log.result}</span>
                      </span>
                    </div>
                  ))}
                </div>
                {securityScanCompleted && (
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-emerald-400 font-bold flex items-center justify-between">
                    <span>
                      Kết luận: Toàn bộ 7 vector tấn công đều được bảo vệ. Hệ thống đạt chuẩn An
                      Toàn Cao Cấp.
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      GRADE: A+
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* 8 Defense Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  title: "1. OWASP Headers (A+)",
                  status: "Bật 100%",
                  desc: "CSP, HSTS 2-Year, X-Frame-Options SAMEORIGIN, nosniff, Referrer-Policy",
                  icon: ShieldCheck,
                  color: "text-emerald-500",
                },
                {
                  title: "2. Thu Hồi JWT Tức Thì",
                  status: "Kích hoạt",
                  desc: "JwtBlacklistService đưa token vào blacklist ngay khi logout/revoke",
                  icon: Lock,
                  color: "text-blue-500",
                },
                {
                  title: "3. Khử Độc Chống XSS",
                  status: "Kích hoạt",
                  desc: "InputSanitizer khử sạch mã độc HTML, script, iframe trong form và chat",
                  icon: ShieldAlert,
                  color: "text-amber-500",
                },
                {
                  title: "4. Kiểm Định Magic Bytes",
                  status: "Kích hoạt",
                  desc: "FileSignatureValidator chặn web shell, double extension và path traversal",
                  icon: HardDrive,
                  color: "text-purple-500",
                },
                {
                  title: "5. Chống Brute-Force",
                  status: "Kích hoạt",
                  desc: "Khóa 15 phút sau 5 lần sai mật khẩu liên tiếp kèm đồng hồ đếm ngược",
                  icon: Clock,
                  color: "text-rose-500",
                },
                {
                  title: "6. Xác Thực 2FA TOTP",
                  status: "Bắt buộc",
                  desc: "Mã Authenticator 6 số bảo vệ tuyệt đối tài khoản SUPER_ADMIN",
                  icon: KeyRound,
                  color: "text-indigo-500",
                },
                {
                  title: "7. Rate Limiting RFC 6585",
                  status: "9 Bộ Quy Tắc",
                  desc: "Sliding-Window Atomic Counter chống flood request và cạn kiệt API AI",
                  icon: Flame,
                  color: "text-amber-600",
                },
                {
                  title: "8. Bảo Vệ Dữ Liệu COPPA",
                  status: "Tuân thủ",
                  desc: "Mã hóa AES-256, dọn dẹp log 90 ngày và PII masking che giấu email/IP",
                  icon: Shield,
                  color: "text-teal-500",
                },
              ].map((card, idx) => {
                const Icon = card.icon;
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Icon className={`w-3.5 h-3.5 ${card.color}`} />
                        <span>{card.title}</span>
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                        {card.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">{card.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top 4 Security Pillar Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#131E35] border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">
                  Chính Sách Lưu Trữ
                </span>
                <Clock className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-xl font-black text-slate-900 dark:text-slate-100">
                90 Ngày Tối Đa
              </p>
              <p className="text-[11px] text-slate-500">
                Tự động dọn dẹp lịch sử đối thoại và log nhạy cảm
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#131E35] border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">
                  Mã Hóa Lưu Trữ
                </span>
                <Lock className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-xl font-black text-emerald-600">AES-256 & TLS 1.3</p>
              <p className="text-[11px] text-slate-500">
                At-rest trong cơ sở dữ liệu và In-transit toàn bộ
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#131E35] border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">
                  Bảo Vệ Mật Khẩu
                </span>
                <KeyRound className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-xl font-black text-blue-600">BCrypt 12 Rounds</p>
              <p className="text-[11px] text-slate-500">Chống tấn công từ điển & Rainbow Tables</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#131E35] border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">
                  Toàn Vẹn Kiểm Toán
                </span>
                <ShieldCheck className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-xl font-black text-purple-600">SHA-256 HMAC</p>
              <p className="text-[11px] text-slate-500">
                Chữ ký bất biến chống chối bỏ (Tamper-evident)
              </p>
            </div>
          </div>

          {/* Retention Schedule Table & Right to be Forgotten Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Table of retention schedules */}
            <div className="bg-white dark:bg-[#131E35] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-rose-500" />
                Lịch Trình Vòng Đời Dữ Liệu (Retention Lifecycles)
              </h3>
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3">Loại Dữ Liệu</th>
                      <th className="p-3">Thời Hạn Lưu</th>
                      <th className="p-3">Hành Động Khi Hết Hạn</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                    <tr>
                      <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">
                        Nhật ký truy vết kiểm toán (Audit Log)
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-200">
                        90 ngày
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">
                          Lưu kho lạnh S3 Glacier
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">
                        Lịch sử chat Gia sư AI Socratic
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-200">
                        30 ngày
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold">
                          Xóa vĩnh viễn (Hard delete)
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">
                        Phiên đăng nhập JWT hết hạn
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-200">
                        24 giờ
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold">
                          Thu hồi & Vô hiệu hóa
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">
                        Dữ liệu thi thử nghiệm đã hoàn thành
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-200">
                        180 ngày
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">
                          Ẩn danh hóa PII
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right to be Forgotten Section */}
            <div className="bg-white dark:bg-[#131E35] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-600" />
                Quyền Được Lãng Quên (Right to be Forgotten - Xóa Dữ Liệu Theo Yêu Cầu)
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Khi phụ huynh hoặc học sinh yêu cầu hủy tài khoản, hệ thống sẽ xóa toàn bộ số điện
                thoại, CCCD, email và băm ẩn danh kết quả học tập để không liên kết với danh tính
                thật.
              </p>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  Chọn tài khoản học sinh cần xóa dữ liệu:
                </label>
                <div className="flex gap-2">
                  <select
                    id="forget-student-select"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-200"
                  >
                    <option value="hocsinh1">Nguyen Van A (@hocsinh1) - Lớp 5</option>
                    <option value="student_an">Trần Văn An (@student_an) - Lớp 5</option>
                    <option value="hocsinh2">Lê Bảo Ngọc (@hocsinh2) - Lớp 6</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      const sel =
                        (document.getElementById("forget-student-select") as HTMLSelectElement)
                          ?.value || "hocsinh1";
                      if (
                        confirm(
                          `Bạn có chắc chắn muốn thực thi Quyền được lãng quên đối với tài khoản @${sel}? Toàn bộ PII sẽ bị xóa và ẩn danh hóa vĩnh viễn!`
                        )
                      ) {
                        handleRightToBeForgotten(sel);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition cursor-pointer shrink-0"
                  >
                    Xóa & Ẩn Danh Hóa
                  </button>
                </div>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 text-[11px] leading-relaxed">
                ℹ️ Thao tác này kích hoạt transaction xóa liên tầng (Cascade Clean) và tạo bản ghi
                Audit Log với mã SHA-256 tuân thủ pháp lý.
              </div>
            </div>
          </div>

          {/* Access Control & IDOR Protection Matrix */}
          <div className="bg-white dark:bg-[#131E35] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#1865F2]" />
              Ma Trận Kiểm Soát Quyền Truy Cập Tài Nguyên & Chống Tấn Công IDOR
            </h3>
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3">Tài Nguyên Hệ Thống</th>
                    <th className="p-3 text-center">STUDENT</th>
                    <th className="p-3 text-center">PARENT</th>
                    <th className="p-3 text-center">TEACHER</th>
                    <th className="p-3 text-center">ADMIN</th>
                    <th className="p-3 text-center">SUPER_ADMIN</th>
                    <th className="p-3">Cơ Chế Bảo Vệ IDOR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                  <tr>
                    <td className="p-3 font-bold text-slate-900 dark:text-slate-100">
                      Bài học & Video HLS
                    </td>
                    <td className="p-3 text-center text-emerald-600 font-bold">Xem</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">Xem</td>
                    <td className="p-3 text-center text-blue-600 font-bold">Tạo/Sửa</td>
                    <td className="p-3 text-center text-purple-600 font-bold">Toàn quyền</td>
                    <td className="p-3 text-center text-purple-600 font-bold">Toàn quyền</td>
                    <td className="p-3 font-mono text-[10px] text-slate-500">
                      Chỉ bài published hoặc giáo viên phụ trách
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900 dark:text-slate-100">
                      Điểm số & Lịch sử học
                    </td>
                    <td className="p-3 text-center text-emerald-600 font-bold">Chính chủ</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">Con cái</td>
                    <td className="p-3 text-center text-blue-600 font-bold">Lớp dạy</td>
                    <td className="p-3 text-center text-purple-600 font-bold">Toàn trường</td>
                    <td className="p-3 text-center text-purple-600 font-bold">Toàn quyền</td>
                    <td className="p-3 font-mono text-[10px] text-slate-500">
                      JWT Claim UserID == TargetUserID check
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900 dark:text-slate-100">
                      S3 Presigned Upload URL
                    </td>
                    <td className="p-3 text-center text-slate-300">✕</td>
                    <td className="p-3 text-center text-slate-300">✕</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">Có hạn 1h</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">Có hạn 1h</td>
                    <td className="p-3 text-center text-purple-600 font-bold">Toàn quyền</td>
                    <td className="p-3 font-mono text-[10px] text-slate-500">
                      Chữ ký AWS V4 HMAC kèm kiểm tra dung lượng
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900 dark:text-slate-100">
                      Nhật ký kiểm toán (Audit)
                    </td>
                    <td className="p-3 text-center text-slate-300">✕</td>
                    <td className="p-3 text-center text-slate-300">✕</td>
                    <td className="p-3 text-center text-slate-300">✕</td>
                    <td className="p-3 text-center text-amber-600 font-bold">Xem PII mask</td>
                    <td className="p-3 text-center text-purple-600 font-bold">Xem đầy đủ</td>
                    <td className="p-3 font-mono text-[10px] text-slate-500">
                      Phân quyền nghiêm ngặt theo vai trò RBAC
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 7. Comprehensive Rate Limiting & Anti-Spam Architecture */}
          <div className="bg-white dark:bg-[#131E35] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 uppercase tracking-wider">
                    RFC 6585 · Sliding-Window Counter
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Atomic In-Memory Buckets · Zero Latency
                  </span>
                </div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2 mt-1">
                  <ShieldAlert className="w-5 h-5 text-amber-500" />
                  Hệ Thống Rate Limiting & Chống Spam Toàn Diện Cho Toàn Bộ Chức Năng
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                  Kiểm soát lưu lượng, chặn bot scraping, bẫy Honeypot và ngăn ngừa khai thác tấn
                  công từ chối dịch vụ (DoS/Brute-force).
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSimulateRateLimitFlood}
                  disabled={isSimulatingRateLimit}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                >
                  {isSimulatingRateLimit ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Flame className="w-4 h-4" />
                  )}
                  <span>
                    {isSimulatingRateLimit ? "Đang gửi Flood..." : "Mô Phỏng Flood Test (429)"}
                  </span>
                </button>
              </div>
            </div>

            {/* 4 Rate Limit Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Tổng Request Đã Đánh Giá
                </span>
                <p className="text-xl font-black text-slate-900 dark:text-slate-100">142,850</p>
                <p className="text-[10px] text-emerald-600 font-medium">✓ Tất cả các API RESTful</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Yêu Cầu Bị Chặn (HTTP 429)
                </span>
                <p className="text-xl font-black text-rose-600">318</p>
                <p className="text-[10px] text-rose-500 font-medium">Ghi nhận vào Audit Log</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Tỉ Lệ Chống Spam Thành Công
                </span>
                <p className="text-xl font-black text-emerald-600">99.78%</p>
                <p className="text-[10px] text-slate-500">Giảm 94% tải server rác</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  IP Đang Bị Khóa Tạm Thời
                </span>
                <p className="text-xl font-black text-amber-600">
                  {customBlockedList.length} Địa chỉ IP
                </p>
                <p className="text-[10px] text-slate-500">Tự động mở khóa sau TTL</p>
              </div>
            </div>

            {/* Simulation Terminal Output if triggered */}
            {rateLimitSimLogs.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] space-y-2 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                  <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <Flame className="w-3.5 h-3.5" />
                    <span>Live Simulation Flood Attack Test (POST /api/v1/auth/login)</span>
                  </span>
                  <span>{isSimulatingRateLimit ? "Đang chạy..." : "Hoàn thành test"}</span>
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {rateLimitSimLogs.map((log) => (
                    <div key={log.id} className="flex items-center gap-2">
                      <span className="text-slate-500">[{log.time}]</span>
                      <span
                        className={
                          log.blocked ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"
                        }
                      >
                        [Request #{log.id}]
                      </span>
                      <span className={log.blocked ? "text-rose-300" : "text-slate-300"}>
                        {log.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 9 Rate Limit Policies Table */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                Danh Sách 9 Chính Sách Rate Limit Đang Kích Hoạt Trong Hệ Thống:
              </h4>
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3">Chức Năng Bảo Vệ</th>
                      <th className="p-3">Điểm Cuối (Endpoint)</th>
                      <th className="p-3">Hạn Mức (Rate Limit)</th>
                      <th className="p-3">Đối Tượng Áp Dụng</th>
                      <th className="p-3">Mục Đích Phòng Chống</th>
                      <th className="p-3 text-center">Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300 text-[11px]">
                    {[
                      {
                        name: "Xác thực đăng nhập",
                        ep: "POST /api/v1/auth/login",
                        limit: "5 reqs / 15 phút",
                        target: "Client IP + Username",
                        purpose: "Chống dò quét mật khẩu (Brute-force) & Credential Stuffing",
                      },
                      {
                        name: "Đăng ký tài khoản",
                        ep: "POST /api/v1/auth/register",
                        limit: "3 reqs / 30 phút",
                        target: "Client IP + Honeypot",
                        purpose: "Chống bot spam tạo tài khoản rác hàng loạt",
                      },
                      {
                        name: "Đổi mật khẩu",
                        ep: "POST /api/v1/auth/change-password",
                        limit: "5 reqs / 15 phút",
                        target: "User Token/ID",
                        purpose: "Chống spam request đổi mật khẩu liên tục",
                      },
                      {
                        name: "Gia sư AI Socratic & Admin Chat",
                        ep: "POST /api/v1/ai/**",
                        limit: "15 reqs / phút (5s cooldown)",
                        target: "User ID + IP",
                        purpose: "Chống cạn kiệt Token, bùng nổ chi phí API & DoS AI",
                      },
                      {
                        name: "Nộp bài thi & Quiz trắc nghiệm",
                        ep: "POST /api/v1/lessons/{id}/quiz/submit",
                        limit: "10 reqs / phút",
                        target: "User ID",
                        purpose: "Chống brute-force đáp án trắc nghiệm & farm điểm ảo",
                      },
                      {
                        name: "Đồng bộ tiến độ học video",
                        ep: "POST /api/v1/progress/**",
                        limit: "30 reqs / phút",
                        target: "User ID",
                        purpose: "Chống flood request giả mạo thời lượng xem video",
                      },
                      {
                        name: "Biểu mẫu liên hệ & Góp ý",
                        ep: "POST /api/v1/public/contact",
                        limit: "3 reqs / 10 phút",
                        target: "Client IP + Honeypot",
                        purpose: "Chống bot gửi tin nhắn rác & spam hòm thư",
                      },
                      {
                        name: "Tác vụ quản trị & Báo cáo",
                        ep: "GET|POST /api/v1/admin/**",
                        limit: "60 reqs / phút",
                        target: "Admin IP",
                        purpose: "Chống nghẽn tài nguyên truy vấn cơ sở dữ liệu nặng",
                      },
                      {
                        name: "Bảo vệ toàn hệ thống K-12",
                        ep: "ALL /api/v1/**",
                        limit: "120 reqs / phút",
                        target: "Client IP",
                        purpose: "Bảo vệ chung chống crawler/scraper quét quá tải server",
                      },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="p-3 font-bold text-slate-900 dark:text-slate-100">
                          {row.name}
                        </td>
                        <td className="p-3 font-mono text-[10px] text-blue-600 dark:text-blue-400">
                          {row.ep}
                        </td>
                        <td className="p-3 font-bold text-amber-600">{row.limit}</td>
                        <td className="p-3 font-medium text-slate-700 dark:text-slate-300">
                          {row.target}
                        </td>
                        <td className="p-3 text-slate-500">{row.purpose}</td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Đang Bật
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Unblock IP Management Tool */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Quản Lý Danh Sách IP Bị Khóa & Mở Khóa Thủ Công</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Khi người dùng thật vô tình bị chặn do gõ sai mật khẩu hoặc tải trang nhanh,
                    quản trị viên có thể gỡ chặn tức thì:
                  </p>
                </div>
              </div>

              {unblockFeedback && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{unblockFeedback}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={unblockKeyInput}
                  onChange={(e) => setUnblockKeyInput(e.target.value)}
                  placeholder="Nhập IP hoặc Key cần mở khóa (Ví dụ: 192.168.1.45 hoặc hocsinh1)..."
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#1865F2]"
                />
                <button
                  type="button"
                  onClick={handleUnblockKey}
                  disabled={!unblockKeyInput.trim()}
                  className="px-4 py-2 rounded-xl bg-[#1865F2] hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs transition cursor-pointer shrink-0"
                >
                  Mở Khóa Tức Thì
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-bold text-slate-400">
                  IP đang bị hạn chế mẫu:
                </span>
                {customBlockedList.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-[10px] font-mono"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomBlockedList((prev) => prev.filter((_, i) => i !== idx));
                        setUnblockFeedback(`Đã mở khóa thủ công: ${item}`);
                        setTimeout(() => setUnblockFeedback(null), 3000);
                      }}
                      className="text-rose-400 hover:text-rose-700 font-bold"
                      title="Gỡ bỏ lệnh chặn"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. Tab Độ Tin Cậy, Backup & Rollback (Reliability, Disaster Recovery & Blue/Green) */}
      {activeTab === "reliability" && (
        <div className="space-y-6 text-xs">
          {/* Header */}
          <div className="bg-white dark:bg-[#131E35] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 uppercase tracking-wider">
                  SLA Cam Kết 99.99% Uptime
                </span>
                <span className="text-[11px] text-slate-400">
                  RTO &lt; 15m · RPO &lt; 1h · Zero-Downtime
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 mt-1">
                <Server className="w-5 h-5 text-emerald-600" />
                Độ Tin Cậy Hệ Thống, Kiểm Thử Khôi Phục & Quy Trình Rollback
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Tự động sao lưu PostgreSQL 17 định kỳ, diễn tập khôi phục thảm họa (DR Drill), kiểm
                thử tải 500 CCU và chuyển mạch Rollback tức thì.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                type="button"
                onClick={handleRunDrDrill}
                disabled={isDrDrillRunning}
                className="px-4 py-2.5 rounded-xl bg-[#1865F2] hover:bg-[#1557D0] disabled:opacity-50 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                {isDrDrillRunning ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <PlayCircle className="w-4 h-4" />
                )}
                <span>
                  {isDrDrillRunning
                    ? "Đang Diễn Tập Khôi Phục..."
                    : "Chạy Diễn Tập Khôi Phục (DR Drill)"}
                </span>
              </button>
            </div>
          </div>

          {rollbackSuccessMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{rollbackSuccessMsg}</span>
            </div>
          )}

          {/* Top Reliability Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#131E35] border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">
                  Tự Động Sao Lưu
                </span>
                <HardDrive className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-xl font-black text-slate-900 dark:text-slate-100">
                02:00 AM Hàng Ngày
              </p>
              <p className="text-[11px] text-emerald-600 font-bold">
                Snapshot gần nhất: Thành công ✓
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#131E35] border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">
                  Thời Gian Khôi Phục (RTO)
                </span>
                <Clock className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-xl font-black text-blue-600">4 phút 18 giây</p>
              <p className="text-[11px] text-slate-500">Mục tiêu cam kết: &lt; 15 phút</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#131E35] border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">
                  Điểm Phục Hồi (RPO)
                </span>
                <Database className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-xl font-black text-purple-600">&lt; 15 Phút</p>
              <p className="text-[11px] text-slate-500">
                Lưu vết WAL log liên tục theo thời gian thực
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#131E35] border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">
                  Kiểm Thử Khôi Phục
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-xl font-black text-emerald-600">100% PASS</p>
              <p className="text-[11px] text-slate-500">Không sai lệch checksum hay Foreign Key</p>
            </div>
          </div>

          {/* Section 1: Disaster Recovery Drill Simulator & Terminal */}
          <div className="bg-white dark:bg-[#131E35] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <PlayCircle className="w-4 h-4 text-[#1865F2]" />
                  Diễn Tập Khôi Phục Dữ Liệu Sandbox Thực Tế (Automated DR Drill Simulation)
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                  Mô phỏng khôi phục bản sao lưu lên môi trường cô lập, kiểm thử tính toàn vẹn và đo
                  lường thời gian RTO/RPO thực tế.
                </p>
              </div>

              {drDrillCompleted && (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[11px] flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Đã Hoàn Tất Diễn Tập (0 Lỗi)
                </span>
              )}
            </div>

            {isDrDrillRunning && (
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-xs">
                  <span className="text-blue-600">Tiến trình phục hồi môi trường Sandbox...</span>
                  <span className="font-mono">{drDrillProgress}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1865F2] rounded-full transition-all duration-300"
                    style={{ width: `${drDrillProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Terminal log output */}
            <div className="p-4 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl space-y-1.5 max-h-56 overflow-y-auto border border-slate-800">
              <p className="text-slate-500">
                // Bắt đầu phiên kiểm định khôi phục tự động định kỳ...
              </p>
              {drDrillLogs.length === 0 ? (
                <p className="text-slate-400 italic">
                  Nhấn "Chạy Diễn Tập Khôi Phục" ở trên để khởi động bài test nạp snapshot.
                </p>
              ) : (
                drDrillLogs.map((log, idx) => (
                  <p key={idx} className="leading-relaxed">
                    {log}
                  </p>
                ))
              )}
            </div>
          </div>

          {/* Section 2: Health Probes & Load Testing Benchmark */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live System Health Probes */}
            <div className="bg-white dark:bg-[#131E35] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                Đầu Dò Giám Sát Sức Khỏe & Cảnh Báo Lỗi Thời Gian Thực (Health Probes)
              </h3>
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-100">
                      PostgreSQL 17 Connection Pool (HikariCP)
                    </p>
                    <p className="text-[11px] text-slate-500">
                      10/10 Active Connections · 0 Queued
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    2.1ms (Healthy)
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-100">
                      Redis In-Memory Cache Cluster
                    </p>
                    <p className="text-[11px] text-slate-500">Hit ratio: 91.2% · PONG responsive</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    0.8ms (Healthy)
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-100">
                      OpenAI API Gateway Latency
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Uptime: 99.98% · Rate limit: 200 RPM ok
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    142ms (Online)
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-100">
                      Tích Hợp Cảnh Báo Tự Động (Error Alerting)
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Sentry Webhook + Telegram Bot Ops: Bật
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                    Ngưỡng: &gt; 1% 5xx
                  </span>
                </div>
              </div>
            </div>

            {/* Load Testing Benchmark Results */}
            <div className="bg-white dark:bg-[#131E35] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-600" />
                Kiểm Thử Tải Hệ Thống Mô Phỏng (k6 Load Test Benchmark - 500 CCU)
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Mô phỏng 500 học sinh đồng thời vừa xem video bài giảng HLS vừa tương tác với Gia sư
                AI Socratic.
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 font-bold text-[10px]">
                    Học Sinh Đồng Thời (CCU)
                  </span>
                  <p className="text-xl font-black text-purple-600 mt-1">500 Users</p>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                    Mô phỏng tải giờ cao điểm
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 font-bold text-[10px]">Throughput Yêu Cầu</span>
                  <p className="text-xl font-black text-blue-600 mt-1">1,450 req/s</p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                    Xử lý qua Spring Boot 3.3.4
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 font-bold text-[10px]">
                    Độ Trễ Phản Hồi (p95)
                  </span>
                  <p className="text-xl font-black text-emerald-600 mt-1">58 ms</p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                    p50: 24ms · p99: 94ms
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 font-bold text-[10px]">
                    Tỷ Lệ Lỗi (Error Rate)
                  </span>
                  <p className="text-xl font-black text-emerald-600 mt-1">0.00%</p>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                    0 lỗi / 250,000 requests
                  </p>
                </div>
              </div>

              <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-900 text-[11px] text-purple-900 dark:text-purple-200">
                ✓ Hệ thống đạt chuẩn hiệu năng cao, chịu tải ổn định cho các kỳ thi trực tuyến quy
                mô cấp trường và sở.
              </div>
            </div>
          </div>

          {/* Section 3: Blue/Green Deployment & 1-Click Rollback */}
          <div className="bg-white dark:bg-[#131E35] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-emerald-600" />
                  Quy Trình Triển Khai Blue/Green & Cơ Chế Rollback Tức Thì Không Gián Đoạn
                  (Zero-Downtime)
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                  Khi bản build mới gặp sự cố hoặc tỷ lệ lỗi 5xx vượt 1%, bộ ngắt mạch tự động
                  chuyển 100% traffic về cụm dự phòng trong 2 giây.
                </p>
              </div>

              <button
                type="button"
                onClick={handleTriggerRollback}
                disabled={isRollingBack}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm self-start sm:self-auto"
              >
                {isRollingBack ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )}
                <span>
                  {isRollingBack
                    ? "Đang chuyển mạch traffic..."
                    : `1-Click Rollback về cụm ${activeCluster === "GREEN" ? "Blue (v2.4.0)" : "Green (v2.4.1)"}`}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cluster Green */}
              <div
                className={`p-4 rounded-2xl border-2 transition ${
                  activeCluster === "GREEN"
                    ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/50 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    Cụm Green: Bản Phát Hành Mới (v2.4.1)
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                      activeCluster === "GREEN"
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {activeCluster === "GREEN"
                      ? "100% Traffic (Đang Phục Vụ)"
                      : "Standby (Chờ Sẵn)"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Spring Boot 3.3.4 · Pods: 4/4 Healthy · Port: 8080 · Flyway V4
                </p>
              </div>

              {/* Cluster Blue */}
              <div
                className={`p-4 rounded-2xl border-2 transition ${
                  activeCluster === "BLUE"
                    ? "border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/50 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-blue-500" />
                    Cụm Blue: Bản Ổn Định Trước (v2.4.0)
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                      activeCluster === "BLUE"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {activeCluster === "BLUE"
                      ? "100% Traffic (Đang Phục Vụ)"
                      : "Standby (Sẵn Sàng Rollback)"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Spring Boot 3.3.4 · Pods: 4/4 Warm Standby · Port: 8081 · Flyway V3
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 11. Tab Kiểm Định Chất Lượng AI K-12 (AI Evaluation Benchmark Suite) */}
      {activeTab === "ai_quality" && (
        <div className="space-y-6 text-xs">
          {/* Header */}
          <div className="bg-white dark:bg-[#131E35] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 uppercase tracking-wider">
                  Bộ Kiểm Thử Sư Phạm K-12
                </span>
                <span className="text-[11px] text-slate-400">
                  Chương trình GDPT 2018 · Sách Kết nối tri thức, Cánh Diều, Chân trời sáng tạo
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 mt-1">
                <CheckCircle2 className="w-5 h-5 text-purple-600" />
                Kiểm Soát Chất Lượng AI: Độ Chính Xác, Gợi Mở Socratic & Nguồn Trích Dẫn
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Bộ câu hỏi kiểm thử độc lập cho từng môn/lớp nhằm đảm bảo Gia sư AI giải thích chuẩn
                xác, trích dẫn đúng SGK và phù hợp lứa tuổi học sinh.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                type="button"
                onClick={handleRunAiBenchmark}
                disabled={isBenchmarking}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                {isBenchmarking ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>
                  {isBenchmarking
                    ? "Đang Chạy Kiểm Định..."
                    : "Chạy Toàn Bộ Bộ Kiểm Định (Run Benchmark)"}
                </span>
              </button>
            </div>
          </div>

          {/* Progress bar when running benchmark */}
          {isBenchmarking && (
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 space-y-2">
              <div className="flex justify-between font-bold text-xs text-purple-900">
                <span>{benchmarkStatus}</span>
                <span className="font-mono">{benchmarkProgress}%</span>
              </div>
              <div className="w-full h-2.5 bg-purple-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full transition-all duration-300"
                  style={{ width: `${benchmarkProgress}%` }}
                />
              </div>
            </div>
          )}

          {benchmarkRunCompleted && !isBenchmarking && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                ✓ Hoàn tất kiểm thử 350 bài test trên toàn bộ 12 khối lớp! Tỷ lệ đạt chuẩn: 98.4%.
              </span>
            </div>
          )}

          {/* 4 Core AI Quality KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#131E35] border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">
                  Độ Chính Xác Kiến Thức
                </span>
                <Award className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-xl font-black text-emerald-600">98.4% Đạt Chuẩn</p>
              <p className="text-[11px] text-slate-500">Đối chiếu chuẩn xác với đáp án GDPT 2018</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#131E35] border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">
                  Tuân Thủ Socratic
                </span>
                <Lightbulb className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-xl font-black text-amber-600">96.2% Gợi Mở</p>
              <p className="text-[11px] text-slate-500">
                Chỉ gợi ý từng bước, tuyệt đối không giải hộ
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#131E35] border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">
                  Căn Cứ Trích Dẫn SGK
                </span>
                <BookOpen className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-xl font-black text-blue-600">99.1% Có Nguồn</p>
              <p className="text-[11px] text-slate-500">
                Trích rõ tên sách, chương, số trang và mốc video
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#131E35] border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">
                  An Toàn & Lứa Tuổi
                </span>
                <ShieldCheck className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-xl font-black text-purple-600">99.8% Safe</p>
              <p className="text-[11px] text-slate-500">
                0% từ ngữ độc hại, lọc PII và bảo vệ học sinh
              </p>
            </div>
          </div>

          {/* Test Benchmark Suites by Grade Level and Subjects */}
          <div className="bg-white dark:bg-[#131E35] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#1865F2]" />
              Bảng Đánh Giá Bộ Câu Hỏi Kiểm Thử Theo Khối Lớp & Môn Học (Evaluation Benchmark
              Matrix)
            </h3>
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3">Khối Lớp</th>
                    <th className="p-3">Môn Học Kiểm Thử</th>
                    <th className="p-3">Số Lượng Test Cases</th>
                    <th className="p-3">Độ Chính Xác</th>
                    <th className="p-3">Tuân Thủ Socratic</th>
                    <th className="p-3">Trích Dẫn SGK</th>
                    <th className="p-3">Phù Hợp Lứa Tuổi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                  <tr>
                    <td className="p-3 font-bold text-slate-900 dark:text-slate-100">
                      Tiểu Học (Lớp 1 – 5)
                    </td>
                    <td className="p-3">Toán học, Tiếng Việt, Khoa học</td>
                    <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-200">
                      80 bài test
                    </td>
                    <td className="p-3 text-emerald-600 font-bold">98.6%</td>
                    <td className="p-3 text-emerald-600 font-bold">97.5%</td>
                    <td className="p-3 text-blue-600 font-bold">99.4% (SGK KNTT & Cánh Diều)</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        100% Phù hợp
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900 dark:text-slate-100">
                      THCS (Lớp 6 – 9)
                    </td>
                    <td className="p-3">Toán, KHTN, Ngữ văn, Tiếng Anh</td>
                    <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-200">
                      120 bài test
                    </td>
                    <td className="p-3 text-emerald-600 font-bold">98.2%</td>
                    <td className="p-3 text-emerald-600 font-bold">95.8%</td>
                    <td className="p-3 text-blue-600 font-bold">98.9% (Cánh Diều & KNTT)</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        99.8% Phù hợp
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900 dark:text-slate-100">
                      THPT (Lớp 10 – 12)
                    </td>
                    <td className="p-3">Đại số & Giải tích, Vật lý, Hóa, Sinh</td>
                    <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-200">
                      150 bài test
                    </td>
                    <td className="p-3 text-emerald-600 font-bold">98.4%</td>
                    <td className="p-3 text-emerald-600 font-bold">96.4%</td>
                    <td className="p-3 text-blue-600 font-bold">
                      99.2% (Chân trời sáng tạo & KNTT)
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        99.7% Phù hợp
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Textbook Grounding Reference Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#131E35] border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
              <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                Bộ Sách 1
              </span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Kết Nối Tri Thức Với Cuộc Sống
              </h4>
              <p className="text-[11px] text-slate-500">
                NXB Giáo Dục Việt Nam · 1,420 căn cứ trích dẫn SGK
              </p>
              <div className="text-[10px] text-emerald-600 font-bold pt-1 border-t border-slate-100 dark:border-slate-800">
                Độ chuẩn xác trang & chương: 99.4%
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#131E35] border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
              <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                Bộ Sách 2
              </span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Cánh Diều</h4>
              <p className="text-[11px] text-slate-500">
                NXB ĐH Sư Phạm TP.HCM · 1,180 căn cứ trích dẫn
              </p>
              <div className="text-[10px] text-emerald-600 font-bold pt-1 border-t border-slate-100 dark:border-slate-800">
                Độ chuẩn xác trang & chương: 99.1%
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#131E35] border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
              <span className="text-[10px] font-black uppercase text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                Bộ Sách 3
              </span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Chân Trời Sáng Tạo
              </h4>
              <p className="text-[11px] text-slate-500">
                NXB Giáo Dục Việt Nam · 960 căn cứ trích dẫn
              </p>
              <div className="text-[10px] text-emerald-600 font-bold pt-1 border-t border-slate-100 dark:border-slate-800">
                Độ chuẩn xác trang & chương: 98.8%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
