"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

export const BentoGrid: React.FC<BentoGridProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto auto-rows-[22rem]",
        className
      )}
    >
      {children}
    </div>
  );
};

interface BentoCardProps {
  name: string;
  className?: string;
  background?: React.ReactNode;
  Icon?: React.ComponentType<{ className?: string }>;
  description: string;
  href?: string;
  cta?: string;
  tag?: string;
  onClick?: () => void;
}

export const BentoCard: React.FC<BentoCardProps> = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta = "Tìm hiểu thêm",
  tag,
  onClick,
}) => {
  return (
    <div
      key={name}
      onClick={onClick}
      className={cn(
        "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-2xl",
        "bg-white dark:bg-[#0B172E] border border-slate-200 dark:border-[#1E293B]",
        "hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-300 shadow-xs hover:shadow-xl",
        onClick && "cursor-pointer",
        className
      )}
    >
      {/* Background Graphic Slot */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-80 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-500">
        {background}
      </div>

      {/* Top Tag */}
      {tag && (
        <div className="relative z-10 p-5 pb-0 flex justify-start">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {tag}
          </span>
        </div>
      )}

      {/* Content Bottom Block */}
      <div className="relative z-10 flex flex-col gap-2 p-6 mt-auto bg-gradient-to-t from-white dark:from-[#0B172E] via-white/95 dark:via-[#0B172E]/95 to-transparent pt-12">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {name}
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg line-clamp-3">
          {description}
        </p>

        {/* CTA Link with micro-interaction hover arrow */}
        <div className="pt-2 flex items-center">
          {href ? (
            <a
              href={href}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#1865F2] hover:text-[#0B4ED7] dark:text-[#60A5FA] dark:hover:text-[#93C5FD] transition-colors"
            >
              <span>{cta}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#1865F2] group-hover:text-[#0B4ED7] dark:text-[#60A5FA] transition-colors">
              <span>{cta}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
