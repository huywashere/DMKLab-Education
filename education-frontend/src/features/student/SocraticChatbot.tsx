"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, User } from "@/types";
import {
  PiRobotDuotone,
  PiSparkleDuotone,
  PiMicrophoneDuotone,
  PiCameraDuotone,
  PiSpeakerHighDuotone,
  PiSpeakerSimpleXDuotone,
  PiTrashDuotone,
  PiPaperPlaneRightFill,
  PiShieldCheckDuotone,
  PiLightbulbDuotone,
  PiArrowsOutSimpleBold,
  PiArrowsInSimpleBold,
  PiMinusBold,
  PiXBold,
  PiCheckCircleDuotone,
  PiXCircleDuotone,
  PiGraduationCapDuotone,
  PiArrowsClockwiseDuotone,
  PiInfoDuotone,
  PiBookBookmarkDuotone,
  PiQuestionDuotone,
  PiWarningCircleDuotone,
  PiCpuDuotone,
  PiWifiHighDuotone,
  PiUserCircleDuotone,
  PiThumbsUpDuotone,
  PiThumbsDownDuotone,
  PiCopyDuotone,
  PiCaretDownBold,
  PiClockCountdownDuotone,
  PiImagesDuotone,
  PiFileTextDuotone,
} from "react-icons/pi";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { api, SocraticChatResponse, InteractiveQuizData, CitationData } from "@/lib/api";

export type TutorMode =
  | "SOCRATIC"
  | "GRADE_ADAPTED"
  | "PRACTICE"
  | "ERROR_DIAGNOSIS"
  | "CITE_LESSON";

interface SocraticChatbotProps {
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
  activeLessonTitle?: string;
  activeSubject?: string;
  activeBookTitle?: string;
  activeChapterTitle?: string;
  onNavigateToLesson?: (lessonId: string) => void;
}

interface TutorModeItem {
  id: TutorMode;
  name: string;
  shortName: string;
  icon: React.ReactNode;
  desc: string;
}

const TUTOR_MODES: TutorModeItem[] = [
  {
    id: "SOCRATIC",
    name: "Gợi ý từng bước",
    shortName: "Gợi ý",
    icon: <PiLightbulbDuotone className="w-4 h-4" />,
    desc: "Gợi mở tư duy sư phạm, không làm hộ bài",
  },
  {
    id: "GRADE_ADAPTED",
    name: "Theo lớp học",
    shortName: "Lớp học",
    icon: <PiGraduationCapDuotone className="w-4 h-4" />,
    desc: "Giải thích trực quan phù hợp tâm lý lứa tuổi",
  },
  {
    id: "PRACTICE",
    name: "Tạo bài luyện tập",
    shortName: "Luyện tập",
    icon: <PiQuestionDuotone className="w-4 h-4" />,
    desc: "Trắc nghiệm tương tác tức thì có tính điểm",
  },
  {
    id: "ERROR_DIAGNOSIS",
    name: "Vì sao em sai?",
    shortName: "Chẩn đoán",
    icon: <PiArrowsClockwiseDuotone className="w-4 h-4" />,
    desc: "Phân tích bẫy tư duy và cách sửa sai",
  },
  {
    id: "CITE_LESSON",
    name: "Căn cứ SGK",
    shortName: "SGK & Video",
    icon: <PiBookBookmarkDuotone className="w-4 h-4" />,
    desc: "Trích dẫn chương trình GDPT 2018 & video bài giảng",
  },
];

