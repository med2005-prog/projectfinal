"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mail, Lock, User, Briefcase, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";
import { useGoogleLogin } from "@react-oauth/google";


export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, register, googleLogin } = useAuth();
  const { t, dir } = useLanguage();


  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user" as "user" | "partner",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        await login({ email: formData.email, password: formData.password });
      } else {
        await register(formData);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setError(null);
      try {
        await googleLogin(tokenResponse.access_token);
      } catch (err: any) {
        setError(err.message || "Google login failed");
        setGoogleLoading(false);
      }
    },
    onError: (error) => {
      setError("Google Login Failed");
      console.error(error);
    }
  });

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4" dir={dir}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card w-full max-w-md p-8 sm:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
      >
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />
        
        <div className="relative z-10 space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black tracking-tight">
              {isLogin ? t("auth.login.title") : t("auth.register.title")}
            </h1>
            <p className="text-muted-foreground">
              {isLogin ? t("auth.login.subtitle") : t("auth.register.subtitle")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{t("auth.form.name")}</label>
                <div className="relative">
                  <User className={cn("absolute top-3.5 text-muted-foreground", dir === 'rtl' ? 'right-4' : 'left-4')} size={18} />
                  <input
                    required
                    type="text"
                    placeholder="John Doe"
                    className={cn(
                      "w-full py-3.5 rounded-2xl border border-border bg-background/50 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-medium",
                      dir === 'rtl' ? "pr-12 pl-4" : "pl-12 pr-4"
                    )}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{t("auth.form.email")}</label>
              <div className="relative">
                <Mail className={cn("absolute top-3.5 text-muted-foreground", dir === 'rtl' ? 'right-4' : 'left-4')} size={18} />
                <input
                  required
                  type="email"
                  placeholder="name@example.com"
                  className={cn(
                    "w-full py-3.5 rounded-2xl border border-border bg-background/50 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-medium",
                    dir === 'rtl' ? "pr-12 pl-4" : "pl-12 pr-4"
                  )}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{t("auth.form.password")}</label>
              <div className="relative">
                <Lock className={cn("absolute top-3.5 text-muted-foreground", dir === 'rtl' ? 'right-4' : 'left-4')} size={18} />
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  className={cn(
                    "w-full py-3.5 rounded-2xl border border-border bg-background/50 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-medium",
                    dir === 'rtl' ? "pr-12 pl-4" : "pl-12 pr-4"
                  )}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            {!isLogin && (
              <div 
                onClick={() => setFormData({ ...formData, role: formData.role === 'partner' ? 'user' : 'partner' })}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all",
                  formData.role === 'partner' ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                )}
              >
                <div className={cn(
                  "p-2 rounded-xl transition-colors",
                  formData.role === 'partner' ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
                )}>
                  <Briefcase size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">{t("auth.form.business")}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-black">{t("auth.form.businessDesc")}</p>
                </div>
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                  formData.role === 'partner' ? "border-primary bg-primary" : "border-muted"
                )}>
                  {formData.role === 'partner' && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs font-bold text-destructive text-center py-2 px-4 bg-destructive/10 rounded-xl">
                {error}
              </p>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : isLogin ? t("auth.form.signIn") : t("auth.form.signUp")}
              {!loading && <ArrowRight size={20} className={cn(dir === 'rtl' ? 'rotate-180' : '')} />}
            </button>

            {isLogin && (
              <div className="text-center">
                <Link href="/forgot-password" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
                  {t("auth.form.forgotPassword") || "Forgot your password?"}
                </Link>
              </div>
            )}
          </form>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground font-black">{t("auth.form.or")}</span></div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={() => handleGoogleLogin()}
              disabled={googleLoading}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-border hover:bg-secondary transition-all font-bold text-sm disabled:opacity-50"
            >
              {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <svg width={18} height={18} viewBox="0 0 24 24" className="w-4 h-4"><path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.909 3.164-1.908 4.156-1.225 1.225-3.134 2.592-7.808 2.592-7.248 0-13.101-5.853-13.101-13.101s5.853-13.101 13.101-13.101c3.857 0 6.643 1.507 8.643 3.42l2.42-2.42c-2.44-2.3-5.694-4-11.063-4-9.931 0-18 8.069-18 18s8.069 18 18 18c5.44 0 9.569-1.8 12.825-5.2s4.25-8.175 4.25-12.075c0-1.162-.113-2.262-.313-3.28z"/></svg>
              )}
              Google
            </button>
          </div>


          <p className="text-center text-sm font-bold text-muted-foreground">
            {isLogin ? t("auth.form.noAccount") : t("auth.form.hasAccount")}{" "}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline"
            >
              {isLogin ? t("auth.form.switchSignup") : t("auth.form.switchLogin")}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
