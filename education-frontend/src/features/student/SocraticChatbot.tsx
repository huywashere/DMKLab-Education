"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, User } from "@/types";
import { 
  X, 
  Send, 
  Sparkles, 
  Lightbulb, 
  Bot, 
  User as UserIcon,
  ShieldCheck,
  RotateCcw
} from "lucide-react";

interface SocraticChatbotProps {
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
}

export const SocraticChatbot: React.FC<SocraticChatbotProps> = ({
  currentUser,
  isOpen,
  onClose,
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
  const [usedQuota, setUsedQuota] = useState(6);
  const maxQuota = 30; // Daily quota from PDF specification

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
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
    setUsedQuota((prev) => Math.min(prev + 1, maxQuota));

    // Simulate Socratic AI Response based on prompt
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
    }, 1000);
  };

  const samplePrompts = [
    "Quy đồng mẫu số là gì vậy thầy?",
    "Cho em một gợi ý về bài tập pizza",
    "Mẫu số chung nhỏ nhất của 3 và 4 là gì?",
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 md:w-[420px] bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="bg-[#0B2147] text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#14BF96] flex items-center justify-center text-white shadow-inner">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
              <span>Gia Sư AI Học Tập</span>
              <span className="text-[10px] bg-[#14BF96] px-1.5 py-0.5 rounded font-extrabold">Socratic</span>
            </h3>
            <p className="text-[11px] text-slate-300 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Bảo vệ trẻ em · Gợi mở tư duy</span>
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quota Banner (Mục 9.1 & 9.3 trong PDF) */}
      <div className="bg-slate-100 px-4 py-2 text-xs text-slate-600 flex items-center justify-between border-b border-slate-200">
        <span className="font-medium">Hạn mức AI hôm nay:</span>
        <span className="font-bold text-slate-800">
          {usedQuota}/{maxQuota} câu hỏi ({maxQuota - usedQuota} câu còn lại)
        </span>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map((m) => {
          const isBot = m.role === "assistant";
          return (
            <div
              key={m.id}
              className={`flex gap-2.5 ${isBot ? "items-start" : "items-end justify-end"}`}
            >
              {isBot && (
                <div className="w-7 h-7 rounded-full bg-[#14BF96] flex items-center justify-center text-white shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[82%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isBot
                    ? "bg-white border border-slate-200 text-slate-800 shadow-sm rounded-tl-sm"
                    : "bg-[#14BF96] text-white font-medium rounded-tr-sm shadow-sm"
                }`}
              >
                <p>{m.content}</p>
                <span className={`block text-[10px] mt-1 text-right ${isBot ? "text-slate-400" : "text-emerald-100"}`}>
                  {m.timestamp}
                </span>
              </div>

              {!isBot && (
                <div className="w-7 h-7 rounded-full bg-[#0B2147] flex items-center justify-center text-white shrink-0 mb-0.5">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-2.5 items-start">
            <div className="w-7 h-7 rounded-full bg-[#14BF96] flex items-center justify-center text-white shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 p-3 rounded-2xl text-xs text-slate-500 shadow-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#14BF96] animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-[#14BF96] animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-[#14BF96] animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-[11px]">Gia sư AI đang suy nghĩ gợi ý...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Pills */}
      <div className="p-2.5 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="text-[11px] whitespace-nowrap bg-slate-100 hover:bg-[#14BF96]/15 hover:text-[#0B2147] text-slate-600 px-2.5 py-1 rounded-full transition flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Lightbulb className="w-3 h-3 text-amber-500" />
            <span>{p}</span>
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3 bg-white border-t border-slate-200">
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
            className="flex-1 bg-slate-100 text-slate-900 placeholder-slate-400 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-transparent focus:bg-white focus:border-[#14BF96] focus:outline-none transition"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-10 h-10 rounded-xl bg-[#14BF96] hover:bg-[#12AB86] disabled:opacity-40 text-white flex items-center justify-center transition shadow-sm cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-slate-400 text-center mt-1.5">
          AI được kiểm duyệt an toàn K-12. Không chia sẻ thông tin cá nhân.
        </p>
      </div>
    </div>
  );
};
