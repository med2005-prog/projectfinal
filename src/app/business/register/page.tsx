"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useGoogleLogin } from "@react-oauth/google";
import { 
  Building2, User, Mail, Phone, MapPin, Tag, 
  FileText, Globe, Send, CheckCircle2, Loader2, ArrowLeft, ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const CATEGORIES = [
  "متجر إلكتروني", "مكتبة / قرطاسية", "صيدلية", "مطعم / مقهى",
  "سوبر ماركت", "محطة وقود", "فندق / رياض", "مصلحة بريدية",
  "بنك / صراف آلي", "مركز رياضي", "محل ملابس", "أخرى"
];

export default function BusinessRegisterPage() {
  const { language, dir } = useLanguage();
  const isAr = language === "ar";

  const [googleUser, setGoogleUser] = useState<{ name: string; email: string; picture: string } | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");

  const [form, setForm] = useState({
    businessName: "", ownerName: "", email: "", phone: "",
    city: "أكادير", address: "", category: "", description: "", website: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setGoogleError("");
      try {
        const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        const userInfo = await userRes.json();
        setGoogleUser({ name: userInfo.name, email: userInfo.email, picture: userInfo.picture });
        // Pre-fill the form with Google info
        setForm(prev => ({
          ...prev,
          ownerName: userInfo.name || prev.ownerName,
          email: userInfo.email || prev.email
        }));
      } catch {
        setGoogleError(isAr ? "فشل تسجيل الدخول بـ Google" : "Google sign-in failed");
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => setGoogleError(isAr ? "فشل تسجيل الدخول بـ Google" : "Google sign-in failed")
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleUser) {
      setError(isAr ? "يجب تسجيل الدخول بـ Google أولاً" : "Please sign in with Google first");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, googleVerified: true, googlePicture: googleUser.picture })
      });
      const data = await res.json();
      if (data.success) setSuccess(true);
      else setError(data.error || "حدث خطأ");
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card max-w-md w-full rounded-3xl border p-10 text-center space-y-5 shadow-2xl"
        >
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={48} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-black">{isAr ? "تم إرسال طلبك!" : "Request Sent!"}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {isAr 
              ? "شكراً لاهتمامك بالانضمام لشبكة Fin Huwa. سيتم مراجعة طلبك والتواصل معك خلال 48 ساعة."
              : "Thank you for your interest. Your request will be reviewed and you will be contacted within 48 hours."}
          </p>
          <Link href="/" className="inline-block bg-primary text-white px-8 py-3 rounded-xl font-black hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
            {isAr ? "العودة للرئيسية" : "Back to Home"}
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4" dir={dir}>
      <Link href="/" className="flex items-center gap-2 text-muted-foreground mb-8 hover:text-foreground transition-colors w-fit">
        <ArrowLeft size={18} className={dir === "rtl" ? "rotate-180" : ""} />
        <span className="font-bold text-sm">{isAr ? "رجوع" : "Back"}</span>
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-3xl border p-8 shadow-xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl"><Building2 size={28} /></div>
            <div>
              <h1 className="text-2xl font-black">{isAr ? "انضم كشريك تجاري" : "Join as a Business Partner"}</h1>
              <p className="text-muted-foreground text-sm">{isAr ? "سجّل محلك كنقطة تسليم موثوقة في أكادير" : "Register your location as a trusted drop-off point"}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            {["✅ مجاني تماماً", "📦 نقطة تسليم آمنة", "🏅 شارة الشريك الرسمي"].map(b => (
              <span key={b} className="text-xs font-bold bg-secondary px-3 py-1.5 rounded-full">{b}</span>
            ))}
          </div>
        </div>

        {/* STEP 1: Google Sign-In */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-black ${googleUser ? "bg-green-500 text-white" : "bg-primary text-white"}`}>
              {googleUser ? "✓" : "1"}
            </div>
            <p className="font-black text-sm">
              {isAr ? "الخطوة 1: تسجيل الدخول بـ Google" : "Step 1: Sign in with Google"}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!googleUser ? (
              <motion.div key="signin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {googleError && (
                  <p className="text-destructive text-sm font-bold mb-3">{googleError}</p>
                )}
                <button
                  type="button"
                  onClick={() => googleLogin()}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-border hover:border-primary/30 hover:bg-primary/5 transition-all font-bold text-sm disabled:opacity-50"
                >
                  {googleLoading ? <Loader2 size={20} className="animate-spin" /> : (
                    <svg width={20} height={20} viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  {isAr ? "متابعة مع Google" : "Continue with Google"}
                </button>
                <p className="text-center text-xs text-muted-foreground mt-2">
                  {isAr ? "سيتم ملء اسمك وبريدك تلقائياً" : "Your name and email will be pre-filled automatically"}
                </p>
              </motion.div>
            ) : (
              <motion.div key="loggedin" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl"
              >
                <Image src={googleUser.picture} alt={googleUser.name} width={48} height={48} className="rounded-full border-2 border-green-500/30" />
                <div className="flex-1">
                  <p className="font-black text-sm">{googleUser.name}</p>
                  <p className="text-xs text-muted-foreground">{googleUser.email}</p>
                </div>
                <div className="flex items-center gap-1 text-green-500 font-bold text-xs">
                  <ShieldCheck size={16} />
                  {isAr ? "موثَّق" : "Verified"}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* STEP 2: Fill form - only after Google login */}
        <div className={`transition-all duration-300 ${!googleUser ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-black ${googleUser ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}>2</div>
            <p className="font-black text-sm">{isAr ? "الخطوة 2: معلومات المحل" : "Step 2: Business Details"}</p>
          </div>

          {error && <div className="mb-5 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-bold">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-1.5">{isAr ? "اسم المحل / الشركة" : "Business Name"} *</label>
                <div className="relative">
                  <Building2 size={16} className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground ${dir === "rtl" ? "right-3" : "left-3"}`} />
                  <input required value={form.businessName} onChange={e => set("businessName", e.target.value)}
                    className={`w-full py-3 rounded-xl border bg-secondary/50 focus:ring-2 focus:ring-primary outline-none font-medium text-sm ${dir === "rtl" ? "pr-9 pl-3" : "pl-9 pr-3"}`}
                    placeholder={isAr ? "محل البركة" : "Baraka Store"} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-1.5">{isAr ? "اسم صاحب المحل" : "Owner Name"} *</label>
                <div className="relative">
                  <User size={16} className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground ${dir === "rtl" ? "right-3" : "left-3"}`} />
                  <input required value={form.ownerName} onChange={e => set("ownerName", e.target.value)}
                    className={`w-full py-3 rounded-xl border bg-secondary/50 focus:ring-2 focus:ring-primary outline-none font-medium text-sm ${dir === "rtl" ? "pr-9 pl-3" : "pl-9 pr-3"}`}
                    placeholder={isAr ? "محمد العلمي" : "Mohammed Elmalki"} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-1.5">{isAr ? "البريد الإلكتروني" : "Email"} *</label>
                <div className="relative">
                  <Mail size={16} className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground ${dir === "rtl" ? "right-3" : "left-3"}`} />
                  <input required type="email" value={form.email} onChange={e => set("email", e.target.value)}
                    className={`w-full py-3 rounded-xl border bg-secondary/50 focus:ring-2 focus:ring-primary outline-none font-medium text-sm ${dir === "rtl" ? "pr-9 pl-3" : "pl-9 pr-3"}`}
                    placeholder="email@example.com" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-1.5">{isAr ? "رقم الهاتف" : "Phone"} *</label>
                <div className="relative">
                  <Phone size={16} className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground ${dir === "rtl" ? "right-3" : "left-3"}`} />
                  <input required value={form.phone} onChange={e => set("phone", e.target.value)}
                    className={`w-full py-3 rounded-xl border bg-secondary/50 focus:ring-2 focus:ring-primary outline-none font-medium text-sm ${dir === "rtl" ? "pr-9 pl-3" : "pl-9 pr-3"}`}
                    placeholder="+212 6XX XXXXXX" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-1.5">{isAr ? "المدينة" : "City"} *</label>
                <div className="relative">
                  <MapPin size={16} className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground ${dir === "rtl" ? "right-3" : "left-3"}`} />
                  <select required value={form.city} onChange={e => set("city", e.target.value)}
                    className={`w-full py-3 rounded-xl border bg-secondary/50 focus:ring-2 focus:ring-primary outline-none font-medium text-sm appearance-none ${dir === "rtl" ? "pr-9 pl-3" : "pl-9 pr-3"}`}>
                    {["أكادير", "إنزكان", "أيت ملول", "تيزنيت", "طرفاية"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-1.5">{isAr ? "نوع النشاط" : "Category"} *</label>
                <div className="relative">
                  <Tag size={16} className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground ${dir === "rtl" ? "right-3" : "left-3"}`} />
                  <select required value={form.category} onChange={e => set("category", e.target.value)}
                    className={`w-full py-3 rounded-xl border bg-secondary/50 focus:ring-2 focus:ring-primary outline-none font-medium text-sm appearance-none ${dir === "rtl" ? "pr-9 pl-3" : "pl-9 pr-3"}`}>
                    <option value="">{isAr ? "اختر النوع..." : "Choose category..."}</option>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-1.5">{isAr ? "العنوان التفصيلي" : "Full Address"} *</label>
              <div className="relative">
                <MapPin size={16} className={`absolute top-3.5 text-muted-foreground ${dir === "rtl" ? "right-3" : "left-3"}`} />
                <input required value={form.address} onChange={e => set("address", e.target.value)}
                  className={`w-full py-3 rounded-xl border bg-secondary/50 focus:ring-2 focus:ring-primary outline-none font-medium text-sm ${dir === "rtl" ? "pr-9 pl-3" : "pl-9 pr-3"}`}
                  placeholder={isAr ? "شارع محمد السادس، رقم 12" : "12 Mohammed VI St"} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-1.5">{isAr ? "الموقع الإلكتروني (اختياري)" : "Website (optional)"}</label>
              <div className="relative">
                <Globe size={16} className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground ${dir === "rtl" ? "right-3" : "left-3"}`} />
                <input type="url" value={form.website} onChange={e => set("website", e.target.value)}
                  className={`w-full py-3 rounded-xl border bg-secondary/50 focus:ring-2 focus:ring-primary outline-none font-medium text-sm ${dir === "rtl" ? "pr-9 pl-3" : "pl-9 pr-3"}`}
                  placeholder="https://..." />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-1.5">{isAr ? "وصف المحل" : "Business Description"} *</label>
              <div className="relative">
                <FileText size={16} className={`absolute top-3.5 text-muted-foreground ${dir === "rtl" ? "right-3" : "left-3"}`} />
                <textarea required rows={4} value={form.description} onChange={e => set("description", e.target.value)}
                  className={`w-full py-3 rounded-xl border bg-secondary/50 focus:ring-2 focus:ring-primary outline-none font-medium text-sm resize-none ${dir === "rtl" ? "pr-9 pl-3" : "pl-9 pr-3"}`}
                  placeholder={isAr ? "اكتب وصفاً مختصراً عن نشاطك ومكانك..." : "Briefly describe your business and location..."} />
              </div>
            </div>

            <button type="submit" disabled={loading || !googleUser}
              className="w-full bg-primary text-white py-4 rounded-xl font-black flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 transition-all text-base">
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              {isAr ? "إرسال طلب الانضمام" : "Submit Registration"}
            </button>

            <p className="text-center text-xs text-muted-foreground">
              {isAr ? "سيتم التواصل معك خلال 48 ساعة من تقديم الطلب." : "You will be contacted within 48 hours of submitting."}
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
