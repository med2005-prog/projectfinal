"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { PostCard } from "@/components/PostCard";
import { Loader2, ArrowLeft, ArrowRight, Filter, Search as SearchIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { t, dir, language } = useLanguage();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPosts = async () => {
    try {
      const response = await fetch(`/api/posts?category=${slug}`);
      const data = await response.json();
      setPosts(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Map slug to readable name
    const categories: Record<string, string> = {
      electronics: t("cat.electronics"),
      wallets: t("cat.wallets"),
      keys: t("cat.keys"),
      pets: t("cat.pets"),
      bags: t("cat.bags"),
      other: t("cat.other")
    };
    setCategoryName(categories[slug] || slug.charAt(0).toUpperCase() + slug.slice(1));

    fetchPosts();
  }, [slug, t]);

  const filteredPosts = posts.filter((post: any) => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" dir={dir}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="space-y-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
          >
            <BackIcon size={16} />
            {t("common.back")}
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
               <Filter size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">{categoryName}</h1>
              <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest mt-1">
                {filteredPosts.length} {t("cat.foundCount")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <div className="relative">
              <SearchIcon className={cn("absolute top-1/2 -translate-y-1/2 text-muted-foreground", dir === 'rtl' ? "right-4" : "left-4")} size={16} />
              <input 
                type="text" 
                placeholder={t("topbar.search")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn("bg-secondary border-none rounded-2xl py-3 text-sm focus:ring-2 focus:ring-primary/50 w-full md:w-64", 
                  dir === 'rtl' ? "pr-11 pl-4" : "pl-11 pr-24"
                )}
              />
              <button className={cn("absolute top-1/2 -translate-y-1/2 px-4 py-1.5 bg-primary text-white text-[10px] font-black rounded-xl hover:opacity-90 transition-all shadow-sm",
                dir === 'rtl' ? "left-2" : "right-2"
              )}>
                {t("topbar.btnSearch")}
              </button>
           </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="animate-spin text-primary" size={48} />
          <p className="font-bold text-muted-foreground animate-pulse text-lg">Filtering results...</p>
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPosts.map((post: any) => (
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
              onDelete={fetchPosts}
            />
          ))}
        </div>
      ) : (
        <div className="bg-card border-2 border-dashed border-border/50 rounded-[3rem] p-20 text-center flex flex-col items-center gap-8 shadow-sm">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center text-muted-foreground/30">
            <SearchIcon size={48} />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-black tracking-tight">
              {t("cat.empty.title").replace("{category}", categoryName)}
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto text-lg">
              {t("cat.empty.desc")}
            </p>
          </div>
          <Link 
            href="/" 
            className="px-10 py-4 bg-primary text-white font-black rounded-2xl hover:opacity-90 transition-all shadow-2xl shadow-primary/20"
          >
            {t("sidebar.viewAll")}
          </Link>
        </div>
      )}
    </div>
  );
}
