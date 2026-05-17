"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { CheckoutForm } from "@/components/CheckoutForm";
import { motion } from "framer-motion";
import { Zap, ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_your_key_here");

function PaymentContent() {
  const { language, dir } = useLanguage();
  const searchParams = useSearchParams();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  
  const postId = searchParams.get("postId") || searchParams.get("post");
  const planId = searchParams.get("planId") || searchParams.get("plan");
  const planName = searchParams.get("planName");
  const price = searchParams.get("price");
  const testMode = searchParams.get("testMode") === "true";

  useEffect(() => {
    if (!postId || !planId || !price) {
      console.error("Missing required payment parameters:", { postId, planId, price });
      return;
    }

    console.log("Initializing payment intent for:", { postId, planId, planName, price, testMode });

    fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, planId, planName, price, testMode }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          console.error("Failed to get clientSecret:", data.error);
        }
      })
      .catch(err => console.error("Checkout API error:", err));
  }, [postId, planId, price, testMode, planName]);

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#10b981',
      colorBackground: '#ffffff',
      colorText: '#18181b',
      borderRadius: '16px',
      fontFamily: 'system-ui, sans-serif',
    },
  };

  return (
    <div className="min-h-screen py-20 px-4" dir={dir}>
      <div className="max-w-xl mx-auto">
        <Link href="/boost" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-bold mb-8 transition-colors">
          <ArrowLeft size={18} />
          {language === 'ar' ? "العودة للعروض" : "Back to Plans"}
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight">
              {language === 'ar' ? "إتمام عملية الدفع" : "Complete Payment"}
            </h1>
            <p className="text-zinc-500 font-medium">
              {language === 'ar' 
                ? `أنت بصدد تفعيل باقة ${planName} بقيمة ${price} درهم` 
                : `You are activating the ${planName} plan for ${price} MAD`}
            </p>
          </div>

          {clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
              <CheckoutForm postId={postId!} planId={planId!} />
            </Elements>
          ) : (
            <div className="glass-card p-12 rounded-3xl flex flex-col items-center justify-center gap-4 animate-pulse">
              <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
              <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
                {language === 'ar' ? "جاري تهيئة الدفع الآمن..." : "Initializing secure checkout..."}
              </p>
            </div>
          )}

          <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-200">
             <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <ShieldCheck size={20} />
             </div>
             <div>
                <p className="text-xs font-black uppercase tracking-wider text-zinc-900">
                  {language === 'ar' ? "دفع آمن ومحمي" : "Secure & Encrypted"}
                </p>
                <p className="text-[10px] text-zinc-500 font-medium">
                  {language === 'ar' ? "يتم معالجة جميع المدفوعات بواسطة Stripe بمعايير أمان عالمية." : "All payments are processed securely by Stripe with global standards."}
                </p>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function PayPage() {
  return (
    <Suspense>
      <PaymentContent />
    </Suspense>
  );
}