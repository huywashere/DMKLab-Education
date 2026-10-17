"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, User } from "@/types";
import { 
  X, 
  Send, 
  Sparkles, 
  Lightbulb, 
  User as UserIcon,
  Minus
} from "lucide-react";
import { RiSparklingFill, RiRobot2Fill } from "react-icons/ri";
import { FaShieldHalved } from "react-icons/fa6";

import { api } from "@/lib/api";

interface SocraticChatbotProps {
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
}

export const SocraticChatbot: React.FC<SocraticChatbotProps> = ({
  currentUser,
  isOpen,
  onClose,
  onOpen,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-01",
      role: "assistant",
      content: `Chào ${currentUser.fullName}! Thầy là Gia sư AI gợi mở theo phương pháp Socratic. Thầy sẽ không giải bài hộ em ngay đâu, nhưng thầy sẽ luôn ở đây để đặt câu hỏi gợi ý và đồng hành cùng em tìm ra đáp án đúng! Em đang thắc mắc chỗ nào nào?`,
      timestamp: "10:30",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [usedQuota, setUsedQuota] = useState(1);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const maxQuota = 30; // Daily quota from PDF specification

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    try {
      const res = await api.sendLearningChat(text, undefined, sessionId);
      if (res && res.reply) {
        if (res.sessionId) setSessionId(res.sessionId);
        if (typeof res.dailyQuotaRemaining === 'number') {
          setUsedQuota(Math.max(0, maxQuota - res.dailyQuotaRemaining));
        }

        const botMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: "assistant",
          content: res.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
        return;
      }
    } catch {
      // Fallback to local Socratic logic
    }

    // Local fallback
    setTimeout(() => {
      let aiReply = "Câu hỏi rất hay! Để giải quyết vấn đề này, bước đầu tiên em hãy thử nhớ lại: trong hai phân số em đang tính, mẫu số của chúng đã bằng nhau chưa?";
      
      const lower = text.toLowerCase();
      if (lower.includes("đáp án") || lower.includes("kết quả")) {
        aiReply = "Thầy hiểu em đang rất muốn biết kết quả! Nhưng để rèn luyện tư duy thật vững, em hãy thử cho thầy biết: Tử số và Mẫu số của chiếc bánh pizza trong bài đang biểu thị điều gì trước nhé?";
      } else if (lower.includes("quy đồng")) {
        aiReply = "Quy đồng mẫu số nghĩa là làm cho các phân số có chung một mẫu số mà giá trị không đổi. Ví dụ với mẫu 3 và 4, số nhỏ nhất nào chia hết cho cả 3 và 4 nhỉ?";
      } else if (lower.includes("12")) {
        aiReply = "Chính xác tuyệt vời! 12 chính là Mẫu số chung nhỏ nhất! Vậy tiếp theo, để phân số 2/3 có mẫu số là 12, em cần nhân cả tử và mẫu với bao nhiêu?";
      }

      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
      setUsedQuota((prev) => Math.min(prev + 1, maxQuota));
    }, 800);
  };

  const samplePrompts = [
    "Quy đồng mẫu số là gì vậy thầy?",
    "Cho em một gợi ý về bài tập pizza",
    "Mẫu số chung nhỏ nhất của 3 và 4 là gì?",
  ];

  // If chatbot is closed, render floating circular trigger button at bottom-right corner
  if (!isOpen) {
    if (!onOpen) return null;
    return (
      <div className="fixed bottom-6 right-6 z-40 group flex items-center">
        {/* Subtle tooltip on hover */}
        <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 mr-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 dark:bg-slate-800/95 text-white text-xs font-semibold whitespace-nowrap shadow-xl border border-white/10 hidden sm:flex items-center gap-1.5 backdrop-blur-xs">
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

  // If chatbot is open, render floating chatbox at bottom-right corner
  return (
    <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[410px] md:w-[440px] h-[600px] max-h-[calc(100vh-5rem)] bg-white dark:bg-[#0F172A] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0B2147] via-[#102A54] to-[#0D3B66] text-white p-3.5 sm:p-4 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1865F2] to-[#14BF96] flex items-center justify-center text-white shadow-sm shrink-0">
            <RiSparklingFill className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
              <span>Gia Sư AI Học Tập</span>
              <span className="text-[10px] bg-[#14BF96] px-1.5 py-0.5 rounded-full font-black text-white">Socratic</span>
            </h3>
            <p className="text-[10px] sm:text-[11px] text-slate-300 flex items-center gap-1 mt-0.5">
              <FaShieldHalved className="w-2.5 h-2.5 text-emerald-400" />
              <span>Bảo vệ học sinh K-12 · Gợi mở tư duy</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
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

      {/* Quota Banner */}
      <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 shrink-0">
        <span className="font-medium">Hạn mức AI hôm nay:</span>
        <span className="font-bold text-[#1865F2] dark:text-blue-400">
          {usedQuota}/{maxQuota} câu hỏi ({maxQuota - usedQuota} câu còn lại)
        </span>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3.5 bg-slate-50/60 dark:bg-[#070D18]/60">
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
                className={`max-w-[85%] p-3 sm:p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isBot
                    ? "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 shadow-xs rounded-tl-xs"
                    : "bg-[#1865F2] text-white font-medium rounded-tr-xs shadow-xs"
                }`}
              >
                <p>{m.content}</p>
                <span className={`block text-[10px] mt-1 text-right ${isBot ? "text-slate-400 dark:text-slate-500" : "text-blue-100"}`}>
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
              <span className="ml-1 text-[11px]">Gia sư AI đang suy nghĩ gợi ý...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Pills */}
      <div className="p-2.5 bg-white dark:bg-[#0F172A] border-t border-slate-100 dark:border-slate-800 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        {samplePrompts.map((p, idx) => (
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

      {/* Input Form */}
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
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hỏi gia sư AI về bài học..."
            className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-transparent focus:bg-white dark:focus:bg-slate-750 focus:border-[#1865F2] focus:outline-none transition"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-10 h-10 rounded-xl bg-[#1865F2] hover:bg-[#1557D0] disabled:opacity-40 text-white flex items-center justify-center transition shadow-sm cursor-pointer shrink-0"
            title="Gửi câu hỏi"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-1.5">
          AI được kiểm duyệt an toàn K-12. Không chia sẻ thông tin cá nhân.
        </p>
      </div>
    </div>
  );
};
