"use client";

import { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { motion } from "framer-motion";
import { Lock, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function CheckoutForm({ postId, planId }: { postId: string; planId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const { language } = useLanguage();
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?post=${postId}&plan=${planId}`,
      },
    });

    if (error) {
      setErrorMessage(error.message || "An unexpected error occurred.");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="glass-card p-6 rounded-3xl border border-white/40 shadow-xl bg-white/50 backdrop-blur-xl">
        <PaymentElement options={{
            layout: 'tabs',
            business: { name: 'Fin Huwa' },
        }} />
      </div>

      {errorMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl text-sm font-bold"
        >
          <AlertCircle size={18} />
          {errorMessage}
        </motion.div>
      )}

      <button
        disabled={!stripe || loading}
        className="w-full bg-zinc-900 text-white py-4 px-8 rounded-2xl font-black text-lg shadow-xl shadow-zinc-900/20 hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        {loading ? (
          <Loader2 className="animate-spin" size={24} />
        ) : (
          <>
            <Lock size={20} className="group-hover:scale-110 transition-transform" />
            {language === 'ar' ? "تأكيد الدفع الآمن" : "Confirm Secure Payment"}
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">
        <div className="flex items-center gap-1">
          <ShieldCheck size={14} className="text-emerald-500" />
          SSL SECURED
        </div>
        <div className="w-1 h-1 bg-zinc-300 rounded-full" />
        <div>POWERED BY STRIPE</div>
      </div>
    </form>
  );
}
