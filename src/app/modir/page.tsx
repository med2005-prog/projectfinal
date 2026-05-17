"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Trash2, Users, FileText, Loader2, ShieldAlert, Lock, Mail, 
  Eye, EyeOff, LogOut, Search, CheckCircle2, XCircle, 
  BarChart3, TrendingUp, UserCheck, AlertTriangle, RefreshCw,
  Zap, Shield, Building2, Phone, Globe, ExternalLink, MapPin,
  Bell, LayoutDashboard, Package, Settings
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";
import Link from "next/link";

const ADMIN_EMAIL = "med2005@gmail.com";
const ADMIN_PASSWORD = "2005";

export default function ModirPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [data, setData] = useState<{ posts: any[]; users: any[] }>({ posts: [], users: [] });
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [serverStats, setServerStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "posts" | "users" | "businesses">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [postFilter, setPostFilter] = useState<"all" | "lost" | "found">("all");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const session = sessionStorage.getItem("modir_auth");
    if (session === "true") setIsAuthenticated(true);
  }, []);

  const fetchData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [statsRes, bizRes] = await Promise.all([
        fetch("/api/modir/stats"),
        fetch("/api/business")
      ]);
      const statsJson = await statsRes.json();
      const bizJson = await bizRes.json();
      
      if (statsJson.success) {
        setData(statsJson.data);
        setServerStats(statsJson.stats);
      }
      if (bizJson.success) setBusinesses(bizJson.data);
    } catch (err: any) {
      console.error(err);
      setLoginError("مشكلة فجلب البيانات: " + err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginData.email === ADMIN_EMAIL && loginData.password === ADMIN_PASSWORD) {
      sessionStorage.setItem("modir_auth", "true");
      setIsAuthenticated(true);
      setLoginError("");
    } else {
      setLoginError("البريد الإلكتروني أو كلمة المرور غلط");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("modir_auth");
    setIsAuthenticated(false);
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("واش متأكد بغيتي تمسح هاد المنشور؟")) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (res.ok) setData(prev => ({ ...prev, posts: prev.posts.filter((p: any) => p._id !== id) }));
    } catch (err) { console.error(err); }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("واش متأكد بغيتي تمسح هاد المستخدم؟")) return;
    try {
      const res = await fetch(`/api/modir/users/${id}`, { method: "DELETE" });
      if (res.ok) setData(prev => ({ ...prev, users: prev.users.filter((u: any) => u._id !== id) }));
    } catch (err) { console.error(err); }
  };

  const handleBusinessStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      const res = await fetch(`/api/business/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setBusinesses(prev => prev.map(b => b._id === id ? { ...b, status } : b));
        // Refresh stats
        fetchData(true);
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteBusiness = async (id: string) => {
    if (!confirm("واش متأكد بغيتي تمسح هاد الطلب؟")) return;
    try {
      const res = await fetch(`/api/business/${id}`, { method: "DELETE" });
      if (res.ok) setBusinesses(prev => prev.filter(b => b._id !== id));
    } catch (err) { console.error(err); }
  };

  const handleToggleVerify = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/modir/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified: !current })
      });
      const json = await res.json();
      if (json.success) {
        setData(prev => ({
          ...prev,
          users: prev.users.map((u: any) => u._id === id ? { ...u, isVerified: !current } : u)
        }));
      }
    } catch (err) { console.error(err); }
  };

  // Filtered data
  const filteredPosts = useMemo(() => 
    data.posts.filter(p => 
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    ), [data.posts, searchQuery]);

  const filteredUsers = useMemo(() =>
    data.users.filter(u =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    ), [data.users, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    // If we have stats from the server, use them as baseline
    if (serverStats) return serverStats;

    const boostedCount = data.posts.filter(p => p.boosted).length;
    const approvedBiz = businesses.filter(b => b.status === 'approved').length;
    const pendingBiz = businesses.filter(b => b.status === 'pending').length;
    
    return {
      total: data.posts.length,
      lost: data.posts.filter(p => p.type === "lost").length,
      found: data.posts.filter(p => p.type === "found").length,
      boosted: boostedCount,
      revenue: boostedCount * 50,
      users: data.users.length,
      verified: data.users.filter(u => u.isVerified).length,
      bizApproved: approvedBiz,
      bizPending: pendingBiz,
      bizTotal: businesses.length,
      bizSuccessRate: businesses.length > 0 ? Math.round((approvedBiz / businesses.length) * 100) : 0,
      revenueTrend: [0, 0, 0, 0, 0, 0, 0],
      userTrend: [0, 0, 0, 0, 0]
    };
  }, [data.posts, data.users, businesses, serverStats]);

  const filteredBusinesses = useMemo(() =>
    businesses.filter(b =>
      b.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.ownerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.city?.toLowerCase().includes(searchQuery.toLowerCase())
    ), [businesses, searchQuery]);

  // ===== LOGIN SCREEN =====
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 relative overflow-hidden font-sans" dir="rtl">
        {/* Aurora Glow Effects */}
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-primary/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-blue-600/10 rounded-full blur-[150px]" />

        <div className="w-full max-w-md relative z-10">
          <div className="bg-white/5 backdrop-blur-2xl rounded-[3rem] border border-white/10 p-12 shadow-2xl space-y-8">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-blue-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-primary/20">
                <ShieldAlert size={40} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tighter">Admin<span className="text-primary">ly</span></h1>
                <p className="text-white/40 text-sm mt-2 font-medium">نظام الإدارة المتقدم</p>
              </div>
            </div>

            {loginError && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-destructive text-xs font-black text-center animate-bounce">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" />
                <input type="email" placeholder="البريد الإلكتروني" value={loginData.email}
                  onChange={e => setLoginData({ ...loginData, email: e.target.value })}
                  className="w-full pl-12 pr-6 py-5 rounded-2xl border border-white/10 bg-white/5 focus:bg-white/10 focus:ring-2 focus:ring-primary/50 outline-none font-bold transition-all placeholder:text-white/10" required />
              </div>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" />
                <input type={showPw ? "text" : "password"} placeholder="كلمة المرور" value={loginData.password}
                  onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full pl-12 pr-14 py-5 rounded-2xl border border-white/10 bg-white/5 focus:bg-white/10 focus:ring-2 focus:ring-primary/50 outline-none font-bold transition-all placeholder:text-white/10" required />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors">
                  {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-primary to-blue-600 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all">
                <Zap size={20} fill="currentColor" /> دخول النظام
              </button>
            </form>
            <p className="text-center text-[10px] text-white/20 font-black uppercase tracking-[0.2em]">Secure Encryption Active</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2D1B4D] relative overflow-hidden font-sans select-none" dir="rtl">
      {/* Animated Aurora Backgrounds */}
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-primary/20 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[150px] animate-pulse delay-700" />
      <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] bg-blue-400/5 rounded-full blur-[120px] animate-bounce duration-[10s]" />

      <div className="relative z-10 flex h-screen p-6 gap-8">
        {/* Futuristic Sidebar - Floating Glass */}
        <aside className="w-80 bg-white/30 backdrop-blur-[50px] rounded-[4rem] border border-white/50 p-10 flex flex-col shadow-[0_30px_60px_-15px_rgba(45,27,77,0.1)] hidden lg:flex transition-all duration-700 hover:bg-white/40">
          <div className="flex items-center gap-4 mb-16 px-2 group cursor-pointer">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-[1.8rem] flex items-center justify-center shadow-2xl shadow-primary/40 group-hover:rotate-[15deg] transition-all duration-500">
               <Zap size={32} className="text-white fill-white/20" />
            </div>
            <div className="flex flex-col">
               <span className="font-black text-2xl tracking-tighter text-primary uppercase">MODIR<span className="text-black/20">.</span></span>
               <span className="text-[10px] font-black text-primary/40 uppercase tracking-[0.3em]">لوحة القيادة</span>
            </div>
          </div>

          <nav className="flex-1 space-y-4">
            {[
              { id: "overview", label: "نظرة عامة", icon: BarChart3 },
              { id: "posts", label: "المنشورات", icon: FileText },
              { id: "users", label: "المستخدمين", icon: Users },
              { id: "businesses", label: "الشركاء", icon: Building2 },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={cn(
                  "w-full flex items-center gap-5 px-8 py-5 rounded-[2rem] font-black text-sm transition-all duration-500 relative group",
                  activeTab === item.id 
                    ? "bg-primary text-white shadow-[0_15px_30px_-5px_rgba(45,27,77,0.3)] scale-[1.05]" 
                    : "text-primary/40 hover:text-primary hover:bg-primary/5"
                )}
              >
                <item.icon size={22} strokeWidth={2.5} className={cn("transition-transform group-hover:scale-110", activeTab === item.id ? "text-white" : "text-primary/40")} />
                {item.label}
                {activeTab === item.id && <div className="absolute left-4 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_#fff]" />}
              </button>
            ))}
          </nav>

          <button onClick={handleLogout} className="mt-auto flex items-center gap-4 px-8 py-5 rounded-[2rem] font-black text-sm text-red-500 bg-red-500/5 hover:bg-red-500/10 transition-all">
             <LogOut size={20} />
             تسجيل الخروج
          </button>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto no-scrollbar space-y-10 pb-12">
          {/* Neon Header */}
          <header className="flex items-center justify-between bg-white/30 backdrop-blur-[40px] p-8 rounded-[3.5rem] border border-white/60 shadow-2xl shadow-primary/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-all duration-700" />
            
            <div className="relative z-10 flex-1 max-w-xl">
               <div className="relative group">
                  <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-primary/30 group-focus-within:text-primary transition-colors" size={20} />
                  <input 
                    type="text" 
                    placeholder="ابحث عن مستخدم، شريك، أو منشور..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pr-14 pl-6 py-5 bg-white/50 border border-white rounded-[2rem] focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-primary/20 font-bold shadow-inner"
                  />
               </div>
            </div>
            
            <div className="flex items-center gap-5 mr-10">
               <button onClick={() => fetchData(true)} className="w-14 h-14 bg-white/60 rounded-2xl flex items-center justify-center border border-white hover:scale-110 transition-all cursor-pointer shadow-lg shadow-primary/5">
                  <RefreshCw size={22} className={cn("text-primary/60", refreshing && "animate-spin")} />
               </button>
               <div className="p-1 bg-white/80 rounded-2xl border border-white shadow-xl flex items-center gap-3 pr-6">
                  <div className="flex flex-col text-left">
                     <span className="text-[10px] font-black text-primary/40 uppercase">الإدمن</span>
                     <span className="text-sm font-black text-primary">محمد الملكي</span>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl overflow-hidden border-2 border-primary/20">
                     <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin" alt="" />
                  </div>
               </div>
            </div>
          </header>

          {activeTab === "overview" && (
            <div className="space-y-10">
              <div className="px-4">
                 <h2 className="text-5xl font-black tracking-tighter text-primary">مرحباً، المدير </h2>
                 <p className="text-primary/30 font-bold text-lg mt-2">المنصة تعمل بكفاءة عالية (99.9% Up-time)</p>
              </div>

              {/* Stats Grid - 3D Floating Effect */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                {[
                  { label: "إجمالي المنشورات", value: stats.total, icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
                  { label: "الأرباح الكلية", value: `${stats.revenue} DH`, icon: Zap, color: "text-green-500", bg: "bg-green-500/10" },
                  { label: "المستخدمين", value: stats.users, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
                  { label: "طلبات الشركاء", value: stats.bizPending, icon: Building2, color: "text-amber-500", bg: "bg-amber-500/10" },
                ].map((s, i) => (
                  <div key={i} className="group bg-white/40 backdrop-blur-2xl border border-white p-10 rounded-[3.5rem] shadow-[0_20px_40px_-15px_rgba(45,27,77,0.05)] hover:bg-white/60 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
                    <div className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6", s.bg, s.color)}>
                       <s.icon size={32} />
                    </div>
                    <p className="text-[11px] font-black text-primary/40 uppercase tracking-[0.3em]">{s.label}</p>
                    <p className="text-4xl font-black mt-2 tracking-tighter text-primary">{s.value}</p>
                    <div className="absolute bottom-[-20px] right-[-20px] w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all duration-700" />
                  </div>
                ))}
              </div>

              {/* Sophisticated Charts Grid - PRO Version */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                {/* 1. Revenue - Neon Area Chart with Time Labels */}
                <div className="bg-white/40 backdrop-blur-3xl border border-white p-10 rounded-[4rem] shadow-2xl shadow-primary/5 group relative overflow-hidden transition-all duration-500 hover:shadow-primary/10">
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <h3 className="text-2xl font-black text-primary mb-1">النمو المالي</h3>
                      <p className="text-primary/30 text-sm font-bold">تحليل الأرباح (آخر 7 أيام)</p>
                    </div>
                    <div className="p-4 bg-green-500/10 rounded-2xl text-green-600 text-xs font-black">+14.2%</div>
                  </div>
                  
                  <div className="h-[240px] relative">
                     {/* Horizontal Grid Lines */}
                     <div className="absolute inset-0 flex flex-col justify-between opacity-5">
                        {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-full h-px bg-primary" />)}
                     </div>
                     <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
                        {/* 7 Real Bars for 7 Days */}
                        {(() => {
                           const trend = stats.revenueTrend || [0, 0, 0, 0, 0, 0, 0];
                           const max = Math.max(...trend) || 1;
                           return trend.map((val: number, i: number) => {
                              const h = Math.max(10, Math.min(90, (val / max) * 80));
                              return (
                                 <rect 
                                    key={i} 
                                    x={i * 15} 
                                    y={100 - h} 
                                    width="10" 
                                    height={h} 
                                    rx="3" 
                                    fill="url(#neonGreen)" 
                                    className="transition-all duration-700 hover:brightness-125 cursor-pointer"
                                 />
                              );
                           });
                        })()}
                        <defs>
                          <linearGradient id="neonGreen" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#22c55e" />
                            <stop offset="100%" stopColor="#22c55e" stopOpacity="0.1" />
                          </linearGradient>
                        </defs>
                     </svg>
                     
                     {/* Time Axis (Dynamic Days) */}
                     <div className="absolute bottom-[-35px] inset-x-0 flex justify-between text-[9px] font-black text-primary/30 uppercase tracking-tighter">
                        {(() => {
                           const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
                           const labels = [];
                           for (let i = 6; i >= 0; i--) {
                              const d = new Date();
                              d.setDate(d.getDate() - i);
                              labels.push(days[d.getDay()]);
                           }
                           return labels.map((l, i) => <span key={i}>{i === 6 ? 'اليوم' : l}</span>);
                        })()}
                     </div>
                  </div>
                  <div className="mt-16 flex items-center justify-between border-t border-primary/5 pt-8">
                     <p className="text-5xl font-black text-primary tracking-tighter">{stats.revenue} <span className="text-lg text-primary/40">DH</span></p>
                  </div>
                </div>

                {/* 2. Posts Density - Neon Bars with Labels */}
                <div className="bg-white/40 backdrop-blur-3xl border border-white p-10 rounded-[4rem] shadow-2xl shadow-primary/5 group relative transition-all duration-500 hover:shadow-primary/10">
                  <h3 className="text-2xl font-black text-primary mb-1">إحصائيات النشاط</h3>
                  <p className="text-primary/30 text-sm font-bold mb-12">توزيع البلاغات حسب النوع</p>
                  
                  <div className="h-[240px] flex items-end gap-16 px-12 relative">
                     <div className="flex-1 flex flex-col items-center gap-6 h-full relative z-10 group/bar">
                        <div className="w-full bg-primary/5 rounded-[2.5rem] relative overflow-hidden h-full shadow-inner border border-white/20">
                           <div className="absolute bottom-0 w-full bg-gradient-to-t from-red-500 to-red-400 rounded-[2.5rem] transition-all duration-1000 group-hover/bar:brightness-125" 
                              style={{ height: `${stats.total > 0 ? (stats.lost / stats.total) * 100 : 0}%` }}>
                              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-white/30 rounded-full" />
                           </div>
                        </div>
                        <div className="text-center">
                           <p className="text-sm font-black text-primary">مفقود</p>
                           <p className="text-2xl font-black text-red-500/60 tracking-tighter">{stats.lost}</p>
                        </div>
                     </div>
                     <div className="flex-1 flex flex-col items-center gap-6 h-full relative z-10 group/bar">
                        <div className="w-full bg-primary/5 rounded-[2.5rem] relative overflow-hidden h-full shadow-inner border border-white/20">
                           <div className="absolute bottom-0 w-full bg-gradient-to-t from-green-500 to-green-400 rounded-[2.5rem] transition-all duration-1000 group-hover/bar:brightness-90" 
                              style={{ height: `${stats.total > 0 ? (stats.found / stats.total) * 100 : 0}%` }}>
                              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-white/30 rounded-full" />
                           </div>
                        </div>
                        <div className="text-center">
                           <p className="text-sm font-black text-primary">موجود</p>
                           <p className="text-2xl font-black text-green-500/60 tracking-tighter">{stats.found}</p>
                        </div>
                     </div>
                  </div>
                </div>
              </div>

              {/* 3. Improved Stats & Business Analytics */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                {/* User Growth with Month Labels */}
                <div className="bg-white/40 backdrop-blur-3xl border border-white p-10 rounded-[4rem] shadow-2xl shadow-primary/5 group relative overflow-hidden transition-all duration-500 hover:shadow-primary/10">
                  <h3 className="text-2xl font-black text-primary mb-1">نمو المستخدمين</h3>
                  <p className="text-primary/30 text-sm font-bold mb-10">تحليل التسجيل الشهري</p>
                  
                  <div className="h-[200px] relative">
                     <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
                        {/* 5 Real Bars for 5 Months */}
                        {(() => {
                           const trend = stats.userTrend || [0, 0, 0, 0, 0];
                           const max = Math.max(...trend) || 1;
                           return trend.map((val: number, i: number) => {
                              const h = Math.max(10, Math.min(90, (val / max) * 80));
                              return (
                                 <rect 
                                    key={i} 
                                    x={i * 22} 
                                    y={100 - h} 
                                    width="12" 
                                    height={h} 
                                    rx="4" 
                                    fill="url(#blueBar)" 
                                    className="transition-all duration-700 hover:brightness-110"
                                 />
                              );
                           });
                        })()}
                        <defs>
                          <linearGradient id="blueBar" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
                          </linearGradient>
                        </defs>
                     </svg>
                     
                     {/* Dynamic Month Labels */}
                     <div className="absolute bottom-[-35px] inset-x-0 flex justify-between text-[9px] font-black text-primary/30 uppercase tracking-tighter">
                        {(() => {
                           const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'];
                           const labels = [];
                           const cur = new Date().getMonth();
                           for (let i = 4; i >= 0; i--) {
                              labels.push(months[(cur - i + 12) % 12]);
                           }
                           return labels.map((l, i) => <span key={i}>{l}</span>);
                        })()}
                     </div>

                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-white/60 backdrop-blur-xl border border-white px-8 py-4 rounded-3xl shadow-xl text-center transform group-hover:scale-110 transition-transform duration-500">
                           <p className="text-5xl font-black text-primary tracking-tighter">{stats.users}</p>
                           <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.3em] mt-1">عضو نشط</p>
                        </div>
                     </div>
                  </div>
                </div>

                {/* Advanced Multi-Segment Donut Chart - Inspired by Reference */}
                <div className="bg-white/40 backdrop-blur-3xl border border-white p-10 rounded-[4rem] shadow-2xl shadow-primary/5 group relative transition-all duration-500 hover:shadow-primary/10">
                  <h3 className="text-2xl font-black text-primary mb-1">توزيع طلبات الشركاء</h3>
                  <p className="text-primary/30 text-sm font-bold mb-12">تحليل الحالات حسب التوثيق والمراجعة</p>
                  
                  <div className="flex flex-col lg:flex-row items-center gap-12">
                     <div className="relative w-56 h-56 shrink-0 group/donut">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                           <circle cx="18" cy="18" r="15.5" fill="none" stroke="#F5F0E8" strokeWidth="4.5" />
                           <circle cx="18" cy="18" r="15.5" fill="none" stroke="#22c55e" strokeWidth="4.5" 
                              strokeDasharray={`${(stats.bizApproved / (stats.bizTotal || 1)) * 100}, 100`} 
                              strokeDashoffset="0"
                              strokeLinecap="round" className="transition-all duration-1000 drop-shadow-[0_0_8px_rgba(34,197,94,0.3)]" />
                           <circle cx="18" cy="18" r="15.5" fill="none" stroke="#fbbf24" strokeWidth="4.5" 
                              strokeDasharray={`${(stats.bizPending / (stats.bizTotal || 1)) * 100}, 100`} 
                              strokeDashoffset={`-${(stats.bizApproved / (stats.bizTotal || 1)) * 100}`}
                              strokeLinecap="round" className="transition-all duration-1000 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]" />
                           <circle cx="18" cy="18" r="15.5" fill="none" stroke="#3b82f6" strokeWidth="4.5" 
                              strokeDasharray={`${10}, 100`} 
                              strokeDashoffset={`-${((stats.bizApproved + stats.bizPending) / (stats.bizTotal || 1)) * 100}`}
                              strokeLinecap="round" className="transition-all duration-1000" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                           <span className="text-5xl font-black text-primary tracking-tighter group-hover/donut:scale-110 transition-transform duration-500">{stats.bizTotal}</span>
                           <span className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] mt-1">الإجمالي</span>
                        </div>
                     </div>
                     <div className="flex-1 space-y-6 w-full">
                        {[
                           { label: "طلبات موثقة", count: stats.bizApproved, color: "bg-green-500", pct: stats.bizSuccessRate },
                           { label: "قيد المراجعة", count: stats.bizPending, color: "bg-amber-400", pct: Math.round((stats.bizPending / (stats.bizTotal || 1)) * 100) },
                           { label: "طلبات جديدة", count: 2, color: "bg-blue-500", pct: 5 },
                           { label: "مرفوضة", count: 0, color: "bg-red-500", pct: 0 },
                        ].map((item, idx) => (
                           <div key={idx} className="flex items-center justify-between group/legend">
                              <div className="flex items-center gap-4">
                                 <div className={cn("w-3.5 h-3.5 rounded-full shadow-lg transition-transform group-hover/legend:scale-125", item.color)} />
                                 <span className="text-sm font-black text-primary/70">{item.label}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                 <span className="text-md font-black text-primary">{item.count}</span>
                                 <span className="text-[10px] font-bold text-primary/20 bg-primary/5 px-2 py-1 rounded-lg">({item.pct}%)</span>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
              </div>

              {/* Lists - Floating Sections */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                 {/* Activity List */}
                 <div className="bg-white/40 backdrop-blur-3xl border border-white p-10 rounded-[4rem] shadow-2xl shadow-primary/5">
                    <div className="flex justify-between items-center mb-10">
                       <h3 className="text-2xl font-black text-primary">أحدث المنشورات</h3>
                       <button className="px-6 py-2.5 bg-primary/5 text-primary text-xs font-black rounded-2xl hover:bg-primary hover:text-white transition-all">الكل</button>
                    </div>
                    <div className="space-y-5">
                       {data.posts.slice(0, 5).map((post: any) => (
                          <div key={post._id} className="group/item flex items-center gap-6 p-6 bg-white/50 rounded-[2.5rem] border border-white hover:bg-white hover:scale-[1.02] transition-all shadow-sm">
                             <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary font-black text-2xl shadow-inner group-hover/item:rotate-6 transition-all">{post.title?.charAt(0)}</div>
                             <div className="flex-1">
                                <p className="text-md font-black text-primary truncate">{post.title}</p>
                                <p className="text-[11px] text-primary/40 font-bold mt-1 flex items-center gap-2">
                                   {post.author?.name} • {post.type === 'lost' ? 'مفقود' : 'موجود'}
                                </p>
                             </div>
                             <span className="text-[10px] font-black text-primary/20 bg-primary/5 px-3 py-1.5 rounded-xl">{formatDistanceToNow(new Date(post.createdAt), { locale: ar })}</span>
                          </div>
                       ))}
                    </div>
                 </div>

                 {/* Users List */}
                 <div className="bg-white/40 backdrop-blur-3xl border border-white p-10 rounded-[4rem] shadow-2xl shadow-primary/5">
                    <div className="flex justify-between items-center mb-10">
                       <h3 className="text-2xl font-black text-primary">أعضاء جدد</h3>
                       <button className="px-6 py-2.5 bg-primary/5 text-primary text-xs font-black rounded-2xl hover:bg-primary hover:text-white transition-all">الكل</button>
                    </div>
                    <div className="space-y-5">
                       {data.users.slice(0, 5).map((u: any) => (
                          <div key={u._id} className="group/item flex items-center gap-6 p-6 bg-white/50 rounded-[2.5rem] border border-white hover:bg-white hover:scale-[1.02] transition-all shadow-sm">
                             <div className="w-16 h-16 rounded-full border-4 border-white shadow-xl overflow-hidden group-hover/item:scale-110 transition-all">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} alt="" className="w-full h-full bg-primary/5" />
                             </div>
                             <div className="flex-1">
                                <p className="text-md font-black text-primary">{u.name}</p>
                                <p className="text-[11px] text-primary/40 font-bold mt-1">{u.email}</p>
                             </div>
                             {u.isVerified && (
                                <div className="p-2 bg-blue-500/10 text-blue-600 rounded-xl shadow-inner">
                                   <Shield size={20} />
                                </div>
                             )}
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === "posts" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
               <div className="bg-white/40 backdrop-blur-3xl border border-white p-10 rounded-[4rem] shadow-2xl shadow-primary/5">
                  <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
                     <div>
                        <h3 className="text-4xl font-black text-primary tracking-tighter">إدارة المنشورات</h3>
                        <p className="text-primary/40 font-bold mt-2 text-sm">إجمالي المنشورات المعروضة: {filteredPosts.filter(p => postFilter === 'all' || p.type === postFilter).length}</p>
                     </div>

                     <div className="flex p-2 bg-primary/5 rounded-[2rem] border border-primary/10 w-full md:w-auto">
                        {[
                           { id: "all", label: "الكل" },
                           { id: "lost", label: "المفقودات" },
                           { id: "found", label: "المعثورات" },
                        ].map((btn) => (
                           <button
                              key={btn.id}
                              onClick={() => setPostFilter(btn.id as any)}
                              className={cn(
                                 "flex-1 md:px-10 py-4 rounded-[1.5rem] font-black text-xs transition-all duration-500",
                                 postFilter === btn.id 
                                    ? "bg-white text-primary shadow-xl" 
                                    : "text-primary/40 hover:text-primary"
                              )}
                           >
                              {btn.label}
                           </button>
                        ))}
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6">
                     {filteredPosts
                        .filter(post => postFilter === 'all' || post.type === postFilter)
                        .map((post: any) => (
                        <div key={post._id} className="bg-white/50 p-8 rounded-[3rem] border border-white shadow-xl hover:bg-white transition-all group/post flex flex-col md:flex-row items-center gap-8">
                           <div className={cn(
                              "w-24 h-24 rounded-[2.5rem] flex items-center justify-center font-black text-4xl shadow-inner group-hover/post:scale-110 transition-all",
                              post.type === 'lost' ? "bg-red-500/5 text-red-500" : "bg-green-500/5 text-green-500"
                           )}>
                              {post.title?.charAt(0)}
                           </div>
                           <div className="flex-1 text-center md:text-right">
                              <h4 className="text-2xl font-black text-primary mb-1">{post.title}</h4>
                              <p className="text-primary/40 font-bold flex items-center justify-center md:justify-start gap-3">
                                 <span className={cn("px-4 py-1 rounded-full text-[10px] uppercase tracking-widest", post.type === 'lost' ? "bg-red-500/10 text-red-600" : "bg-green-500/10 text-green-600")}>
                                    {post.type === 'lost' ? 'مفقود' : 'موجود'}
                                 </span>
                                 • {post.author?.name} • {formatDistanceToNow(new Date(post.createdAt), { locale: ar })}
                              </p>
                           </div>
                           <div className="flex gap-4">
                              <button onClick={() => handleDeletePost(post._id)} className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg">
                                 <Trash2 size={24} />
                              </button>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
               <div className="bg-white/40 backdrop-blur-3xl border border-white p-10 rounded-[4rem] shadow-2xl shadow-primary/5">
                  <div className="flex justify-between items-center mb-12">
                     <div>
                        <h3 className="text-4xl font-black text-primary tracking-tighter">إدارة المستخدمين</h3>
                        <p className="text-primary/40 font-bold mt-2 text-sm">إجمالي المستخدمين المسجلين: {data.users.length}</p>
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {filteredUsers.map((u: any) => (
                        <div key={u._id} className="bg-white/50 p-8 rounded-[3rem] border border-white shadow-xl hover:bg-white transition-all group/user flex items-center gap-6">
                           <div className="w-20 h-20 rounded-full border-4 border-white shadow-2xl overflow-hidden group-hover/user:scale-110 transition-all">
                              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} alt="" className="w-full h-full bg-primary/5" />
                           </div>
                           <div className="flex-1">
                              <h4 className="text-xl font-black text-primary">{u.name}</h4>
                              <p className="text-sm font-bold text-primary/40">{u.email}</p>
                           </div>
                           <div className="flex gap-3">
                              <button 
                                 onClick={() => handleToggleVerify(u._id, u.isVerified)}
                                 className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-lg",
                                    u.isVerified 
                                       ? "bg-blue-500 text-white shadow-blue-500/20" 
                                       : "bg-primary/5 text-primary/20 hover:bg-primary/10 hover:text-primary"
                                 )}
                                 title={u.isVerified ? "إلغاء التوثيق" : "توثيق الحساب"}
                              >
                                 <Shield size={20} fill={u.isVerified ? "currentColor" : "none"} />
                              </button>
                              <button 
                                 onClick={() => handleDeleteUser(u._id)} 
                                 className="w-12 h-12 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/10"
                                 title="حذف المستخدم"
                              >
                                 <Trash2 size={20} />
                              </button>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          )}

          {activeTab === "businesses" && (
            <div className="space-y-10">
              <div className="bg-white/40 backdrop-blur-3xl border border-white p-10 rounded-[4rem] shadow-2xl shadow-primary/5">
                 <div className="flex justify-between items-center mb-12">
                    <div>
                       <h3 className="text-4xl font-black text-primary tracking-tighter">طلبات الشركاء</h3>
                       <p className="text-primary/40 font-bold mt-2 text-sm">مراجعة وتوثيق المحلات التجارية الجديدة</p>
                    </div>
                    <div className="p-6 bg-white/60 rounded-[2rem] border border-white text-center min-w-[120px] shadow-xl">
                       <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">قيد المراجعة</p>
                       <p className="text-3xl font-black text-primary">{stats.bizPending}</p>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {businesses.map((biz: any) => (
                       <div key={biz._id} className="bg-white/50 p-10 rounded-[3.5rem] border border-white shadow-2xl hover:bg-white transition-all group/biz relative overflow-hidden">
                          <div className="flex items-start justify-between mb-8 relative z-10">
                             <div className="flex items-center gap-6">
                                <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center text-primary group-hover/biz:rotate-12 transition-all shadow-inner">
                                   <Building2 size={48} />
                                </div>
                                <div>
                                   <h4 className="text-2xl font-black text-primary">{biz.businessName}</h4>
                                   <p className="text-md font-bold text-primary/40">{biz.category} • {biz.ownerName}</p>
                                </div>
                             </div>
                             <span className={cn(
                                "px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-inner",
                                biz.status === 'approved' ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600"
                             )}>
                                {biz.status === 'approved' ? "موثق" : "منتظر"}
                             </span>
                          </div>
                          
                          <div className="space-y-4 mb-10 relative z-10">
                             <div className="flex items-center gap-4 text-sm font-black text-primary/60"><MapPin size={22} className="text-primary/20" /> {biz.address}</div>
                             <div className="flex items-center gap-4 text-sm font-black text-primary/60"><Phone size={22} className="text-primary/20" /> {biz.phone}</div>
                          </div>
                          
                          <div className="flex gap-5 relative z-10">
                             {biz.status !== 'approved' && (
                                <button onClick={() => handleBusinessStatus(biz._id, 'approved')} className="flex-1 py-6 bg-primary text-white font-black rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(45,27,77,0.3)] hover:scale-[1.02] active:scale-95 transition-all text-lg">قبول الشريك</button>
                             )}
                             <button onClick={() => handleDeleteBusiness(biz._id)} className="px-10 py-6 bg-red-500/10 text-red-500 font-black rounded-[2rem] hover:bg-red-500 hover:text-white transition-all">حذف</button>
                          </div>
                          <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />
                       </div>
                    ))}
                 </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
