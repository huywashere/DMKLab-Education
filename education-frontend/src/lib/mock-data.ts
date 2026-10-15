import { User, Grade, Subject, Course, Lesson, AuditLog, MediaAsset } from "@/types";

export const MOCK_USERS: Record<string, User> = {
  student: {
    id: "u-student-01",
    username: "minhan",
    fullName: "Nguyễn Minh An",
    email: "minhan@student.k12.edu.vn",
    role: "STUDENT",
    avatarUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80",
    gradeLevel: 5,
    energyPoints: 2450,
    streakDays: 7,
  },
  teacher: {
    id: "u-teacher-01",
    username: "thaynam",
    fullName: "Thầy Trần Nam (Toán K-12)",
    email: "trannam@school.edu.vn",
    role: "TEACHER",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    energyPoints: 8900,
    streakDays: 45,
  },
  admin: {
    id: "u-admin-01",
    username: "quantri",
    fullName: "Ban Quản Trị Hệ Thống",
    email: "admin@k12.edu.vn",
    role: "SUPER_ADMIN",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    energyPoints: 12000,
    streakDays: 120,
  },
};

export const MOCK_GRADES: Grade[] = [
  { id: "g-1", name: "Lớp 1", code: "GRADE_1", level: "PRIMARY", displayOrder: 1 },
  { id: "g-2", name: "Lớp 2", code: "GRADE_2", level: "PRIMARY", displayOrder: 2 },
  { id: "g-3", name: "Lớp 3", code: "GRADE_3", level: "PRIMARY", displayOrder: 3 },
  { id: "g-4", name: "Lớp 4", code: "GRADE_4", level: "PRIMARY", displayOrder: 4 },
  { id: "g-5", name: "Lớp 5", code: "GRADE_5", level: "PRIMARY", displayOrder: 5 },
  { id: "g-6", name: "Lớp 6", code: "GRADE_6", level: "SECONDARY", displayOrder: 6 },
  { id: "g-7", name: "Lớp 7", code: "GRADE_7", level: "SECONDARY", displayOrder: 7 },
  { id: "g-8", name: "Lớp 8", code: "GRADE_8", level: "SECONDARY", displayOrder: 8 },
  { id: "g-9", name: "Lớp 9", code: "GRADE_9", level: "SECONDARY", displayOrder: 9 },
  { id: "g-10", name: "Lớp 10", code: "GRADE_10", level: "HIGH_SCHOOL", displayOrder: 10 },
  { id: "g-11", name: "Lớp 11", code: "GRADE_11", level: "HIGH_SCHOOL", displayOrder: 11 },
  { id: "g-12", name: "Lớp 12", code: "GRADE_12", level: "HIGH_SCHOOL", displayOrder: 12 },
];

export const MOCK_SUBJECTS: Subject[] = [
  {
    id: "sub-math-5",
    gradeId: "g-5",
    name: "Toán học Lớp 5",
    code: "MATH_5",
    color: "#2563EB", // Blue
    icon: "Calculator",
    totalLessons: 36,
    completedLessons: 24,
  },
  {
    id: "sub-science-5",
    gradeId: "g-5",
    name: "Khoa học Tự nhiên 5",
    code: "SCI_5",
    color: "#059669", // Emerald
    icon: "Atom",
    totalLessons: 28,
    completedLessons: 18,
  },
  {
    id: "sub-viet-5",
    gradeId: "g-5",
    name: "Tiếng Việt & Tập đọc 5",
    code: "VIET_5",
    color: "#D97706", // Amber
    icon: "BookOpen",
    totalLessons: 32,
    completedLessons: 12,
  },
  {
    id: "sub-eng-5",
    gradeId: "g-5",
    name: "Tiếng Anh K-12 (Starters)",
    code: "ENG_5",
    color: "#7C3AED", // Purple
    icon: "Globe",
    totalLessons: 24,
    completedLessons: 20,
  },
  {
    id: "sub-hist-5",
    gradeId: "g-5",
    name: "Lịch sử & Địa lý 5",
    code: "HIST_5",
    color: "#DC2626", // Rose
    icon: "Compass",
    totalLessons: 20,
    completedLessons: 8,
  },
];

