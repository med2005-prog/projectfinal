"use client";

import { useState, cloneElement, ReactElement } from "react";
import {
  Check, Zap, Star, Crown, Sparkles, Rocket,
  Loader2, ShieldCheck, ArrowRight, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface BoostPricingProps {
  postId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

type PlanId = "basic" | "standard" | "pro" | "premium";

interface Plan {
  id: PlanId;
  name: string;
  nameAr: string;
  price: number;
  monthlyPrice: string;
  featuresAr: string[];
  topBg: string;
  popular?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "basic",
    name: "Starter Boost",
    nameAr: "الباقة الأساسية",
    price: 19,
    monthlyPrice: "19",
    featuresAr: ["+500 مشاهدة حقيقية", "شارة 'عاجل' لمدة 3 أيام", "ظهور متكرر في البحث"],
    topBg: "bg-blue-500/5",
  },
  {
    id: "standard",
    name: "Silver Boost",
    nameAr: "الباقة الفضية",
    price: 39,
    monthlyPrice: "39",
    featuresAr: ["+2000 مشاهدة مستهدفة", "تصدر قمة النتائج", 'شارة "موثق" ذهبية', "إشعار لـ 50 مستخدم قريب"],
    topBg: "bg-purple-500/5",
  },
  {
    id: "pro",
    name: "Gold Boost",
    nameAr: "الباقة الذهبية",
    price: 79,
    monthlyPrice: "79",
    popular: true,
    featuresAr: ["+5000 مشاهدة واسعة", "إشعارات لكل مستخدمي المدينة", "نشر تلقائي في منصاتنا", "دعم فني مخصص"],
    topBg: "bg-amber-500/5",
  },
  {
    id: "premium",
    name: "Diamond Boost",
    nameAr: "باقة الألماس",
    price: 149,
    monthlyPrice: "149",
    featuresAr: ["مشاهدات غير محدودة", "تثبيت في الصفحة الرئيسية", "تصدر شامل و VIP"],
    topBg: "bg-emerald-500/5",
  },
];


export function BoostPricing({ postId, onSuccess, onCancel }: BoostPricingProps) {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("pro");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const selected = PLANS.find((p) => p.id === selectedPlan)!;
  const router = useRouter();

  const handleBoost = async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        postId,
        planId: selectedPlan,
        planName: selected.nameAr,
        price: selected.price.toString(), 
      }).toString();
      
      router.push(`/checkout/pay?${query}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center space-y-6"
      >
        <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center">
          <ShieldCheck className="text-green-500" size={48} />
        </div>
        <div>
          <h3 className="text-2xl font-black">تم تفعيل الترويج! 🎉</h3>
          <p className="text-muted-foreground mt-2">
            إعلانك الآن في المقدمة
          </p>
        </div>
      </motion.div>
    );
  }

  const getPlanStyles = (id: PlanId) => {
    switch (id) {
      case 'basic': return { border: 'group-hover:border-blue-200', text: 'text-blue-600', bg: 'bg-blue-600', icon: <Zap className="text-blue-500" size={20} /> };
      case 'standard': return { border: 'group-hover:border-purple-200', text: 'text-purple-600', bg: 'bg-purple-600', icon: <Star className="text-purple-500" size={20} /> };
      case 'pro': return { border: 'group-hover:border-amber-200', text: 'text-amber-600', bg: 'bg-amber-600', icon: <Crown className="text-amber-500" size={20} /> };
      case 'premium': return { border: 'group-hover:border-emerald-200', text: 'text-emerald-600', bg: 'bg-emerald-600', icon: <Sparkles className="text-emerald-500" size={20} /> };
    }
  };

  return (
    <div className="space-y-12 py-4" dir="rtl">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-primary/5 text-primary px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-primary/10 mb-2">
          <Rocket size={14} fill="currentColor" /> ترويج الإعلان
        </div>
        <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-900 bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900">
          رَوّج إعلانك وضاعف فرص الاسترجاع
        </h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto font-medium">
          اختر الباقة المناسبة لترويج هذا المنشور وزيادة فرصة العثور على غرضك المفقود.
        </p>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
        {PLANS.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          const styles = getPlanStyles(plan.id);

          return (
            <motion.div
              key={plan.id}
              whileHover={{ y: -10 }}
              onClick={() => setSelectedPlan(plan.id)}
              className={cn(
                "group relative flex flex-col p-4 rounded-[3rem] border-4 cursor-pointer transition-all duration-500 bg-white",
                isSelected
                  ? "border-primary shadow-[0_40px_80px_-15px_rgba(45,27,77,0.15)] ring-4 ring-primary/5"
                  : "border-zinc-50 hover:border-zinc-200 shadow-xl shadow-zinc-100"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black px-6 py-2 rounded-full shadow-xl z-20 whitespace-nowrap tracking-widest uppercase">
                  الأكثر فاعلية
                </div>
              )}

              {/* Icon & Label */}
              <div className="flex items-center justify-between mb-8 px-2">
                 <div className="w-14 h-14 rounded-2xl bg-zinc-50 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6">
                    {styles.icon}
                 </div>
                 <div className={cn("px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-zinc-50", styles.text)}>
                    {plan.nameAr}
                 </div>
              </div>

              {/* Pricing */}
              <div className="px-2 mb-10">
                 <div className="flex items-baseline gap-1">
                    <span className="text-6xl font-black tracking-tighter text-zinc-900">{plan.price}</span>
                    <div className="flex flex-col">
                       <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">DH</span>
                       <span className="text-[10px] font-bold text-zinc-400">دفع لمرة واحدة</span>
                    </div>
                 </div>
              </div>

              {/* Features */}
              <div className="px-2 pb-10 space-y-6 flex-1">
                <div className="h-px bg-zinc-100 w-full" />
                <ul className="space-y-4">
                  {plan.featuresAr.map((feat) => (
                    <li key={feat} className="flex items-center gap-3 text-sm font-bold text-zinc-600 group-hover:text-zinc-900 transition-colors">
                      <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-sm", isSelected ? styles.bg : "bg-zinc-100")}>
                         <Check size={12} className="text-white" strokeWidth={4} />
                      </div>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <div
                className={cn(
                  "w-full rounded-[1.8rem] py-5 px-6 font-black transition-all text-center text-sm shadow-xl",
                  isSelected
                    ? "bg-primary text-white shadow-primary/30"
                    : "bg-zinc-900 text-white hover:bg-primary hover:shadow-primary/30"
                )}
              >
                {isSelected ? "تم الاختيار ✓" : "اختر الباقة"}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Summary - Glass Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedPlan}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto rounded-[2.5rem] bg-white border-2 border-primary/10 p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
          
          <div className="flex items-center gap-6 relative z-10">
            <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl", getPlanStyles(selectedPlan).bg)}>
               {cloneElement(getPlanStyles(selectedPlan).icon as ReactElement<any>, { size: 36, className: 'text-white' })}
            </div>
            <div>
               <h3 className="text-2xl font-black text-zinc-900">{selected.nameAr}</h3>
               <p className="text-zinc-400 font-bold text-sm mt-1">ترويج إعلانك المختار فوراً</p>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end gap-1 relative z-10">
             <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-zinc-900 tracking-tighter">
                   {selected.price}
                </span>
                <span className="text-lg font-black text-zinc-400">DH</span>
             </div>
             <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">دفع لمرة واحدة</p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Final Actions */}
      <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto px-4">
        <button
          onClick={handleBoost}
          disabled={loading}
          className="flex-1 h-20 bg-primary text-white font-black rounded-3xl text-xl shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={24} /> : (
            <>
              {"تأكيد ودفع"}
              <ArrowRight size={24} className="rotate-180" />
            </>
          )}
        </button>
        <button
          onClick={onCancel}
          className="px-10 h-20 rounded-3xl font-black border-2 border-zinc-100 hover:bg-zinc-50 hover:border-zinc-200 transition-all text-zinc-400"
        >
          إلغاء
        </button>
      </div>

      {/* Trust & Security */}
      <div className="flex flex-col items-center gap-6 pt-6 border-t border-zinc-100">
         <div className="flex flex-wrap justify-center gap-8 opacity-40 grayscale group-hover:grayscale-0 transition-all">
            <ShieldCheck size={24} />
            <Zap size={24} />
            <Star size={24} />
            <Crown size={24} />
         </div>
         <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em] text-center">
            تشفير آمن بنسبة 100% · معالجة عبر CMI · حماية المشتري
         </p>
      </div>
    </div>
  );
}
