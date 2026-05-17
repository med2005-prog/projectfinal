"use client";

import { useState, useEffect, Suspense } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { AIChatBot } from "@/components/AIChatBot";
import { OnboardingModal } from "@/components/OnboardingModal";
import { CategoryBar } from "@/components/CategoryBar";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useHeartbeat } from "@/hooks/useHeartbeat";

import { MobileNav } from "@/components/MobileNav";

function HeartbeatTracker() {
  useHeartbeat();
  return null;
}

export default function LayoutClientWrapper({
  children,
  clientId
}: {
  children: React.ReactNode;
  clientId: string;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const isAdmin = pathname.startsWith('/modir');

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <HeartbeatTracker />
        <LanguageProvider>
          <div className="flex h-screen overflow-hidden bg-[#fafafa]">
            {isAdmin ? (
              <main className="flex-1 h-screen overflow-y-auto no-scrollbar">
                {children}
              </main>
            ) : (
              <>
                {/* Desktop Sidebar */}
                <Sidebar className="hidden lg:flex w-[280px] shrink-0" />

                {/* Mobile Sidebar Overlay */}
                <div className={cn(
                  "fixed inset-0 z-[100] lg:hidden transition-opacity duration-300",
                  isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}>
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
                  <div className={cn(
                    "absolute top-0 bottom-0 left-0 w-72 bg-background transition-transform duration-300 ease-out shadow-2xl",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                  )}>
                    <Sidebar onClose={() => setIsSidebarOpen(false)} />
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                  <Suspense fallback={<div className="h-16 border-b bg-card animate-pulse" />}>
                    <TopBar onMenuClick={() => setIsSidebarOpen(true)} />
                    {!(pathname.startsWith('/modir') || pathname.startsWith('/business/dashboard')) && <CategoryBar />}
                  </Suspense>

                  {/* Scrollable Content */}
                  <main className="flex-1 overflow-y-auto p-0 md:p-6 lg:p-8 flex gap-8 pb-24 md:pb-6">
                    <div className="flex-1 w-full mx-auto max-w-full overflow-x-hidden px-4 md:px-0">
                      <Suspense fallback={
                        <div className="flex items-center justify-center py-20">
                          <span className="font-black text-lg tracking-tight">Fin<span className="text-primary">Huwa</span></span>
                        </div>
                      }>
                        {children}
                      </Suspense>
                    </div>
                  </main>
                  
                  <MobileNav />
                </div>
              </>
            )}
            <AIChatBot />
            <OnboardingModal />
          </div>
        </LanguageProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
