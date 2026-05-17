"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { 
  Laptop, 
  Wallet, 
  Key, 
  Dog, 
  Briefcase, 
  LayoutGrid,
  ChevronRight
} from "lucide-react";

export function CategoryBar() {
  const { t, dir } = useLanguage();
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch("/api/posts/category-counts");
        const data = await res.json();
        if (data.success) setCounts(data.data);
      } catch (error) {
        console.error("Failed to fetch counts", error);
      }
    };
    fetchCounts();
  }, []);

  const categories = [
    { name: t("cat.electronics"), key: "electronics", icon: Laptop },
    { name: t("cat.wallets"), key: "wallets", icon: Wallet },
    { name: t("cat.keys"), key: "keys", icon: Key },
    { name: t("cat.pets"), key: "pets", icon: Dog },
    { name: t("cat.bags"), key: "bags", icon: Briefcase },
  ];

  return (
    <div className="w-full bg-white/80 backdrop-blur-xl border-b sticky top-16 z-20 shadow-sm overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center gap-8 h-20 overflow-x-auto no-scrollbar scroll-smooth">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link 
                key={cat.key}
                href={`/category/${cat.key}`}
                className="flex flex-col items-center gap-2 min-w-fit px-2 pb-3 border-b-2 border-transparent hover:border-primary/30 hover:text-primary transition-all duration-300 group relative"
              >
                <div className="p-2 rounded-xl group-hover:bg-primary/5 transition-colors">
                  <Icon size={24} strokeWidth={1.5} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="text-xs font-bold whitespace-nowrap text-muted-foreground group-hover:text-foreground">
                  {cat.name}
                </span>
                {counts[cat.key] > 0 && (
                  <span className="absolute -top-1 -right-1 text-[8px] bg-primary text-white font-black px-1.5 py-0.5 rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform">
                    {counts[cat.key]}
                  </span>
                )}
              </Link>
            );
          })}
          
          <div className="ml-auto pl-4 border-l hidden md:block">
            <Link href="/all-categories" className="flex items-center gap-2 text-xs font-black text-muted-foreground hover:text-primary transition-colors whitespace-nowrap">
              <LayoutGrid size={16} />
              {t("sidebar.viewAll")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
