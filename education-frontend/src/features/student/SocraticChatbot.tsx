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
    icon: <PiLightbulbDuotone className="w-3.5 h-3.5 text-amber-500" />,
    desc: "Phương pháp Socratic gợi mở tư duy, không giải hộ bài",
  },
  {
    id: "GRADE_ADAPTED",
    name: "Theo lứa tuổi",
    shortName: "Theo lớp",
    icon: <PiGraduationCapDuotone className="w-3.5 h-3.5 text-blue-500" />,
    desc: "Giải thích trực quan phù hợp tâm lý lứa tuổi K-12",
  },
  {
    id: "PRACTICE",
    name: "Luyện tập tương tác",
    shortName: "Luyện tập",
    icon: <PiQuestionDuotone className="w-3.5 h-3.5 text-emerald-500" />,
    desc: "Trắc nghiệm tương tác tức thì có tích điểm sao",
  },
  {
    id: "ERROR_DIAGNOSIS",
    name: "Vì sao em sai?",
    shortName: "Bẫy sai",
    icon: <PiArrowsClockwiseDuotone className="w-3.5 h-3.5 text-rose-500" />,
    desc: "Chẩn đoán điểm ngộ nhận và cách khắc phục",
  },
  {
    id: "CITE_LESSON",
    name: "Căn cứ SGK",
    shortName: "Chuẩn SGK",
    icon: <PiBookBookmarkDuotone className="w-3.5 h-3.5 text-indigo-500" />,
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
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Tin nhắn ban đầu thân thiện với học sinh
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-01",
      role: "assistant",
      content: `Chào ${currentUser.fullName || "em"}! Thầy/cô là Gia sư Trợ giảng AI. Em đang cần thầy/cô gợi ý từng bước giải bài tập hay giải thích khái niệm nào hôm nay?`,
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

  // Làm mới cuộc trò chuyện với Custom Modal (loại bỏ hoàn toàn window.confirm mặc định của trình duyệt)
  const handleResetChat = () => {
    setIsResetConfirmOpen(true);
  };

  const confirmResetChat = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: `Chào ${currentUser.fullName || "em"}! Thầy/cô đã sẵn sàng cho bài học mới. Em đang muốn học hay rèn luyện chủ đề gì nào?`,
        timestamp: "Vừa xong",
        isSocraticHint: true,
        mode: selectedMode,
        gradeLevel: selectedGrade,
      },
    ]);
    setQuizAnswers({});
    setInput("");
    setPiiWarning(null);
    setSessionId(undefined);
    setIsResetConfirmOpen(false);
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
        <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 mr-2.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#0B1528] text-slate-800 dark:text-slate-100 text-xs font-bold shadow-xl border border-slate-200/80 dark:border-slate-700 hidden sm:flex items-center gap-2">
          <PiGraduationCapDuotone className="w-4 h-4 text-[#1865F2] dark:text-blue-400" />
          <span>Gia sư AI Socratic 24/7</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={onOpen}
          className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1865F2] via-[#0E52C9] to-[#14BF96] text-white shadow-xl hover:shadow-2xl hover:shadow-blue-500/30 transition-shadow duration-200 flex items-center justify-center cursor-pointer border border-white/25"
          title="Trò chuyện với Gia Sư AI Socratic 24/7"
          aria-label="Mở gia sư AI DMKLab"
        >
          <PiGraduationCapDuotone className="w-7 h-7 text-amber-300 drop-shadow-xs" />
          <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full ring-2 ring-white dark:ring-[#0B1528]" />
        </motion.button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 bg-white dark:bg-[#090D16] rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] border border-slate-200/90 dark:border-slate-800/80 flex flex-col overflow-hidden transition-all duration-200 ${isExpanded
        ? "w-[calc(100vw-2rem)] sm:w-[720px] h-[720px] max-h-[calc(100vh-4rem)]"
        : "w-[calc(100vw-2rem)] sm:w-[460px] h-[640px] max-h-[calc(100vh-4.5rem)]"
        }`}
    >
      {/* 0. CUSTOM CONFIRMATION MODAL */}
      {isResetConfirmOpen && (
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#0E1526] rounded-2xl p-5 max-w-[280px] sm:max-w-xs w-full shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3.5 animate-in zoom-in-95 duration-150">
            <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 dark:text-amber-400 mx-auto flex items-center justify-center border border-amber-200/80 dark:border-amber-800/70 shadow-xs">
              <PiArrowsClockwiseDuotone className="w-5 h-5 animate-spin [animation-duration:3s]" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Bắt đầu chủ đề mới?
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Cuộc trò chuyện hiện tại sẽ được làm mới để bắt đầu bài học mới cùng Gia sư AI.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Giữ lại
              </button>
              <button
                type="button"
                onClick={confirmResetChat}
                className="flex-1 py-2 px-3 rounded-xl bg-[#1865F2] hover:bg-[#1253cc] text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                Làm mới
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. TOP HEADER: Ultra-Minimalist Studio Bar */}
      <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800/70 flex items-center justify-between shrink-0 bg-white dark:bg-[#090D16]">
        {/* Left: Brand & Context */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-[#1865F2] dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100/80 dark:border-blue-900/50 shadow-2xs">
            <PiSparkleDuotone className="w-4 h-4 text-amber-500" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                Gia sư AI
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" title="Đang trực tuyến" />
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              Lớp {selectedGrade} {activeSubject ? `· ${activeSubject}` : "· Chuẩn GDPT 2018"}
            </p>
          </div>
        </div>

        {/* Right: Controls & Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Grade Selector Pill */}
          <div className="relative">
            <button
              onClick={() => setIsGradeDropdownOpen(!isGradeDropdownOpen)}
              className="px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 transition cursor-pointer border border-slate-200/70 dark:border-slate-800"
              title="Đổi lớp học"
            >
              <span>Lớp {selectedGrade}</span>
              <PiCaretDownBold className="w-2.5 h-2.5 opacity-50" />
            </button>

            {isGradeDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-56 bg-white dark:bg-[#0E1526] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-3 z-50 text-slate-800 dark:text-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 pb-1.5 border-b border-slate-100 dark:border-slate-800">
                  Chọn trình độ lớp học
                </div>

                {/* Tiểu học */}
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block px-1 mb-1">
                    🌱 Tiểu học (Lớp 1 - 5)
                  </span>
                  <div className="grid grid-cols-5 gap-1">
                    {[1, 2, 3, 4, 5].map((g) => (
                      <button
                        key={g}
                        onClick={() => {
                          setSelectedGrade(g);
                          setIsGradeDropdownOpen(false);
                        }}
                        className={`py-1 text-xs font-bold rounded-lg transition cursor-pointer ${selectedGrade === g
                          ? "bg-amber-500 text-white"
                          : "hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-700 dark:text-slate-300"
                          }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* THCS */}
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 block px-1 mb-1">
                    📘 THCS (Lớp 6 - 9)
                  </span>
                  <div className="grid grid-cols-4 gap-1">
                    {[6, 7, 8, 9].map((g) => (
                      <button
                        key={g}
                        onClick={() => {
                          setSelectedGrade(g);
                          setIsGradeDropdownOpen(false);
                        }}
                        className={`py-1 text-xs font-bold rounded-lg transition cursor-pointer ${selectedGrade === g
                          ? "bg-[#1865F2] text-white"
                          : "hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300"
                          }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* THPT */}
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 block px-1 mb-1">
                    🎓 THPT (Lớp 10 - 12)
                  </span>
                  <div className="grid grid-cols-3 gap-1">
                    {[10, 11, 12].map((g) => (
                      <button
                        key={g}
                        onClick={() => {
                          setSelectedGrade(g);
                          setIsGradeDropdownOpen(false);
                        }}
                        className={`py-1 text-xs font-bold rounded-lg transition cursor-pointer ${selectedGrade === g
                          ? "bg-purple-600 text-white"
                          : "hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-300"
                          }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quota Badge */}
          <span
            className="px-2 py-0.5 rounded-md text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition hidden sm:inline-block"
            title={`Lượt hỏi hôm nay: ${usedQuota}/${maxQuota}`}
          >
            ⚡ {maxQuota - usedQuota}
          </span>

          {/* Reset chat */}
          <button
            onClick={handleResetChat}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition cursor-pointer"
            title="Làm mới cuộc trò chuyện"
            aria-label="Làm mới cuộc trò chuyện"
          >
            <PiTrashDuotone className="w-4 h-4" />
          </button>

          {/* Expand/Collapse window */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition cursor-pointer hidden sm:block"
            title={isExpanded ? "Thu nhỏ cửa sổ" : "Mở rộng cửa sổ"}
            aria-label={isExpanded ? "Thu nhỏ cửa sổ" : "Mở rộng cửa sổ"}
          >
            {isExpanded ? (
              <PiArrowsInSimpleBold className="w-4 h-4" />
            ) : (
              <PiArrowsOutSimpleBold className="w-4 h-4" />
            )}
          </button>

          {/* Tech / Admin toggle */}
          <button
            onClick={() => setIsDevMetricsOpen(!isDevMetricsOpen)}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              isDevMetricsOpen
                ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white"
                : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80"
            }`}
            title="Thông tin mô hình AI & Quản trị"
            aria-label="Thông tin mô hình AI"
          >
            <PiInfoDuotone className="w-4 h-4" />
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
            title="Đóng chatbox"
            aria-label="Đóng chatbox"
          >
            <PiXBold className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. LINEAR GHOST MODE TABS (Zero-Stripe Segmented Controls) */}
      <div className="px-3.5 py-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0 bg-white dark:bg-[#090D16]">
        {TUTOR_MODES.map((mode) => {
          const isActive = selectedMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                isActive
                  ? "bg-slate-900 text-white dark:bg-blue-600 dark:text-white shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
              }`}
              title={mode.desc}
            >
              <span>{mode.icon}</span>
              <span>{mode.shortName}</span>
            </button>
          );
        })}
      </div>

      {/* 2b. Collapsible Technical / Admin Metrics Panel */}
      {isDevMetricsOpen && (
        <div className="bg-slate-50 dark:bg-[#0E1526] p-3 border-y border-slate-100 dark:border-slate-800 text-xs space-y-2 animate-in fade-in slide-in-from-top-1 duration-150 shrink-0">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
            <span>QUẢN TRỊ HẠN MỨC & ĐỘNG CƠ AI</span>
            <span>Gemini 2.5 Flash / Groq LPU</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
            <div className="p-2 rounded-xl bg-white dark:bg-[#111927] border border-slate-200/80 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px]">Tokens hôm nay</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {tokensUsedToday.toLocaleString()} / {maxTokens.toLocaleString()}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-[#111927] border border-slate-200/80 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px]">Chi phí ước tính</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                ${estimatedCostUsd} / $0.05
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1 p-2 rounded-xl bg-white dark:bg-[#111927] border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px]">Động cơ hiện tại</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {aiEngineMode === "CLOUD_OPENAI" ? "Multi-tier Cloud" : "Offline Socratic"}
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

      {/* 2c. Minimalist Context Chip */}
      {(activeLessonTitle || activeChapterTitle) && (
        <div className="mx-3.5 mt-1 px-3 py-1 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5 truncate">
            <PiBookBookmarkDuotone className="w-3.5 h-3.5 text-[#1865F2] shrink-0" />
            <span className="truncate">
              {activeSubject && <strong className="font-semibold text-slate-800 dark:text-slate-200">{activeSubject}: </strong>}
              {activeChapterTitle
                ? `${activeBookTitle ? activeBookTitle + " › " : ""}${activeChapterTitle}`
                : activeLessonTitle}
            </span>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold shrink-0 ml-2">
            ✓ SGK 2018
          </span>
        </div>
      )}

      {/* Cooldown Timer Bar */}
      {cooldownSec > 0 && (
        <div className="mx-3.5 mt-1 px-3 py-1 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 flex items-center justify-between text-[11px] text-blue-700 dark:text-blue-300 shrink-0 animate-in fade-in duration-150">
          <span className="flex items-center gap-1.5">
            <PiClockCountdownDuotone className="w-3.5 h-3.5 text-[#1865F2] animate-spin" />
            <span>Hãy suy ngẫm gợi ý trước khi gửi câu tiếp theo nhé...</span>
          </span>
          <span className="font-mono font-bold">{cooldownSec}s</span>
        </div>
      )}

      {/* Alerts & Warnings */}
      {fallbackActiveToast && (
        <div className="mx-3.5 mt-1 bg-amber-500 text-white px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 shrink-0 animate-in fade-in duration-150 font-medium">
          <PiWarningCircleDuotone className="w-4 h-4 shrink-0" />
          <span>{fallbackActiveToast}</span>
        </div>
      )}

      {abnormalAlert && (
        <div className="mx-3.5 mt-1 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-900 px-3 py-1.5 rounded-xl text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2 shrink-0 animate-in fade-in duration-150">
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
        <div className="mx-3.5 mt-1 bg-amber-50 dark:bg-amber-950/80 border border-amber-200 px-3 py-1.5 rounded-xl text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2 shrink-0">
          <PiWarningCircleDuotone className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="text-[11px] font-medium">{rateLimitAlert}</span>
        </div>
      )}

      {piiWarning && (
        <div className="mx-3.5 mt-1 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 px-3 py-1.5 rounded-xl text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2 shrink-0 animate-in fade-in duration-150">
          <PiShieldCheckDuotone className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="flex-1 leading-snug text-[11px]">{piiWarning}</p>
        </div>
      )}

      {/* 3. CHAT MESSAGES SCROLL CONTAINER (Seamless Canvas) */}
      <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-4 bg-white dark:bg-[#090D16]">
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
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-[#1865F2] dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 border border-blue-100/80 dark:border-blue-900/40 shadow-2xs">
                  <PiGraduationCapDuotone className="w-4 h-4 text-[#1865F2] dark:text-blue-400" />
                </div>
              )}

              <div
                className={`max-w-[88%] sm:max-w-[82%] rounded-2xl text-xs sm:text-sm leading-relaxed space-y-2.5 ${isBot
                  ? "bg-slate-50 dark:bg-[#0E1526] border border-slate-100 dark:border-slate-800/80 p-3.5 sm:p-4 text-slate-800 dark:text-slate-100 rounded-tl-xs shadow-2xs"
                  : "bg-[#1865F2] text-white p-3.5 rounded-tr-xs shadow-xs font-normal"
                  }`}
              >
                {/* Assistant Mode Tag */}
                {isBot && m.mode && (
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 pb-1.5 border-b border-slate-200/50 dark:border-slate-800/60">
                    <PiSparkleDuotone className="w-3 h-3 text-amber-500" />
                    <span>
                      {m.mode === "GRADE_ADAPTED"
                        ? `Giải thích trực quan Lớp ${m.gradeLevel || selectedGrade}`
                        : m.mode === "PRACTICE"
                          ? "Bài tập luyện tập tương tác"
                          : m.mode === "ERROR_DIAGNOSIS"
                            ? "Chẩn đoán bẫy sai lầm & Cách sửa"
                            : m.mode === "CITE_LESSON"
                              ? "Căn cứ bài học SGK & Video"
                              : "Gợi mở tư duy từng bước"}
                    </span>
                  </div>
                )}

                {/* Message Body với KaTeX Math Formatter */}
                <div className="whitespace-pre-line leading-relaxed">{renderFormattedContent(m.content)}</div>

                {/* Gợi ý phản hồi nhanh 1 chạm (Quick Action Chips) */}
                {isBot && m.quickReplies && m.quickReplies.length > 0 && (
                  <div className="pt-1 flex flex-wrap gap-1.5 animate-in fade-in duration-150">
                    {m.quickReplies.map((qr, qrIdx) => (
                      <button
                        key={qrIdx}
                        disabled={isTyping}
                        onClick={() => handleSend(qr)}
                        className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white dark:bg-slate-800 text-[#1865F2] dark:text-blue-300 border border-slate-200/80 dark:border-slate-700 hover:border-blue-400 transition active:scale-95 cursor-pointer shadow-2xs"
                      >
                        {qr}
                      </button>
                    ))}
                  </div>
                )}

                {/* Step-by-Step Guidance Box */}
                {isBot && m.stepByStepHints && m.stepByStepHints.length > 0 && (
                  <div className="p-3 rounded-xl bg-white dark:bg-[#111927] border border-slate-200/70 dark:border-slate-800 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                      <PiLightbulbDuotone className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Gợi mở từng bước:</span>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                      {m.stepByStepHints.map((hint, hIdx) => (
                        <div key={hIdx} className="flex items-start gap-2 leading-relaxed">
                          <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-950 text-[#1865F2] dark:text-blue-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {hIdx + 1}
                          </span>
                          <span className="flex-1">{hint}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interactive Practice Quiz */}
                {isBot && m.interactiveQuiz && (
                  <div className="p-3.5 rounded-xl bg-white dark:bg-[#111927] border border-slate-200/80 dark:border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <PiQuestionDuotone className="w-4 h-4 text-emerald-500" />
                        <span>Câu hỏi luyện tập tương tác</span>
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        +{m.interactiveQuiz.points} Điểm
                      </span>
                    </div>

                    <p className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                      {m.interactiveQuiz.question}
                    </p>

                    {/* Quiz Options */}
                    <div className="space-y-1.5">
                      {m.interactiveQuiz.options.map((opt, oIdx) => {
                        const answerState = quizAnswers[m.interactiveQuiz!.id];
                        const isSelected = answerState?.selected === opt;
                        const isCorrectOption =
                          opt.includes(m.interactiveQuiz!.correctAnswer) ||
                          opt.startsWith(m.interactiveQuiz!.correctAnswer.slice(0, 2));

                        let btnClass =
                          "bg-slate-50 dark:bg-[#0E1526] border-slate-200 dark:border-slate-700 hover:border-[#1865F2] text-slate-700 dark:text-slate-200";
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
                            className={`w-full p-2.5 rounded-xl border text-left text-xs transition flex items-center justify-between cursor-pointer ${btnClass}`}
                          >
                            <span>{opt}</span>
                            {answerState && isCorrectOption && (
                              <PiCheckCircleDuotone className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                            {answerState && isSelected && !answerState.isCorrect && (
                              <PiXCircleDuotone className="w-4 h-4 text-rose-500 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Quiz Result Feedback */}
                    {quizAnswers[m.interactiveQuiz.id] && (
                      <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200 space-y-1 animate-in fade-in duration-150">
                        <p className="font-bold flex items-center gap-1.5">
                          {quizAnswers[m.interactiveQuiz.id].isCorrect ? (
                            <>
                              <PiCheckCircleDuotone className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>Chính xác! Đạt +{m.interactiveQuiz.points} Điểm! 🎉</span>
                            </>
                          ) : (
                            <>
                              <PiWarningCircleDuotone className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>Chưa chính xác. Em xem giải thích nhé:</span>
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
                    className={`p-3 rounded-xl border space-y-1 ${m.misconceptionReason === "OFF_TOPIC_REDIRECT"
                      ? "bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/60"
                      : "bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60"
                      }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      {m.misconceptionReason === "OFF_TOPIC_REDIRECT" ? (
                        <>
                          <PiShieldCheckDuotone className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                          <span className="text-blue-900 dark:text-blue-200">
                            Bảo vệ chủ đề học tập:
                          </span>
                        </>
                      ) : (
                        <>
                          <PiWarningCircleDuotone className="w-4 h-4 text-amber-600 shrink-0" />
                          <span className="text-amber-900 dark:text-amber-200">
                            Chẩn đoán sai lầm & Cách sửa:
                          </span>
                        </>
                      )}
                    </div>
                    <p
                      className={`text-xs leading-relaxed font-medium ${m.misconceptionReason === "OFF_TOPIC_REDIRECT"
                        ? "text-blue-950 dark:text-blue-100"
                        : "text-amber-950 dark:text-amber-100"
                        }`}
                    >
                      {m.misconceptionReason === "OFF_TOPIC_REDIRECT"
                        ? "Hệ thống khuyến khích em tập trung vào nội dung bài học để đạt hiệu quả cao nhất."
                        : m.misconceptionReason}
                    </p>
                  </div>
                )}

                {/* Citations Box */}
                {isBot && m.citations && m.citations.length > 0 && (
                  <div className="p-3 rounded-xl bg-white dark:bg-[#111927] border border-slate-200/80 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <PiBookBookmarkDuotone className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Căn cứ Sách giáo khoa & Bài giảng:</span>
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        GDPT 2018
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {m.citations.map((cite, cIdx) => (
                        <div
                          key={cIdx}
                          className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0E1526] border-l-2 border-l-[#1865F2] border-y border-r border-slate-200/70 dark:border-slate-800 text-[11px] space-y-0.5"
                        >
                          <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                            <span className="text-xs text-blue-900 dark:text-blue-300">{cite.title}</span>
                            {cite.targetUrl && (
                              <a
                                href={cite.targetUrl}
                                className="text-[10px] text-[#1865F2] hover:underline flex items-center gap-0.5 font-bold"
                              >
                                Xem SGK ↗
                              </a>
                            )}
                          </div>
                          <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                            📖 {cite.sourceBook} {cite.chapter && `· ${cite.chapter}`}
                          </div>
                          {cite.videoTime && (
                            <div className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded mt-0.5">
                              ▶ Video bài học: {cite.videoTime}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message Footer Toolbar (Subtle Ghost Actions) */}
                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                  {isBot ? (
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => handleSpeakText(m.id, m.content)}
                        className={`p-1 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer ${isSpeaking ? "text-blue-600 font-bold" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          }`}
                        title={isSpeaking ? "Dừng đọc" : "Đọc bằng giọng nói"}
                      >
                        {isSpeaking ? (
                          <PiSpeakerSimpleXDuotone className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                        ) : (
                          <PiSpeakerHighDuotone className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleCopyText(m.id, m.content)}
                        className="p-1 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer"
                        title={isCopied ? "Đã sao chép!" : "Sao chép câu trả lời"}
                      >
                        {isCopied ? (
                          <span className="text-emerald-600 font-bold text-[9px]">Đã chép!</span>
                        ) : (
                          <PiCopyDuotone className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleFeedback(m.id, "HELPFUL", m.backendMessageId)}
                        className={`p-1 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer ${feedbackMap[m.id] === "HELPFUL"
                          ? "text-emerald-600 font-bold"
                          : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          }`}
                        title="Gợi ý hữu ích"
                      >
                        <PiThumbsUpDuotone className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleFeedback(m.id, "UNHELPFUL", m.backendMessageId)}
                        className={`p-1 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer ${feedbackMap[m.id] === "UNHELPFUL"
                          ? "text-rose-600 font-bold"
                          : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          }`}
                        title="Chưa hiểu rõ"
                      >
                        <PiThumbsDownDuotone className="w-3.5 h-3.5" />
                      </button>

                      {feedbackMap[m.id] && (
                        <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 ml-1">
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
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-[#1865F2] dark:text-blue-300 shrink-0 mb-0.5 shadow-2xs">
                  <PiUserCircleDuotone className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-2.5 items-start">
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-[#1865F2] dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40">
              <PiGraduationCapDuotone className="w-4 h-4 text-[#1865F2] dark:text-blue-400" />
            </div>
            <div className="bg-slate-50 dark:bg-[#0E1526] border border-slate-100 dark:border-slate-800/80 p-3 rounded-2xl text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1865F2] animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#1865F2] animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#1865F2] animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Thầy/cô đang soạn gợi ý cho em...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 4. SMART PROMPT SUGGESTIONS (Floating Pill Chips) */}
      <div className="px-3.5 pt-1.5 pb-1 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0 bg-white dark:bg-[#090D16]">
        {getPromptSuggestions().map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="text-[11px] font-medium whitespace-nowrap bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/70 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-2.5 py-1 rounded-full transition flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>{p}</span>
          </button>
        ))}
      </div>

      {/* 5. MULTI-MODAL PHOTO SELECTION MENU */}
      {isPhotoMenuOpen && (
        <div className="mx-3.5 mb-2 p-3 bg-slate-50 dark:bg-[#0E1526] rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-150 shrink-0">
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
              className="p-2 rounded-xl bg-white dark:bg-[#111927] border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left transition flex items-center gap-2 cursor-pointer"
            >
              <PiImagesDuotone className="w-4 h-4 text-emerald-500 shrink-0" />
              <div className="truncate">
                <span className="font-semibold block truncate">Bài tập Mẫu số chung</span>
                <span className="text-[10px] text-slate-400">3/4 và 5/6</span>
              </div>
            </button>
            <button
              onClick={() =>
                handleSimulatePhotoUpload("📸 Đã quét: Rút gọn phân số 48/64 về dạng phân số tối giản.")
              }
              className="p-2 rounded-xl bg-white dark:bg-[#111927] border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left transition flex items-center gap-2 cursor-pointer"
            >
              <PiImagesDuotone className="w-4 h-4 text-blue-500 shrink-0" />
              <div className="truncate">
                <span className="font-semibold block truncate">Bài tập Rút gọn phân số</span>
                <span className="text-[10px] text-slate-400">Phân số 48/64</span>
              </div>
            </button>

            {/* Upload Custom Training Data Document */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 hover:border-amber-500 text-left transition flex items-center gap-2 cursor-pointer col-span-1 sm:col-span-2"
            >
              <PiFileTextDuotone className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="truncate">
                <span className="font-semibold text-amber-900 dark:text-amber-200 block truncate">
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
        <div className="mx-3.5 mb-1 px-3 py-1 bg-amber-500/10 rounded-xl border border-amber-500/30 flex items-center justify-between text-xs text-amber-300 shrink-0">
          <span className="flex items-center gap-1.5 truncate">
            <PiFileTextDuotone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">
              Tài liệu chuyên sâu: <strong>{knowledgeFileName}</strong>
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
            ✕ Gỡ
          </button>
        </div>
      )}

      {/* 6. FLOATING COMMAND CAPSULE DOCK (Linear / Raycast Style) */}
      <div className="p-3 pt-1 bg-white dark:bg-[#090D16] shrink-0">
        <input
          type="file"
          ref={fileInputRef}
          accept=".txt,.md,.json,.csv"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Outer Command Capsule */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0E1526] focus-within:border-[#1865F2] focus-within:bg-white dark:focus-within:bg-[#0E1526] focus-within:ring-2 focus-within:ring-blue-500/10 transition-all p-2 flex flex-col gap-1 shadow-2xs">
          {/* Text Area */}
          <textarea
            ref={inputRef}
            rows={2}
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`Hỏi thầy về bài học Lớp ${selectedGrade}... (Enter để gửi)`}
            className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs sm:text-sm resize-none focus:outline-none min-h-[44px] max-h-[130px] px-1 py-0.5 leading-relaxed"
          />

          {/* Action Toolbar Inside Command Capsule */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800/80">
            {/* Left Action Tools */}
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => setIsPhotoMenuOpen(!isPhotoMenuOpen)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-[#1865F2] hover:bg-slate-200/50 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Quét đề bài / Chụp ảnh bài tập"
                aria-label="Quét ảnh bài tập"
              >
                <PiCameraDuotone className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleToggleVoiceInput}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  isListening
                    ? "bg-rose-500 text-white animate-pulse shadow-xs"
                    : "text-slate-400 hover:text-[#1865F2] hover:bg-slate-200/50 dark:hover:bg-slate-800"
                }`}
                title={isListening ? "Đang lắng nghe..." : "Hỏi bằng giọng nói"}
                aria-label="Hỏi bằng giọng nói"
              >
                <PiMicrophoneDuotone className="w-4 h-4" />
              </button>

              {input.length > 0 && (
                <button
                  type="button"
                  onClick={() => setInput("")}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                  title="Xóa nội dung đã nhập"
                  aria-label="Xóa nội dung đã nhập"
                >
                  <PiXBold className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Right Action: Send Button */}
            <button
              type="button"
              disabled={!input.trim() || cooldownSec > 0}
              onClick={() => handleSend()}
              className="px-3 py-1 rounded-xl bg-[#1865F2] hover:bg-[#1253cc] active:scale-95 disabled:opacity-30 disabled:hover:bg-[#1865F2] text-white flex items-center gap-1.5 transition shadow-xs cursor-pointer font-bold text-xs"
              title={cooldownSec > 0 ? `Vui lòng chờ ${cooldownSec}s` : "Gửi câu hỏi"}
              aria-label="Gửi câu hỏi cho gia sư"
            >
              {cooldownSec > 0 ? (
                <span className="font-mono text-xs">{cooldownSec}s</span>
              ) : (
                <>
                  <span>Gửi</span>
                  <PiPaperPlaneRightFill className="w-3 h-3" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Minimal Footer Note */}
        <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-1">
          Gia sư Socratic hướng dẫn từng bước · Chuẩn GDPT 2018
        </p>
      </div>
    </motion.div>
  );
};
