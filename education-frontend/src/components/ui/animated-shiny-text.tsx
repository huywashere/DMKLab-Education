"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AnimatedShinyTextProps {
  children: React.ReactNode;
  className?: string;
  shimmerWidth?: number;
}

export const AnimatedShinyText: React.FC<AnimatedShinyTextProps> = ({
  children,
  className,
  shimmerWidth = 100,
}) => {
  return (
    <span
      style={
        {
          "--shiny-width": `${shimmerWidth}px`,
        } as React.CSSProperties
      }
      className={cn(
        "inline-block bg-gradient-to-r from-slate-900 via-blue-600 to-slate-900 dark:from-slate-200 dark:via-blue-400 dark:to-slate-200 bg-[length:200%_100%] bg-clip-text text-transparent animate-shiny-text font-bold",
        className
      )}
    >
      {children}
    </span>
  );
};
