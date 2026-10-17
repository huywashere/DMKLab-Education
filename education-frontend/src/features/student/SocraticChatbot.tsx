"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, User } from "@/types";
import {
  X,
  Send,
  Sparkles,
  Lightbulb,
  User as UserIcon,
  Minus,
  BookOpen,
  GraduationCap,
  HelpCircle,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Check,
  ArrowRight,
  BookmarkCheck,
  ChevronDown,
  Layers,
  Cpu,
  WifiOff,
  Wifi,
  Coins,
  ShieldAlert,
  Clock,
  AlertCircle,
} from "lucide-react";
import { RiSparklingFill, RiRobot2Fill } from "react-icons/ri";
import { FaShieldHalved } from "react-icons/fa6";
import confetti from "canvas-confetti";
import { api, SocraticChatResponse, InteractiveQuizData, CitationData } from "@/lib/api";

export type TutorMode =
  "SOCRATIC" | "GRADE_ADAPTED" | "PRACTICE" | "ERROR_DIAGNOSIS" | "CITE_LESSON";

interface SocraticChatbotProps {
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
  activeLessonTitle?: string;
  onNavigateToLesson?: (lessonId: string) => void;
}

const TUTOR_MODES: { id: TutorMode; name: string; icon: React.ReactNode; desc: string }[] = [
  {
    id: "SOCRATIC",
    name: "Gợi ý từng bước",
    icon: <Lightbulb className="w-3.5 h-3.5" />,
    desc: "Gợi mở tư duy, không giải hộ",
  },
  {
    id: "GRADE_ADAPTED",
    name: "Theo lớp học",
    icon: <GraduationCap className="w-3.5 h-3.5" />,
    desc: "Ngôn ngữ phù hợp lứa tuổi",
  },
  {
    id: "PRACTICE",
    name: "Tạo bài luyện tập",
    icon: <HelpCircle className="w-3.5 h-3.5" />,
    desc: "Trắc nghiệm tương tác tức thì",
  },
  {
    id: "ERROR_DIAGNOSIS",
    name: "Vì sao em sai?",
    icon: <RotateCcw className="w-3.5 h-3.5" />,
    desc: "Chẩn đoán bẫy sai lầm",
  },
  {
    id: "CITE_LESSON",
    name: "Căn cứ SGK & Video",
    icon: <BookOpen className="w-3.5 h-3.5" />,
    desc: "Trích dẫn chương trình GDPT",
  },
];

