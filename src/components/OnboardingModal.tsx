"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, MessageCircle, Zap, Search, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

export function OnboardingModal() {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeenOnboarding) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    setIsOpen(false);
  };

  const steps = [
    {
      icon: Search,
      title: t("sidebar.step1.title"),
      desc: t("sidebar.step1.desc"),
      color: "bg-blue-500"
    },
    {
      icon: Zap,
      title: t("sidebar.step2.title"),
      desc: t("sidebar.step2.desc"),
      color: "bg-amber-500"
    },
    {
      icon: MessageCircle,
      title: t("sidebar.step3.title"),
      desc: t("sidebar.step3.desc"),
      color: "bg-green-500"
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-background w-full max-w-2xl rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden"
          >
            {/* Background Decorative Circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -ml-32 -mb-32" />

            <button 
              onClick={handleClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-secondary transition-colors z-20"
            >
              <X size={24} />
            </button>

            <div className="relative z-10 text-center space-y-10">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck size={32} />
                </div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                  {language === 'ar' ? 'مرحباً بك في فين هوّا!' : 'Welcome to Fin Huwa!'}
                </h2>
                <p className="text-muted-foreground font-bold text-lg max-w-md mx-auto">
                  {language === 'ar' ? 'اكتشف كيف نساعدك في استعادة مفقوداتك في خطوات بسيطة.' : 'Discover how we help you recover your lost items in simple steps.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {steps.map((step, index) => (
                  <div key={index} className="space-y-4 p-6 rounded-[2rem] bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors group">
                    <div className={`w-12 h-12 ${step.color} text-white rounded-xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform`}>
                      <step.icon size={24} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-black text-sm uppercase tracking-wider">{step.title}</h3>
                      <p className="text-xs text-muted-foreground font-medium leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={handleClose}
                className="w-full py-5 rounded-2xl bg-primary text-white font-black text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all"
              >
                {language === 'ar' ? 'ابدأ الاستخدام الآن' : 'Start Using Now'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
