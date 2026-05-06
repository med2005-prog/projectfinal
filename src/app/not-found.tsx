"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, ArrowRight, Search, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotFound() {
  const { t, dir, language } = useLanguage();
  const ArrowIcon = dir === "rtl" ? ArrowRight : ArrowLeft;

  return (
    <div
      dir={dir}
      className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center"
    >
      <div className="space-y-6 max-w-md">
        <div className="relative">
          <h1 className="text-9xl font-black text-primary/10">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search size={80} className="text-primary animate-bounce" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tight">
            {t("common.pageNotFound")}
          </h2>
          <p className="text-muted-foreground font-medium">
            {language === 'ar' 
              ? "عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها." 
              : "Oops! The page you're looking for doesn't exist or has been moved."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
          >
            <Home size={18} />
            {t("nav.home")}
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-foreground rounded-2xl font-bold hover:bg-secondary/80 transition-all"
          >
            <ArrowIcon size={18} />
            {language === 'ar' ? "العودة للخلف" : "Go Back"}
          </button>
        </div>
      </div>
    </div>
  );
}
