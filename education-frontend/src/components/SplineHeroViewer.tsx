"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Sparkles, Bot, Box, RotateCcw, Compass, MousePointer } from "lucide-react";

// Dynamically import Spline to avoid SSR issues with WebGL canvas
const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
  loading: () => <SplineLoadingSkeleton />,
});

const SplineLoadingSkeleton: React.FC = () => (
  <div className="w-full h-full min-h-[360px] sm:min-h-[400px] flex flex-col items-center justify-center gap-3 bg-slate-50/80 dark:bg-slate-900/50 rounded-[28px] animate-pulse">
    <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center text-[#1865F2] dark:text-blue-300">
      <Compass className="w-6 h-6 animate-spin" />
    </div>
    <div className="text-center space-y-1">
      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
        Đang khởi tạo Spline 3D WebGL...
      </p>
      <p className="text-[11px] text-slate-400">Tối ưu hóa đồ họa 60 FPS</p>
    </div>
  </div>
);

interface SplineHeroViewerProps {
  isVi?: boolean;
}

export const SplineHeroViewer: React.FC<SplineHeroViewerProps> = ({ isVi = true }) => {
  const [activePreset, setActivePreset] = useState<"robot" | "quantum">("robot");
  const [splineKey, setSplineKey] = useState<number>(0);

  // Official high-performance verified Spline Community 3D Scenes
  const SCENES = {
    // Interactive AI Mascot Robot (Tracks cursor movement, responds to clicks)
    robot: {
      url: "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode",
      title: isVi ? "Gia Sư Trợ Lý AI 3D" : "Socratic 3D AI Tutor",
      subtitle: isVi ? "Tự động hướng mắt theo chuột" : "Tracks cursor dynamically",
      tag: "Interactive Bot",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
    },
    // Quantum Crystal Cube (Reflective physics-based 3D geometric artifact)
    quantum: {
      url: "https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode",
      title: isVi ? "Khối Không Gian Toán Học" : "3D Quantum Geometry",
      subtitle: isVi ? "Vật lý quang học phản xạ ánh sáng" : "Reflective optics simulation",
      tag: "Math & Physics",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800",
    },
  };

  const currentScene = SCENES[activePreset];

  const handleSwitchPreset = (preset: "robot" | "quantum") => {
    setActivePreset(preset);
    setSplineKey((prev) => prev + 1); // Refresh canvas cleanly
  };

  return (
    <div className="w-full max-w-[450px] sm:max-w-[500px] bg-white dark:bg-[#0B172E] rounded-[36px] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-200 dark:border-slate-800 p-5 sm:p-7 flex flex-col relative select-none overflow-hidden">
      
      {/* 1. Header Toolbar: Preset Switcher */}
      <div className="w-full flex items-center justify-between pb-3.5 mb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-full">
          <button
            type="button"
            onClick={() => handleSwitchPreset("robot")}
            className={`px-3 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activePreset === "robot"
                ? "bg-[#1865F2] text-white shadow-xs scale-102"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>{isVi ? "Robot AI 3D" : "AI Robot"}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchPreset("quantum")}
            className={`px-3 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activePreset === "quantum"
                ? "bg-[#1865F2] text-white shadow-xs scale-102"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>{isVi ? "Toán Học 3D" : "3D Math Cube"}</span>
          </button>
        </div>

        {/* Live Status Badge */}
        <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${currentScene.badgeColor}`}>
          WebGL 60FPS
        </span>
      </div>

      {/* 2. Interactive Spline 3D Stage */}
      <div className="relative w-full aspect-square max-w-[340px] sm:max-w-[360px] mx-auto rounded-3xl overflow-hidden bg-slate-50/50 dark:bg-[#071328] border border-slate-200/80 dark:border-slate-800 flex items-center justify-center">
        <Spline key={splineKey} scene={currentScene.url} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Subtle Bottom Floating Hint */}
        <div className="absolute bottom-3 inset-x-0 mx-auto w-fit px-3 py-1 rounded-full bg-slate-900/70 backdrop-blur-xs text-white text-[10px] font-semibold flex items-center gap-1.5 shadow-md pointer-events-none">
          <MousePointer className="w-3 h-3 text-[#14BF96]" />
          <span>{isVi ? "Rê chuột hoặc kéo để xoay 360°" : "Hover or drag to rotate 360°"}</span>
        </div>
      </div>

      {/* 3. Spline Info Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
        <div className="flex items-center justify-between text-xs">
          <h4 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>{currentScene.title}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
              • {currentScene.subtitle}
            </span>
          </h4>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
          {activePreset === "robot"
            ? isVi
              ? "Trợ lý 3D Socratic thông minh tự động liếc nhìn theo từng cử động chuột và tương tác trực tiếp khi nhấp."
              : "Interactive Socratic 3D companion responding directly to cursor movement and clicks."
            : isVi
              ? "Mô phỏng hình học không gian và tinh thể vật lý lượng tử với hiệu ứng đổ bóng & phản quang chân thực."
              : "Spatial geometry and quantum physics simulation with realistic realtime reflections."}
        </p>
      </div>
    </div>
  );
};

