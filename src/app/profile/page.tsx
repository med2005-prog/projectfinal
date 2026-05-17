"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { User, MapPin, Mail, Phone, Edit3, Star, Package, CheckCircle, Clock, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function ProfilePage() {
  const { t, dir, language } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const res = await fetch("/api/posts?author=me");
        const data = await res.json();
        if (data.success) {
          setPosts(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchUserPosts();
  }, [user]);

  if (authLoading || (user && loading)) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20 space-y-4" dir={dir}>
        <h2 className="text-2xl font-bold">{t("profile.loginRequired")}</h2>
        <Link href="/login" className="text-primary font-bold hover:underline">{t("auth.form.signIn")}</Link>
      </div>
    );
  }

  const stats = [
    { label: t("profile.stats.posts"), value: posts.length.toString(), icon: Package },
    { label: t("profile.stats.resolved"), value: "0", icon: CheckCircle },
    { label: t("profile.stats.rating"), value: "5.0", icon: Star },
    { label: t("profile.stats.days"), value: "1", icon: Clock },
  ];

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6" dir={dir}>
      {/* Profile Header Card */}
      <div className="glass-card rounded-3xl overflow-hidden">
        {/* Cover Banner */}
        <div className="h-28 bg-gradient-to-r from-blue-900 via-blue-700 to-primary relative">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
          />
        </div>

        <div className="px-6 pb-6">
          {/* Avatar + Edit */}
          <div className="flex items-end justify-between -mt-12 mb-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-blue-800 border-4 border-card flex items-center justify-center shadow-lg overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} className="w-full h-full object-cover" alt={user.name} />
                ) : (
                  <User size={40} className="text-white" />
                )}
              </div>
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 border-2 border-card rounded-full" />
            </div>
            <Link href="/settings" className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold hover:bg-secondary transition-colors">
              <Edit3 size={14} />
              {t("post.edit")}
            </Link>
          </div>

          {/* Info */}
          <h1 className="text-2xl font-extrabold tracking-tight">{user.name}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin size={14} className="text-primary" /> {language === 'ar' ? "أكادير، المغرب" : "Agadir, Morocco"}
            </span>
            <span className="flex items-center gap-1.5">
              <Mail size={14} className="text-primary" /> {user.email}
            </span>
            {user.phone && (
              <span className="flex items-center gap-1.5">
                <Phone size={14} className="text-primary" /> {user.phone}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="glass-card rounded-2xl p-5 text-center hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto mb-3">
              <s.icon size={20} />
            </div>
            <div className="text-2xl font-extrabold">{s.value}</div>
            <div className="text-xs text-muted-foreground font-bold mt-0.5 uppercase tracking-tight">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="glass-card rounded-3xl p-6">
        <h2 className="font-black text-lg mb-4">{language === 'ar' ? "النشاط الأخير" : "Recent Activity"}</h2>
        <div className="space-y-3">
          {posts.length > 0 ? posts.map((item) => (
            <Link
              key={item._id}
              href={`/my-posts`}
              className="flex items-center justify-between p-4 rounded-xl bg-secondary/40 hover:bg-secondary transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className={cn(
                  "px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0",
                  item.type === "lost"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-green-500/10 text-green-600"
                )}>
                  {item.type === "lost" ? t("post.lost") : t("post.found")}
                </span>
                <span className="text-sm font-bold line-clamp-1">{item.title}</span>
              </div>
              <div className={cn("flex items-center gap-3 shrink-0", dir === 'rtl' ? 'mr-3' : 'ml-3')}>
                <span className={cn(
                  "text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-tighter",
                  item.status === "active"
                    ? "bg-primary/10 text-primary"
                    : "bg-green-500/10 text-green-600"
                )}>
                  {item.status === 'active' ? t("common.active") : t("common.resolved")}
                </span>
                <span className="text-xs text-muted-foreground font-medium hidden sm:block">
                  {new Date(item.createdAt).toLocaleDateString(language)}
                </span>
              </div>
            </Link>
          )) : (
            <p className="text-center py-10 text-muted-foreground text-sm font-bold">{t("profile.noActivity")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
