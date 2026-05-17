"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Heart, Search, Loader2, Bookmark } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function FavoritesPage() {
  const { t, dir, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8" dir={dir}>
      <div className="mb-10">
        <h1 className="text-3xl font-black tracking-tight">{t("nav.favorites")}</h1>
        <p className="text-muted-foreground mt-1">
          {language === 'ar' 
            ? "تتبع العناصر التي قمت بحفظها لوقت لاحق." 
            : language === 'fr'
            ? "Suivez les éléments que vous avez enregistrés pour plus tard."
            : "Keep track of items you've bookmarked for later."}
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="font-bold text-muted-foreground animate-pulse">
            {language === 'ar' ? "جاري تحميل المفضلة..." : "Loading your favorites..."}
          </p>
        </div>
      ) : favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Favorites would be rendered here */}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-6 bg-card border rounded-[2rem] text-center gap-6">
          <div className="relative">
             <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center">
                <Heart size={48} className="text-primary/20" />
             </div>
             <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border">
                <Bookmark size={20} className="text-primary" fill="currentColor" />
             </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight">
              {t("fav.empty")}
            </h2>
            <p className="text-muted-foreground max-w-sm mx-auto">
              {language === 'ar' 
                ? "احفظ المنشورات في مفضلتك للعثور عليها بسرعة لاحقاً. مفيد لتتبع العناصر التي تعتقد أنها قد تكون لك."
                : language === 'fr'
                ? "Enregistrez des publications dans vos favoris pour les retrouver rapidement plus tard."
                : "Save posts to your favorites to quickly find them later. Useful for tracking items you think might be yours."}
            </p>
          </div>

          <Link 
            href="/" 
            className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-xl shadow-primary/20"
          >
            <Search size={18} />
            {language === 'ar' ? "تصفح الإعلانات" : language === 'fr' ? "Parcourir" : "Browse Feed"}
          </Link>
        </div>
      )}
    </div>
  );
}
