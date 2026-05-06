"use client";

import { useState, useEffect } from "react";
import { MapPin, Tag, FileText, Calendar, ArrowRight, Loader2, CheckCircle2, ShieldAlert } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/ImageUpload";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const MapArea = dynamic(() => import("@/components/MapArea"), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-secondary/20 animate-pulse rounded-[2.5rem] flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>
});


export default function ReportLost() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { t, dir } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    date: "",
    location: "",
    city: "Agadir",
    description: "",
    imageUrl: "",
    locationCoords: null as { lat: number; lng: number } | null
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/report/lost");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          location: formData.location || "Map Selection", // Default location string
          type: "lost",
          images: formData.imageUrl ? [formData.imageUrl] : []
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/"), 2000);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to submit report");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }

  };

  if (authLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="animate-spin text-primary" size={40} /></div>;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4" dir={dir}>
      <AnimatePresence mode="wait">
        {success ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6"
          >
            <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center shadow-xl shadow-primary/10">
              <CheckCircle2 size={48} />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black">{t("form.success.title")}</h2>
              <p className="text-muted-foreground text-lg">{t("form.success.subtitle")}</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-10 space-y-2 text-center lg:text-left">
              <h1 className="text-4xl font-black tracking-tight">{t("form.lost.title")}</h1>
              <p className="text-muted-foreground text-lg">{t("form.lost.subtitle")}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
               {/* Left: Map Selection */}
               <div className="space-y-4 lg:sticky lg:top-24">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                       <MapPin size={16} /> {t("form.whereLost")}
                    </label>
                    {formData.locationCoords && (
                       <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-1 rounded-md">Location Set</span>
                    )}
                  </div>
                  <div className="h-[400px] lg:h-[500px] border rounded-[2.5rem] overflow-hidden shadow-2xl">
                     <MapArea onLocationSelect={(lat, lng) => setFormData({ ...formData, locationCoords: { lat, lng } })} />
                  </div>
                  <p className="text-xs text-muted-foreground font-bold italic px-4 text-center">
                    {dir === 'rtl' ? "اضغط على الخريطة لتحديد مكان الضياع بدقة" : "Click on the map to accurately pinpoint the lost location"}
                  </p>
               </div>

               {/* Right: Form Details */}
               <form onSubmit={handleSubmit} className="glass-card rounded-[2.5rem] p-8 sm:p-12 space-y-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
                  
                  <div className="space-y-6 relative z-10">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{t("form.whatLost")}</label>
                        <div className="relative">
                          <Tag className={cn("absolute top-4 text-muted-foreground", dir === 'rtl' ? 'right-4' : 'left-4')} size={18} />
                          <input 
                            required
                            type="text" 
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className={cn("w-full py-4 rounded-2xl border bg-background/50 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-medium", 
                              dir === 'rtl' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4'
                            )}
                            placeholder={t("form.placeholder.title")}
                          />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{t("form.category")}</label>
                          <select 
                            required
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className={cn("w-full px-4 py-4 rounded-2xl border bg-background/50 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-bold appearance-none",
                              dir === 'rtl' ? "text-right" : ""
                            )}
                          >
                            <option value="">{t("form.select")}</option>
                            <option value="electronics">{t("cat.electronics")}</option>
                            <option value="wallets">{t("cat.wallets")}</option>
                            <option value="keys">{t("cat.keys")}</option>
                            <option value="pets">{t("cat.pets")}</option>
                            <option value="bags">{t("cat.bags")}</option>
                            <option value="other">{t("cat.other")}</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{t("form.whenLost")}</label>
                          <div className="relative">
                            <Calendar className={cn("absolute top-4 text-muted-foreground pointer-events-none", dir === 'rtl' ? 'right-4' : 'left-4')} size={18} />
                            <input 
                              required
                              type="date" 
                              value={formData.date}
                              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                              className={cn("w-full py-4 rounded-2xl border bg-background/50 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-bold", 
                                dir === 'rtl' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4'
                              )}
                            />
                          </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{t("form.image")}</label>
                        <ImageUpload 
                          value={formData.imageUrl} 
                          onUpload={(url) => setFormData({ ...formData, imageUrl: url })} 
                          onRemove={() => setFormData({ ...formData, imageUrl: "" })} 
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{t("form.details")}</label>
                        <div className="relative">
                          <FileText className={cn("absolute top-4 text-muted-foreground", dir === 'rtl' ? 'right-4' : 'left-4')} size={18} />
                          <textarea 
                            required
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className={cn("w-full py-4 rounded-2xl border bg-background/50 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-none font-medium", 
                              dir === 'rtl' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4'
                            )}
                            placeholder={t("form.placeholder.details")}
                          ></textarea>
                        </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <div className="p-2 rounded-xl bg-secondary">
                          <ShieldAlert size={20} />
                        </div>
                        <p className="text-xs font-bold leading-tight">
                          {t("form.trust")}
                        </p>
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full sm:w-auto flex items-center justify-center gap-3 bg-primary text-white font-black py-4 px-10 rounded-2xl shadow-xl shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : t("form.submitLost")}
                        {!loading && <ArrowRight size={20} className={dir === 'rtl' ? 'rotate-180' : ''} />}
                    </button>
                  </div>
               </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
