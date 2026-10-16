"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Language, getTranslation } from "./translations";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "dmklab_lang";

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Always default to Vietnamese ('vi') as requested by user
  const [lang, setLangState] = useState<Language>("vi");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (saved === "vi" || saved === "en") {
        setLangState(saved);
      }
    } catch {
      // ignore in SSR or blocked environments
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
      document.documentElement.lang = newLang;
    } catch {
      // ignore
    }
  };

  const toggleLang = () => {
    setLang(lang === "vi" ? "en" : "vi");
  };

  const t = (key: string, fallback?: string): string => {
    const val = getTranslation(key, lang);
    if (val) return val;
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Graceful fallback if rendered outside provider
    return {
      lang: "vi",
      setLang: () => {},
      toggleLang: () => {},
      t: (key: string, fallback?: string) => getTranslation(key, "vi") || fallback || key,
    };
  }
  return context;
};
