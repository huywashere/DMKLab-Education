import { Grade, Subject, Lesson, Question, User } from "@/types";
import { MOCK_GRADES, MOCK_SUBJECTS, MOCK_LESSONS, MOCK_USERS } from "./mock-data";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
const TOKEN_KEY = "khan_k12_jwt_token";

export interface BackendGrade {
  id: string;
  name: string;
  code: string;
  level: "PRIMARY" | "SECONDARY" | "HIGH_SCHOOL";
  displayOrder: number;
}

export interface BackendSubject {
  id: string;
  name: string;
  code: string;
  color?: string;
  icon?: string;
  displayOrder: number;
}

export interface BackendLesson {
  id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  videoDurationSeconds?: number;
  thumbnailUrl?: string;
  displayOrder: number;
  published: boolean;
  createdAt?: string;
}

export interface BackendQuizQuestion {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC?: string;
  optionD?: string;
  correctAnswer: string;
  explanation?: string;
  displayOrder: number;
}

export interface BackendProgressResponse {
  lessonId: string;
  positionSeconds: number;
  durationSeconds: number;
  isCompleted: boolean;
  lastWatchedAt?: string;
}

export interface BackendProgressSummary {
  totalLessonsCompleted: number;
  totalTimeSpentSeconds: number;
  currentStreakDays: number;
  energyPoints: number;
}

export interface QuizSubmissionResult {
  lessonId: string;
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  passed: boolean;
  pointsEarned: number;
  feedback: string;
  questionResults: {
    questionId: string;
    submittedAnswer: string;
    correctAnswer: string;
    correct: boolean;
    explanation: string;
  }[];
}

export interface InteractiveQuizData {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
}

export interface CitationData {
  title: string;
  chapter: string;
  sourceBook: string;
  videoTime: string;
  targetUrl?: string;
}

export interface SocraticChatResponse {
  sessionId: string;
  reply: string;
  dailyQuotaRemaining: number;
  suggestedAction?: string;
  isSocraticHint?: boolean;
  mode?: string;
  gradeLevel?: number;
  stepByStepHints?: string[];
  interactiveQuiz?: InteractiveQuizData;
  citations?: CitationData[];
  misconceptionReason?: string;
  safetyWarning?: string;
}

export interface AdminOverviewReport {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalLessons: number;
  totalQuizzesCompleted: number;
  totalEnergyPoints: number;
  activeUsersToday: number;
  storageUsedBytes: number;
  cdnCacheHitRate: number;
  aiMonthlyCostUsd: number;
  aiMonthlyQuotaUsd: number;
  jvmMemoryUsedMb: number;
  jvmMemoryMaxMb: number;
  postgresStatus: string;
  flywayStatus: string;
  redisStatus?: string;
}

export interface AdminUserItem {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  active: boolean;
  energyPoints: number;
  streakDays: number;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface BackendAuditLog {
  id: string;
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  storageKey: string;
  expiresInSeconds: number;
  hlsStreamingUrl: string;
  message: string;
}

export interface BackendRateLimitStats {
  totalChecked: number;
  totalThrottled: number;
  currentlyTrackedBuckets: number;
  activeBlockedCount: number;
  activeBlockedDetails: {
    key: string;
    attempts: number;
    limit: number;
    remainingSeconds: number;
  }[];
  redisConnected?: boolean;
  storageType?: string;
}

export interface ContactFormData {
  fullName: string;
  email: string;
  phone?: string;
  role?: string;
  grade?: string;
  subject?: string;
  message: string;
  honeypot?: string;
}

const apiCache = {
  grades: null as Grade[] | null,
  subjects: new Map<string, Subject[]>(),
  lessons: new Map<string, Lesson[]>(),
  quizzes: new Map<string, Question[]>(),
  clear() {
    this.grades = null;
    this.subjects.clear();
    this.lessons.clear();
    this.quizzes.clear();
  },
};

export const api = {
  // Token Management
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  clearToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  },

