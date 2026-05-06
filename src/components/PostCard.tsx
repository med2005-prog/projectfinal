"use client";

import { MapPin, Clock, MoreHorizontal, MessageCircle, Trash2, Edit, Zap, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar, fr, enUS } from "date-fns/locale";
import { cn, optimizeImage } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { BoostPricing } from "./BoostPricing";
import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";

interface PostCardProps {
  id: string;
  type: "lost" | "found";
  title: string;
  description: string;
  location: string;
  date: Date;
  category: string;
  imageUrl?: string;
  author: {
    _id?: string;
    name: string;
    avatar?: string;
    isVerified?: boolean;
    role?: "user" | "partner";
    isPremium?: boolean;
  };
  boosted?: boolean;
  boostType?: string;
  onDelete?: () => void;
}

export function PostCard({
  id,
  type,
  title,
  description,
  location,
  date,
  category,
  imageUrl,
  author,
  boosted,
  boostType,
  onDelete
}: PostCardProps) {
  const { t, dir, language } = useLanguage();
  const { user } = useAuth();
  const locale = language === 'ar' ? ar : language === 'fr' ? fr : enUS;
  const [showActions, setShowActions] = useState(false);
  const [showBoost, setShowBoost] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Resolve the active plan from either field (new boostPlan or legacy boostType)
  const activePlan = (boostType as string) || "";
  const isPremiumPost = activePlan === "premium";
  const isProPost     = activePlan === "pro";
  const isStarterPost = activePlan === "starter";

  const isOwner = user?._id === author?._id;
  const isPartner = author?.role === "partner";

  const handleDelete = async () => {
    if (!confirm(t("post.deleteConfirm"))) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (res.ok) onDelete?.();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className={cn(
        "glass-card rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group relative",
        (boosted || isPartner) && "ring-2 ring-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.15)] bg-amber-50/[0.02]",
        isDeleting && "opacity-50 grayscale pointer-events-none"
      )} dir={dir}>
        
        {/* Animated Shine for Boosted Posts */}
        {boosted && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-0">
            <motion.div 
              animate={{ x: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear", repeatDelay: 1 }}
              className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
            />
          </div>
        )}

        {/* Header Info */}
        <div className="p-4 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden border border-border relative">
              {author?.avatar ? (
                <Image src={author.avatar} alt={author.name || "User"} width={40} height={40} className="object-cover w-full h-full" />
              ) : (
                <span className="font-bold text-muted-foreground">{(author?.name || "U").charAt(0)}</span>
              )}
              {(author?.isVerified || isPartner) && (
                <div className={cn(
                  "absolute -bottom-1 -right-1 p-0.5 rounded-full border-2 border-white",
                  isPartner ? "bg-amber-500" : "bg-primary"
                )}>
                  <Zap size={8} className="text-white" fill="currentColor" />
                </div>
              )}
            </div>
            <div>
              <h4 className="text-sm font-bold flex items-center gap-1">
                {author?.name || "System User"}
                {(boosted || isPartner) && <Zap size={14} className={cn("fill-current", isPartner ? "text-amber-500" : "text-amber-400")} />}
              </h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {formatDistanceToNow(new Date(date), { addSuffix: true, locale })}
                </span>
                {isPartner && (
                  <span className="text-amber-600 font-bold flex items-center gap-1">
                    <Briefcase size={10} /> {language === 'ar' ? 'شريك موثوق' : 'Trusted Partner'}
                  </span>
                )}
              </div>
            </div>
          </div>
          {isOwner && (
            <div className="relative">
              <button 
                onClick={() => setShowActions(!showActions)}
                className="text-muted-foreground hover:bg-secondary p-2 rounded-full transition-colors"
              >
                <MoreHorizontal size={18} />
              </button>
              
              {showActions && (
                <div className={cn(
                  "absolute top-full mt-1 w-36 bg-background border border-border rounded-xl shadow-2xl z-50 overflow-hidden p-1",
                  dir === 'rtl' ? 'left-0' : 'right-0'
                )}>
                  <button 
                    onClick={() => { setShowBoost(true); setShowActions(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-primary hover:bg-primary/5 rounded-lg transition-colors"
                  >
                    <Zap size={14} className="fill-primary" /> {t("sidebar.boost.btn")}
                  </button>
                  <button 
                    onClick={() => { window.location.href = `/edit-post/${id}`; }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary rounded-lg transition-colors"
                  >
                    <Edit size={14} /> {t("post.edit")}
                  </button>
                  <div className="h-px bg-border my-1" />
                  <button 
                    onClick={handleDelete}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} /> {t("post.delete")}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Image (if any) */}
        {imageUrl && (
          <Link href={`/posts/${id}`} className="block w-full h-48 sm:h-64 relative bg-secondary overflow-hidden">
            <Image 
              src={optimizeImage(imageUrl, 600)} 
              alt={title} 
              fill 
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={boosted}
              className="object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            {/* Badges */}
            <div className={cn("absolute top-3 z-10 flex flex-wrap gap-2", dir === "rtl" ? "right-3" : "left-3")}>
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-black shadow-sm backdrop-blur-md",
                type === "lost" 
                  ? "bg-destructive/90 text-destructive-foreground" 
                  : "bg-green-500/90 text-white"
              )}>
                {type === "lost" ? t("post.lost") : t("post.found")}
              </span>
              {(boosted || isPartner) && (
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-black shadow-lg flex items-center gap-1 animate-pulse text-white",
                  isPartner ? "bg-amber-500" : "bg-primary"
                )}>
                  <Zap size={12} fill="currentColor" /> {isPartner ? t("biz.partner") : t("post.featured")}
                </span>
              )}
              {isPremiumPost && (
                <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-white shadow-lg">
                  {t("post.urgent")}
                </span>
              )}
              {isProPost && (
                <span className="px-3 py-1 rounded-full text-xs font-black bg-violet-600 text-white shadow-lg">
                  PRO
                </span>
              )}
            </div>
          </Link>
        )}

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-4 mb-2">
            <Link href={`/posts/${id}`}>
              <h3 className="font-extrabold text-lg leading-tight line-clamp-1 hover:text-primary transition-colors">{title}</h3>
            </Link>

            {!imageUrl && boosted && (
              <Zap size={18} className="text-primary fill-primary shrink-0" />
            )}
          </div>
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
            {description}
          </p>

          {/* Footer info & Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold bg-secondary text-secondary-foreground px-2 py-1 rounded-md w-fit">
                {category}
              </span>
              <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <MapPin size={12} className="text-primary" />
                {location}
              </span>
            </div>

            <button 
              onClick={async () => {
                try {
                  const res = await fetch("/api/conversations/start", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ receiverId: author?._id, postId: id })
                  });
                  const data = await res.json();
                  if (data.success) {
                    window.location.href = "/messages";
                  }
                } catch (err) {
                  console.error(err);
                }
              }}
              className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95"
            >
              <MessageCircle size={16} />
              {t("post.contact")}
            </button>
          </div>
        </div>
      </div>

      {/* Boost Modal */}
      {showBoost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-background w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl relative p-8 sm:p-12">
            <button 
              onClick={() => setShowBoost(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-secondary transition-colors"
            >
              <X size={24} />
            </button>
            <BoostPricing 
              postId={id} 
              onSuccess={() => { setShowBoost(false); window.location.reload(); }} 
              onCancel={() => setShowBoost(false)} 
            />
          </div>
        </div>
      )}
    </>
  );
}
