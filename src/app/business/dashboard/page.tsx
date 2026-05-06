"use client";

import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  PlusCircle, 
  Eye, 
  MousePointer2, 
  CheckCircle, 
  Package, 
  Settings,
  MoreVertical,
  Zap,
  Loader2
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function BusinessDashboard() {
  const { t, dir, language } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinessPosts = async () => {
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
    if (user) fetchBusinessPosts();
  }, [user]);

  if (authLoading || (user && loading)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!user || user.role !== "partner") {
    return (
      <div className="flex flex-col h-screen items-center justify-center space-y-4" dir={dir}>
        <h2 className="text-2xl font-bold">{t("dash.accessDenied")}</h2>
        <p>{t("dash.businessOnly")}</p>
        <Link href="/" className="text-primary hover:underline font-bold">{t("comingSoon.goHome")}</Link>
      </div>
    );
  }

  const stats = [
    { label: t("dash.totalPosts"), value: posts.length.toString(), icon: Package, color: "text-blue-500" },
    { label: t("dash.totalViews"), value: "0", icon: Eye, color: "text-primary" },
    { label: t("dash.totalClicks"), value: "0", icon: MousePointer2, color: "text-secondary-500" },
    { label: t("dash.returnedItems"), value: "0", icon: CheckCircle, color: "text-green-500" },
  ];

  return (
    <div className="flex min-h-screen bg-secondary/30 rounded-3xl overflow-hidden" dir={dir}>
      {/* Sidebar */}
      <aside className="w-64 bg-background border-r border-border p-6 hidden lg:block">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
            <Zap size={24} fill="currentColor" />
          </div>
          <span className="font-black text-xl tracking-tight">{t("dash.title")}</span>
        </div>

        <nav className="space-y-1">
          {[
            { id: "overview", label: t("dash.overview"), icon: LayoutDashboard },
            { id: "posts", label: t("dash.managePosts"), icon: Package },
            { id: "settings", label: t("nav.settings"), icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                activeTab === item.id 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:bg-secondary"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight capitalize">
              {activeTab === 'overview' ? t("dash.overview") : activeTab === 'posts' ? t("dash.managePosts") : t("nav.settings")}
            </h1>
            <p className="text-muted-foreground font-bold">
              {t("dash.manageDesc")}
            </p>
          </div>
          <Link 
            href="/report/found"
            className="flex items-center gap-2 bg-primary text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            <PlusCircle size={20} />
            {t("dash.postNew")}
          </Link>
        </header>

        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="glass-card p-6 rounded-3xl space-y-4">
                  <div className={cn("p-3 rounded-2xl w-fit bg-secondary/50", stat.color)}>
                    <stat.icon size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-black">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Posts Table */}
            <div className="glass-card rounded-[2.5rem] overflow-hidden">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h3 className="font-bold">{t("dash.recentPosts")}</h3>
                <button className="text-sm font-bold text-primary">{t("dash.viewAll")}</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left" dir={dir}>
                  <thead className="bg-secondary/50 text-xs font-black uppercase text-muted-foreground">
                    <tr>
                      <th className={cn("px-6 py-4", dir === 'rtl' ? 'text-right' : 'text-left')}>{t("common.title")}</th>
                      <th className={cn("px-6 py-4", dir === 'rtl' ? 'text-right' : 'text-left')}>{t("form.views")}</th>
                      <th className={cn("px-6 py-4", dir === 'rtl' ? 'text-right' : 'text-left')}>{t("form.status")}</th>
                      <th className={cn("px-6 py-4", dir === 'rtl' ? 'text-left' : 'text-right')}>{t("common.actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {posts.slice(0, 5).map((post) => (
                      <tr key={post._id} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-6 py-4 font-bold">{post.title}</td>
                        <td className="px-6 py-4 text-sm font-medium">0</td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2 py-1 rounded-md text-[10px] font-black uppercase",
                            post.status === "active" ? "bg-green-500/10 text-green-600" : "bg-blue-500/10 text-blue-600"
                          )}>
                            {post.status === 'active' ? t("common.active") : t("common.resolved")}
                          </span>
                        </td>
                        <td className={cn("px-6 py-4", dir === 'rtl' ? 'text-left' : 'text-right')}>
                          <button className="text-muted-foreground hover:text-foreground">
                            <MoreVertical size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {posts.length === 0 && (
                <div className="text-center py-10 text-muted-foreground text-sm font-bold">
                  {t("dash.noPosts")}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
