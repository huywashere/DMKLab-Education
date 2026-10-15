import { Grade, Subject, Lesson, Question, User } from '@/types';
import { MOCK_GRADES, MOCK_SUBJECTS, MOCK_LESSONS, MOCK_USERS } from './mock-data';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
const TOKEN_KEY = 'khan_k12_jwt_token';

export interface BackendGrade {
  id: string;
  name: string;
  code: string;
  level: 'PRIMARY' | 'SECONDARY' | 'HIGH_SCHOOL';
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

export const api = {
  // Token Management
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  },

  // Auth & Profile APIs
  async login(usernameOrEmail: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernameOrEmail, password }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Đăng nhập không thành công');
    }

    const { accessToken, user: rawUser } = json.data;
    this.setToken(accessToken);

    const user: User = {
      id: rawUser.id,
      username: rawUser.username,
      fullName: rawUser.fullName,
      email: rawUser.email,
      role: rawUser.role,
      avatarUrl: rawUser.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rawUser.username}`,
      bio: rawUser.bio || 'Học viên Khan Academy K-12',
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
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Đăng ký không thành công');
    }

    const { accessToken, user: rawUser } = json.data;
    this.setToken(accessToken);

    const user: User = {
      id: rawUser.id,
      username: rawUser.username,
      fullName: rawUser.fullName,
      email: rawUser.email,
      role: rawUser.role,
      avatarUrl: rawUser.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rawUser.username}`,
      bio: rawUser.bio || 'Học viên mới Khan Academy K-12',
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
        method: 'GET',
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
          avatarUrl: rawUser.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rawUser.username}`,
          bio: rawUser.bio || 'Học viên Khan Academy K-12',
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
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Cập nhật hồ sơ thất bại');
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
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Đổi mật khẩu thất bại');
    }
    return json.message || 'Đổi mật khẩu thành công!';
  },

  // Academics & Content
  async getGrades(): Promise<Grade[]> {
    try {
      const res = await fetch(`${API_BASE}/grades`);
      if (!res.ok) throw new Error('API failed');
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data.map((g: BackendGrade) => ({
          id: g.id,
          name: g.name,
          code: g.code,
          level: g.level,
          displayOrder: g.displayOrder,
        }));
      }
    } catch {
      // Fallback
    }
    return MOCK_GRADES;
  },

  async getSubjects(gradeId: string): Promise<Subject[]> {
    try {
      const res = await fetch(`${API_BASE}/grades/${gradeId}/subjects`);
      if (!res.ok) throw new Error('API failed');
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data.map((s: BackendSubject) => ({
          id: s.id,
          gradeId: gradeId,
          name: s.name,
          code: s.code,
          color: s.color || '#1865F2',
          icon: s.icon || 'book',
          totalLessons: 12,
          completedLessons: 3,
        }));
      }
    } catch {
      // Fallback
    }
    return MOCK_SUBJECTS.filter((s) => s.gradeId === gradeId || s.gradeId === 'g-5');
  },

  async getLessons(subjectId: string): Promise<Lesson[]> {
    try {
      const res = await fetch(`${API_BASE}/subjects/${subjectId}/lessons`);
      if (!res.ok) throw new Error('API failed');
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data.map((l: BackendLesson, index: number) => ({
          id: l.id,
          chapterId: 'c-live',
          title: l.title,
          description: l.description || '',
          contentType: 'VIDEO',
          videoUrl: l.videoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          durationSeconds: l.videoDurationSeconds || 600,
          orderNum: l.displayOrder || (index + 1),
          isCompleted: false,
          positionSeconds: 0,
          masteryLevel: 'FAMILIAR',
        }));
      }
    } catch {
      // Fallback
    }
    return MOCK_LESSONS;
  },

  async getLessonQuiz(lessonId: string): Promise<Question[]> {
    try {
      const res = await fetch(`${API_BASE}/lessons/${lessonId}/quiz`);
      if (!res.ok) throw new Error('API failed');
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data.map((q: BackendQuizQuestion) => ({
          id: q.id,
          questionText: q.question,
          explanation: q.explanation || '',
          points: 10,
          options: [
            { id: 'opt-a', text: q.optionA, isCorrect: q.correctAnswer === 'A' },
            { id: 'opt-b', text: q.optionB, isCorrect: q.correctAnswer === 'B' },
            ...(q.optionC ? [{ id: 'opt-c', text: q.optionC, isCorrect: q.correctAnswer === 'C' }] : []),
            ...(q.optionD ? [{ id: 'opt-d', text: q.optionD, isCorrect: q.correctAnswer === 'D' }] : []),
          ],
        }));
      }
    } catch {
      // Fallback
    }
    return [];
  },
};