  // Auth & Profile APIs
  async login(usernameOrEmail: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernameOrEmail, password }),
    });

    const json = await res.json().catch(() => ({}));
    if (res.status === 429) {
      throw new Error(
        json.message ||
          "Hệ thống phát hiện quá nhiều lần thử đăng nhập. Vui lòng thử lại sau 15 phút (HTTP 429)."
      );
    }
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Đăng nhập không thành công");
    }

    const { accessToken, user: rawUser } = json.data;
    this.setToken(accessToken);

    const user: User = {
      id: rawUser.id,
      username: rawUser.username,
      fullName: rawUser.fullName,
      email: rawUser.email,
      role: rawUser.role,
      avatarUrl:
        rawUser.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rawUser.username}`,
      bio: rawUser.bio || "Học viên DMKLab Education K-12",
      energyPoints: rawUser.energyPoints || 1000,
      streakDays: rawUser.streakDays || 1,
      createdAt: rawUser.createdAt,
    };

    return { user, token: accessToken };
  },

  async register(data: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    role: string;
  }): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json().catch(() => ({}));
    if (res.status === 429) {
      throw new Error(
        json.message ||
          "Đã vượt quá giới hạn đăng ký tài khoản (Tối đa 3 tài khoản/30 phút). Vui lòng thử lại sau (HTTP 429)."
      );
    }
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Đăng ký không thành công");
    }

    const { accessToken, user: rawUser } = json.data;
    this.setToken(accessToken);

    const user: User = {
      id: rawUser.id,
      username: rawUser.username,
      fullName: rawUser.fullName,
      email: rawUser.email,
      role: rawUser.role,
      avatarUrl:
        rawUser.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rawUser.username}`,
      bio: rawUser.bio || "Học viên mới DMKLab Education K-12",
      energyPoints: rawUser.energyPoints || 1000,
      streakDays: rawUser.streakDays || 1,
      createdAt: rawUser.createdAt,
    };

    return { user, token: accessToken };
  },

  async getMyProfile(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!res.ok) {
        if (res.status === 401) {
          this.clearToken();
        }
        return null;
      }

      const json = await res.json();
      if (json.success && json.data) {
        const rawUser = json.data;
        return {
          id: rawUser.id,
          username: rawUser.username,
          fullName: rawUser.fullName,
          email: rawUser.email,
          role: rawUser.role,
          avatarUrl:
            rawUser.avatarUrl ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${rawUser.username}`,
          bio: rawUser.bio || "Học viên DMKLab Education K-12",
          energyPoints: rawUser.energyPoints || 1000,
          streakDays: rawUser.streakDays || 1,
          createdAt: rawUser.createdAt,
        };
      }
    } catch {
      // Fallback
    }
    return null;
  },

  async updateProfile(data: { fullName: string; avatarUrl: string; bio: string }): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Cập nhật hồ sơ thất bại");
    }

    const rawUser = json.data;
    return {
      id: rawUser.id,
      username: rawUser.username,
      fullName: rawUser.fullName,
      email: rawUser.email,
      role: rawUser.role,
      avatarUrl: rawUser.avatarUrl,
      bio: rawUser.bio,
      energyPoints: rawUser.energyPoints,
      streakDays: rawUser.streakDays,
      createdAt: rawUser.createdAt,
    };
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<string> {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Đổi mật khẩu thất bại");
    }
    return json.message || "Đổi mật khẩu thành công!";
  },

  // Academics & Content (With in-memory caching to optimize network roundtrips)
  async getGrades(): Promise<Grade[]> {
    if (apiCache.grades && apiCache.grades.length > 0) {
      return apiCache.grades;
    }
    try {
      const res = await fetch(`${API_BASE}/grades`);
      if (!res.ok) throw new Error("API failed");
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        const mapped = json.data.map((g: BackendGrade) => ({
          id: g.id,
          name: g.name,
          code: g.code,
          level: g.level,
          displayOrder: g.displayOrder,
        }));
        apiCache.grades = mapped;
        return mapped;
      }
    } catch {
      // Fallback
    }
    return MOCK_GRADES;
  },

  async getSubjects(gradeId: string): Promise<Subject[]> {
    if (apiCache.subjects.has(gradeId)) {
      return apiCache.subjects.get(gradeId)!;
    }
    try {
      const res = await fetch(`${API_BASE}/grades/${gradeId}/subjects`);
      if (!res.ok) throw new Error("API failed");
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        const mapped = json.data.map((s: BackendSubject) => ({
          id: s.id,
          gradeId: gradeId,
          name: s.name,
          code: s.code,
          color: s.color || "#1865F2",
          icon: s.icon || "book",
          totalLessons: 12,
          completedLessons: 3,
        }));
        apiCache.subjects.set(gradeId, mapped);
        return mapped;
      }
    } catch {
      // Fallback
    }
    return MOCK_SUBJECTS.filter((s) => s.gradeId === gradeId || s.gradeId === "g-5");
  },

  async getLessons(subjectId: string): Promise<Lesson[]> {
    if (apiCache.lessons.has(subjectId)) {
      return apiCache.lessons.get(subjectId)!;
    }
    try {
      const res = await fetch(`${API_BASE}/subjects/${subjectId}/lessons`);
      if (!res.ok) throw new Error("API failed");
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        const mapped = json.data.map((l: BackendLesson, index: number) => ({
          id: l.id,
          chapterId: "c-live",
          title: l.title,
          description: l.description || "",
          contentType: "VIDEO",
          videoUrl: l.videoUrl || "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          durationSeconds: l.videoDurationSeconds || 600,
          orderNum: l.displayOrder || index + 1,
          isCompleted: false,
          positionSeconds: 0,
          masteryLevel: "FAMILIAR",
        }));
        apiCache.lessons.set(subjectId, mapped);
        return mapped;
      }
    } catch {
      // Fallback
    }
    return MOCK_LESSONS;
  },

  async getLessonQuiz(lessonId: string): Promise<Question[]> {
    if (apiCache.quizzes.has(lessonId)) {
      return apiCache.quizzes.get(lessonId)!;
    }
    try {
      const res = await fetch(`${API_BASE}/lessons/${lessonId}/quiz`);
      if (!res.ok) throw new Error("API failed");
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        const mapped = json.data.map((q: BackendQuizQuestion) => ({
          id: q.id,
          questionText: q.question,
          explanation: q.explanation || "",
          points: 10,
          options: [
            { id: "opt-a", text: q.optionA, isCorrect: q.correctAnswer === "A" },
            { id: "opt-b", text: q.optionB, isCorrect: q.correctAnswer === "B" },
            ...(q.optionC
              ? [{ id: "opt-c", text: q.optionC, isCorrect: q.correctAnswer === "C" }]
              : []),
            ...(q.optionD
              ? [{ id: "opt-d", text: q.optionD, isCorrect: q.correctAnswer === "D" }]
              : []),
          ],
        }));
        apiCache.quizzes.set(lessonId, mapped);
        return mapped;
      }
    } catch {
      // Fallback
    }
    return [];
  },

  // Learning Progress APIs (Mục 8.4 & 6.1 PDF)
  async updateLessonProgress(
    lessonId: string,
    positionSeconds: number,
    durationSeconds: number,
    isCompleted: boolean
  ): Promise<BackendProgressResponse | null> {
    try {
      const res = await fetch(`${API_BASE}/lessons/${lessonId}/progress`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ positionSeconds, durationSeconds, isCompleted }),
      });
      const json = await res.json();
      return json.success ? json.data : null;
    } catch {
      return null;
    }
  },

  async getLessonProgress(lessonId: string): Promise<BackendProgressResponse | null> {
    try {
      const res = await fetch(`${API_BASE}/lessons/${lessonId}/progress`, {
        headers: this.getAuthHeaders(),
      });
      const json = await res.json();
      return json.success ? json.data : null;
    } catch {
      return null;
    }
  },

  async getProgressSummary(): Promise<BackendProgressSummary | null> {
    try {
      const res = await fetch(`${API_BASE}/progress/summary`, {
        headers: this.getAuthHeaders(),
      });
      const json = await res.json();
      return json.success ? json.data : null;
    } catch {
      return null;
    }
  },

  // Assessment / Quiz Submission (Mục 5 & 6.1 PDF)
  async submitQuiz(
    lessonId: string,
    answers: { questionId: string; selectedAnswer: string }[]
  ): Promise<QuizSubmissionResult> {
    const res = await fetch(`${API_BASE}/lessons/${lessonId}/quiz/submit`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ answers }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Lỗi nộp bài trắc nghiệm");
    }
    return json.data;
  },

  // AI Chatbots (Mục 9 & 9.1 PDF - Nâng cấp Gia sư AI đa chế độ)
  async sendLearningChat(
    message: string,
    lessonId?: string,
    sessionId?: string,
    options?: {
      mode?: string;
      gradeLevel?: number;
      studentAnswer?: string;
      contextLessonTitle?: string;
      contextSubject?: string;
    }
  ): Promise<SocraticChatResponse> {
    const payload = {
      message,
      lessonId,
      sessionId,
      mode: options?.mode,
      gradeLevel: options?.gradeLevel,
      studentAnswer: options?.studentAnswer,
      contextLessonTitle: options?.contextLessonTitle,
      contextSubject: options?.contextSubject,
    };
    const res = await fetch(`${API_BASE}/ai/learning/chat`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Lỗi kết nối Trợ lý DMK AI");
    }
    return json.data;
  },

  streamLearningChat(
    message: string,
    options: {
      mode?: string;
      gradeLevel?: number;
      subject?: string;
      sessionId?: string;
      onDelta: (token: string) => void;
      onDone: (fullReply: string, cached: boolean) => void;
      onError?: (err: Error) => void;
    }
  ): () => void {
    const controller = new AbortController();
    const proxyUrl =
      process.env.NEXT_PUBLIC_AI_PROXY_URL || "http://localhost:8086/api/v1/ai/stream";

    fetch(proxyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        mode: options.mode || "SOCRATIC",
        gradeLevel: options.gradeLevel || 5,
        subject: options.subject || "Toán học K-12",
        sessionId: options.sessionId,
      }),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok || !res.body) {
          throw new Error(`AI Streaming Proxy returned HTTP ${res.status}`);
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let fullReply = "";
        let cached = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const block of lines) {
            const trimmed = block.trim();
            if (!trimmed) continue;
            if (trimmed.startsWith("event: delta")) {
              const dataLine = trimmed.split("\n").find((l) => l.startsWith("data: "));
              if (dataLine) {
                try {
                  const data = JSON.parse(dataLine.substring(6));
                  if (data.text) {
                    fullReply += data.text;
                    options.onDelta(data.text);
                  }
                } catch {}
              }
            } else if (trimmed.startsWith("event: done")) {
              const dataLine = trimmed.split("\n").find((l) => l.startsWith("data: "));
              if (dataLine) {
                try {
                  const data = JSON.parse(dataLine.substring(6));
                  cached = !!data.cached;
                  if (data.fullReply) fullReply = data.fullReply;
                } catch {}
              }
            }
          }
        }
        options.onDone(fullReply, cached);
      })
      .catch((err) => {
        if (err.name !== "AbortError" && options.onError) {
          options.onError(err);
        }
      });

    return () => controller.abort();
  },

  async sendAdminChat(message: string, sessionId?: string): Promise<SocraticChatResponse> {
    const res = await fetch(`${API_BASE}/ai/admin/chat`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ message, sessionId }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Lỗi kết nối AI Quản trị");
    }
    return json.data;
  },

  // Admin CMS APIs (Mục 7 & 12 PDF)
  async getAdminOverview(): Promise<AdminOverviewReport | null> {
    try {
      const res = await fetch(`${API_BASE}/admin/reports/overview`, {
        headers: this.getAuthHeaders(),
      });
      const json = await res.json();
      return json.success ? json.data : null;
    } catch {
      return null;
    }
  },

  async getAdminUsers(role?: string, q?: string): Promise<AdminUserItem[]> {
    try {
      const params = new URLSearchParams();
      if (role && role !== "ALL") params.set("role", role);
      if (q) params.set("q", q);
      const res = await fetch(`${API_BASE}/admin/users?${params.toString()}`, {
        headers: this.getAuthHeaders(),
      });
      const json = await res.json();
      return json.success ? json.data : [];
    } catch {
      return [];
    }
  },

  async toggleUserStatus(userId: string, active: boolean): Promise<AdminUserItem> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/status`, {
      method: "PATCH",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ active }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Cập nhật trạng thái người dùng thất bại");
    }
    return json.data;
  },

  async getAdminAuditLogs(): Promise<BackendAuditLog[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/audit-logs`, {
        headers: this.getAuthHeaders(),
      });
      const json = await res.json();
      return json.success ? json.data : [];
    } catch {
      return [];
    }
  },

  async requestPresignedUploadUrl(
    filename: string,
    contentType: string = "video/mp4",
    fileSizeBytes: number = 50000000
  ): Promise<UploadUrlResponse> {
    const res = await fetch(`${API_BASE}/admin/media/upload-url`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ filename, contentType, fileSizeBytes }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Lỗi cấp URL ký");
    }
    return json.data;
  },

  async submitContact(data: ContactFormData): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/public/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    if (res.status === 429) {
      throw new Error(
        json.message || "Bạn đang gửi tin nhắn quá nhanh. Vui lòng thử lại sau vài phút (HTTP 429)."
      );
    }
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Gửi tin nhắn không thành công.");
    }
    return { success: true, message: json.data || json.message };
  },

  async getRateLimitStats(): Promise<BackendRateLimitStats | null> {
    try {
      const res = await fetch(`${API_BASE}/admin/security/ratelimit-stats`, {
        headers: this.getAuthHeaders(),
      });
      const json = await res.json();
      return json.success ? json.data : null;
    } catch {
      return null;
    }
  },

  async unblockRateLimitKey(key: string): Promise<string> {
    const res = await fetch(
      `${API_BASE}/admin/security/ratelimit/unblock?key=${encodeURIComponent(key)}`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
      }
    );
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Không thể mở khóa key");
    }
    return json.data || "Đã mở khóa thành công";
  },

  // Cache Management APIs (Mục 7 & 12 PDF)
  async getCacheStats(): Promise<{
    redisConnected: boolean;
    cacheType: string;
    activeNamespaces: string[];
  } | null> {
    try {
      const res = await fetch(`${API_BASE}/admin/cache/stats`, {
        headers: this.getAuthHeaders(),
      });
      const json = await res.json();
      return json.success ? json.data : null;
    } catch {
      return null;
    }
  },

  async clearServerCache(namespace = "all"): Promise<string> {
    apiCache.clear();
    const res = await fetch(
      `${API_BASE}/admin/cache/clear?namespace=${encodeURIComponent(namespace)}`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
      }
    );
    const json = await res.json();
    return json.data || json.message || "Đã làm mới cache thành công";
  },
};
