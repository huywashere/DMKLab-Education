"use client";

import React from "react";
import { useAccessibility } from "@/lib/a11y/AccessibilityContext";
import {
  X,
  Keyboard,
  Eye,
  Type,
  Play,
  Volume2,
  Maximize,
  Subtitles,
  RotateCcw,
  RotateCw,
  Check,
} from "lucide-react";

export const KeyboardShortcutsModal: React.FC = () => {
  const {
    isShortcutsOpen,
    closeShortcuts,
    fontSize,
    setFontSize,
    highContrast,
    toggleHighContrast,
    subtitlesDefault,
    toggleSubtitlesDefault,
  } = useAccessibility();

  if (!isShortcutsOpen) return null;

  const shortcutsList = [
    {
      key: "Space / K",
      desc: "Phát hoặc Tạm dừng video bài học",
      icon: <Play className="w-4 h-4 text-blue-500" />,
    },
    { key: "J", desc: "Tua lùi 10 giây", icon: <RotateCcw className="w-4 h-4 text-blue-500" /> },
    { key: "L", desc: "Tua nhanh 10 giây", icon: <RotateCw className="w-4 h-4 text-blue-500" /> },
    {
      key: "M",
      desc: "Tắt hoặc Bật tiếng (Mute/Unmute)",
      icon: <Volume2 className="w-4 h-4 text-blue-500" />,
    },
    {
      key: "F",
      desc: "Bật hoặc Thoát toàn màn hình",
      icon: <Maximize className="w-4 h-4 text-blue-500" />,
    },
    {
      key: "C",
      desc: "Bật hoặc Tắt phụ đề bài giảng",
      icon: <Subtitles className="w-4 h-4 text-blue-500" />,
    },
    {
      key: "?",
      desc: "Mở hoặc Đóng bảng phím tắt này",
      icon: <Keyboard className="w-4 h-4 text-emerald-500" />,
    },
    {
      key: "Esc",
      desc: "Đóng cửa sổ popup hoặc chatbox",
      icon: <X className="w-4 h-4 text-rose-500" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 animate-in zoom-in-95 duration-150 text-slate-800 dark:text-slate-100 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="a11y-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#1865F2] flex items-center justify-center shrink-0">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="a11y-modal-title"
                className="text-base sm:text-lg font-bold text-slate-900 dark:text-white"
              >
                Hỗ Trợ Tiếp Cận & Điều Khiển Bàn Phím
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tối ưu trải nghiệm cho mọi học sinh · Chuẩn quốc tế WCAG 2.1
              </p>
            </div>
          </div>
          <button
            onClick={closeShortcuts}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Đóng bảng tiếp cận"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Accessibility Controls (Font Size, Contrast, Captions) */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
            Cài đặt hiển thị thân thiện:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Font size switcher */}
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Type className="w-3.5 h-3.5" /> Cỡ chữ:
              </span>
              <div className="flex rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1">
                {(["normal", "large", "xlarge"] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setFontSize(size)}
                    className={`flex-1 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                      fontSize === size
                        ? "bg-[#1865F2] text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {size === "normal" ? "Vừa" : size === "large" ? "Lớn" : "Rất lớn"}
                  </button>
                ))}
              </div>
            </div>

            {/* High contrast toggle */}
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> Tương phản cao:
              </span>
              <button
                onClick={toggleHighContrast}
                className={`w-full py-1.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                  highContrast
                    ? "bg-amber-500 text-slate-950 border-amber-500 shadow-xs"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                }`}
              >
                <span>{highContrast ? "Đang Bật" : "Đang Tắt"}</span>
                {highContrast && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </button>
            </div>

            {/* Default subtitles toggle */}
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Subtitles className="w-3.5 h-3.5" /> Phụ đề WebVTT:
              </span>
              <button
                onClick={toggleSubtitlesDefault}
                className={`w-full py-1.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                  subtitlesDefault
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                }`}
              >
                <span>{subtitlesDefault ? "Mặc định Bật" : "Mặc định Tắt"}</span>
                {subtitlesDefault && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </button>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts Table */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
            Phím tắt điều khiển nhanh:
          </span>

          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {shortcutsList.map((sc, idx) => (
              <div
                key={idx}
                className="p-3 flex items-center justify-between bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    {sc.icon}
                  </div>
                  <span className="font-medium text-slate-700 dark:text-slate-200">{sc.desc}</span>
                </div>
                <kbd className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] font-bold text-slate-900 dark:text-slate-100 shadow-xs">
                  {sc.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        {/* Footer tip */}
        <div className="text-[11px] text-slate-500 dark:text-slate-400 text-center border-t border-slate-100 dark:border-slate-800 pt-3">
          💡 Mẹo nhanh: Nhấn phím{" "}
          <kbd className="font-mono font-bold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            ?
          </kbd>{" "}
          trên bàn phím bất kỳ lúc nào để mở bảng trợ giúp này.
        </div>
      </div>
    </div>
  );
};
