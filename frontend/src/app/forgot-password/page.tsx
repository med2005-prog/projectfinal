"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const { language, dir } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" dir={dir}>
      <div className="w-full max-w-md">
        <Link href="/login" className="flex items-center gap-2 text-muted-foreground mb-8 hover:text-foreground transition-colors w-fit">
          <ArrowLeft size={18} className={dir === "rtl" ? "rotate-180" : ""} />
          <span className="font-bold text-sm">{language === "ar" ? "العودة لتسجيل الدخول" : "Back to Login"}</span>
        </Link>

        <div className="glass-card rounded-3xl border p-8 shadow-2xl">
          {!sent ? (
            <>
              <div className="mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                  <Mail size={32} className="text-primary" />
                </div>
                <h1 className="text-2xl font-black mb-2">
                  {language === "ar" ? "نسيت كلمة المرور؟" : "Forgot Password?"}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {language === "ar"
                    ? "أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور."
                    : "Enter your email and we'll send you a reset link."}
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-bold">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">
                    {language === "ar" ? "البريد الإلكتروني" : "Email Address"}
                  </label>
                  <div className="relative">
                    <Mail size={18} className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground ${dir === "rtl" ? "right-4" : "left-4"}`} />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder={language === "ar" ? "بريدك الإلكتروني" : "your@email.com"}
                      className={`w-full p-4 rounded-xl border bg-secondary/50 focus:ring-2 focus:ring-primary outline-none ${dir === "rtl" ? "pr-12 pl-4" : "pl-12 pr-4"}`}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white p-4 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : <Mail size={20} />}
                  {language === "ar" ? "إرسال رابط الاسترداد" : "Send Reset Link"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={40} className="text-green-500" />
              </div>
              <h2 className="text-xl font-black">
                {language === "ar" ? "تم الإرسال!" : "Email Sent!"}
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {language === "ar"
                  ? `لقد أرسلنا رابط إعادة التعيين إلى ${email}. تحقق من بريدك الإلكتروني.`
                  : `We sent a reset link to ${email}. Please check your inbox.`}
              </p>
              <Link href="/login" className="inline-block mt-4 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all">
                {language === "ar" ? "العودة لتسجيل الدخول" : "Back to Login"}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
