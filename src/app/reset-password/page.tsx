"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { Lock, Eye, EyeOff, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { language, dir } = useLanguage();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError(language === "ar" ? "كلمتا المرور غير متطابقتين" : "Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setError(data.error || "Invalid or expired link.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center py-10">
        <p className="text-destructive font-bold">Invalid reset link.</p>
        <Link href="/forgot-password" className="text-primary mt-4 inline-block">Request a new one</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" dir={dir}>
      <div className="w-full max-w-md">
        <div className="glass-card rounded-3xl border p-8 shadow-2xl">
          {!success ? (
            <>
              <div className="mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                  <Lock size={32} className="text-primary" />
                </div>
                <h1 className="text-2xl font-black mb-2">
                  {language === "ar" ? "تعيين كلمة مرور جديدة" : "Set New Password"}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {language === "ar" ? "أدخل كلمة المرور الجديدة." : "Enter your new password below."}
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
                    {language === "ar" ? "كلمة المرور الجديدة" : "New Password"}
                  </label>
                  <div className="relative">
                    <Lock size={18} className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground ${dir === "rtl" ? "right-4" : "left-4"}`} />
                    <input
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className={`w-full p-4 rounded-xl border bg-secondary/50 focus:ring-2 focus:ring-primary outline-none ${dir === "rtl" ? "pr-12 pl-12" : "pl-12 pr-12"}`}
                      required minLength={8}
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground ${dir === "rtl" ? "left-4" : "right-4"}`}>
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">
                    {language === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"}
                  </label>
                  <div className="relative">
                    <Lock size={18} className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground ${dir === "rtl" ? "right-4" : "left-4"}`} />
                    <input
                      type={showPw ? "text" : "password"}
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      className={`w-full p-4 rounded-xl border bg-secondary/50 focus:ring-2 focus:ring-primary outline-none ${dir === "rtl" ? "pr-12 pl-4" : "pl-12 pr-4"}`}
                      required minLength={8}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white p-4 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : <Lock size={20} />}
                  {language === "ar" ? "حفظ كلمة المرور" : "Save Password"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={40} className="text-green-500" />
              </div>
              <h2 className="text-xl font-black">
                {language === "ar" ? "تم تغيير كلمة المرور!" : "Password Changed!"}
              </h2>
              <p className="text-muted-foreground text-sm">
                {language === "ar" ? "جاري تحويلك لتسجيل الدخول..." : "Redirecting you to login..."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
