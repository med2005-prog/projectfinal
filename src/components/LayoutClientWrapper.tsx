"use client";

import { useState, useEffect, Suspense } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { RightSidebar } from "@/components/RightSidebar";
import { AIChatBot } from "@/components/AIChatBot";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { IncomingCallListener } from "@/components/IncomingCallListener";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

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

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <LanguageProvider>
          <div className="flex h-screen overflow-hidden">
            {/* Desktop Sidebar */}
            <Sidebar className="hidden lg:flex w-64 shrink-0" />

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
              </Suspense>

              {/* Scrollable Content */}
              <main className="flex-1 overflow-y-auto p-0 md:p-6 lg:p-8 flex gap-8">
                <div className="flex-1 w-full mx-auto max-w-[100vw] overflow-x-hidden md:max-w-4xl">
                  <Suspense fallback={
                    <div className="flex items-center justify-center py-20">
                      <span className="font-black text-lg tracking-tight">Fin<span className="text-primary">Huwa</span></span>
                    </div>
                  }>
                    {children}
                  </Suspense>
                </div>

                {/* Desktop Right Sidebar */}
                <RightSidebar className="hidden xl:block w-80 shrink-0 self-start sticky top-0" />
              </main>
            </div>
            <AIChatBot />
            <IncomingCallListener />
          </div>
        </LanguageProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
