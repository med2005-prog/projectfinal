"use client";

import { useState, useEffect } from "react";
import {
  Check, Zap, Star, Crown, Sparkles, Rocket,
  ShieldCheck, ArrowRight, Loader2, Search, ArrowLeft, AlertCircle
} from "lucide-react";
import { cn, optimizeImage } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";

type PlanId = "starter" | "basic" | "standard" | "pro" | "premium";

const PLANS = [
  {
    id: "basic" as PlanId,
    name: { en: "Basic", fr: "Basique", ar: "الأساسي" },
    yearlyPrice: 64,
    monthlyPrice: "8",
    priceInDh: 19,
    features: {
      en: ["500+ Views", "Basic Badge"],
      fr: ["500+ Vues", "Badge Basique"],
      ar: ["+500 مشاهدة", "شارة أساسية"]
    },
    topBg: "bg-zinc-100",
  },
  {
    id: "standard" as PlanId,
    name: { en: "Standard", fr: "Standard", ar: "القياسي" },
    yearlyPrice: 144,
    monthlyPrice: "15",
    priceInDh: 39,
    features: {
      en: ["2,000+ Views", "Top of list", '"Featured" Badge'],
      fr: ["2,000+ Vues", "Haut de liste", 'Badge "Sponsorisé"'],
      ar: ["+2000 مشاهدة", "قمة القائمة", 'شارة "مميز"']
    },
    topBg: "bg-zinc-100",
  },
  {
    id: "pro" as PlanId,
    name: { en: "Professional", fr: "Professionnel", ar: "الاحترافي" },
    yearlyPrice: 240,
    monthlyPrice: "25",
    priceInDh: 79,
    popular: true,
    features: {
      en: ["5,000+ Views", "City Notifications", "Priority Support"],
      fr: ["5,000+ Vues", "Notifications Ville", "Support Prioritaire"],
      ar: ["+5000 مشاهدة", "إشعارات للمدينة", "دعم أولوية"]
    },
    topBg: "bg-gradient-to-br from-blue-100 to-indigo-100",
  },
  {
    id: "premium" as PlanId,
    name: { en: "Premium", fr: "Premium", ar: "البريميوم" },
    yearlyPrice: 360,
    monthlyPrice: "37",
    priceInDh: 149,
    features: {
      en: ["15,000+ Views", "Full Prominence", "VIP Support"],
      fr: ["15,000+ Vues", "Mise en avant totale", "Support VIP"],
      ar: ["+15,000 مشاهدة", "تصدر شامل", "دعم VIP"]
    },
    topBg: "bg-zinc-100",
  },
];

