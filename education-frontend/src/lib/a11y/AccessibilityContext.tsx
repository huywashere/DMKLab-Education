"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type FontSizeOption = "normal" | "large" | "xlarge";

interface AccessibilityContextType {
  fontSize: FontSizeOption;
  setFontSize: (size: FontSizeOption) => void;
  cycleFontSize: () => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
  subtitlesDefault: boolean;
  toggleSubtitlesDefault: () => void;
  isShortcutsOpen: boolean;
  openShortcuts: () => void;
  closeShortcuts: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const STORAGE_KEY = "dmklab_a11y";

export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [fontSize, setFontSizeState] = useState<FontSizeOption>("normal");
  const [highContrast, setHighContrastState] = useState<boolean>(false);
  const [subtitlesDefault, setSubtitlesDefaultState] = useState<boolean>(true);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.fontSize) {
          setFontSizeState(parsed.fontSize);
          applyFontSize(parsed.fontSize);
        }
        if (typeof parsed.highContrast === "boolean") {
          setHighContrastState(parsed.highContrast);
          applyHighContrast(parsed.highContrast);
        }
        if (typeof parsed.subtitlesDefault === "boolean") {
          setSubtitlesDefaultState(parsed.subtitlesDefault);
        }
      }
    } catch {
      // Fallback
    }
  }, []);

  // Global Keyboard shortcuts listener (? to open shortcuts, Esc to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsShortcutsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const saveSettings = (fs: FontSizeOption, hc: boolean, sd: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ fontSize: fs, highContrast: hc, subtitlesDefault: sd }));
    } catch {
      // Ignore
    }
  };

  const applyFontSize = (size: FontSizeOption) => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.classList.remove("text-size-normal", "text-size-large", "text-size-xlarge");
      if (size === "large") {
        root.classList.add("text-size-large");
        root.style.fontSize = "18px";
      } else if (size === "xlarge") {
        root.classList.add("text-size-xlarge");
        root.style.fontSize = "20px";
      } else {
        root.classList.add("text-size-normal");
        root.style.fontSize = "16px";
      }
    }
  };

  const applyHighContrast = (enabled: boolean) => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      if (enabled) {
        root.classList.add("high-contrast");
      } else {
        root.classList.remove("high-contrast");
      }
    }
  };

  const setFontSize = (size: FontSizeOption) => {
    setFontSizeState(size);
    applyFontSize(size);
    saveSettings(size, highContrast, subtitlesDefault);
  };

  const cycleFontSize = () => {
    const next: FontSizeOption =
      fontSize === "normal" ? "large" : fontSize === "large" ? "xlarge" : "normal";
    setFontSize(next);
  };

  const toggleHighContrast = () => {
    const next = !highContrast;
    setHighContrastState(next);
    applyHighContrast(next);
    saveSettings(fontSize, next, subtitlesDefault);
  };

  const toggleSubtitlesDefault = () => {
    const next = !subtitlesDefault;
    setSubtitlesDefaultState(next);
    saveSettings(fontSize, highContrast, next);
  };

  const openShortcuts = () => setIsShortcutsOpen(true);
  const closeShortcuts = () => setIsShortcutsOpen(false);

  return (
    <AccessibilityContext.Provider
      value={{
        fontSize,
        setFontSize,
        cycleFontSize,
        highContrast,
        toggleHighContrast,
        subtitlesDefault,
        toggleSubtitlesDefault,
        isShortcutsOpen,
        openShortcuts,
        closeShortcuts,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
};
