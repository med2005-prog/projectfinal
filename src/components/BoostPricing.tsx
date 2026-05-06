"use client";

import { useState } from "react";
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
    name: "Basic",
    nameAr: "الأساسي",
    price: 80,
    monthlyPrice: "80",
    featuresAr: ["ظهور 3x", "شارة أساسية"],
    topBg: "bg-zinc-100",
  },
  {
    id: "standard",
    name: "Standard",
    nameAr: "القياسي",
    price: 150,
    monthlyPrice: "150",
    featuresAr: ["ظهور 6x", "قمة القائمة", 'شارة "مميز"'],
    topBg: "bg-zinc-100",
  },
  {
    id: "pro",
    name: "Professional",
    nameAr: "الاحترافي",
    price: 250,
    monthlyPrice: "250",
    popular: true,
    featuresAr: ["ظهور 8x", "إشعارات للمدينة", "دعم أولوية"],
    topBg: "bg-gradient-to-br from-blue-100 to-indigo-100",
  },
  {
    id: "premium",
    name: "Premium",
    nameAr: "البريميوم",
    price: 370,
    monthlyPrice: "370",
    featuresAr: ["ظهور 12x", "تصدر شامل", "دعم VIP"],
    topBg: "bg-zinc-100",
  },
];


export function BoostPricing({ postId, onSuccess, onCancel }: BoostPricingProps) {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("standard");
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const selected = PLANS.find((p) => p.id === selectedPlan)!;
  const router = useRouter();

  const handleBoost = async () => {
    setLoading(true);
    setError(null);
    try {
      // Redirect to our internal custom checkout page
      const query = new URLSearchParams({
        postId,
        planId: selectedPlan,
        planName: selected.nameAr,
        price: (isYearly ? selected.price : selected.price).toString(), // simplified for now
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

  return (
    <div className="space-y-8 py-2" dir="rtl">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-primary/5 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-primary/10">
          ترويج الإعلان
        </div>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900">
          رَوّج إعلانك وضاعف فرص الاسترجاع
        </h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          اختار الباقة المناسبة وخلي إعلانك يوصل لأكبر عدد من الناس
        </p>

        {/* Toggle Switch */}
        <div className="flex justify-center mt-6 mb-4">
          <div className="bg-zinc-100 p-1 rounded-full flex items-center relative">
            <button
              onClick={() => setIsYearly(false)}
              className={cn(
                "relative z-10 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300",
                !isYearly ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              شهري
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={cn(
                "relative z-10 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2",
                isYearly ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              سنوي
              <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                توفير 20%
              </span>
            </button>
            <div
              className={cn(
                "absolute top-1 bottom-1 bg-white rounded-full shadow-sm transition-all duration-300 ease-in-out",
                isYearly ? "left-1 right-[50%]" : "left-[50%] right-1"
              )}
            />
          </div>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLANS.map((plan) => {
          const isSelected = selectedPlan === plan.id;

          return (
            <motion.div
              key={plan.id}
              whileHover={{ y: -4 }}
              onClick={() => setSelectedPlan(plan.id)}
              className={cn(
                "relative flex flex-col p-2.5 rounded-[2rem] border-2 cursor-pointer transition-all duration-200 bg-white shadow-sm",
                isSelected
                  ? "border-zinc-900 shadow-xl"
                  : "border-transparent hover:border-zinc-200"
              )}
            >
              {/* Top Section */}
              <div className={cn("rounded-[1.5rem] p-6 mb-2 flex flex-col", plan.topBg)}>
                <div className="bg-white/90 backdrop-blur-sm w-fit px-4 py-1.5 rounded-full text-[11px] font-black mb-4 uppercase tracking-wider text-zinc-900 shadow-sm border border-zinc-200/50">
                  {plan.nameAr}
                </div>
                <div className="flex items-end gap-1.5 mt-2 flex-wrap">
                  <span className="text-4xl sm:text-5xl font-black text-zinc-900 leading-none">
                    {isYearly ? plan.price : plan.monthlyPrice.replace("~", "")}
                  </span>
                  <span className="text-sm font-bold text-zinc-500 mb-1">
                    {isYearly ? "درهم / سنة" : "درهم / شهر"}
                  </span>
                </div>
                {isYearly && (
                  <p className="text-xs font-bold text-zinc-400 mt-3">
                    ~{Math.round(plan.price / 12)} درهم / شهر
                  </p>
                )}
              </div>

              {/* Select Indicator Button */}
              <div
                className={cn(
                  "w-[calc(100%-1rem)] mx-auto rounded-full py-4 px-6 font-bold mt-2 mb-6 transition-all text-center text-sm sm:text-base",
                  isSelected
                    ? "bg-zinc-900 text-white shadow-md shadow-zinc-900/20"
                    : "bg-zinc-900 text-white hover:bg-zinc-800"
                )}
              >
                {isSelected ? "✓ محدد" : "اختر الباقة"}
              </div>

              {/* Features */}
              <div className="px-5 pb-5 flex-1">
                <ul className="space-y-3.5">
                  {plan.featuresAr.map((feat) => (
                    <li key={feat} className="flex items-center gap-3 text-sm font-semibold text-zinc-600">
                      <Check size={16} className="text-zinc-300 shrink-0" strokeWidth={3} />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected plan summary */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedPlan}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="rounded-2xl border border-zinc-200 bg-white p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-zinc-700 bg-zinc-100 shrink-0">
              <Rocket size={22} />
            </div>
            <div>
              <p className="font-black text-lg text-zinc-900">{selected.nameAr}</p>
              <p className="text-sm text-zinc-500 font-medium">
                الباقة المحددة
              </p>
            </div>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-3xl font-black text-zinc-900" dir="ltr">
              {isYearly ? selected.price : selected.monthlyPrice.replace("~", "")} MAD
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive">
          <X size={18} className="shrink-0" />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleBoost}
          disabled={loading}
          className={cn(
            "flex-1 flex items-center justify-center gap-3 font-black py-4 px-8 rounded-2xl text-lg transition-all shadow-xl active:scale-[0.98]",
            "bg-zinc-900 text-white shadow-zinc-900/20 hover:bg-zinc-800 disabled:opacity-50"
          )}
        >
          {loading ? (
            <Loader2 className="animate-spin" size={22} />
          ) : (
            <>
              {"رَوّج الآن"}
              <ArrowRight size={20} className="rotate-180" />
            </>
          )}
        </button>
        <button
          onClick={onCancel}
          className="px-8 py-4 rounded-2xl font-bold border border-zinc-200 hover:bg-zinc-50 transition-all text-zinc-500"
        >
          لاحقاً
        </button>
      </div>

      {/* Trust footer */}
      <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
        <ShieldCheck size={14} className="text-green-500" />
        الدفع الآمن عبر CMI · ضمان استرجاع المبلغ إذا لم تكن راضياً
      </p>
    </div>
  );
}
