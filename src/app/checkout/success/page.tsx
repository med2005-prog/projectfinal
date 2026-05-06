"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Zap, Share2, Home, Download, ShieldCheck, ArrowLeftRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CheckoutSuccessPage() {
  const { language, dir } = useLanguage();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  const plan = searchParams.get("plan") || "standard";
  const postId = searchParams.get("post");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-50 via-background to-background" dir={dir}>
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-2xl w-full relative"
      >
        {/* Main Card */}
        <div className="glass-card rounded-[3.5rem] border border-white/50 p-8 sm:p-14 text-center shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] bg-white/40 backdrop-blur-3xl relative overflow-hidden">
          
          {/* Animated Success Ring */}
          <div className="relative mb-10">
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 12, stiffness: 100, delay: 0.2 }}
              className="w-28 h-28 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30 relative z-10"
            >
              <CheckCircle2 size={56} className="text-white" strokeWidth={2.5} />
            </motion.div>
            
            {/* Pulsing rings */}
            <motion.div 
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 border-4 border-emerald-500/20 rounded-[2.5rem]" 
            />
          </div>

          <div className="space-y-4 mb-12">
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl sm:text-5xl font-black text-zinc-900 tracking-tight leading-tight"
            >
              {language === 'ar' ? "تم الترويج بنجاح!" : "Promotion Success!"}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-zinc-500 text-lg font-medium max-w-md mx-auto"
            >
              {language === 'ar' 
                ? `إعلانك الآن في قمة القائمة بفضل باقة ${plan.toUpperCase()}. استعد للمكالمات!`
                : `Your post is now featured at the top with the ${plan.toUpperCase()} plan. Get ready!`}
            </motion.p>
          </div>

          {/* Receipt/Details Box */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-zinc-900/5 border border-zinc-900/5 rounded-3xl p-6 mb-12 flex flex-col gap-4 text-right"
          >
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 text-xs font-black uppercase tracking-widest">{language === 'ar' ? "نوع الخطة" : "Plan Type"}</span>
              <span className="font-bold flex items-center gap-2 text-primary">
                <Zap size={14} className="fill-primary" /> {plan.toUpperCase()}
              </span>
            </div>
            <div className="h-px bg-zinc-900/10" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500 font-bold">{language === 'ar' ? "حالة الدفع" : "Payment Status"}</span>
              <span className="text-emerald-600 font-black flex items-center gap-1.5">
                <ShieldCheck size={16} /> {language === 'ar' ? "مؤكد" : "Verified"}
              </span>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
               <Link 
                 href="/my-posts"
                 className="flex items-center justify-center gap-3 bg-zinc-900 text-white py-5 px-8 rounded-2xl font-black text-lg shadow-xl hover:bg-zinc-800 transition-all shadow-zinc-900/20"
               >
                 <Home size={20} />
                 {language === 'ar' ? "منشوراتي" : "My Posts"}
               </Link>
             </motion.div>
             
             <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
               <button 
                 onClick={() => {
                    if (navigator.share) {
                        navigator.share({
                            title: 'شوف الإعلان ديالي فـ Fin Huwa',
                            url: `${window.location.origin}/posts/${postId}`
                        });
                    }
                 }}
                 className="w-full flex items-center justify-center gap-3 bg-white border-2 border-zinc-200 text-zinc-900 py-5 px-8 rounded-2xl font-black text-lg hover:bg-zinc-50 transition-all"
               >
                 <Share2 size={20} />
                 {language === 'ar' ? "نشر الإعلان" : "Share Post"}
               </button>
             </motion.div>
          </div>

          {/* Footer Branding */}
          <div className="mt-12 flex items-center justify-center gap-3 text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em]">
            <div className="h-px w-8 bg-zinc-200" />
            Fin Huwa Lost & Found
            <div className="h-px w-8 bg-zinc-200" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
