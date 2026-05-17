"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusCircle, MessageSquare, User, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

export function MobileNav() {
  const pathname = usePathname();
  const { t, dir } = useLanguage();
  const { user } = useAuth();

  const navItems = [
    { name: "home", href: "/", icon: Home },
    { name: "search", href: "/all-categories", icon: Search },
    { name: "add", href: "/report/lost", icon: PlusCircle, primary: true },
    { name: "messages", href: "/messages", icon: MessageSquare },
    { name: "profile", href: user ? "/profile" : "/login", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden" dir={dir}>
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-t border-zinc-100 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] rounded-t-[2.5rem]" />
      
      <div className="relative flex items-center justify-around h-20 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          if (item.primary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -top-8 group"
              >
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white shadow-2xl shadow-primary/40 group-active:scale-95 transition-transform border-4 border-white">
                  <PlusCircle size={32} strokeWidth={2.5} />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300",
                isActive ? "text-primary" : "text-zinc-400"
              )}
            >
              <div className="relative">
                <item.icon 
                  size={24} 
                  strokeWidth={isActive ? 2.5 : 2}
                  className={cn("transition-all duration-300", isActive && "scale-110")} 
                />
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </div>
      
      {/* iPhone Notch Spacer */}
      <div className="h-safe-bottom bg-white/80 backdrop-blur-xl" />
    </div>
  );
}
