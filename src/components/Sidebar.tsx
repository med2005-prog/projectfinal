"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import { usePathname } from "next/navigation";
import { 
  Home, 
  Search,
  PlusCircle, 
  FolderHeart, 
  MessageSquare, 
  Briefcase, 
  Settings,
  BellRing,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  onClose?: () => void;
  className?: string;
}

export function Sidebar({ onClose, className }: SidebarProps) {
  const pathname = usePathname();
  const { t, dir, language } = useLanguage();
  const { user } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [msgRes, notifRes] = await Promise.all([
          fetch("/api/messages/unread-count"),
          fetch("/api/notifications/unread-count")
        ]);
        const msgData = await msgRes.json();
        const notifData = await notifRes.json();
        
        if (msgData.success) setUnreadMessages(msgData.data);
        if (notifData.success) setUnreadNotifications(notifData.data);
      } catch (error) {
        console.error(t("common.failedSidebarFetch"), error);
      }
    };

    fetchCounts();
    // Refresh every 30 seconds
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [t]);

  const navItems = [
    { name: t("nav.home"), href: "/", icon: Home },
    { name: t("nav.reportLost"), href: "/report/lost", icon: Search },
    { name: t("nav.reportFound"), href: "/report/found", icon: PlusCircle },
    { name: t("nav.myPosts"), href: "/my-posts", icon: FolderHeart },
    { name: t("nav.messages"), href: "/messages", icon: MessageSquare, badge: unreadMessages },
    { name: t("notif.title"), href: "/notifications", icon: BellRing, badge: unreadNotifications },
    { name: t("nav.businesses"), href: "/businesses", icon: Briefcase },
  ];

  // Add Partner specific dashboard link
  if (user?.role === "partner") {
    navItems.push({
      name: t("nav.businessDashboard"),
      href: "/business/dashboard",
      icon: Briefcase
    });
  }


  return (
    <aside className={cn(
      "flex flex-col border-r bg-card/80 backdrop-blur-xl transition-all duration-300 h-full",
      className
    )} dir={dir} suppressHydrationWarning>
      <div className="h-16 flex items-center justify-between px-6 border-b">
        <Link href="/" className="flex items-center gap-2.5 group" onClick={onClose}>
          <div className="relative shrink-0">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
              <defs>
                <linearGradient id="logo-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#1e40af"/>
                  <stop offset="100%" stopColor="#3b82f6"/>
                </linearGradient>
                <filter id="inner-shadow">
                  <feOffset dx="0" dy="1"/>
                  <feGaussianBlur stdDeviation="1" result="offset-blur"/>
                  <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse"/>
                  <feFlood floodColor="black" floodOpacity="0.2" result="color"/>
                  <feComposite operator="in" in="color" in2="inverse" result="shadow"/>
                  <feComposite operator="over" in="shadow" in2="SourceGraphic"/>
                </filter>
              </defs>
              <rect width="40" height="40" rx="12" fill="url(#logo-gradient)"/>
              {/* Stylized Pin + Magnifier */}
              <path 
                d="M20 10C15.5817 10 12 13.5817 12 18C12 23.5 20 30 20 30C20 30 28 23.5 28 18C28 13.5817 24.4183 10 20 10Z" 
                stroke="white" 
                strokeWidth="2.5" 
                strokeLinejoin="round"
                fill="white"
                fillOpacity="0.1"
              />
              <circle cx="20" cy="18" r="4" stroke="white" strokeWidth="2.5"/>
              <path d="M23 21L26 24" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-black text-lg tracking-tight">Fin<span className="text-primary">Huwa</span></span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="p-2 md:hidden">
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-6 px-3">
          {t("nav.menu")}
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group relative",
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} />
                {item.name}
              </div>
              {item.badge > 0 && (
                <span className={cn(
                  "text-[10px] font-black px-2 py-0.5 rounded-full",
                  isActive ? "bg-white text-primary" : "bg-primary text-white"
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <Link
          href="/settings"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-muted-foreground hover:bg-secondary transition-colors"
        >
          <Settings size={18} />
          {t("nav.settings")}
        </Link>
      </div>
    </aside>
  );
}
