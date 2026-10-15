export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  bio?: string;
  gradeLevel?: number; // Ví dụ: Lớp 5
  energyPoints: number; // Điểm năng lượng Khan Academy
  streakDays: number;
  createdAt?: string;
}

export type MasteryLevel = 'NOT_STARTED' | 'FAMILIAR' | 'PROFICIENT' | 'MASTERED';

export interface Grade {
  id: string;
  name: string;
  code: string;
  level: 'PRIMARY' | 'SECONDARY' | 'HIGH_SCHOOL';
  displayOrder: number;
}

export interface Subject {
  id: string;
  gradeId: string;
  name: string;
  code: string;
  color: string;
  icon: string;
  totalLessons: number;
  completedLessons: number;
}

export interface Course {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  courseId: string;
  title: string;
  orderNum: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  chapterId: string;
  title: string;
  description: string;
  contentType: 'VIDEO' | 'ARTICLE' | 'QUIZ';
  videoUrl?: string;
  durationSeconds: number;
  orderNum: number;
  isCompleted: boolean;
  positionSeconds: number;
  masteryLevel: MasteryLevel;
  quiz?: Quiz;
  articleBody?: string;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  questionText: string;
  options: QuestionOption[];
  explanation: string;
  points: number;
}

export interface Quiz {
  id: string;
  title: string;
  passingScore: number;
  questions: Question[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isSocraticHint?: boolean;
}

export interface MediaAsset {
  id: string;
  storageKey: string;
  originalFilename: string;
  contentType: string;
  fileSizeBytes: number;
  status: 'READY' | 'TRANSCODING' | 'UPLOADED' | 'FAILED';
  hlsUrl?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: string;
  createdAt: string;
}
