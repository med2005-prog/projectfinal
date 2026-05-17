"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, MapPin, Bell, User, Globe, LogOut, Loader2, Menu, Briefcase, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

export function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { language, setLanguage, t, dir } = useLanguage();
  const [location, setLocation] = useState(language === 'ar' ? "أكادير، المغرب" : "Agadir, Morocco");
  const [isLocLoading, setIsLocLoading] = useState(false);
  const { user, logout, loading } = useAuth();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const router = useRouter();
  const searchParams = useSearchParams();

  // Fetch real location
  useEffect(() => {
    if ("geolocation" in navigator) {
      setIsLocLoading(true);
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Use current language for locality fetching
          const locLang = language === 'ar' ? 'ar' : language;
          const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=${locLang}`);
          const data = await res.json();
          if (data.city || data.locality) {
            setLocation(`${data.city || data.locality}, ${data.countryName}`);
          }
        } catch (err) {
          console.error("Location fetch failed", err);
        } finally {
          setIsLocLoading(false);
        }
      }, () => {
        setIsLocLoading(false);
      });
    }
  }, [language]);

  // Sync search input with URL
  useEffect(() => {
    const q = searchParams.get("q") || "";
    setSearchQuery(q);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Immediate search on submit
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery) params.set("q", searchQuery);
    else params.delete("q");
    router.push(`/?${params.toString()}`);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <header className="h-16 border-b bg-card/80 backdrop-blur-md sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between gap-4">
      {/* Mobile Menu Toggle */}
      <button 
        onClick={onMenuClick}
        className="p-2 -ml-2 rounded-xl hover:bg-secondary lg:hidden"
      >
        <Menu size={24} />
      </button>

      <div className="lg:hidden font-black text-xl tracking-tight shrink-0">
        Fin<span className="text-primary">Huwa</span>
      </div>

      {/* Search & Location Group */}
      <form 
        onSubmit={handleSearch}
        className="hidden sm:flex flex-1 max-w-2xl items-center bg-secondary rounded-full border border-border/50 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all duration-200"
      >
        <div className={cn("flex items-center gap-2 py-2 border-border/50 hover:bg-secondary-foreground/5 cursor-pointer group", 
          dir === 'rtl' ? "pr-4 pl-3 border-l rounded-r-full" : "pl-4 pr-3 border-r rounded-l-full"
        )} suppressHydrationWarning>
          {isLocLoading ? (
            <Loader2 size={16} className="text-primary animate-spin" />
          ) : (
            <MapPin size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
          )}
          <span className="text-sm font-medium whitespace-nowrap" suppressHydrationWarning>
            {isLocLoading ? t("common.locating") : location}
          </span>
        </div>

        <div className="flex-1 flex items-center px-3 py-2 relative">
          <Search size={16} className={cn("text-muted-foreground shrink-0", dir === 'rtl' ? "ml-2" : "mr-2")} suppressHydrationWarning />
          <input 
            type="text" 
            placeholder={t("topbar.search")} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none focus:outline-none text-sm placeholder:text-muted-foreground/70"
            suppressHydrationWarning
          />
          {searchQuery && (
            <button 
              type="button"
              onClick={clearSearch}
              className={cn("p-1.5 hover:bg-muted rounded-full text-muted-foreground transition-colors shrink-0", 
                dir === 'rtl' ? "ml-1" : "mr-1"
              )}
            >
              <X size={14} />
            </button>
          )}
          <button 
            type="submit"
            className={cn("px-4 py-1.5 bg-primary text-white text-xs font-black rounded-full hover:opacity-90 transition-all shadow-sm shrink-0",
              dir === 'rtl' ? "mr-1" : "ml-1"
            )}
            suppressHydrationWarning
          >
            {t("topbar.btnSearch")}
          </button>
        </div>
      </form>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Language Switcher */}
        <div className="relative">
          <button 
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <Globe size={20} />
            <span className="text-xs font-bold uppercase">
              {language === 'ar' ? 'العربية' : language === 'fr' ? 'Français' : 'English'}
            </span>
          </button>
          
          {isLangOpen && (
            <div className={cn("absolute top-full mt-2 w-32 bg-card border rounded-xl shadow-lg py-1 z-50", 
              dir === 'rtl' ? "left-0" : "right-0"
            )}>
              <button onClick={() => { setLanguage("en"); setIsLangOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors">English</button>
              <button onClick={() => { setLanguage("fr"); setIsLangOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors">Français</button>
              <button onClick={() => { setLanguage("ar"); setIsLangOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors">العربية</button>
            </div>
          )}
        </div>

        <Link href="/notifications" className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-card" />
        </Link>

        {/* User Profile / Login */}
        <div className="relative">
          {loading ? (
            <div className="p-2 animate-pulse bg-secondary rounded-full w-10 h-10" />
          ) : user ? (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsUserOpen(!isUserOpen)}
                className="flex items-center gap-2 p-1 md:pr-3 rounded-full border hover:bg-secondary transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
                  {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name.charAt(0)}
                </div>
                <span className="text-sm font-bold hidden md:block">{user.name.split(' ')[0]}</span>
              </button>
              {isUserOpen && (
                <div className={cn("absolute top-full mt-2 w-48 bg-card border rounded-2xl shadow-xl p-2 z-50", 
                  dir === 'rtl' ? "left-0" : "right-0"
                )}>
                  <Link href="/profile" className="flex items-center gap-2 px-3 py-2 text-sm font-bold hover:bg-secondary rounded-xl transition-colors">
                    <User size={16} /> {t("topbar.profile")}
                  </Link>
                  {user.role === "partner" && (
                    <Link href="/business/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm font-bold hover:bg-secondary rounded-xl transition-colors">
                      <Briefcase size={16} /> {t("dash.title")}
                    </Link>
                  )}
                  <div className="h-px bg-border my-1" />
                  <button 
                    onClick={() => logout()}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                  >
                    <LogOut size={16} /> {t("auth.form.logout")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link 
              href="/login" 
              className="bg-primary text-white text-sm font-bold py-2.5 px-6 rounded-full hover:opacity-90 transition-all shadow-lg shadow-primary/20"
            >
              {t("auth.form.signIn")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
