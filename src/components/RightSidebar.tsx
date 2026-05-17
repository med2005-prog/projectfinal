"use client";

import { useState, useEffect } from "react";
import { Sparkles, ShieldCheck, Zap, ChevronRight, Tag } from "lucide-react";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface RightSidebarProps {
  className?: string;
}

export function RightSidebar({ className }: RightSidebarProps) {
  const { t, dir } = useLanguage();
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch("/api/posts/category-counts");
        const data = await res.json();
        if (data.success) setCounts(data.data);
      } catch (error) {
        console.error("Failed to fetch category counts", error);
      }
    };
    fetchCounts();
  }, []);

  const categories = [
    { name: t("cat.electronics"), key: "electronics" },
    { name: t("cat.wallets"), key: "wallets" },
    { name: t("cat.keys"), key: "keys" },
    { name: t("cat.pets"), key: "pets" },
    { name: t("cat.bags"), key: "bags" },
  ];


  return (
    <aside className={cn("hidden lg:flex flex-col w-80 space-y-6", className)} dir={dir}>
      {/* Boost Section */}
      <div className="rounded-2xl bg-gradient-to-br from-primary-900 to-primary-700 p-5 text-white shadow-lg relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={20} className="text-secondary-300" />
            <h3 className="font-bold text-lg">{t("sidebar.boost.title")}</h3>
          </div>
          <p className="text-primary-100 text-sm mb-4">
            {t("sidebar.boost.desc")}
          </p>
          <Link href="/boost" className="block text-center w-full bg-white text-primary-900 hover:bg-primary-50 font-semibold py-2 px-4 rounded-xl transition-colors shadow-sm">
            {t("sidebar.boost.btn")}
          </Link>
        </div>
      </div>

      {/* How it works */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <ShieldCheck size={18} className="text-primary" />
          {t("sidebar.howItWorks")}
        </h3>
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">1</div>
            <div>
              <h4 className="text-sm font-semibold">{t("sidebar.step1.title")}</h4>
              <p className="text-xs text-muted-foreground mt-0.5">{t("sidebar.step1.desc")}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">2</div>
            <div>
              <h4 className="text-sm font-semibold">{t("sidebar.step2.title")}</h4>
              <p className="text-xs text-muted-foreground mt-0.5">{t("sidebar.step2.desc")}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">3</div>
            <div>
              <h4 className="text-sm font-semibold">{t("sidebar.step3.title")}</h4>
              <p className="text-xs text-muted-foreground mt-0.5">{t("sidebar.step3.desc")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Tag size={18} className="text-primary" />
          {t("sidebar.categories")}
        </h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <Link 
              key={cat.key} 
              href={`/category/${cat.key}`}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary transition-colors group"
            >
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">{cat.name}</span>
              <span className="text-xs bg-secondary group-hover:bg-background px-2 py-1 rounded-md text-muted-foreground font-semibold">
                {counts[cat.key] || 0}
              </span>
            </Link>
          ))}
        </div>
        <Link href="/all-categories" className="flex items-center justify-center gap-1 mt-4 text-xs font-semibold text-primary hover:text-primary-600 transition-colors">
          {t("sidebar.viewAll")} <ChevronRight size={14} className={dir === 'rtl' ? 'rotate-180' : ''} />
        </Link>
      </div>
    </aside>
  );
}
