"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface NumberTickerProps {
  value: number;
  direction?: "up" | "down";
  className?: string;
  delay?: number; // seconds
  decimalPlaces?: number;
  prefix?: string;
  suffix?: string;
  duration?: number; // ms
}

export const NumberTicker: React.FC<NumberTickerProps> = ({
  value,
  direction = "up",
  className,
  delay = 0,
  decimalPlaces = 0,
  prefix = "",
  suffix = "",
  duration = 2000,
}) => {
  const [displayValue, setDisplayValue] = useState<number>(direction === "down" ? value : 0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const hasAnimatedRef = useRef<boolean>(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true;

          const timeout = setTimeout(() => {
            const startTime = performance.now();
            const startVal = direction === "down" ? value : 0;
            const endVal = direction === "down" ? 0 : value;

            const animate = (currentTime: number) => {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);

              // Ease-out cubic curve: 1 - pow(1 - progress, 3)
              const easeOut = 1 - Math.pow(1 - progress, 3);
              const currentVal = startVal + (endVal - startVal) * easeOut;

              setDisplayValue(currentVal);

              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                setDisplayValue(endVal);
              }
            };

            requestAnimationFrame(animate);
          }, delay * 1000);

          return () => clearTimeout(timeout);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [value, direction, delay, duration]);

  const formattedValue = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(displayValue);

  return (
    <span
      ref={elementRef}
      className={cn("inline-block tabular-nums tracking-tight font-extrabold", className)}
    >
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
};
