"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSearchParams } from "next/navigation";
import { PlusCircle, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { PostCard } from "@/components/PostCard";

export default function MyPostsPage() {
  const { t, dir, language } = useLanguage();
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");


  const fetchMyPosts = async () => {
    try {
      const response = await fetch("/api/posts?author=me");
      const data = await response.json();
      setPosts(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8" dir={dir}>
      {success && (
        <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-600 animate-in slide-in-from-top-4 duration-500">
          <CheckCircle2 size={24} />
          <div className="font-bold">
            {language === 'ar' ? "تم تفعيل الترويج بنجاح! 🎉" : "Boost activated successfully! 🎉"}
          </div>
        </div>
      )}
      
      {canceled && (
        <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-center gap-3 text-destructive animate-in slide-in-from-top-4 duration-500">
          <AlertCircle size={24} />
          <div className="font-bold">
            {language === 'ar' ? "تم إلغاء عملية الدفع." : "Payment was canceled."}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">

        <div>
          <h1 className="text-3xl font-black tracking-tight">{t("nav.myPosts")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("myPosts.subtitle")}
          </p>
        </div>
        <Link 
          href="/report/lost" 
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
        >
          <PlusCircle size={20} />
          {t("hero.btnLost")}
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="font-bold text-muted-foreground animate-pulse">
            {language === 'ar' ? "جاري تحميل تقاريرك..." : "Loading your reports..."}
          </p>
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post: any) => (
            <PostCard 
              key={post._id} 
              id={post._id}
              type={post.type}
              title={post.title}
              description={post.description}
              location={post.location}
              date={new Date(post.date)}
              category={post.category}
              imageUrl={post.images?.[0]}
              author={post.author}
              boosted={post.boosted}
              onDelete={fetchMyPosts}
            />
          ))}
        </div>
      ) : (
        <div className="bg-card border rounded-3xl p-12 text-center flex flex-col items-center gap-6 shadow-sm">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
            <AlertCircle size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold">
              {language === 'ar' ? "لا توجد بلاغات نشطة" : "No active reports found"}
            </h2>
            <p className="text-muted-foreground max-w-sm">
              {language === 'ar' 
                ? "لم تقم بالإبلاغ عن أي عناصر مفقودة أو معثور عليها بعد. بلاغاتك النشطة ستظهر هنا."
                : "You haven't reported any lost or found items yet. Your active reports will appear here."}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
             <Link href="/report/lost" className="px-6 py-2.5 bg-secondary font-bold rounded-xl hover:bg-secondary/80 transition-colors">
               {t("nav.reportLost")}
             </Link>
             <Link href="/report/found" className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-colors">
               {t("nav.reportFound")}
             </Link>
          </div>
        </div>
      )}
    </div>
  );
}