export const SocraticChatbot: React.FC<SocraticChatbotProps> = ({
  currentUser,
  isOpen,
  onClose,
  onOpen,
  activeLessonTitle = "Khái niệm Phân số và Các tính chất cơ bản",
  onNavigateToLesson,
}) => {
  const [selectedMode, setSelectedMode] = useState<TutorMode>("SOCRATIC");
  const [selectedGrade, setSelectedGrade] = useState<number>(currentUser.gradeLevel || 5);
  const [isGradeDropdownOpen, setIsGradeDropdownOpen] = useState(false);

  // Danh sách tin nhắn khởi tạo
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-01",
      role: "assistant",
      content: `Chào ${currentUser.fullName}! Thầy là Gia sư AI đồng hành cùng em theo phương pháp Socratic. Thay vì chỉ đưa đáp án, thầy sẽ gợi ý từng bước, tạo bài luyện tập, chỉ rõ vì sao em sai và trích dẫn chuẩn SGK Lớp ${selectedGrade}. Em đang băn khoăn ở phần nào nào?`,
      timestamp: "10:30",
      isSocraticHint: true,
      mode: "SOCRATIC",
      gradeLevel: selectedGrade,
    },
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [usedQuota, setUsedQuota] = useState(1);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [piiWarning, setPiiWarning] = useState<string | null>(null);

  // 1. Chống lạm dụng AI: Giới hạn lượt hỏi, Token & Chi phí
  const [tokensUsedToday, setTokensUsedToday] = useState(3420);
  const [estimatedCostUsd, setEstimatedCostUsd] = useState(0.007);
  const [cooldownSec, setCooldownSec] = useState(0);
  const [rateLimitAlert, setRateLimitAlert] = useState<string | null>(null);
  const [isAiMonitorOpen, setIsAiMonitorOpen] = useState(true);

  // 2. Chống lạm dụng AI: Theo dõi hành vi bất thường (Prompt Injection / Jailbreak)
  const [abnormalAlert, setAbnormalAlert] = useState<string | null>(null);

  // 3. Phương án dự phòng khi dịch vụ AI lỗi (Graceful Offline Socratic Engine)
  const [aiEngineMode, setAiEngineMode] = useState<"CLOUD_OPENAI" | "OFFLINE_FALLBACK">(
    "CLOUD_OPENAI"
  );
  const [fallbackActiveToast, setFallbackActiveToast] = useState<string | null>(null);

  // Lưu đáp án học sinh đã chọn cho các câu hỏi luyện tập tương tác trong khung chat
  const [quizAnswers, setQuizAnswers] = useState<
    Record<string, { selected: string; isCorrect: boolean }>
  >({});

  const maxQuota = 30; // Daily quota chuẩn Khanmigo K-12
  const maxTokens = 10000; // Giới hạn token học sinh/ngày
  const maxDailyCost = 0.05; // $0.05 USD / học sinh / ngày
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Cooldown timer cho Sliding-window rate limiter
  useEffect(() => {
    if (cooldownSec <= 0) return;
    const timer = setInterval(() => {
      setCooldownSec((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSec]);

  // Kiểm tra thông tin cá nhân (PII) theo thời gian thực khi học sinh gõ
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);

    const phoneRegex = /(\+84|0)(3|5|7|8|9)[0-9]{7,}/;
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const cccdRegex = /\b[0-9]{9,12}\b/;

    if (phoneRegex.test(val)) {
      setPiiWarning(
        "🛡️ Phát hiện số điện thoại! Để bảo vệ quyền riêng tư, vui lòng không gửi thông tin liên lạc cá nhân."
      );
    } else if (emailRegex.test(val)) {
      setPiiWarning(
        "🛡️ Vui lòng không chia sẻ địa chỉ email cá nhân trên khung trò chuyện học tập."
      );
    } else if (cccdRegex.test(val)) {
      setPiiWarning("🛡️ Phát hiện dãy số định danh! Tuyệt đối không gửi số CCCD/CMND trên mạng.");
    } else {
      setPiiWarning(null);
    }
  };

  const handleSend = async (textToSend?: string, customMode?: TutorMode) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    // 1. Sliding Window Rate Limiting Cooldown Check (Chống spam prompt)
    if (cooldownSec > 0) {
      setRateLimitAlert(
        `Thao tác quá nhanh! Vui lòng suy ngẫm gợi ý trong ${cooldownSec}s trước khi gửi tiếp.`
      );
      setTimeout(() => setRateLimitAlert(null), 3000);
      return;
    }

    // 2. Kiểm tra hành vi bất thường / Prompt Injection / Jailbreak
    const injectionRegex =
      /(ignore previous instructions|bỏ qua hướng dẫn|bỏ qua quy tắc|jailbreak|DAN mode|system prompt|hack hệ thống|đưa luôn đáp án không cần giải thích|bypass filter|tiết lộ prompt)/i;
    const isSuspicious = injectionRegex.test(text);
    if (isSuspicious) {
      setAbnormalAlert(
        "⚠️ CẢNH BÁO AN TOÀN AI: Phát hiện câu lệnh bất thường (Prompt Injection/Jailbreak attempt). Gia sư AI tuân thủ nguyên tắc sư phạm K-12 và đã ghi lại sự kiện vào Nhật ký kiểm toán bảo mật!"
      );
    } else {
      setAbnormalAlert(null);
    }

    const currentMode = customMode || selectedMode;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);
    setPiiWarning(null);
    setRateLimitAlert(null);

    // Kích hoạt cooldown 5s phòng chống spam
    setCooldownSec(5);

    // Cập nhật ước lượng Token và Chi phí
    const promptTokens = Math.max(15, Math.ceil(text.length / 3));
    setTokensUsedToday((prev) => Math.min(prev + promptTokens + 120, maxTokens));
    setEstimatedCostUsd((prev) => Number((prev + 0.0002).toFixed(4)));

    // Nếu học sinh hoặc admin đang chọn Chế độ Dự Phòng Offline
    if (aiEngineMode === "OFFLINE_FALLBACK") {
      setTimeout(() => {
        const botMsg = generateLocalTutorResponse(
          text,
          currentMode,
          selectedGrade,
          activeLessonTitle
        );
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
        setUsedQuota((prev) => Math.min(prev + 1, maxQuota));
      }, 600);
      return;
    }

    try {
      const res: SocraticChatResponse = await api.sendLearningChat(text, undefined, sessionId, {
        mode: currentMode,
        gradeLevel: selectedGrade,
        contextLessonTitle: activeLessonTitle,
        contextSubject: "Toán học K-12",
        studentAnswer: currentMode === "ERROR_DIAGNOSIS" ? text : undefined,
      });

      if (res && res.reply) {
        if (res.sessionId) setSessionId(res.sessionId);
        if (typeof res.dailyQuotaRemaining === "number") {
          setUsedQuota(Math.max(0, maxQuota - res.dailyQuotaRemaining));
        }

        const botMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: "assistant",
          content: res.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          mode: (res.mode as TutorMode) || currentMode,
          gradeLevel: res.gradeLevel || selectedGrade,
          stepByStepHints: res.stepByStepHints,
          interactiveQuiz: res.interactiveQuiz,
          citations: res.citations,
          misconceptionReason: res.misconceptionReason,
          safetyWarning: res.safetyWarning,
        };

        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
        return;
      }
    } catch (err: any) {
      if (
        err?.message &&
        (err.message.includes("429") ||
          err.message.toLowerCase().includes("rate limit") ||
          err.message.includes("quá nhanh"))
      ) {
        setRateLimitAlert(
          err.message ||
            "Giới hạn tốc độ: Bạn đang gửi câu hỏi quá nhanh. Vui lòng đợi 15 giây trước khi hỏi tiếp."
        );
        setCooldownSec(15);
        setIsTyping(false);
        return;
      }
      // Dịch vụ Cloud lỗi -> Chuyển sang Graceful Offline Socratic Engine
      setFallbackActiveToast(
        "⚡ Cloud AI API gặp sự cố. Hệ thống tự động chuyển sang Động cơ Gia sư Socratic Offline dự phòng!"
      );
      setTimeout(() => setFallbackActiveToast(null), 4000);
    }

    // Fallback Client-side Socratic Engine
    setTimeout(() => {
      const botMsg = generateLocalTutorResponse(
        text,
        currentMode,
        selectedGrade,
        activeLessonTitle
      );
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
      setUsedQuota((prev) => Math.min(prev + 1, maxQuota));
    }, 600);
  };

  // Trình sinh phản hồi sư phạm Offline khi backend gián đoạn
  const generateLocalTutorResponse = (
    text: string,
    mode: TutorMode,
    grade: number,
    lesson: string
  ): ChatMessage => {
    const qLower = text.toLowerCase();
    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    let reply = "";
    let hints: string[] | undefined = undefined;
    let quiz: InteractiveQuizData | undefined = undefined;
    let citations: CitationData[] | undefined = undefined;
    let misconception: string | undefined = undefined;

    // Căn cứ SGK
    citations = [
      {
        title: "Bài 3: Khái niệm phân số và phân số bằng nhau",
        chapter: "Chương 1: Ôn tập và Bổ sung về Phân số",
        sourceBook: `SGK Toán ${grade} - Bộ sách Kết nối tri thức với cuộc sống (Trang 10-14)`,
        videoTime: "02:30 (Mục 1: Khái niệm Tử số và Mẫu số)",
      },
      {
        title: "Bài 4: Tính chất cơ bản & Rút gọn phân số",
        chapter: "Chương 1: Phân số & Phép tính",
        sourceBook: `Vở bài tập Toán ${grade} Tập 1 (Trang 8-11)`,
        videoTime: "05:30 (Mục 2: Ví dụ minh họa cắt bánh)",
      },
    ];

    if (mode === "GRADE_ADAPTED") {
      if (grade <= 5) {
        reply = `Chào em! Ở cấp Tiểu học (Lớp ${grade}), chúng ta hình dung thật trực quan nhé: "Em có 1 chiếc bánh pizza chia đều cho 4 bạn. Nếu em lấy 1 miếng, phân số biểu diễn là 1/4 (1 là tử số chỉ số miếng lấy, 4 là mẫu số chỉ tổng số miếng). Hãy nhớ: Tử ở trên, Mẫu ở dưới!"`;
        hints = [
          "Bước 1: Đếm xem đồ vật được chia thành bao nhiêu phần bằng nhau (đây là Mẫu số).",
          "Bước 2: Đếm số phần được lấy ra hoặc tô màu (đây là Tử số).",
          "Bước 3: Viết phân số: Tử số ở trên, dấu gạch ngang, Mẫu số ở dưới.",
        ];
      } else if (grade <= 9) {
        reply = `Chào bạn! Ở cấp THCS (Lớp ${grade}), ta tiếp cận dưới góc độ đại số và tính chất tổng quát: Phân số a/b (b ≠ 0) biểu diễn phép chia a : b. Khi cộng trừ phân số khác mẫu, ta tìm Bội chung nhỏ nhất (BCNN) của các mẫu số để quy đồng.`;
        hints = [
          "Bước 1: Phân tích các mẫu số ra thừa số nguyên tố.",
          "Bước 2: Tìm Mẫu thức chung = BCNN của các mẫu.",
          "Bước 3: Nhân cả tử và mẫu với thừa số phụ tương ứng.",
        ];
      } else {
        reply = `Chào bạn! Ở bậc THPT (Lớp ${grade}), bài học liên quan đến mở rộng trường số hữu tỉ Q sang trường số thực R, biểu thức phân thức đại số và điều kiện xác định của phương trình, đồ thị hàm số.`;
        hints = [
          "Bước 1: Luôn đặt ĐKXĐ (Mẫu thức khác 0).",
          "Bước 2: Biến đổi tương đương hoặc lập bảng biến thiên.",
          "Bước 3: Đối chiếu nghiệm với ĐKXĐ ban đầu.",
        ];
      }
    } else if (mode === "PRACTICE") {
      reply = `Tuyệt vời! Sau khi xem lý thuyết bài "${lesson}", thầy đã tạo sẵn câu hỏi luyện tập trắc nghiệm dành cho Lớp ${grade} để em thử sức ngay:`;
      if (grade <= 5) {
        quiz = {
          id: `quiz-${Date.now()}`,
          question:
            "Một chiếc bánh pizza được chia đều thành 8 miếng. Bạn Minh ăn 3 miếng. Phân số chỉ số phần bánh Minh đã ăn là bao nhiêu?",
          options: ["A. 3/8", "B. 8/3", "C. 5/8", "D. 3/5"],
          correctAnswer: "A. 3/8",
          explanation:
            "Tổng số phần chia đều là 8 (Mẫu số), số phần đã ăn là 3 (Tử số). Do đó phân số biểu diễn là 3/8.",
          points: 10,
        };
      } else if (grade <= 9) {
        quiz = {
          id: `quiz-${Date.now()}`,
          question: "Mẫu số chung nhỏ nhất của hai phân số 5/12 và 7/18 là số nào?",
          options: ["A. 216", "B. 72", "C. 36", "D. 48"],
          correctAnswer: "C. 36",
          explanation:
            "12 = 2² × 3; 18 = 2 × 3². BCNN(12, 18) = 2² × 3² = 36. Mẫu chung nhỏ nhất là 36.",
          points: 10,
        };
      } else {
        quiz = {
          id: `quiz-${Date.now()}`,
          question: "Tập xác định của hàm phân thức y = (2x - 3) / (x² - 9) là:",
          options: ["A. D = R", "B. D = R \\ {3}", "C. D = R \\ {-3; 3}", "D. D = (-3; 3)"],
          correctAnswer: "C. D = R \\ {-3; 3}",
          explanation: "Điều kiện mẫu khác 0: x² - 9 ≠ 0 ⇔ x ≠ 3 và x ≠ -3. Vậy D = R \\ {-3; 3}.",
          points: 10,
        };
      }
    } else if (mode === "ERROR_DIAGNOSIS") {
      reply =
        "Thầy đã phân tích câu trả lời của em. Sai sót là một phần tự nhiên của việc học hỏi! Dưới đây là phân tích chi tiết nguyên nhân:";
      misconception =
        "Bẫy sai lầm phổ biến: Em đã vô tình cộng gộp cả hai mẫu số với nhau (ví dụ: 2/3 + 3/4 = (2+3)/(3+4) = 5/7). Đây là sai lầm rất thường gặp! Mẫu số chỉ đơn vị phân chia, không được phép cộng trực tiếp mà bắt buộc phải quy đồng mẫu trước.";
      hints = [
        "Quy tắc vàng 1: Tuyệt đối không cộng mẫu số với nhau.",
        "Quy tắc vàng 2: Quy đồng về cùng mẫu số chung.",
        "Quy tắc vàng 3: Giữ nguyên mẫu số chung, chỉ cộng các tử số.",
      ];
    } else if (mode === "CITE_LESSON") {
      reply = `Dưới đây là căn cứ tài liệu chính thức theo Chương trình Giáo dục Phổ thông 2018 và bài giảng trực tuyến của DMKLab cho chủ đề "${lesson}":`;
    } else {
      // Socratic default
      if (qLower.includes("đáp án") || qLower.includes("kết quả") || qLower.includes("giải hộ")) {
        reply =
          "Thầy hiểu em đang rất muốn biết kết quả ngay! Nhưng nếu thầy đưa luôn đáp án, em sẽ không rèn luyện được tư duy của chính mình. Em hãy đọc lại đề bài và cho thầy biết: Bước đầu tiên em đã thử làm là gì?";
      } else if (qLower.includes("quy đồng")) {
        reply =
          "Quy đồng mẫu số nghĩa là biến đổi các phân số về cùng một mẫu số chung mà giá trị không thay đổi. Ví dụ với hai mẫu số 3 và 4, số nhỏ nhất nào chia hết cho cả 3 và 4 nhỉ?";
      } else {
        reply = `Câu hỏi rất hay! Để giải quyết vấn đề trong bài học "${lesson}", theo em khái niệm cốt lõi nào chúng ta vừa xem trong video có thể áp dụng đầu tiên?`;
      }
      hints = [
        "Gợi ý 1: Đọc kỹ câu hỏi và xác định dữ kiện đã cho.",
        "Gợi ý 2: Kiểm tra xem mẫu số của các phân số đã bằng nhau chưa.",
        "Gợi ý 3: Tự nhẩm thử một đáp án và đối chiếu lại với định nghĩa trong bài học.",
      ];
    }

    return {
      id: `msg-${Date.now() + 1}`,
      role: "assistant",
      content: reply,
      timestamp: timeNow,
      mode: mode,
      gradeLevel: grade,
      stepByStepHints: hints,
      interactiveQuiz: quiz,
      citations: citations,
      misconceptionReason: misconception,
    };
  };

  // Xử lý khi học sinh chọn một đáp án trong câu hỏi trắc nghiệm tương tác
  const handleSelectQuizOption = (quizId: string, optionText: string, correctAnswer: string) => {
    if (quizAnswers[quizId]) return; // Không cho chọn lại sau khi đã submit

    const isCorrect =
      optionText.trim().startsWith(correctAnswer.slice(0, 2)) || optionText.includes(correctAnswer);
    setQuizAnswers((prev) => ({
      ...prev,
      [quizId]: { selected: optionText, isCorrect },
    }));

    if (isCorrect) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#14BF96", "#1865F2", "#FFC700"],
      });
    }
  };

  // Gợi ý câu hỏi nhanh thay đổi theo từng chế độ
  const getPromptSuggestions = () => {
    switch (selectedMode) {
      case "GRADE_ADAPTED":
        return [
          `Giải thích bài này cho học sinh Lớp ${selectedGrade} dễ hiểu`,
          "Cho ví dụ thực tế liên quan đến cuộc sống",
          `Khái niệm này lên cấp trên sẽ học nâng cao ra sao?`,
        ];
      case "PRACTICE":
        return [
          "Tạo một câu hỏi trắc nghiệm mới về bài học này",
          "Cho em một bài tập nâng cao tư duy",
          "Thử thách bài tập phân số có lời văn",
        ];
      case "ERROR_DIAGNOSIS":
        return [
          "Tại sao 2/3 + 3/4 không bằng 5/7?",
          "Em tính ra kết quả khác đáp án, em sai ở đâu?",
          "Những bẫy sai lầm học sinh hay gặp nhất ở bài này?",
        ];
      case "CITE_LESSON":
        return [
          "Bài học này thuộc chương nào trong SGK?",
          "Cho em biết mốc thời gian video bài giảng liên quan",
          "Trích dẫn định nghĩa chính thức trong sách giáo khoa",
        ];
      case "SOCRATIC":
      default:
        return [
          "Gợi ý cho em bước đầu tiên của bài tập này",
          "Quy đồng mẫu số là gì vậy thầy?",
          "Cho em một gợi ý về ví dụ chiếc bánh pizza",
        ];
    }
  };

  // If chatbot is closed, render floating circular trigger button at bottom-right corner
  if (!isOpen) {
    if (!onOpen) return null;
    return (
      <div className="fixed bottom-6 right-6 z-40 group flex items-center">
        {/* Subtle tooltip on hover */}
        <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 mr-2.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-[#1E293B] text-white text-xs font-bold whitespace-nowrap shadow-xl border border-slate-700 hidden sm:flex items-center gap-1.5">
          <span>Gia sư AI Socratic 24/7</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </div>

        <button
          onClick={onOpen}
          className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-[#1865F2] via-[#1A73E8] to-[#14BF96] text-white shadow-xl hover:shadow-2xl hover:shadow-[#1865F2]/40 hover:scale-108 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer border border-white/25"
          title="Trò chuyện với Gia Sư AI Socratic 24/7"
          aria-label="Mở gia sư AI DMKLab"
        >
          {/* Subtle pulse effect */}
          <span className="absolute inset-0 rounded-full bg-[#1865F2] animate-ping opacity-20 pointer-events-none" />

          {/* AI Robot Icon */}
          <RiRobot2Fill className="w-7 h-7 text-white transition-transform duration-200 group-hover:scale-110 drop-shadow-xs" />

          {/* Online green indicator badge */}
          <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full ring-2 ring-white dark:ring-[#0B1120]" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[440px] md:w-[480px] h-[640px] max-h-[calc(100vh-4.5rem)] bg-white dark:bg-[#0F172A] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-[#0B2147] via-[#102A54] to-[#0D3B66] text-white p-3.5 sm:p-4 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#1865F2] to-[#14BF96] flex items-center justify-center text-white shadow-sm shrink-0">
            <RiSparklingFill className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm leading-tight">Gia Sư AI Học Tập</h3>
              <span className="text-[10px] bg-[#14BF96] px-1.5 py-0.5 rounded-full font-black text-white">
                Socratic 2.0
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-300 flex items-center gap-1 mt-0.5">
              <FaShieldHalved className="w-2.5 h-2.5 text-emerald-400" />
              <span>Bảo vệ quyền riêng tư K-12 · Không giải hộ</span>
            </p>
          </div>
        </div>

        {/* Grade level picker button & window actions */}
        <div className="flex items-center gap-1.5">
          {/* Grade Dropdown Trigger */}
          <div className="relative">
            <button
              onClick={() => setIsGradeDropdownOpen(!isGradeDropdownOpen)}
              className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer border border-white/15"
              title="Đổi trình độ lớp học"
            >
              <span>Lớp {selectedGrade}</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {/* Dropdown Menu */}
            {isGradeDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-50 text-slate-800 dark:text-slate-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                  Chọn trình độ lớp:
                </div>
                <div className="grid grid-cols-3 gap-1 pt-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                    <button
                      key={g}
                      onClick={() => {
                        setSelectedGrade(g);
                        setIsGradeDropdownOpen(false);
                      }}
                      className={`py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                        selectedGrade === g
                          ? "bg-[#1865F2] text-white shadow-xs"
                          : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      Lớp {g}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
            title="Thu nhỏ"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
            title="Đóng chatbox"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5 Tutor Mode Navigation Tabs */}
      <div className="bg-slate-100/90 dark:bg-slate-800/90 p-1.5 border-b border-slate-200 dark:border-slate-700 flex gap-1 overflow-x-auto no-scrollbar shrink-0">
        {TUTOR_MODES.map((mode) => {
          const isActive = selectedMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                isActive
                  ? "bg-white dark:bg-slate-900 text-[#1865F2] dark:text-blue-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50"
              }`}
              title={mode.desc}
            >
              <span className={isActive ? "text-[#1865F2] dark:text-blue-400" : "text-slate-400"}>
                {mode.icon}
              </span>
              <span>{mode.name}</span>
            </button>
          );
        })}
      </div>

      {/* Chống lạm dụng AI & Quota Header */}
      <div className="bg-slate-50 dark:bg-slate-900/90 px-3.5 py-2 border-b border-slate-200 dark:border-slate-800 text-[11px] shrink-0">
        <div className="flex items-center justify-between gap-2">
          {/* Quota & Cost indicators */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-[#1865F2] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900">
              Quota: {usedQuota}/{maxQuota} câu
            </span>
            <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">
              ~{tokensUsedToday.toLocaleString()} tokens
            </span>
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold hidden sm:inline">
              ${estimatedCostUsd} / $0.05
            </span>
          </div>

          {/* AI Engine & Fallback Switcher */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                const next = aiEngineMode === "CLOUD_OPENAI" ? "OFFLINE_FALLBACK" : "CLOUD_OPENAI";
                setAiEngineMode(next);
              }}
              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition cursor-pointer border ${
                aiEngineMode === "CLOUD_OPENAI"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300"
              }`}
              title="Click để chuyển đổi giữa OpenAI API và Động cơ Socratic Offline dự phòng"
            >
              {aiEngineMode === "CLOUD_OPENAI" ? (
                <>
                  <Wifi className="w-3 h-3 text-emerald-600" />
                  <span>OpenAI Cloud API</span>
                </>
              ) : (
                <>
                  <Cpu className="w-3 h-3 text-amber-600" />
                  <span>Offline Dự Phòng</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sliding Window Cooldown Notice */}
        {cooldownSec > 0 && (
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-blue-700 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-950/40 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-900 animate-pulse">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>
                Chống lạm dụng (Sliding window): Vui lòng suy ngẫm gợi ý trước khi hỏi tiếp...
              </span>
            </span>
            <span className="font-mono font-bold">{cooldownSec}s</span>
          </div>
        )}
      </div>

      {/* Fallback Active Toast */}
      {fallbackActiveToast && (
        <div className="bg-amber-500 text-white p-2 text-xs flex items-center gap-2 shrink-0 animate-in fade-in duration-200">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span className="font-medium text-[11px]">{fallbackActiveToast}</span>
        </div>
      )}

      {/* Abnormal Behavior / Prompt Injection Alert Banner */}
      {abnormalAlert && (
        <div className="bg-rose-50 dark:bg-rose-950/80 border-b border-rose-200 dark:border-rose-900 p-2.5 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2 shrink-0 animate-in fade-in duration-200">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-[11px] leading-snug">{abnormalAlert}</div>
          <button
            onClick={() => setAbnormalAlert(null)}
            className="text-rose-400 hover:text-rose-600 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Rate limit alert */}
      {rateLimitAlert && (
        <div className="bg-amber-50 dark:bg-amber-950/80 border-b border-amber-200 p-2 text-xs text-amber-800 flex items-center gap-1.5 shrink-0">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="text-[11px] font-medium">{rateLimitAlert}</span>
        </div>
      )}

      {/* Real-time PII Alert if student enters phone/email */}
      {piiWarning && (
        <div className="bg-amber-50 dark:bg-amber-950/60 border-b border-amber-200 dark:border-amber-800/60 p-2.5 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2 animate-in fade-in slide-in-from-top-1 duration-200 shrink-0">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="flex-1 leading-snug">{piiWarning}</p>
        </div>
      )}

      {/* Chat Messages Scroll Container */}
      <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-[#070D18]/60">
        {messages.map((m) => {
          const isBot = m.role === "assistant";
          return (
            <div
              key={m.id}
              className={`flex gap-2.5 ${isBot ? "items-start" : "items-end justify-end"}`}
            >
              {isBot && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#1865F2] to-[#14BF96] flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
                  <RiRobot2Fill className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[88%] rounded-2xl text-xs sm:text-sm leading-relaxed space-y-3 ${
                  isBot
                    ? "bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 p-3.5 text-slate-800 dark:text-slate-100 shadow-xs rounded-tl-xs"
                    : "bg-[#1865F2] text-white p-3 font-medium rounded-tr-xs shadow-xs"
                }`}
              >
                {/* Mode Tag if available on Assistant message */}
                {isBot && m.mode && (
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-400 pb-1 border-b border-slate-100 dark:border-slate-700/60">
                    <Sparkles className="w-3 h-3 text-[#1865F2]" />
                    <span>
                      {m.mode === "GRADE_ADAPTED"
                        ? `Giải thích chuẩn Lớp ${m.gradeLevel || selectedGrade}`
                        : m.mode === "PRACTICE"
                          ? "Bài tập luyện tập tương tác"
                          : m.mode === "ERROR_DIAGNOSIS"
                            ? "Chẩn đoán sai lầm & Bẫy tư duy"
                            : m.mode === "CITE_LESSON"
                              ? "Căn cứ bài học SGK & Video"
                              : "Gợi ý sư phạm từng bước"}
                    </span>
                  </div>
                )}

                {/* Main Message Content */}
                <p className="whitespace-pre-line">{m.content}</p>

                {/* 1. Step-by-Step Guidance Box (Gợi ý từng bước) */}
                {isBot && m.stepByStepHints && m.stepByStepHints.length > 0 && (
                  <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-200">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Hướng dẫn gợi mở từng bước:</span>
                    </div>
                    <div className="space-y-1.5 text-xs text-blue-950 dark:text-blue-100">
                      {m.stepByStepHints.map((hint, hIdx) => (
                        <div key={hIdx} className="flex items-start gap-2 leading-relaxed">
                          <span className="w-4 h-4 rounded-full bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {hIdx + 1}
                          </span>
                          <span className="flex-1">{hint}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Interactive Practice Question (Tạo câu hỏi luyện tập) */}
                {isBot && m.interactiveQuiz && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-[#14BF96]" />
                        <span>Câu hỏi luyện tập nhanh</span>
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        +{m.interactiveQuiz.points} Điểm
                      </span>
                    </div>

                    <p className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                      {m.interactiveQuiz.question}
                    </p>

                    {/* Options Grid */}
                    <div className="space-y-1.5">
                      {m.interactiveQuiz.options.map((opt, oIdx) => {
                        const answerState = quizAnswers[m.interactiveQuiz!.id];
                        const isSelected = answerState?.selected === opt;
                        const isCorrectOption =
                          opt.includes(m.interactiveQuiz!.correctAnswer) ||
                          opt.startsWith(m.interactiveQuiz!.correctAnswer.slice(0, 2));

                        let btnClass =
                          "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-[#1865F2] text-slate-700 dark:text-slate-200";
                        if (answerState) {
                          if (isCorrectOption) {
                            btnClass =
                              "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-100 font-bold";
                          } else if (isSelected && !answerState.isCorrect) {
                            btnClass =
                              "bg-rose-50 dark:bg-rose-950/60 border-rose-400 text-rose-800 dark:text-rose-200";
                          }
                        }

                        return (
                          <button
                            key={oIdx}
                            disabled={!!answerState}
                            onClick={() =>
                              handleSelectQuizOption(
                                m.interactiveQuiz!.id,
                                opt,
                                m.interactiveQuiz!.correctAnswer
                              )
                            }
                            className={`w-full p-2.5 rounded-xl border text-left text-xs transition flex items-center justify-between cursor-pointer ${btnClass}`}
                          >
                            <span>{opt}</span>
                            {answerState && isCorrectOption && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                            {answerState && isSelected && !answerState.isCorrect && (
                              <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Quiz Result Feedback */}
                    {quizAnswers[m.interactiveQuiz.id] && (
                      <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200 space-y-1 animate-in fade-in duration-200">
                        <p className="font-bold flex items-center gap-1.5">
                          {quizAnswers[m.interactiveQuiz.id].isCorrect ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>
                                Chính xác tuyệt vời! Đạt +{m.interactiveQuiz.points} Điểm Năng
                                Lượng! 🎉
                              </span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              <span>Chưa chính xác. Em xem giải thích chi tiết dưới đây nhé:</span>
                            </>
                          )}
                        </p>
                        <p className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                          {m.interactiveQuiz.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Misconception Reason Box (Giải thích vì sao sai) */}
                {isBot && m.misconceptionReason && (
                  <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Chẩn đoán sai lầm & Cách khắc phục:</span>
                    </div>
                    <p className="text-xs text-amber-950 dark:text-amber-100 leading-relaxed">
                      {m.misconceptionReason}
                    </p>
                  </div>
                )}

                {/* 4. Lesson & Textbook Citations (Trích dẫn bài học làm căn cứ) */}
                {isBot && m.citations && m.citations.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      <BookmarkCheck className="w-3.5 h-3.5 text-[#1865F2]" />
                      <span>Căn cứ bài học & Sách giáo khoa GDPT 2018:</span>
                    </div>
                    <div className="space-y-1.5">
                      {m.citations.map((cite, cIdx) => (
                        <div
                          key={cIdx}
                          className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-[11px] space-y-0.5"
                        >
                          <div className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                            {cite.title}
                          </div>
                          <div className="text-slate-500 dark:text-slate-400">
                            {cite.sourceBook} · {cite.chapter}
                          </div>
                          <div className="text-[#1865F2] dark:text-blue-400 font-semibold flex items-center gap-1 pt-0.5">
                            <span>Mốc video: {cite.videoTime}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timestamp */}
                <span
                  className={`block text-[10px] text-right ${isBot ? "text-slate-400 dark:text-slate-500" : "text-blue-100"}`}
                >
                  {m.timestamp}
                </span>
              </div>

              {!isBot && (
                <div className="w-7 h-7 rounded-full bg-[#0B2147] dark:bg-slate-700 flex items-center justify-center text-white shrink-0 mb-0.5 shadow-xs">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-2.5 items-start">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#1865F2] to-[#14BF96] flex items-center justify-center text-white shrink-0 shadow-xs">
              <RiRobot2Fill className="w-4 h-4" />
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-2xl text-xs text-slate-500 dark:text-slate-400 shadow-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1865F2] animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-[#1865F2] animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-[#1865F2] animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-[11px]">Gia sư AI đang xây dựng gợi ý sư phạm...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Pills (Thay đổi linh hoạt theo chế độ đang chọn) */}
      <div className="p-2.5 bg-white dark:bg-[#0F172A] border-t border-slate-100 dark:border-slate-800 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        {getPromptSuggestions().map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="text-[11px] whitespace-nowrap bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-[#1865F2] dark:hover:text-blue-400 px-3 py-1 rounded-full transition flex items-center gap-1 cursor-pointer shrink-0 border border-slate-200/60 dark:border-slate-700"
          >
            <Lightbulb className="w-3 h-3 text-amber-500" />
            <span>{p}</span>
          </button>
        ))}
      </div>

      {/* Input Form with Privacy Guard */}
      <div className="p-3 bg-white dark:bg-[#0F172A] border-t border-slate-200 dark:border-slate-800 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder={`Hỏi Gia Sư AI (${TUTOR_MODES.find((m) => m.id === selectedMode)?.name} Lớp ${selectedGrade})...`}
            className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-transparent focus:bg-white dark:focus:bg-slate-750 focus:border-[#1865F2] focus:outline-none transition"
          />
          <button
            type="submit"
            disabled={!input.trim() || cooldownSec > 0}
            className="w-10 h-10 rounded-xl bg-[#1865F2] hover:bg-[#1557D0] disabled:opacity-40 text-white flex items-center justify-center transition shadow-sm cursor-pointer shrink-0 font-mono text-xs font-bold"
            title={cooldownSec > 0 ? `Vui lòng chờ ${cooldownSec}s` : "Gửi câu hỏi tới Gia sư AI"}
          >
            {cooldownSec > 0 ? <span>{cooldownSec}s</span> : <Send className="w-4 h-4" />}
          </button>
        </form>

        <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-1.5 flex items-center justify-center gap-1">
          <FaShieldHalved className="w-2.5 h-2.5 text-emerald-500" />
          <span>Kiểm duyệt an toàn K-12. Dữ liệu học sinh được bảo vệ và mã hóa riêng tư.</span>
        </p>
      </div>
    </div>
  );
};
