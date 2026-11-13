"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface MagneticElementProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}

/**
 * Hiệu ứng Magnetic hút theo con trỏ chuột sử dụng GSAP
 * Giúp nút bấm hoặc biểu tượng có điểm chạm tương tác sinh động, cao cấp
 */
export const MagneticElement: React.FC<MagneticElementProps> = ({
  children,
  strength = 0.35,
  className = "",
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = containerRef.current;
      if (!el) return;

      const xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3.out" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3.out" });

      const handleMouseMove = (e: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = (e.clientX - centerX) * strength;
        const dy = (e.clientY - centerY) * strength;
        xTo(dx);
        yTo(dy);
      };

      const handleMouseLeave = () => {
        xTo(0);
        yTo(0);
      };

      el.addEventListener("mousemove", handleMouseMove);
      el.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        el.removeEventListener("mousemove", handleMouseMove);
        el.removeEventListener("mouseleave", handleMouseLeave);
      };
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className={`inline-block ${className}`} {...props}>
      {children}
    </div>
  );
};

interface GsapTextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
}

/**
 * Hiệu ứng Text Reveal từng từ trượt lên mượt mà bằng GSAP
 */
export const GsapTextReveal: React.FC<GsapTextRevealProps> = ({
  text,
  className = "",
  delay = 0.1,
  duration = 0.6,
}) => {
  const containerRef = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;
      const words = containerRef.current.querySelectorAll(".gsap-word");
      gsap.fromTo(
        words,
        { y: 28, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration,
          delay,
          stagger: 0.05,
          ease: "power3.out",
        }
      );
    },
    { scope: containerRef, dependencies: [text] }
  );

  const words = text.split(" ");

  return (
    <span ref={containerRef} className={`inline-flex flex-wrap gap-x-1.5 overflow-hidden ${className}`}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden py-0.5">
          <span className="gsap-word inline-block">{w}</span>
        </span>
      ))}
    </span>
  );
};

interface GsapCountUpProps {
  endValue: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/**
 * Bộ đếm số chính xác cao bằng GSAP timeline
 */
export const GsapCountUp: React.FC<GsapCountUpProps> = ({
  endValue,
  duration = 1.6,
  prefix = "",
  suffix = "",
  className = "",
}) => {
  const countRef = useRef<HTMLSpanElement>(null);
  const objRef = useRef({ val: 0 });

  useGSAP(
    () => {
      if (!countRef.current) return;
      gsap.to(objRef.current, {
        val: endValue,
        duration,
        ease: "power2.out",
        onUpdate: () => {
          if (countRef.current) {
            countRef.current.innerText = `${prefix}${Math.round(objRef.current.val).toLocaleString()}${suffix}`;
          }
        },
      });
    },
    { scope: countRef, dependencies: [endValue] }
  );

  return (
    <span ref={countRef} className={`tabular-nums ${className}`}>
      {prefix}0{suffix}
    </span>
  );
};