export default function BoostPage() {
  const { t, dir, language } = useLanguage();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId>("standard");
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const lang = language as "en" | "fr" | "ar";
  const selectedPlan = PLANS.find((p) => p.id === selectedPlanId)!;

  useEffect(() => {
    if (step === 2) {
      fetchMyPosts();
    }
  }, [step]);

  const fetchMyPosts = async () => {
    setLoadingPosts(true);
    setError(null);
    try {
      const res = await fetch("/api/posts?author=me");
      const data = await res.json();
      setPosts(data.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch your posts");
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleCheckout = async (testMode = false) => {
    if (!selectedPostId || !selectedPlanId) return;
    
    // Calculate final price based on selected duration (60% discount for yearly)
    const finalPrice = isYearly ? Math.round(selectedPlan.priceInDh * 5) : selectedPlan.priceInDh;

    // Redirect to our custom embedded checkout page
    const query = new URLSearchParams({
      postId: selectedPostId,
      planId: selectedPlanId,
      planName: `${selectedPlan.name[lang]} (${isYearly ? (language === 'ar' ? 'سنوي' : 'Yearly') : (language === 'ar' ? 'شهري' : 'Monthly')})`,
      price: finalPrice.toString(),
      testMode: testMode.toString()
    }).toString();
    
    router.push(`/checkout/pay?${query}`);
  };


  return (
    <div className="max-w-6xl mx-auto py-12 px-4 min-h-[80vh]" dir={dir}>
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-12"
          >
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 bg-primary/5 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-primary/10">
                {t("boost.title")} - {language === 'ar' ? "الخطوة 1" : "Step 1"}
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-900">
                {t("boost.heroTitle")}
              </h1>
              <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
                {t("boost.subtitle")}
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
                    {language === 'ar' ? 'شهري' : 'Monthly'}
                  </button>
                  <button
                    onClick={() => setIsYearly(true)}
                    className={cn(
                      "relative z-10 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2",
                      isYearly ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-700"
                    )}
                  >
                    {language === 'ar' ? 'سنوي' : 'Yearly'}
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {language === 'ar' ? 'توفير 60%' : 'Save 60%'}
                    </span>
                  </button>
                  <div
                    className={cn(
                      "absolute top-1 bottom-1 bg-white rounded-full shadow-sm transition-all duration-300 ease-in-out w-[calc(50%-4px)]",
                      !isYearly 
                        ? (dir === 'rtl' ? "right-1" : "left-1") 
                        : (dir === 'rtl' ? "left-1" : "right-1")
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Plan cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {PLANS.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                return (
                  <motion.div
                    key={plan.id}
                    whileHover={{ y: -4 }}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={cn(
                      "relative flex flex-col p-2.5 rounded-[2rem] border-2 cursor-pointer transition-all duration-200 bg-white shadow-sm",
                      isSelected
                        ? "border-zinc-900 shadow-xl"
                        : "border-transparent hover:border-zinc-200"
                    )}
                  >
                    <div className={cn("rounded-[1.5rem] p-6 mb-2 flex flex-col", plan.topBg)}>
                      <div className="bg-white/90 backdrop-blur-sm w-fit px-4 py-1.5 rounded-full text-[11px] font-black mb-4 uppercase tracking-wider text-zinc-900 shadow-sm border border-zinc-200/50">
                        {plan.name[lang]}
                      </div>
                      <div className="flex items-end gap-1.5 mt-2 flex-wrap">
                        <span className="text-4xl sm:text-5xl font-black text-zinc-900 leading-none">
                          {isYearly ? Math.round(plan.priceInDh * 5) : plan.priceInDh}
                        </span>
                        <span className="text-sm font-bold text-zinc-500 mb-1">
                           DH {isYearly ? (language === 'ar' ? '/ سنة' : '/ yr') : (language === 'ar' ? '/ شهر' : '/ mo')}
                        </span>
                      </div>
                      {isYearly && (
                        <p className="text-xs font-bold text-zinc-400 mt-2">
                          ~{Math.round(plan.priceInDh * 5 / 12)} DH / {language === 'ar' ? 'شهر' : 'mo'}
                        </p>
                      )}
                    </div>

                    <button className={cn(
                      "w-[calc(100%-1rem)] mx-auto rounded-full py-4 px-6 font-bold mt-2 mb-6 transition-all text-sm",
                      isSelected ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    )}>
                      {isSelected ? "✓" : t("boost.choose")}
                    </button>

                    <div className="px-5 pb-5 flex-1">
                      <ul className="space-y-3.5">
                        {plan.features[lang].map((f) => (
                          <li key={f} className="flex items-center gap-3 text-sm font-semibold text-zinc-600">
                            <Check size={16} className="text-zinc-300 shrink-0" strokeWidth={3} />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => setStep(2)}
                className="group flex items-center gap-3 bg-zinc-900 text-white px-10 py-5 rounded-2xl font-black text-xl shadow-xl hover:shadow-zinc-900/20 transition-all hover:-translate-y-1 active:scale-95"
              >
                {language === 'ar' ? "استمرار" : "Continue"}
                <ArrowRight className={cn("transition-transform group-hover:translate-x-1", dir === 'rtl' && "rotate-180 group-hover:-translate-x-1")} />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
             <button 
               onClick={() => setStep(1)}
               className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-bold transition-colors"
             >
               <ArrowLeft size={20} className={dir === 'rtl' ? "rotate-180" : ""} />
               {language === 'ar' ? "رجوع للخطط" : "Back to plans"}
             </button>

             <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-emerald-100">
                {selectedPlan.name[lang]} - {isYearly ? Math.round(selectedPlan.priceInDh * 5) : selectedPlan.priceInDh} DH
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-zinc-900">
                {language === 'ar' ? "اختر الإعلان الذي تريد ترويجه" : "Select the post to boost"}
              </h2>
             </div>

             {error && (
               <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-2xl flex items-center gap-3 animate-in fade-in duration-300">
                 <AlertCircle size={20} />
                 <p className="font-bold">{error}</p>
               </div>
             )}

             {loadingPosts ? (

               <div className="flex flex-col items-center justify-center py-20 gap-4">
                 <Loader2 className="animate-spin text-primary" size={40} />
                 <p className="font-bold text-muted-foreground">{t("feed.loading")}</p>
               </div>
             ) : posts.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {posts.map((post) => (
                   <div 
                     key={post._id}
                     onClick={() => setSelectedPostId(post._id)}
                     className={cn(
                       "relative rounded-[2.5rem] overflow-hidden border-4 transition-all duration-300 cursor-pointer group",
                       selectedPostId === post._id ? "border-zinc-900 shadow-2xl scale-[1.02]" : "border-transparent hover:border-zinc-200"
                     )}
                   >
                     <div className="aspect-video relative bg-zinc-100">
                       <Image 
                         src={optimizeImage(post.images[0], 600)} 
                         alt={post.title} 
                         fill 
                         className="object-cover"
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                       <div className="absolute bottom-4 left-6 right-6">
                         <h3 className="text-white font-bold text-lg line-clamp-1">{post.title}</h3>
                         <p className="text-white/80 text-xs font-semibold">{post.location}</p>
                       </div>
                       
                       {selectedPostId === post._id && (
                         <div className="absolute top-4 right-4 bg-zinc-900 text-white p-2 rounded-full shadow-xl">
                           <Check size={20} strokeWidth={3} />
                         </div>
                       )}
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="bg-zinc-50 rounded-[3rem] p-16 text-center space-y-6 border-2 border-dashed border-zinc-200">
                 <div className="w-20 h-20 bg-zinc-200 rounded-full flex items-center justify-center mx-auto text-zinc-400">
                   <Search size={40} />
                 </div>
                 <div className="space-y-2">
                   <h3 className="text-xl font-bold">{language === 'ar' ? "ليس لديك إعلانات بعد" : "You have no posts yet"}</h3>
                   <p className="text-muted-foreground">{language === 'ar' ? "يجب عليك إنشاء إعلان أولاً لكي تتمكن من ترويجه." : "You must create a post first to be able to boost it."}</p>
                 </div>
                 <button onClick={() => router.push("/report/lost")} className="bg-zinc-900 text-white px-8 py-3 rounded-xl font-bold">
                   {t("hero.btnLost")}
                 </button>
               </div>
             )}

             <div className="flex flex-col items-center gap-4 pt-8">
                <button
                  disabled={!selectedPostId || processing}
                  onClick={() => handleCheckout(false)}
                  className="flex items-center gap-3 bg-zinc-900 text-white px-12 py-5 rounded-2xl font-black text-xl shadow-xl hover:shadow-zinc-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1 active:scale-95"
                >
                  {processing ? <Loader2 className="animate-spin" /> : <Zap className="fill-white" />}
                  {language === 'ar' ? "دفع وتفعيل الترويج" : "Pay & Activate Boost"}
                </button>

                {user?.email === "med2005@gmail.com" && (
                  <button
                    onClick={() => handleCheckout(true)}
                    disabled={processing}
                    className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold py-3 px-12 rounded-2xl hover:bg-emerald-500/20 transition-all shadow-sm"
                  >
                    <Rocket size={18} />
                    {language === 'ar' ? "تجربة الترويج (خاص بالمدير)" : "Simulate Success (Admin Only)"}
                  </button>
                )}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
