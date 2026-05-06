"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Briefcase, MapPin, Star, ShieldCheck, ArrowRight, Building2, Store, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function BusinessesPage() {
  const { t, dir, language } = useLanguage();
  const [partners, setPartners] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [partnersRes, usersRes] = await Promise.all([
          fetch("/api/users?role=partner"),
          fetch("/api/users?role=user")
        ]);
        
        const partnersData = await partnersRes.json();
        const usersData = await usersRes.json();
        
        if (partnersData.success) setPartners(partnersData.data);
        if (usersData.success) setUsers(usersData.data.slice(0, 6)); // Show top 6 users
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12" dir={dir}>
      {/* Hero Section */}
      <div className="relative rounded-[2.5rem] overflow-hidden mb-16 bg-slate-950 text-white">
         <div className="absolute inset-0 opacity-40">
            <Image 
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop" 
              alt="Business Partners" 
              fill 
              className="object-cover"
            />
         </div>
         <div className="relative z-10 p-12 md:p-20 flex flex-col items-center text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black uppercase tracking-[0.2em] mb-6">
               <Briefcase size={14} className="text-primary" />
               {t("biz.title")}
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
               {t("biz.hero.title")}
            </h1>
            <p className="text-lg text-white/70 mb-10 font-medium">
               {t("biz.subtitle")}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
               <Link href="/signup?type=business" className="px-8 py-3 bg-primary text-white rounded-2xl font-black hover:opacity-90 transition-all shadow-xl shadow-primary/40">
                  {t("biz.hero.btnRegister")}
               </Link>
               <button className="px-8 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl font-black hover:bg-white/20 transition-all">
                  {t("biz.hero.howItWorks")}
               </button>
            </div>
         </div>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
         {[
           { icon: ShieldCheck, title: t("biz.card1.title"), desc: t("biz.card1.desc") },
           { icon: Store, title: t("biz.card2.title"), desc: t("biz.card2.desc") },
           { icon: Building2, title: t("biz.card3.title"), desc: t("biz.card3.desc") }
         ].map((feat, idx) => (
           <div key={idx} className="p-8 bg-card border rounded-[2rem] hover:border-primary/30 transition-all group">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                 <feat.icon size={24} />
              </div>
              <h3 className="text-lg font-black mb-2">{feat.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
           </div>
         ))}
      </div>

      {/* Partner List */}
      <div className="mb-20">
         <div className="flex flex-col sm:flex-row items-center justify-between mb-8 px-4 gap-4">
            <h2 className="text-2xl font-black tracking-tight">{t("biz.activePartners")}</h2>
            <Link href="/map" className="text-sm font-black text-primary hover:underline inline-flex items-center gap-1">
               {t("biz.viewMap")} <ArrowRight size={14} className={dir === 'rtl' ? 'rotate-180' : ''} />
            </Link>
         </div>
         {loading ? (
            <div className="flex justify-center py-20">
               <Loader2 className="animate-spin text-primary" size={40} />
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {partners.length > 0 ? partners.map((partner) => (
               <div key={partner._id} className="bg-card border rounded-3xl overflow-hidden group hover:shadow-2xl hover:shadow-primary/5 transition-all">
                  <div className="relative h-48">
                     <Image src={partner.avatar || "https://images.unsplash.com/photo-1577495508048-b635879837f1?q=80&w=400&auto=format&fit=crop"} alt={partner.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                     <div className="absolute top-4 left-4 bg-amber-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg">
                        {language === 'ar' ? 'شريك' : 'Partner'}
                     </div>
                  </div>
                  <div className="p-6">
                     <div className="flex items-center justify-between mb-2">
                        <h3 className="font-black text-lg group-hover:text-primary transition-colors">{partner.name}</h3>
                        <div className="flex items-center gap-1 text-amber-500 font-black text-sm">
                           <Star size={14} fill="currentColor" />
                           {partner.rating || "4.8"}
                        </div>
                     </div>
                     <div className="flex items-center gap-2 text-muted-foreground text-sm font-bold mb-6">
                        <MapPin size={14} />
                        {partner.city || (language === 'ar' ? 'أكادير' : 'Agadir')}, {language === 'ar' ? 'المغرب' : 'Morocco'}
                     </div>
                     <button className="w-full py-3 bg-secondary rounded-xl font-black text-sm hover:bg-primary hover:text-white transition-all">
                        {t("biz.contact")}
                     </button>
                  </div>
               </div>
               )) : (
                  <div className="col-span-1 md:col-span-3 py-10 text-center text-muted-foreground font-bold">
                     {t("biz.empty")}
                  </div>
               )}
            </div>
         )}
      </div>

      {/* Regular Users Section */}
      <div className="mb-12">
         <div className="mb-8 px-4">
            <h2 className="text-2xl font-black tracking-tight">{t("biz.activeCommunity")}</h2>
            <p className="text-muted-foreground text-sm font-medium mt-1">
               {t("biz.topContributors")}
            </p>
         </div>
         
         {loading ? (
            <div className="flex justify-center py-10">
               <Loader2 className="animate-spin text-primary/30" size={30} />
            </div>
         ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
               {users.map((user) => (
                  <div key={user._id} className="flex items-center gap-4 p-4 bg-secondary/20 rounded-2xl border border-transparent hover:border-primary/20 transition-all group">
                     <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center overflow-hidden border-2 border-white shrink-0">
                        {user.avatar ? (
                           <Image src={user.avatar} alt={user.name} width={64} height={64} className="object-cover w-full h-full" />
                        ) : (
                           <span className="text-xl font-black text-muted-foreground">{user.name.charAt(0)}</span>
                        )}
                     </div>
                     <div className="flex-1 min-w-0">
                        <h4 className="font-black text-base truncate group-hover:text-primary transition-colors">{user.name}</h4>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                           {language === 'ar' ? 'عضو موثق' : 'Verified Member'}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                           <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-md">
                              {language === 'ar' ? 'نشط' : 'Active'}
                           </span>
                           <span className="text-[10px] font-black text-muted-foreground">
                              {Math.floor(Math.random() * 20) + 5} {language === 'ar' ? 'مساعدة' : 'Helps'}
                           </span>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>
    </div>
  );
}
