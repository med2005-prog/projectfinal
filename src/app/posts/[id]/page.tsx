"use client";

import { useState, useEffect, use } from "react";
import { 
  MapPin, Clock, Tag, MessageCircle, Share2, 
  ShieldCheck, AlertTriangle, ChevronLeft, 
  Loader2, Zap, ArrowRight, User as UserIcon
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn, optimizeImage } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import dynamic from "next/dynamic";
import { PostCard } from "@/components/PostCard";

const MapArea = dynamic(() => import("@/components/MapArea"), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-secondary/20 animate-pulse rounded-[2rem]" />
});

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, dir, language } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  
  const [post, setPost] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchingLoading, setMatchingLoading] = useState(false);

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const res = await fetch(`/api/posts/${id}`);
        const data = await res.json();
        if (data.success) {
          setPost(data.data);
          fetchMatches(id);
        } else {
          router.push("/404");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
  }, [id, router]);

  const fetchMatches = async (postId: string) => {
    setMatchingLoading(true);
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId })
      });
      const data = await res.json();
      if (data.success) {
        setMatches(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMatchingLoading(false);
    }
  };

  const handleContact = async () => {
    if (!user) {
      router.push(`/login?redirect=/posts/${id}`);
      return;
    }
    
    try {
      const res = await fetch("/api/conversations/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: post.author._id, postId: post._id })
      });
      const data = await res.json();
      if (data.success) {
        router.push("/messages");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = language === 'ar' 
      ? `عاونونا نلقاو هاد المفقود/المعثور عليه: "${post.title}" فـ ${post.city}، المغرب. التفاصيل هنا: `
      : `Help us with this Lost/Found item: "${post.title}" in ${post.city}, Morocco. Details here: `;

    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert(language === 'ar' ? "تم نسخ رابط الإعلان بنجاح! " : "Link copied to clipboard! 🎉");
      } catch (err) {
        console.error("Failed to copy link:", err);
      }
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="animate-spin text-primary" size={40} />
      <p className="font-bold text-muted-foreground animate-pulse">
        {language === 'ar' ? "جاري تحميل التفاصيل..." : "Chargement des détails..."}
      </p>
    </div>
  );

  if (!post) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12" dir={dir}>
      {/* Back Button */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-bold transition-colors"
      >
        <ChevronLeft size={20} className={dir === 'rtl' ? 'rotate-180' : ''} />
        {t("common.back") || "Back"}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Left: Image and Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="relative aspect-video rounded-[3rem] overflow-hidden shadow-2xl bg-secondary border-4 border-white">
            {post.images?.[0] ? (
              <Image 
                src={optimizeImage(post.images[0], 1200)} 
                alt={post.title} 
                fill 
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-4">
                <Tag size={64} className="opacity-20" />
                <p className="font-bold">{language === 'ar' ? "لا توجد صورة متوفرة" : "Aucune image disponible"}</p>
              </div>
            )}
            
            <div className={cn("absolute top-6 z-10 flex gap-3", dir === 'rtl' ? 'right-6' : 'left-6')}>
               <span className={cn(
                 "px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl backdrop-blur-md",
                 post.type === "lost" ? "bg-destructive text-white" : "bg-green-500 text-white"
               )}>
                 {post.type === "lost" ? t("post.lost") : t("post.found")}
               </span>
               {post.boosted && (
                 <span className="px-4 py-2 rounded-2xl text-xs font-black bg-primary text-white shadow-xl flex items-center gap-2 animate-pulse">
                   <Zap size={14} fill="currentColor" /> {t("post.featured")}
                 </span>
               )}
            </div>
          </div>

          <div className="glass-card rounded-[3rem] p-8 sm:p-12 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{post.title}</h1>
                <div className="flex items-center gap-2 text-muted-foreground font-bold text-sm bg-secondary px-4 py-2 rounded-xl">
                  <Clock size={16} />
                  {formatDistanceToNow(new Date(post.createdAt || post.date), { addSuffix: true })}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("form.category")}</p>
                    <p className="font-bold text-primary">{post.category}</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("form.location")}</p>
                    <p className="font-bold">{post.city}</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {post.type === 'lost' ? t("form.whenLost") : t("form.whenFound")}
                    </p>
                    <p className="font-bold">
                      {new Date(post.date).toLocaleDateString(language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("form.status")}</p>
                    <p className={cn("font-bold", post.status === 'active' ? "text-green-500" : "text-muted-foreground")}>
                      {post.status.toUpperCase()}
                    </p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("form.views")}</p>
                    <p className="font-bold">{post.views || 0}</p>
                 </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-xl font-black flex items-center gap-2">
                   <Tag size={20} className="text-primary" />
                   {t("form.details")}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-wrap">
                  {post.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-4 pt-6">
                 <button 
                  onClick={handleContact}
                  className="flex-1 min-w-[200px] flex items-center justify-center gap-3 bg-primary text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all"
                 >
                    <MessageCircle size={22} />
                    {t("post.contact")}
                 </button>
                 <button onClick={handleShare} className="p-4 bg-secondary rounded-2xl hover:bg-secondary/80 transition-all active:scale-95" title={language === 'ar' ? "مشاركة" : "Share"}>
                    <Share2 size={22} />
                 </button>
              </div>
            </div>
          </div>

          {/* Map Location */}
          <div className="space-y-4">
             <h3 className="text-2xl font-black px-4">{t("form.location") || "Location"}</h3>
             <div className="h-[400px] w-full rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white relative">
                <MapArea items={[post]} initialCenter={post.locationPoint?.coordinates ? { lat: post.locationPoint.coordinates[1], lng: post.locationPoint.coordinates[0] } : undefined} />
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-6 py-2 rounded-2xl shadow-xl font-black text-sm flex items-center gap-2 z-[400]">
                   <MapPin size={16} className="text-primary" />
                   {post.location}
                </div>
             </div>
          </div>
        </div>

        {/* Right: Author and Matches */}
        <div className="space-y-8 lg:sticky lg:top-8">
           {/* Author Card */}
           <div className="glass-card rounded-[2.5rem] p-8 border-primary/10 shadow-xl space-y-6">
              <div className="flex items-center gap-4">
                 <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center overflow-hidden border-2 border-white shadow-lg relative">
                    {post.author?.avatar ? (
                      <Image src={post.author.avatar} alt={post.author.name || "User"} fill className="object-cover" />
                    ) : (
                      <UserIcon size={32} className="text-muted-foreground" />
                    )}
                 </div>
                 <div>
                    <h4 className="font-black text-lg flex items-center gap-2">
                       {post.author?.name || (language === 'ar' ? "مستخدم النظام" : "Utilisateur System")}
                       {post.author?.isVerified && <ShieldCheck size={18} className="text-primary" fill="currentColor" />}
                    </h4>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                       {language === 'ar' ? "عضو منذ " : "Member since "} 
                       {new Date(post.author?.createdAt || Date.now()).getFullYear()}
                    </p>
                 </div>
              </div>
              <div className="pt-6 border-t flex items-center gap-3 text-muted-foreground">
                 <AlertTriangle size={18} className="text-amber-500" />
                 <p className="text-xs font-bold leading-tight">
                    {t("post.safetyWarning")}
                 </p>
              </div>
           </div>

           {/* Matches Section */}
           <div className="space-y-6">
              <div className="flex items-center justify-between px-4">
                <h3 className="text-xl font-black tracking-tight">
                   {t("post.potentialMatches")}
                </h3>
                {matchingLoading && <Loader2 className="animate-spin text-primary" size={16} />}
              </div>

              <div className="space-y-4">
                 {matches.length > 0 ? matches.map((match) => (
                    <div key={match._id} className="group cursor-pointer" onClick={() => router.push(`/posts/${match._id}`)}>
                       <div className="bg-card border rounded-3xl p-4 flex gap-4 hover:border-primary/40 transition-all shadow-sm hover:shadow-lg">
                          <div className="w-20 h-20 rounded-2xl bg-secondary relative overflow-hidden shrink-0">
                             {match.images?.[0] && <Image src={match.images[0]} alt={match.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />}
                          </div>
                          <div className="flex-1 min-w-0 py-1">
                             <h4 className="font-black text-sm line-clamp-1 group-hover:text-primary transition-colors">{match.title}</h4>
                             <p className="text-[10px] text-muted-foreground font-bold mt-1 uppercase">{match.category}</p>
                             <div className="flex items-center justify-between mt-2">
                                <span className="text-[10px] font-black text-primary flex items-center gap-1">
                                   <MapPin size={10} /> {match.city}
                                </span>
                                <ArrowRight size={12} className={cn("text-muted-foreground group-hover:text-primary transition-colors", dir === 'rtl' ? 'rotate-180' : '')} />
                             </div>
                          </div>
                       </div>
                    </div>
                 )) : !matchingLoading && (
                    <div className="bg-secondary/30 rounded-3xl p-8 text-center border-2 border-dashed">
                       <p className="text-xs font-bold text-muted-foreground leading-relaxed">
                          {language === 'ar' 
                            ? "لا توجد نتائج مطابقة حالياً. سنقوم بإشعارك فور توفرها!" 
                            : "No matches found yet. We'll notify you once a match is available!"}
                       </p>
                    </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
