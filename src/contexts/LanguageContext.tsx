"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, Language } from "@/lib/translations";

type TranslationsKey = keyof typeof translations.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationsKey) => string;
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  // Load saved language on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("language") as Language;
    if (saved && ["en", "fr", "ar"].includes(saved)) {
      setLanguageState(saved);
    } else {
      // Auto-detect based on browser if needed
      const browserLang = typeof navigator !== "undefined" ? navigator.language.split('-')[0] : "en";
      if (browserLang === 'fr') setLanguageState('fr');
      else if (browserLang === 'ar') setLanguageState('ar');
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  // IMPORTANT: For hydration, we MUST use the default "en" until mounted.
  // This ensures the first client render matches the server render.
  const activeLanguage = mounted ? language : "en";

  const t = (key: TranslationsKey): string => {
    return translations[activeLanguage][key] || translations.en[key] || key;
  };

  const activeDir = activeLanguage === "ar" ? "rtl" : "ltr";

  // Update document direction and language class for html when language changes
  useEffect(() => {
    if (mounted) {
      document.documentElement.dir = activeDir;
      document.documentElement.lang = activeLanguage;
    }
  }, [activeLanguage, activeDir, mounted]);

  return (
    <LanguageContext.Provider value={{ language: activeLanguage, setLanguage, t, dir: activeDir }}>
      <div className={mounted ? "" : "invisible"}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