export const MOCK_LESSONS: Lesson[] = [
  {
    id: "les-01",
    chapterId: "chap-01",
    title: "1. Khái niệm Phân số và Các tính chất cơ bản",
    description: "Khám phá bản chất của phân số thông qua ví dụ thực tế về chia bánh pizza và đo lường thể tích.",
    contentType: "VIDEO",
    // Link video mẫu công khai chất lượng cao cho giáo dục (Big Buck Bunny mp4 hoặc Blender educational)
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    durationSeconds: 596,
    orderNum: 1,
    isCompleted: true,
    positionSeconds: 596,
    masteryLevel: "MASTERED",
    quiz: {
      id: "quiz-01",
      title: "Kiểm tra nhanh: Bản chất của phân số",
      passingScore: 80,
      questions: [
        {
          id: "q-1",
          questionText: "Một chiếc bánh pizza được chia đều thành 8 miếng. Bạn Minh ăn 3 miếng. Phân số chỉ số phần bánh Minh đã ăn là bao nhiêu?",
          explanation: "Tổng số phần bằng nhau là 8 (mẫu số), số phần đã ăn là 3 (tử số). Do đó phân số biểu diễn là 3/8.",
          points: 10,
          options: [
            { id: "opt-1", text: "3/8", isCorrect: true },
            { id: "opt-2", text: "8/3", isCorrect: false },
            { id: "opt-3", text: "5/8", isCorrect: false },
            { id: "opt-4", text: "3/5", isCorrect: false },
          ],
        },
        {
          id: "q-2",
          questionText: "Khi nhân cả tử số và mẫu số của một phân số với cùng một số tự nhiên khác 0, ta được:",
          explanation: "Theo tính chất cơ bản của phân số: Khi nhân cả tử số và mẫu số với cùng một số tự nhiên khác 0, ta được một phân số bằng phân số đã cho.",
          points: 10,
          options: [
            { id: "opt-5", text: "Một phân số lớn hơn", isCorrect: false },
            { id: "opt-6", text: "Một phân số bằng phân số đã cho", isCorrect: true },
            { id: "opt-7", text: "Một phân số nhỏ hơn", isCorrect: false },
            { id: "opt-8", text: "Một số thập phân", isCorrect: false },
          ],
        },
      ],
    },
  },
  {
    id: "les-02",
    chapterId: "chap-01",
    title: "2. Quy đồng mẫu số các phân số",
    description: "Học phương pháp tìm mẫu số chung nhỏ nhất và kỹ thuật quy đồng hai hoặc nhiều phân số.",
    contentType: "VIDEO",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    durationSeconds: 653,
    orderNum: 2,
    isCompleted: false,
    positionSeconds: 180,
    masteryLevel: "PROFICIENT",
    quiz: {
      id: "quiz-02",
      title: "Bài tập thực hành: Quy đồng mẫu số",
      passingScore: 80,
      questions: [
        {
          id: "q-3",
          questionText: "Mẫu số chung nhỏ nhất của hai phân số 2/3 và 3/4 là số nào?",
          explanation: "Mẫu số chung nhỏ nhất của 3 và 4 là BCNN(3, 4) = 12.",
          points: 10,
          options: [
            { id: "opt-9", text: "7", isCorrect: false },
            { id: "opt-10", text: "12", isCorrect: true },
            { id: "opt-11", text: "24", isCorrect: false },
            { id: "opt-12", text: "6", isCorrect: false },
          ],
        },
      ],
    },
  },
  {
    id: "les-03",
    chapterId: "chap-01",
    title: "3. Phép cộng và trừ phân số khác mẫu số",
    description: "Ứng dụng quy đồng mẫu số để thực hiện phép cộng và trừ phân số chính xác.",
    contentType: "VIDEO",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    durationSeconds: 480,
    orderNum: 3,
    isCompleted: false,
    positionSeconds: 0,
    masteryLevel: "NOT_STARTED",
  },
  {
    id: "les-04",
    chapterId: "chap-02",
    title: "4. Khái niệm Số thập phân và Hàng của số thập phân",
    description: "Chuyển đổi giữa phân số thập phân sang số thập phân, nhận diện phần nguyên và phần thập phân.",
    contentType: "VIDEO",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    durationSeconds: 520,
    orderNum: 4,
    isCompleted: false,
    positionSeconds: 0,
    masteryLevel: "NOT_STARTED",
  },
];

