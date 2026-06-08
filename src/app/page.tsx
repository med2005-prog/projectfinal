"use client";

import { useState } from "react";
import { PostCard } from "@/components/PostCard";
import { Search, PlusCircle, Loader2, AlertCircle, Map as MapIcon, List, MapPin } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { usePosts } from "@/hooks/usePosts";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const MapArea = dynamic(() => import("@/components/MapArea"), { 
  ssr: false,
  loading: () => <div className="h-[500px] w-full bg-secondary/20 animate-pulse rounded-[2.5rem] flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>
});

export default function Home() {
  const { t, dir } = useLanguage();
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<"all" | "lost" | "found">("all");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  
  // Proximity filter state
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const searchRadius = 50; // km

  const searchQuery = searchParams.get("q") || "";
  
  const { posts, loading, error, refetch } = usePosts({ 
    type: filter,
    q: searchQuery,
    ...(userLocation ? { lat: userLocation.lat, lng: userLocation.lng, radius: searchRadius } : {})
  });

  const toggleLocation = () => {
    if (userLocation) {
      setUserLocation(null);
      return;
    }
    
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLocating(false);
        },
        (error) => {
          console.error("Error getting location", error);
          alert(t("feed.locationError") || "Could not get your location. Please check permissions.");
          setIsLocating(false);
        }
      );
    } else {
      alert(t("feed.locationNotSupported") || "Geolocation is not supported by your browser");
      setIsLocating(false);
    }
  };

  return (
    <div className="space-y-8 pb-10 p-4 md:p-0" dir={dir}>
      {/* Hero Section */}
      <section className="relative rounded-3xl bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500 p-8 sm:p-12 overflow-hidden shadow-xl text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl" />
        
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            {t("hero.title")}
          </h1>
          <p className="text-primary-50 text-lg md:text-xl mb-8 max-w-xl">
            {t("hero.subtitle")}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/report/lost" 
              className="flex items-center justify-center gap-2 bg-white text-primary-900 hover:bg-primary-50 font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <Search size={20} />
              {t("hero.btnLost")}
            </Link>
            <Link 
              href="/report/found" 
              className="flex items-center justify-center gap-2 bg-black/20 hover:bg-black/30 backdrop-blur-md text-white border border-white/20 font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <PlusCircle size={20} />
              {t("hero.btnFound")}
            </Link>
          </div>
        </div>
      </section>

      {/* Main Feed Header & Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-black tracking-tight">{t("feed.title")}</h2>
        
        <div className="flex items-center gap-4 w-full sm:w-auto flex-wrap">
          {/* Near Me Button */}
          <button
            onClick={toggleLocation}
            disabled={isLocating}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm",
              userLocation 
                ? "bg-emerald-500 text-white shadow-emerald-500/20" 
                : "bg-white text-primary hover:bg-secondary border border-primary/10"
            )}
          >
            {isLocating ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
            {dir === 'rtl' ? "قريب مني" : "Near Me"}
          </button>

          {/* View Toggle */}
          <div className="flex p-1 bg-secondary rounded-xl">
            <button 
              onClick={() => setViewMode("list")}
              className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")}
            >
              <List size={20} />
            </button>
            <button 
              onClick={() => setViewMode("map")}
              className={cn("p-2 rounded-lg transition-all", viewMode === 'map' ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")}
            >
              <MapIcon size={20} />
            </button>
          </div>

          <div className="flex gap-2 bg-secondary/50 p-1 rounded-xl">
            {(["all", "lost", "found"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-1.5 text-xs font-black rounded-lg transition-all uppercase tracking-wider",
                  filter === f
                    ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                    : "text-muted-foreground hover:bg-secondary"
                )}
              >
                {f === "all" ? t("feed.filter.all") : f === "lost" ? t("feed.filter.lost") : t("feed.filter.found")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Posts Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-bold animate-pulse">{t("feed.loading")}</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-destructive bg-destructive/5 rounded-3xl border border-destructive/10">
          <AlertCircle className="w-12 h-12" />
          <p className="font-bold text-lg">{error}</p>
          <button 
            onClick={() => refetch()}
            className="px-6 py-2 bg-destructive text-white rounded-xl font-bold hover:opacity-90"
          >
            {t("feed.tryAgain")}
          </button>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-[2.5rem] border-dashed border-2">
          <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
             <Search size={32} />
          </div>
          <p className="text-muted-foreground text-xl font-bold">{t("feed.empty")}</p>
        </div>
      ) : viewMode === 'map' ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="h-[600px] w-full rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border-2 md:border-4 border-white"
        >
          <MapArea items={posts} />
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard 
              key={post._id} 
              id={post._id}
              type={post.type}
              title={post.title}
              description={post.description}
              location={post.location}
              date={new Date(post.createdAt || post.date)}
              category={post.category}
              imageUrl={post.images[0]}
              author={post.author}
              boosted={post.boosted}
              onDelete={refetch}
            />
          ))}
        </div>
      )}
    </div>
  );
}