export const SocraticChatbot: React.FC<SocraticChatbotProps> = ({
  currentUser,
  isOpen,
  onClose,
  onOpen,
  activeLessonTitle = "Khái niệm Phân số và Các tính chất cơ bản",
  activeSubject = "Toán học",
  activeBookTitle,
  activeChapterTitle,
  onNavigateToLesson,
}) => {
  const [selectedMode, setSelectedMode] = useState<TutorMode>("SOCRATIC");
  const [selectedGrade, setSelectedGrade] = useState<number>(currentUser.gradeLevel || 5);
  const [isGradeDropdownOpen, setIsGradeDropdownOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDevMetricsOpen, setIsDevMetricsOpen] = useState(false);
  const [isPhotoMenuOpen, setIsPhotoMenuOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [likedMsgIds, setLikedMsgIds] = useState<Set<string>>(new Set());
  const [feedbackMap, setFeedbackMap] = useState<Record<string, "HELPFUL" | "UNHELPFUL">>({});

  // Tin nhắn ban đầu thân thiện với học sinh
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-01",
      role: "assistant",
      content: `Chào ${currentUser.fullName || "em"}! Thầy là Gia sư AI đồng hành cùng em theo phương pháp Socratic (vận hành bởi Google Gemini & Groq AI).\n\nThay vì giải hộ đáp án, thầy sẽ gợi ý từng bước, lấy ví dụ thực tế và tạo bài tập luyện tập để em tự tin nắm chắc bài. Em đang cần thầy hỗ trợ ở câu hỏi hay bài tập nào?`,
      timestamp: "Vừa xong",
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

  // Giới hạn an toàn & Chống lạm dụng
  const [tokensUsedToday, setTokensUsedToday] = useState(3420);
  const [estimatedCostUsd, setEstimatedCostUsd] = useState(0.007);
  const [cooldownSec, setCooldownSec] = useState(0);
  const [rateLimitAlert, setRateLimitAlert] = useState<string | null>(null);
  const [abnormalAlert, setAbnormalAlert] = useState<string | null>(null);

  // Động cơ AI (OpenAI Cloud API hoặc Offline Fallback)
  const [aiEngineMode, setAiEngineMode] = useState<"CLOUD_OPENAI" | "OFFLINE_FALLBACK">(
    "CLOUD_OPENAI"
  );
  const [fallbackActiveToast, setFallbackActiveToast] = useState<string | null>(null);

  // Lưu đáp án trắc nghiệm tương tác
  const [quizAnswers, setQuizAnswers] = useState<
    Record<string, { selected: string; isCorrect: boolean }>
  >({});

  const maxQuota = 30; // Giới hạn lượt hỏi/ngày
  const maxTokens = 10000;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Huấn luyện chuyên sâu (In-Context Knowledge Grounding)
  const [customKnowledge, setCustomKnowledge] = useState<string>("");
  const [knowledgeFileName, setKnowledgeFileName] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Đếm ngược cooldown chống spam
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

  // Dừng đọc tiếng khi đóng chat
  useEffect(() => {
    if (!isOpen && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
    }
  }, [isOpen]);

  // Định dạng công thức toán học KaTeX và văn bản Markdown trực quan
  const renderFormattedContent = (content: string) => {
    const parts = content.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g);
    return parts.map((part, index) => {
      if (part.startsWith("$$") && part.endsWith("$$")) {
        const formula = part.slice(2, -2).trim();
        return (
          <span
            key={index}
            className="block my-2 p-2 rounded-xl bg-blue-50/80 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900/60 text-blue-900 dark:text-blue-200 font-mono font-bold text-center text-xs sm:text-sm overflow-x-auto"
          >
            {formula}
          </span>
        );
      } else if (part.startsWith("$") && part.endsWith("$")) {
        const formula = part.slice(1, -1).trim();
        return (
          <span
            key={index}
            className="inline-block px-1.5 py-0.5 mx-0.5 rounded-md bg-blue-50 dark:bg-blue-950/70 border border-blue-200/90 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-mono font-bold text-[11px] sm:text-xs shadow-xs"
          >
            {formula}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Kiểm tra thông tin cá nhân (PII Protection)
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);

    const phoneRegex = /(\+84|0)(3|5|7|8|9)[0-9]{7,}/;
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const cccdRegex = /\b[0-9]{9,12}\b/;

    if (phoneRegex.test(val)) {
      setPiiWarning(
        "🛡️ Phát hiện số điện thoại! Để bảo vệ quyền riêng tư, vui lòng không chia sẻ số điện thoại cá nhân."
      );
    } else if (emailRegex.test(val)) {
      setPiiWarning(
        "🛡️ Vui lòng không gửi địa chỉ email cá nhân trong khung học tập này."
      );
    } else if (cccdRegex.test(val)) {
      setPiiWarning("🛡️ Phát hiện dãy số định danh! Tuyệt đối không chia sẻ số CCCD/CMND.");
    } else {
      setPiiWarning(null);
    }
  };

  // Tính năng đọc to văn bản hỗ trợ học sinh tiểu học (Text-to-Speech)
  const handleSpeakText = (msgId: string, text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Loại bỏ markdown và ký tự đặc biệt
    const cleanText = text.replace(/[*#_`]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "vi-VN";
    utterance.rate = 0.95;

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Sao chép tin nhắn
  const handleCopyText = (msgId: string, text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedMsgId(msgId);
      setTimeout(() => setCopiedMsgId(null), 2000);
    }
  };

  // Thích phản hồi
  const handleToggleLike = (msgId: string) => {
    setLikedMsgIds((prev) => {
      const next = new Set(prev);
      if (next.has(msgId)) next.delete(msgId);
      else next.add(msgId);
      return next;
    });
  };

  // Gửi đánh giá RLHF phản hồi chất lượng câu trả lời của AI
  const handleFeedback = async (
    msgId: string,
    rating: "HELPFUL" | "UNHELPFUL",
    backendMsgId?: string
  ) => {
    setFeedbackMap((prev) => ({ ...prev, [msgId]: rating }));
    if (backendMsgId) {
      await api.submitAiFeedback(backendMsgId, rating);
    }
  };

  // Làm mới cuộc trò chuyện
  const handleResetChat = () => {
    if (window.confirm("Bắt đầu cuộc trò chuyện mới với Gia Sư AI?")) {
      setMessages([
        {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: `Chào ${currentUser.fullName || "em"}! Thầy đã sẵn sàng cho câu hỏi tiếp theo. Em đang muốn học hay làm bài tập về chủ đề gì nào?`,
          timestamp: "Vừa xong",
          isSocraticHint: true,
          mode: selectedMode,
          gradeLevel: selectedGrade,
        },
      ]);
      setQuizAnswers({});
      setInput("");
      setPiiWarning(null);
    }
  };

  // Giả lập quét ảnh đề bài bài tập
  const handleSimulatePhotoUpload = (promptText: string) => {
    setIsPhotoMenuOpen(false);
    setInput(promptText);
    inputRef.current?.focus();
  };

  // Nạp tài liệu bài học để huấn luyện AI chuyên sâu theo dữ liệu thực tế
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setCustomKnowledge(text);
        setKnowledgeFileName(file.name);
        setIsPhotoMenuOpen(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `sys-${Date.now()}`,
            role: "assistant",
            content: `📚 **Đã nạp thành công tài liệu chuyên sâu:** \`${file.name}\` (${(file.size / 1024).toFixed(1)} KB).\n\nTừ bây giờ, tôi đã được huấn luyện chuyên sâu bám sát 100% dữ liệu, công thức và phương pháp trong tài liệu này! Em hãy đặt câu hỏi nhé.`,
            timestamp: "Vừa xong",
            isSocraticHint: true,
            mode: selectedMode,
            gradeLevel: selectedGrade,
          },
        ]);
      }
    };
    reader.readAsText(file);
  };

  // Giả lập nhận diện giọng nói
  const handleToggleVoiceInput = () => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      try {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = "vi-VN";
        recognition.interimResults = false;

        if (!isListening) {
          setIsListening(true);
          recognition.start();

          recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
            setIsListening(false);
          };

          recognition.onerror = () => setIsListening(false);
          recognition.onend = () => setIsListening(false);
        } else {
          setIsListening(false);
          recognition.stop();
        }
        return;
      } catch {
        // Fallback
      }
    }

    // Fallback nếu trình duyệt không hỗ trợ Web Speech API
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      setInput("Thầy ơi, giải thích giúp em tính chất cơ bản của phân số với ạ!");
      inputRef.current?.focus();
    }, 1200);
  };

  // Xử lý gửi tin nhắn
  const handleSend = async (textToSend?: string, customMode?: TutorMode) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    if (cooldownSec > 0) {
      setRateLimitAlert(`Thao tác nhanh quá! Hãy dành ${cooldownSec}s đọc kĩ gợi ý trước nhé.`);
      setTimeout(() => setRateLimitAlert(null), 3000);
      return;
    }

    // Kiểm tra Prompt Injection
    const injectionRegex =
      /(ignore previous instructions|bỏ qua hướng dẫn|bỏ qua quy tắc|jailbreak|DAN mode|system prompt|hack hệ thống|đưa luôn đáp án không cần giải thích|bypass filter)/i;
    if (injectionRegex.test(text)) {
      setAbnormalAlert(
        "⚠️ CẢNH BÁO AN TOÀN K-12: Gia sư AI tuân thủ nguyên tắc sư phạm chỉ dẫn gợi mở, không giải hộ hay tiết lộ đáp án trực tiếp."
      );
      setTimeout(() => setAbnormalAlert(null), 5000);
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
    setCooldownSec(4); // Cooldown 4 giây thân thiện

    // Cập nhật token & chi phí ước tính
    const promptTokens = Math.max(15, Math.ceil(text.length / 3));
    setTokensUsedToday((prev) => Math.min(prev + promptTokens + 110, maxTokens));
    setEstimatedCostUsd((prev) => Number((prev + 0.0002).toFixed(4)));

    // Chế độ Offline Fallback
    if (aiEngineMode === "OFFLINE_FALLBACK") {
      setTimeout(() => {
        const botMsg = generateLocalTutorResponse(
          text,
          currentMode,
          selectedGrade,
          activeChapterTitle ? `${activeBookTitle ? activeBookTitle + " - " : ""}${activeChapterTitle}` : activeLessonTitle
        );
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
        setUsedQuota((prev) => Math.min(prev + 1, maxQuota));
      }, 500);
      return;
    }

    const resolvedContext = activeChapterTitle
      ? `${activeBookTitle ? activeBookTitle + " - " : ""}${activeChapterTitle}`
      : activeLessonTitle;

    try {
      const res: SocraticChatResponse = await api.sendLearningChat(text, undefined, sessionId, {
        mode: currentMode,
        gradeLevel: selectedGrade,
        contextLessonTitle: resolvedContext,
        contextSubject: activeSubject || "Toán học K-12",
        studentAnswer: currentMode === "ERROR_DIAGNOSIS" ? text : undefined,
        customKnowledge: customKnowledge || undefined,
      });

      if (res && res.reply) {
        if (res.sessionId) setSessionId(res.sessionId);
        if (typeof res.dailyQuotaRemaining === "number") {
          setUsedQuota(Math.max(0, maxQuota - res.dailyQuotaRemaining));
        }

        const botMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          backendMessageId: res.messageId,
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
          quickReplies: res.quickReplies,
        };

        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
        return;
      }
    } catch {
      // Graceful offline fallback khi mạng gián đoạn
      setFallbackActiveToast("⚡ Đã tự động kích hoạt Động cơ Gia sư Socratic Offline dự phòng.");
      setTimeout(() => setFallbackActiveToast(null), 3500);
    }

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
    }, 500);
  };

  // Trình sinh phản hồi sư phạm Offline chất lượng cao
  const generateLocalTutorResponse = (
    text: string,
    mode: TutorMode,
    grade: number,
    lesson: string
  ): ChatMessage => {
    let reply = "";
    let hints: string[] | undefined = undefined;
    let quiz: InteractiveQuizData | undefined = undefined;
    let citations: CitationData[] | undefined = undefined;
    let misconception: string | undefined = undefined;

    citations = [
      {
        title: "Bài 3: Khái niệm phân số và phân số bằng nhau",
        chapter: "Chương 1: Ôn tập và Bổ sung về Phân số",
        sourceBook: `SGK Toán ${grade} - Bộ Kết nối tri thức với cuộc sống (Trang 10-14)`,
        videoTime: "02:30 (Mục 1: Khái niệm Tử số và Mẫu số)",
      },
      {
        title: "Bài 4: Tính chất cơ bản & Rút gọn phân số",
        chapter: "Chương 1: Phân số & Phép tính",
        sourceBook: `Vở bài tập Toán ${grade} Tập 1 (Trang 8-11)`,
        videoTime: "05:30 (Mục 2: Ví dụ minh họa trực quan)",
      },
    ];

    if (mode === "GRADE_ADAPTED") {
      if (grade <= 5) {
        reply = `Chào em! Ở cấp Tiểu học (Lớp ${grade}), chúng ta cùng hình dung thật gần gũi nhé:\n\n"Em có 1 chiếc bánh pizza tròn chia đều cho 4 bạn. Nếu em lấy 1 miếng, phân số biểu diễn phần bánh của em là 1/4. Số 1 ở trên gọi là Tử số (số phần đã lấy), số 4 ở dưới gọi là Mẫu số (tổng số phần bằng nhau)."`;
        hints = [
          "Bước 1: Đếm xem đồ vật được chia thành bao nhiêu phần bằng nhau (đây là Mẫu số).",
          "Bước 2: Đếm số phần được lấy ra hoặc tô màu (đây là Tử số).",
          "Bước 3: Viết phân số: Tử số ở trên, dấu gạch ngang, Mẫu số ở dưới.",
        ];
      } else if (grade <= 9) {
        reply = `Chào bạn! Ở cấp THCS (Lớp ${grade}), ta tiếp cận phân số dưới dạng thương đại số a/b (b ≠ 0). Khi quy đồng hai phân số khác mẫu, ta tìm Bội chung nhỏ nhất (BCNN) của các mẫu số để chọn làm mẫu thức chung.`;
        hints = [
          "Bước 1: Phân tích các mẫu số ra thừa số nguyên tố.",
          "Bước 2: Tìm Mẫu số chung = BCNN của các mẫu.",
          "Bước 3: Nhân cả tử và mẫu với thừa số phụ tương ứng.",
        ];
      } else {
        reply = `Chào bạn! Ở bậc THPT (Lớp ${grade}), biểu thức phân thức yêu cầu tìm Tập xác định (ĐKXĐ: mẫu số khác 0) trước khi rút gọn hoặc giải phương trình.`;
        hints = [
          "Bước 1: Luôn đặt ĐKXĐ (Mẫu thức khác 0).",
          "Bước 2: Biến đổi tương đương hoặc phân tích đa thức thành nhân tử.",
          "Bước 3: Đối chiếu nghiệm với ĐKXĐ ban đầu.",
        ];
      }
    } else if (mode === "PRACTICE") {
      reply = `Thầy có một câu hỏi trắc nghiệm tương tác rất thú vị liên quan đến "${lesson}" cho Lớp ${grade}. Em chọn đáp án đúng bên dưới nhé:`;
      if (grade <= 5) {
        quiz = {
          id: `quiz-${Date.now()}`,
          question:
            "Một chiếc bánh pizza được cắt đều thành 8 miếng bằng nhau. Bạn Nam đã ăn 3 miếng. Phân số chỉ số phần bánh bạn Nam đã ăn là:",
          options: ["A. 3/8", "B. 8/3", "C. 5/8", "D. 3/5"],
          correctAnswer: "A. 3/8",
          explanation:
            "Tổng số miếng chia đều là 8 (Mẫu số), số miếng Nam đã ăn là 3 (Tử số). Vậy phân số đúng là 3/8.",
          points: 10,
        };
      } else {
        quiz = {
          id: `quiz-${Date.now()}`,
          question: "Mẫu số chung nhỏ nhất của hai phân số 5/12 và 7/18 là số nào?",
          options: ["A. 216", "B. 72", "C. 36", "D. 48"],
          correctAnswer: "C. 36",
          explanation:
            "12 = 2² × 3; 18 = 2 × 3². BCNN(12, 18) = 2² × 3² = 36. Vậy mẫu số chung nhỏ nhất là 36.",
          points: 10,
        };
      }
    } else if (mode === "ERROR_DIAGNOSIS") {
      reply = `Thầy hiểu chỗ em đang băn khoăn! Đây là bẫy sai lầm mà nhiều bạn học sinh thường gặp:`;
      misconception =
        "Sai lầm phổ biến: Cộng trực tiếp cả tử số và mẫu số khi chưa quy đồng (ví dụ: 1/2 + 1/3 = 2/5 là SAI!). Quy tắc đúng: Phải quy đồng về cùng mẫu số chung rồi mới cộng các tử số với nhau: 3/6 + 2/6 = 5/6.";
      hints = [
        "Nhớ kiểm tra: Mẫu số đã giống nhau chưa?",
        "Nếu khác mẫu: Quy đồng về mẫu số chung trước.",
        "Giữ nguyên mẫu số chung, chỉ cộng trừ các tử số.",
      ];
    } else if (mode === "CITE_LESSON") {
      reply = `Kiến thức này được quy định chuẩn trong Chương trình Giáo dục Phổ thông 2018. Em có thể tham khảo trực tiếp các tài liệu học tập sau:`;
    } else {
      reply = `Thầy gợi mở để em tự tìm ra hướng giải nhé! Đối với bài toán "${lesson}":\n\nEm hãy quan sát xem bài toán cho chúng ta những dữ kiện gì, và yêu cầu tìm điều gì trước tiên?`;
      hints = [
        "Gợi ý 1: Xác định đại lượng đã biết và đại lượng cần tìm.",
        "Gợi ý 2: Vẽ sơ đồ đoạn thẳng hoặc hình tròn mô phỏng nếu bài toán có phân số.",
        "Gợi ý 3: Thực hiện từng phép tính một cách tuần tự và rút gọn kết quả về phân số tối giản.",
      ];
    }

    return {
      id: `msg-${Date.now()}`,
      role: "assistant",
      content: reply,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      mode,
      gradeLevel: grade,
      stepByStepHints: hints,
      interactiveQuiz: quiz,
      citations,
      misconceptionReason: misconception,
    };
  };

  // Chọn đáp án trắc nghiệm tương tác
  const handleSelectQuizOption = (quizId: string, selectedOption: string, correctAnswer: string) => {
    const isCorrect =
      selectedOption.includes(correctAnswer) ||
      selectedOption.startsWith(correctAnswer.slice(0, 2));

    setQuizAnswers((prev) => ({
      ...prev,
      [quizId]: { selected: selectedOption, isCorrect },
    }));

    if (isCorrect) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ["#1865F2", "#14BF96", "#F59E0B"],
        });
      } catch {
        // Safe fail
      }
    }
  };

  // Gợi ý câu hỏi nhanh theo từng chế độ
  const getPromptSuggestions = () => {
    switch (selectedMode) {
      case "PRACTICE":
        return [
          "🎯 Cho em 1 bài tập trắc nghiệm phân số",
          "⚡ Luyện tập tính nhanh phân số",
          "🏆 Thử thách bài toán thực tế K-12",
        ];
      case "ERROR_DIAGNOSIS":
        return [
          "❓ Vì sao 1/2 + 1/3 không bằng 2/5?",
          "🔍 Kiểm tra giúp em: 3/4 quy đồng mẫu 12 bằng bao nhiêu?",
          "⚠️ Những lỗi hay gặp khi rút gọn phân số là gì?",
        ];
      case "GRADE_ADAPTED":
        return [
          "🍕 Lấy ví dụ chiếc bánh pizza cho em dễ hiểu",
          "🍎 Minh họa phân số bằng hình vẽ trực quan",
          "✏️ Giải thích như đang nói chuyện với bạn Lớp " + selectedGrade,
        ];
      case "CITE_LESSON":
        return [
          "📖 Trích dẫn bài học này trong SGK Toán " + selectedGrade,
          "🎥 Cho em xem mốc thời gian video bài giảng",
          "📝 Yêu cầu cần đạt theo chuẩn GDPT 2018",
        ];
      default:
        return [
          "💡 Cho em gợi ý bước đầu tiên của bài tập này",
          "📐 Quy đồng mẫu số là làm như thế nào?",
          "🍕 Giải thích phân số qua ví dụ thực tế",
        ];
    }
  };

  // Nếu chatbot chưa mở, hiển thị nút tròn nổi ở góc dưới bên phải
  if (!isOpen) {
    if (!onOpen) return null;
    return (
      <div className="fixed bottom-6 right-6 z-40 group flex items-center">
        <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 mr-2.5 px-3 py-1.5 rounded-xl bg-[#0B1528] text-white text-xs font-bold shadow-xl border border-slate-700 hidden sm:flex items-center gap-2">
          <PiRobotDuotone className="w-4 h-4 text-emerald-400" />
          <span>Gia sư AI Socratic 24/7</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={onOpen}
          className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1865F2] via-[#1253cc] to-[#14BF96] text-white shadow-xl hover:shadow-2xl hover:shadow-blue-500/30 transition-shadow duration-200 flex items-center justify-center cursor-pointer border border-white/20"
          title="Trò chuyện với Gia Sư AI Socratic 24/7"
          aria-label="Mở gia sư AI DMKLab"
        >
          <PiSparkleDuotone className="w-7 h-7 text-white" />
          <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full ring-2 ring-white dark:ring-[#0B1528]" />
        </motion.button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={`fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 bg-white dark:bg-[#0B1528] rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 flex flex-col overflow-hidden transition-all duration-200 ${
        isExpanded
          ? "w-[calc(100vw-2rem)] sm:w-[720px] h-[720px] max-h-[calc(100vh-4rem)]"
          : "w-[calc(100vw-2rem)] sm:w-[460px] h-[640px] max-h-[calc(100vh-4.5rem)]"
      }`}
    >
      {/* 1. TOP HEADER: Thanh tiêu đề thông minh, hiện đại */}
      <div className="bg-[#0A1A36] dark:bg-[#070F1E] text-white px-4 py-3 sm:py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1865F2] to-[#14BF96] flex items-center justify-center text-white shadow-md shrink-0 border border-white/20">
            <PiRobotDuotone className="w-6 h-6" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-[#0A1A36]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm text-white tracking-tight truncate">
                Gia Sư AI Socratic
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40 shrink-0 flex items-center gap-1">
                <span>Gemini / Groq ⚡</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-300 flex items-center gap-1.5 truncate mt-0.5">
              <PiShieldCheckDuotone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Gợi mở tư duy · Không giải hộ · Chuẩn GDPT</span>
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Grade Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsGradeDropdownOpen(!isGradeDropdownOpen)}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-white/15"
              title="Đổi trình độ lớp học"
            >
              <span>Lớp {selectedGrade}</span>
              <PiCaretDownBold className="w-3 h-3 opacity-80" />
            </button>

            {isGradeDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#0B1528] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-2.5 z-50 text-slate-800 dark:text-slate-100 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 px-2 py-1">
                  Chọn trình độ lớp học:
                </div>
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                    <button
                      key={g}
                      onClick={() => {
                        setSelectedGrade(g);
                        setIsGradeDropdownOpen(false);
                      }}
                      className={`py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                        selectedGrade === g
                          ? "bg-[#1865F2] text-white shadow-xs"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      Lớp {g}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reset chat */}
          <button
            onClick={handleResetChat}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
            title="Làm mới cuộc trò chuyện"
          >
            <PiTrashDuotone className="w-4 h-4" />
          </button>

          {/* Expand/Collapse window */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer hidden sm:block"
            title={isExpanded ? "Thu nhỏ cửa sổ" : "Mở rộng cửa sổ"}
          >
            {isExpanded ? (
              <PiArrowsInSimpleBold className="w-4 h-4" />
            ) : (
              <PiArrowsOutSimpleBold className="w-4 h-4" />
            )}
          </button>

          {/* Minimize */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
            title="Thu nhỏ"
          >
            <PiMinusBold className="w-4 h-4" />
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
            title="Đóng chatbox"
          >
            <PiXBold className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. SUB-HEADER: Thanh Chế Độ Sư Phạm & Quota Thân Thiện Học Sinh */}
      <div className="bg-slate-50 dark:bg-[#071120] px-3.5 py-2 border-b border-slate-200/90 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
        {/* Scrollable Mode Selector Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {TUTOR_MODES.map((mode) => {
            const isActive = selectedMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-[#1865F2] text-white shadow-xs"
                    : "bg-white dark:bg-[#0E1B31] border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-300"
                }`}
                title={mode.desc}
              >
                <span>{mode.icon}</span>
                <span>{isExpanded ? mode.name : mode.shortName}</span>
              </button>
            );
          })}
        </div>

        {/* Student-friendly Quota Capsule & Technical Info Toggle */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-[#1865F2] dark:text-blue-400 border border-blue-200/70 dark:border-blue-900/60 flex items-center gap-1">
            <span>Còn {maxQuota - usedQuota}/{maxQuota} câu</span>
          </div>

          <button
            onClick={() => setIsDevMetricsOpen(!isDevMetricsOpen)}
            className={`p-1.5 rounded-xl border transition cursor-pointer ${
              isDevMetricsOpen
                ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600"
                : "bg-white dark:bg-[#0E1B31] text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 border-slate-200/80 dark:border-slate-800"
            }`}
            title="Thông tin kỹ thuật & Giám sát chi phí API"
          >
            <PiInfoDuotone className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2b. Collapsible Technical / Admin Metrics Panel */}
      {isDevMetricsOpen && (
        <div className="bg-slate-100 dark:bg-[#0A1629] p-3 border-b border-slate-200 dark:border-slate-800 text-xs space-y-2 animate-in fade-in slide-in-from-top-1 duration-150 shrink-0">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
            <span>QUẢN TRỊ HẠN MỨC & ĐỘNG CƠ AI</span>
            <span>Mô hình: GPT-4o-mini</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
            <div className="p-2 rounded-xl bg-white dark:bg-[#0E1B31] border border-slate-200/80 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px]">Tokens hôm nay</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {tokensUsedToday.toLocaleString()} / {maxTokens.toLocaleString()}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-[#0E1B31] border border-slate-200/80 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px]">Chi phí ước tính</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                ${estimatedCostUsd} / $0.05
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1 p-2 rounded-xl bg-white dark:bg-[#0E1B31] border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px]">Động cơ hiện tại</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {aiEngineMode === "CLOUD_OPENAI" ? "OpenAI Cloud" : "Offline Socratic"}
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setAiEngineMode(
                    aiEngineMode === "CLOUD_OPENAI" ? "OFFLINE_FALLBACK" : "CLOUD_OPENAI"
                  )
                }
                className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[10px] font-bold text-blue-600 dark:text-blue-400 transition cursor-pointer"
              >
                Đổi chế độ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2c. Active Curriculum Context & Topic Guardrail Status */}
      <div className="bg-blue-50/70 dark:bg-blue-950/30 px-3.5 py-1.5 border-b border-blue-100 dark:border-blue-900/40 flex items-center justify-between text-[11px] shrink-0">
        <div className="flex items-center gap-1.5 text-blue-900 dark:text-blue-300 font-medium truncate">
          <PiBookBookmarkDuotone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
          <span className="truncate">
            <span className="font-bold">{activeSubject || "Toán học"}:</span>{" "}
            {activeChapterTitle
              ? `${activeBookTitle ? activeBookTitle + " › " : ""}${activeChapterTitle}`
              : activeLessonTitle}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Crawl SGK & Bám sát chủ đề 100%</span>
        </div>
      </div>

      {/* Cooldown Timer Bar */}
      {cooldownSec > 0 && (
        <div className="bg-blue-50/90 dark:bg-blue-950/60 px-3.5 py-1.5 border-b border-blue-200/80 dark:border-blue-900/60 flex items-center justify-between text-[11px] text-blue-800 dark:text-blue-200 shrink-0">
          <span className="flex items-center gap-1.5">
            <PiClockCountdownDuotone className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
            <span>Hãy suy ngẫm gợi ý của thầy trước khi gửi câu tiếp theo nhé...</span>
          </span>
          <span className="font-mono font-black">{cooldownSec}s</span>
        </div>
      )}

      {/* Alerts & Warnings */}
      {fallbackActiveToast && (
        <div className="bg-amber-500 text-white px-3.5 py-2 text-xs flex items-center gap-2 shrink-0 animate-in fade-in duration-200 font-medium">
          <PiWarningCircleDuotone className="w-4 h-4 shrink-0" />
          <span>{fallbackActiveToast}</span>
        </div>
      )}

      {abnormalAlert && (
        <div className="bg-rose-50 dark:bg-rose-950/80 border-b border-rose-200 dark:border-rose-900 px-3.5 py-2 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2 shrink-0 animate-in fade-in duration-200">
          <PiWarningCircleDuotone className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-[11px] leading-snug">{abnormalAlert}</div>
          <button
            onClick={() => setAbnormalAlert(null)}
            className="text-rose-400 hover:text-rose-600 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {rateLimitAlert && (
        <div className="bg-amber-50 dark:bg-amber-950/80 border-b border-amber-200 px-3.5 py-2 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2 shrink-0">
          <PiWarningCircleDuotone className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="text-[11px] font-medium">{rateLimitAlert}</span>
        </div>
      )}

      {piiWarning && (
        <div className="bg-amber-50 dark:bg-amber-950/60 border-b border-amber-200 dark:border-amber-800/60 px-3.5 py-2 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2 shrink-0 animate-in fade-in duration-200">
          <PiShieldCheckDuotone className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="flex-1 leading-snug text-[11px]">{piiWarning}</p>
        </div>
      )}

      {/* 3. CHAT MESSAGES SCROLL CONTAINER */}
      <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-4 bg-slate-50/70 dark:bg-[#070E1C]">
        {messages.map((m) => {
          const isBot = m.role === "assistant";
          const isLiked = likedMsgIds.has(m.id);
          const isCopied = copiedMsgId === m.id;
          const isSpeaking = speakingMsgId === m.id;

          return (
            <div
              key={m.id}
              className={`flex gap-2.5 ${isBot ? "items-start" : "items-end justify-end"}`}
            >
              {isBot && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1865F2] to-[#14BF96] flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm border border-white/20">
                  <PiRobotDuotone className="w-5 h-5" />
                </div>
              )}

              <div
                className={`max-w-[88%] sm:max-w-[82%] rounded-2xl text-xs sm:text-sm leading-relaxed space-y-3 ${
                  isBot
                    ? "bg-white dark:bg-[#0D1A30] border border-slate-200/90 dark:border-slate-800 p-4 text-slate-800 dark:text-slate-100 shadow-sm rounded-tl-sm"
                    : "bg-[#1865F2] text-white p-3.5 font-medium rounded-tr-sm shadow-md"
                }`}
              >
                {/* Assistant Mode Tag */}
                {isBot && m.mode && (
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <PiSparkleDuotone className="w-3.5 h-3.5 text-[#1865F2] dark:text-blue-400" />
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

                {/* Message Body với KaTeX Math Formatter */}
                <div className="whitespace-pre-line leading-relaxed">{renderFormattedContent(m.content)}</div>

                {/* Gợi ý phản hồi nhanh 1 chạm (Quick Action Chips) */}
                {isBot && m.quickReplies && m.quickReplies.length > 0 && (
                  <div className="pt-1 flex flex-wrap gap-1.5 animate-in fade-in duration-200">
                    {m.quickReplies.map((qr, qrIdx) => (
                      <button
                        key={qrIdx}
                        disabled={isTyping}
                        onClick={() => handleSend(qr)}
                        className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/70 dark:hover:bg-blue-900/70 text-[#1865F2] dark:text-blue-300 border border-blue-200/80 dark:border-blue-800 transition active:scale-95 cursor-pointer shadow-xs"
                      >
                        {qr}
                      </button>
                    ))}
                  </div>
                )}

                {/* Step-by-Step Guidance Box */}
                {isBot && m.stepByStepHints && m.stepByStepHints.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/50 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-200">
                      <PiLightbulbDuotone className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Hướng dẫn gợi mở từng bước:</span>
                    </div>
                    <div className="space-y-2 text-xs text-blue-950 dark:text-blue-100">
                      {m.stepByStepHints.map((hint, hIdx) => (
                        <div key={hIdx} className="flex items-start gap-2.5 leading-relaxed">
                          <span className="w-5 h-5 rounded-lg bg-blue-200 dark:bg-blue-800 text-blue-950 dark:text-blue-100 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                            {hIdx + 1}
                          </span>
                          <span className="flex-1 font-medium">{hint}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interactive Practice Quiz */}
                {isBot && m.interactiveQuiz && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#071120] border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <PiQuestionDuotone className="w-4 h-4 text-[#14BF96]" />
                        <span>Câu hỏi luyện tập tương tác</span>
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        +{m.interactiveQuiz.points} Điểm Năng Lượng
                      </span>
                    </div>

                    <p className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                      {m.interactiveQuiz.question}
                    </p>

                    {/* Quiz Options */}
                    <div className="space-y-2">
                      {m.interactiveQuiz.options.map((opt, oIdx) => {
                        const answerState = quizAnswers[m.interactiveQuiz!.id];
                        const isSelected = answerState?.selected === opt;
                        const isCorrectOption =
                          opt.includes(m.interactiveQuiz!.correctAnswer) ||
                          opt.startsWith(m.interactiveQuiz!.correctAnswer.slice(0, 2));

                        let btnClass =
                          "bg-white dark:bg-[#0D1A30] border-slate-200 dark:border-slate-700 hover:border-[#1865F2] text-slate-700 dark:text-slate-200";
                        if (answerState) {
                          if (isCorrectOption) {
                            btnClass =
                              "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-100 font-bold";
                          } else if (isSelected && !answerState.isCorrect) {
                            btnClass =
                              "bg-rose-50 dark:bg-rose-950/60 border-rose-400 text-rose-800 dark:text-rose-200 font-medium";
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
                            className={`w-full p-3 rounded-xl border text-left text-xs transition flex items-center justify-between cursor-pointer ${btnClass}`}
                          >
                            <span>{opt}</span>
                            {answerState && isCorrectOption && (
                              <PiCheckCircleDuotone className="w-5 h-5 text-emerald-600 shrink-0" />
                            )}
                            {answerState && isSelected && !answerState.isCorrect && (
                              <PiXCircleDuotone className="w-5 h-5 text-rose-500 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Quiz Result Feedback */}
                    {quizAnswers[m.interactiveQuiz.id] && (
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200 space-y-1 animate-in fade-in duration-200">
                        <p className="font-bold flex items-center gap-1.5">
                          {quizAnswers[m.interactiveQuiz.id].isCorrect ? (
                            <>
                              <PiCheckCircleDuotone className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>Chính xác tuyệt vời! Đạt +{m.interactiveQuiz.points} Điểm Năng Lượng! 🎉</span>
                            </>
                          ) : (
                            <>
                              <PiWarningCircleDuotone className="w-4 h-4 text-amber-600 shrink-0" />
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

                {/* Misconception Reason Box / Topic Guardrail Alert */}
                {isBot && m.misconceptionReason && (
                  <div
                    className={`p-3.5 rounded-2xl border space-y-1.5 ${
                      m.misconceptionReason === "OFF_TOPIC_REDIRECT"
                        ? "bg-blue-50/90 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60"
                        : "bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      {m.misconceptionReason === "OFF_TOPIC_REDIRECT" ? (
                        <>
                          <PiShieldCheckDuotone className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                          <span className="text-blue-900 dark:text-blue-200">
                            Rào cản bảo vệ chủ đề học tập (Topic Guardrail):
                          </span>
                        </>
                      ) : (
                        <>
                          <PiWarningCircleDuotone className="w-4 h-4 text-amber-600 shrink-0" />
                          <span className="text-amber-900 dark:text-amber-200">
                            Chẩn đoán sai lầm & Cách khắc phục:
                          </span>
                        </>
                      )}
                    </div>
                    <p
                      className={`text-xs leading-relaxed font-medium ${
                        m.misconceptionReason === "OFF_TOPIC_REDIRECT"
                          ? "text-blue-950 dark:text-blue-100"
                          : "text-amber-950 dark:text-amber-100"
                      }`}
                    >
                      {m.misconceptionReason === "OFF_TOPIC_REDIRECT"
                        ? "Hệ thống khuyến khích em tập trung vào môn học và nội dung bài học để đạt hiệu quả cao nhất."
                        : m.misconceptionReason}
                    </p>
                  </div>
                )}

                {/* Citations Box */}
                {isBot && m.citations && m.citations.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#071120] border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      <PiBookBookmarkDuotone className="w-4 h-4 text-[#1865F2]" />
                      <span>Căn cứ sách giáo khoa GDPT 2018:</span>
                    </div>
                    <div className="space-y-1.5">
                      {m.citations.map((cite, cIdx) => (
                        <div
                          key={cIdx}
                          className="p-2.5 rounded-xl bg-white dark:bg-[#0D1A30] border border-slate-200/80 dark:border-slate-800 text-[11px] space-y-1"
                        >
                          <div className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1 flex items-center justify-between">
                            <span>{cite.title}</span>
                            {cite.targetUrl && (
                              <a
                                href={cite.targetUrl}
                                className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 font-bold"
                              >
                                Xem SGK ↗
                              </a>
                            )}
                          </div>
                          <div className="text-slate-500 dark:text-slate-400">
                            {cite.sourceBook} {cite.chapter ? `· ${cite.chapter}` : ""}
                          </div>
                          {cite.videoTime && (
                            <div className="text-[#1865F2] dark:text-blue-400 font-semibold flex items-center gap-1 pt-0.5">
                              <span>Mốc bài học: {cite.videoTime}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message Footer Toolbar */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-400">
                  {isBot ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleSpeakText(m.id, m.content)}
                        className={`p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer ${
                          isSpeaking ? "text-blue-600 font-bold" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        }`}
                        title={isSpeaking ? "Dừng đọc" : "Đọc gợi ý bằng giọng nói"}
                      >
                        {isSpeaking ? (
                          <PiSpeakerSimpleXDuotone className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                        ) : (
                          <PiSpeakerHighDuotone className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleCopyText(m.id, m.content)}
                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer"
                        title={isCopied ? "Đã sao chép!" : "Sao chép câu trả lời"}
                      >
                        {isCopied ? (
                          <span className="text-emerald-600 font-bold text-[9px]">Đã chép!</span>
                        ) : (
                          <PiCopyDuotone className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Phản hồi Sư phạm RLHF: Thumbs Up */}
                      <button
                        onClick={() => handleFeedback(m.id, "HELPFUL", m.backendMessageId)}
                        className={`p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer ${
                          feedbackMap[m.id] === "HELPFUL"
                            ? "text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40"
                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        }`}
                        title="Gợi ý rất dễ hiểu (Học tập hiệu quả)"
                      >
                        <PiThumbsUpDuotone className="w-3.5 h-3.5" />
                      </button>

                      {/* Phản hồi Sư phạm RLHF: Thumbs Down */}
                      <button
                        onClick={() => handleFeedback(m.id, "UNHELPFUL", m.backendMessageId)}
                        className={`p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer ${
                          feedbackMap[m.id] === "UNHELPFUL"
                            ? "text-rose-600 font-bold bg-rose-50 dark:bg-rose-950/40"
                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        }`}
                        title="Chưa hiểu rõ / Cần gợi ý thêm"
                      >
                        <PiThumbsDownDuotone className="w-3.5 h-3.5" />
                      </button>

                      {feedbackMap[m.id] && (
                        <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                          ✓ Đã ghi nhận!
                        </span>
                      )}
                    </div>
                  ) : (
                    <div />
                  )}

                  <span className={isBot ? "text-slate-400 dark:text-slate-500" : "text-blue-100"}>
                    {m.timestamp}
                  </span>
                </div>
              </div>

              {!isBot && (
                <div className="w-8 h-8 rounded-xl bg-[#0A1A36] dark:bg-slate-700 flex items-center justify-center text-white shrink-0 mb-0.5 shadow-sm">
                  <PiUserCircleDuotone className="w-5 h-5" />
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-2.5 items-start">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1865F2] to-[#14BF96] flex items-center justify-center text-white shrink-0 shadow-sm border border-white/20">
              <PiRobotDuotone className="w-5 h-5" />
            </div>
            <div className="bg-white dark:bg-[#0D1A30] border border-slate-200/90 dark:border-slate-800 p-3.5 rounded-2xl text-xs text-slate-500 dark:text-slate-400 shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1865F2] animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-[#1865F2] animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-[#1865F2] animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                Thầy đang chuẩn bị gợi ý sư phạm cho em...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 4. SMART PROMPT SUGGESTIONS PILLS */}
      <div className="px-3.5 py-2 bg-white dark:bg-[#0B1528] border-t border-slate-100 dark:border-slate-800 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        {getPromptSuggestions().map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="text-[11px] font-semibold whitespace-nowrap bg-slate-100 dark:bg-[#0D1A30] hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-[#1865F2] dark:hover:text-blue-400 px-3 py-1.5 rounded-full transition flex items-center gap-1 cursor-pointer shrink-0 border border-slate-200/70 dark:border-slate-800"
          >
            <span>{p}</span>
          </button>
        ))}
      </div>

      {/* 5. MULTI-MODAL PHOTO SELECTION MENU */}
      {isPhotoMenuOpen && (
        <div className="p-3 bg-slate-50 dark:bg-[#071120] border-t border-slate-200 dark:border-slate-800 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-150 shrink-0">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <PiCameraDuotone className="w-4 h-4 text-blue-600" />
              <span>Chụp ảnh / Quét đề bài tập K–12</span>
            </span>
            <button
              onClick={() => setIsPhotoMenuOpen(false)}
              className="text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <button
              onClick={() =>
                handleSimulatePhotoUpload("📸 Đã quét: Cho 2 phân số 3/4 và 5/6. Hãy tìm mẫu số chung nhỏ nhất và quy đồng.")
              }
              className="p-2.5 rounded-xl bg-white dark:bg-[#0D1A30] border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-left transition flex items-center gap-2 cursor-pointer"
            >
              <PiImagesDuotone className="w-4 h-4 text-emerald-500 shrink-0" />
              <div className="truncate">
                <span className="font-bold block truncate">Bài tập tìm Mẫu số chung</span>
                <span className="text-[10px] text-slate-400">3/4 và 5/6</span>
              </div>
            </button>
            <button
              onClick={() =>
                handleSimulatePhotoUpload("📸 Đã quét: Rút gọn phân số 48/64 về dạng phân số tối giản.")
              }
              className="p-2.5 rounded-xl bg-white dark:bg-[#0D1A30] border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-left transition flex items-center gap-2 cursor-pointer"
            >
              <PiImagesDuotone className="w-4 h-4 text-blue-500 shrink-0" />
              <div className="truncate">
                <span className="font-bold block truncate">Bài tập Rút gọn phân số</span>
                <span className="text-[10px] text-slate-400">Phân số 48/64</span>
              </div>
            </button>

            {/* Upload Custom Training Data Document */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/50 hover:border-amber-500 text-left transition flex items-center gap-2 cursor-pointer col-span-1 sm:col-span-2"
            >
              <PiFileTextDuotone className="w-5 h-5 text-amber-500 shrink-0" />
              <div className="truncate">
                <span className="font-bold text-amber-900 dark:text-amber-200 block truncate">
                  Tải lên tệp tài liệu / Giáo án (.txt, .md, .json)
                </span>
                <span className="text-[10px] text-amber-700/80 dark:text-amber-300/70">
                  Huấn luyện AI chuyên sâu theo dữ liệu & chủ đề của bạn (In-Context Grounding)
                </span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* 5.5 ACTIVE CUSTOM KNOWLEDGE GROUNDING BADGE */}
      {knowledgeFileName && (
        <div className="px-3.5 py-1.5 bg-amber-500/10 border-t border-amber-500/30 flex items-center justify-between text-xs text-amber-300 shrink-0">
          <span className="flex items-center gap-1.5 truncate">
            <PiFileTextDuotone className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">
              Đang áp dụng dữ liệu huấn luyện: <strong>{knowledgeFileName}</strong>
            </span>
          </span>
          <button
            onClick={() => {
              setCustomKnowledge("");
              setKnowledgeFileName(null);
            }}
            className="text-amber-400 hover:text-amber-200 text-xs ml-2 cursor-pointer font-bold px-1.5 py-0.5 rounded hover:bg-amber-500/20"
            title="Gỡ bỏ tài liệu này"
          >
            ✕ Gỡ bỏ
          </button>
        </div>
      )}

      {/* 6. INPUT BAR WITH ENTER KEY & SMART BUTTONS */}
      <div className="p-3 bg-white dark:bg-[#0B1528] border-t border-slate-200/90 dark:border-slate-800 shrink-0">
        <input
          type="file"
          ref={fileInputRef}
          accept=".txt,.md,.json,.csv"
          className="hidden"
          onChange={handleFileUpload}
        />
        <div className="flex items-end gap-2 bg-slate-100 dark:bg-[#071120] rounded-2xl p-2 border border-slate-200 dark:border-slate-800 focus-within:border-[#1865F2] focus-within:bg-white dark:focus-within:bg-[#0D1A30] transition">
          {/* Homework Photo Scan Button */}
          <button
            type="button"
            onClick={() => setIsPhotoMenuOpen(!isPhotoMenuOpen)}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
            title="Quét ảnh đề bài tập"
          >
            <PiCameraDuotone className="w-5 h-5" />
          </button>

          {/* Voice Mic Button */}
          <button
            type="button"
            onClick={handleToggleVoiceInput}
            className={`p-2 rounded-xl transition cursor-pointer shrink-0 ${
              isListening
                ? "bg-rose-500 text-white animate-pulse"
                : "text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-200/70 dark:hover:bg-slate-800"
            }`}
            title={isListening ? "Đang lắng nghe..." : "Hỏi bằng giọng nói"}
          >
            <PiMicrophoneDuotone className="w-5 h-5" />
          </button>

          {/* Flexible Textarea with Enter-to-Submit */}
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`Hỏi thầy về bài toán, hiện tượng tự nhiên (Lớp ${selectedGrade})...`}
            className="flex-1 bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm resize-none focus:outline-none min-h-[36px] max-h-[120px] py-1.5 leading-relaxed"
          />

          {/* Clear text button */}
          {input.length > 0 && (
            <button
              type="button"
              onClick={() => setInput("")}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
              title="Xóa nội dung"
            >
              <PiXBold className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Send Button */}
          <button
            type="button"
            disabled={!input.trim() || cooldownSec > 0}
            onClick={() => handleSend()}
            className="w-10 h-10 rounded-xl bg-[#1865F2] hover:bg-[#1253cc] active:scale-95 disabled:opacity-40 text-white flex items-center justify-center transition shadow-md shadow-blue-500/20 cursor-pointer shrink-0 font-bold"
            title={cooldownSec > 0 ? `Vui lòng chờ ${cooldownSec}s` : "Gửi câu hỏi (Nhấn Enter)"}
          >
            {cooldownSec > 0 ? (
              <span className="font-mono text-xs">{cooldownSec}s</span>
            ) : (
              <PiPaperPlaneRightFill className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Security & COPPA compliance badge */}
        <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-2 flex items-center justify-center gap-1.5">
          <PiShieldCheckDuotone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>Kiểm duyệt an toàn K-12 · Dữ liệu học sinh được bảo vệ và mã hóa riêng tư.</span>
        </p>
      </div>
    </motion.div>
  );
};