export const MOCK_COURSE: Course = {
  id: "course-math-5",
  subjectId: "sub-math-5",
  title: "Toán Học Lớp 5 - Chương Trình Chuẩn Bộ Giáo Dục & Đào Tạo",
  description: "Khóa học xây dựng nền tảng tư duy logic, làm chủ phân số, số thập phân, hình học phẳng và giải toán có lời văn chuẩn bị cho chuyển cấp THCS.",
  thumbnailUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80",
  chapters: [
    {
      id: "chap-01",
      courseId: "course-math-5",
      title: "Chương 1: Ôn tập và Bổ sung về Phân số",
      orderNum: 1,
      lessons: [MOCK_LESSONS[0], MOCK_LESSONS[1], MOCK_LESSONS[2]],
    },
    {
      id: "chap-02",
      courseId: "course-math-5",
      title: "Chương 2: Số thập phân và Các phép tính",
      orderNum: 2,
      lessons: [MOCK_LESSONS[3]],
    },
  ],
};

export const MOCK_MEDIA_ASSETS: MediaAsset[] = [
  {
    id: "media-01",
    storageKey: "videos/math-grade5/lesson01_fractions.mp4",
    originalFilename: "bai1_khai_niem_phan_so_goc.mp4",
    contentType: "video/mp4",
    fileSizeBytes: 245890120, // 245 MB
    status: "READY",
    hlsUrl: "https://cdn.eduk12.vn/hls/lesson01/master.m3u8",
    createdAt: "2026-10-10 09:30:00",
  },
  {
    id: "media-02",
    storageKey: "videos/math-grade5/lesson02_common_denominator.mp4",
    originalFilename: "bai2_quy_dong_mau_so.mp4",
    contentType: "video/mp4",
    fileSizeBytes: 312450890, // 312 MB
    status: "READY",
    hlsUrl: "https://cdn.eduk12.vn/hls/lesson02/master.m3u8",
    createdAt: "2026-10-11 14:15:00",
  },
  {
    id: "media-03",
    storageKey: "videos/science-grade5/lesson01_human_body.mp4",
    originalFilename: "bai1_co_the_nguoi_4k.mp4",
    contentType: "video/mp4",
    fileSizeBytes: 520110450, // 520 MB
    status: "TRANSCODING",
    createdAt: "2026-10-13 16:45:00",
  },
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: "aud-01",
    userId: "u-admin-01",
    userName: "Ban Quản Trị",
    action: "UPDATE_SYSTEM_SETTINGS",
    resourceType: "PLATFORM_CONFIG",
    resourceId: "RATE_LIMIT_AI",
    details: "Điều chỉnh hạn mức AI học sinh từ 20 câu/ngày lên 30 câu/ngày",
    createdAt: "2026-10-13 16:20:00",
  },
  {
    id: "aud-02",
    userId: "u-teacher-01",
    userName: "Thầy Trần Nam",
    action: "CREATE_LESSON",
    resourceType: "LESSON",
    resourceId: "les-03",
    details: "Tạo bài giảng mới: Phép cộng và trừ phân số khác mẫu số",
    createdAt: "2026-10-13 14:10:00",
  },
  {
    id: "aud-03",
    userId: "u-admin-01",
    userName: "Ban Quản Trị",
    action: "ROLE_PERMISSION_CHANGE",
    resourceType: "SECURITY_RBAC",
    resourceId: "TEACHER_ROLE",
    details: "Cấp thêm quyền tải lên Video HLS cho nhóm TEACHER",
    createdAt: "2026-10-12 11:00:00",
  },
];
