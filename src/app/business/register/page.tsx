"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useGoogleLogin } from "@react-oauth/google";
import { 
  Building2, User, Mail, Phone, MapPin, Tag, 
  FileText, Globe, Send, CheckCircle2, Loader2, ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Dynamic import for Leaflet (no SSR)
const LocationPicker = dynamic(() => import("@/components/LocationPicker"), { 
  ssr: false,
  loading: () => (
    <div className="h-[280px] rounded-2xl bg-secondary/50 border-2 border-border flex items-center justify-center">
      <Loader2 size={24} className="animate-spin text-primary/30" />
    </div>
  )
});

const CATEGORIES = [
  "متجر إلكتروني", "مكتبة / قرطاسية", "صيدلية", "مطعم / مقهى",
  "سوبر ماركت", "محطة وقود", "فندق / رياض", "مصلحة بريدية",
  "بنك / صراف آلي", "مركز رياضي", "محل ملابس",
];

export default function BusinessRegisterPage() {
  const { language, dir } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const isAr = language === "ar";

  const [form, setForm] = useState({
    businessName: "", ownerName: "", email: "", phone: "",
    city: "أكادير", address: "", category: "", description: "", website: "",
    lat: 0, lng: 0
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);
  const [googleUser, setGoogleUser] = useState<{ name: string; email: string; picture: string } | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const set = (field: string, value: string | number) => setForm(prev => ({ ...prev, [field]: value }));

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setForm(prev => ({ ...prev, lat, lng, address }));
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      try {
        const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        const info = await userRes.json();
        setGoogleUser({ name: info.name, email: info.email, picture: info.picture });
        setForm(prev => ({
          ...prev,
          ownerName: info.name || prev.ownerName,
          email: info.email || prev.email
        }));
      } catch {}
      setGoogleLoading(false);
    },
    onError: () => setGoogleLoading(false)
  });

  // Check if user already has a business registered
  useEffect(() => {
    const check = async () => {
      if (!user) { setChecking(false); return; }
      try {
        const res = await fetch("/api/business/check-status");
        const data = await res.json();
        if (data.success && data.hasBusiness) {
          router.push("/business/dashboard");
          return;
        }
      } catch {}
      // Pre-fill from user account
      setForm(prev => ({
        ...prev,
        ownerName: user.name || prev.ownerName,
        email: user.email || prev.email
      }));
      setChecking(false);
    };
    check();
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.lat || !form.lng) {
      setError(isAr ? "يجب تحديد موقع محلك على الخريطة" : "Please select your location on the map");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
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

  // Loading check
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-primary" />
      </div>
    );
  }

  // Success screen
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

        {error && <div className="mb-5 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-bold">{error}</div>}

        {/* Google Quick Fill */}
        {!googleUser ? (
          <button
            type="button"
            onClick={() => googleLogin()}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-4 mb-6 rounded-2xl border-2 border-border hover:border-primary/30 hover:bg-primary/5 transition-all font-bold text-sm disabled:opacity-50"
          >
            {googleLoading ? <Loader2 size={20} className="animate-spin" /> : (
              <svg width={20} height={20} viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {isAr ? "ملء سريع عبر Google" : "Quick fill with Google"}
          </button>
        ) : (
          <div className="flex items-center gap-4 p-4 mb-6 bg-green-500/10 border border-green-500/20 rounded-2xl">
            <Image src={googleUser.picture} alt={googleUser.name} width={40} height={40} className="rounded-full" />
            <div className="flex-1">
              <p className="font-black text-sm">{googleUser.name}</p>
              <p className="text-xs text-muted-foreground">{googleUser.email}</p>
            </div>
            <span className="text-green-600 text-xs font-black">✓ {isAr ? "تم الملء" : "Filled"}</span>
          </div>
        )}

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

          {/* 🗺️ MAP PICKER */}
          <LocationPicker onLocationSelect={handleLocationSelect} />

          {/* Address field - auto-filled from map */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-1.5">{isAr ? "العنوان التفصيلي" : "Full Address"} *</label>
            <div className="relative">
              <MapPin size={16} className={`absolute top-3.5 text-muted-foreground ${dir === "rtl" ? "right-3" : "left-3"}`} />
              <input required value={form.address} onChange={e => set("address", e.target.value)}
                className={`w-full py-3 rounded-xl border bg-secondary/50 focus:ring-2 focus:ring-primary outline-none font-medium text-sm ${dir === "rtl" ? "pr-9 pl-3" : "pl-9 pr-3"} ${form.lat ? "border-green-500/30 bg-green-500/5" : ""}`}
                placeholder={isAr ? "حدد موقعك على الخريطة أو اكتب العنوان يدوياً" : "Pick on map or type manually"} />
            </div>
            {form.lat > 0 && (
              <p className="text-[10px] font-bold text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle2 size={10} /> {isAr ? "تم تحديد الموقع من الخريطة" : "Location set from map"}
                <span className="text-green-500/50 mr-2">({form.lat.toFixed(4)}, {form.lng.toFixed(4)})</span>
              </p>
            )}
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

          <button type="submit" disabled={loading}
            className="w-full bg-primary text-white py-4 rounded-xl font-black flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 transition-all text-base">
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            {isAr ? "إرسال طلب الانضمام" : "Submit Registration"}
          </button>

          <p className="text-center text-xs text-muted-foreground">
            {isAr ? "سيتم التواصل معك خلال 48 ساعة من تقديم الطلب." : "You will be contacted within 48 hours of submitting."}
          </p>
        </form>
      </motion.div>
    </div>
  );
}
