"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Trash2, Users, FileText, Loader2, ShieldAlert, Lock, Mail, 
  Eye, EyeOff, LogOut, Search, CheckCircle2, XCircle, 
  BarChart3, TrendingUp, UserCheck, AlertTriangle, RefreshCw,
  Zap, Shield, Building2, Phone, Globe, ExternalLink
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import Link from "next/link";

const ADMIN_EMAIL = "med2005@gmail.com";
const ADMIN_PASSWORD = "Admin@2025";

export default function ModirPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [data, setData] = useState<{ posts: any[]; users: any[] }>({ posts: [], users: [] });
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "posts" | "users" | "businesses">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const session = sessionStorage.getItem("modir_auth");
    if (session === "true") setIsAuthenticated(true);
  }, []);

  const fetchData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [mainRes, bizRes] = await Promise.all([
        fetch("/api/modir"),
        fetch("/api/business")
      ]);
      const mainJson = await mainRes.json();
      const bizJson = await bizRes.json();
      if (mainJson.success) setData(mainJson.data);
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
      if (res.ok) setBusinesses(prev => prev.map(b => b._id === id ? { ...b, status } : b));
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
  const stats = useMemo(() => ({
    total: data.posts.length,
    lost: data.posts.filter(p => p.type === "lost").length,
    found: data.posts.filter(p => p.type === "found").length,
    boosted: data.posts.filter(p => p.boosted).length,
    users: data.users.length,
    verified: data.users.filter(u => u.isVerified).length,
    bizPending: businesses.filter(b => b.status === "pending").length,
  }), [data, businesses]);

  const filteredBusinesses = useMemo(() =>
    businesses.filter(b =>
      b.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.ownerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.city?.toLowerCase().includes(searchQuery.toLowerCase())
    ), [businesses, searchQuery]);

  // ===== LOGIN SCREEN =====
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm">
          <div className="glass-card rounded-3xl border p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center mx-auto">
                <ShieldAlert size={32} />
              </div>
              <h1 className="text-2xl font-black">لوحة التحكم</h1>
              <p className="text-muted-foreground text-sm">دخل بمعلومات المدير</p>
            </div>
            {loginError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-bold text-center">
                {loginError}
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="email" placeholder="البريد الإلكتروني" value={loginData.email}
                  onChange={e => setLoginData({ ...loginData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border bg-secondary/50 focus:ring-2 focus:ring-primary outline-none font-medium" required />
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type={showPw ? "text" : "password"} placeholder="كلمة المرور" value={loginData.password}
                  onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full pl-12 pr-12 py-4 rounded-xl border bg-secondary/50 focus:ring-2 focus:ring-primary outline-none font-medium" required />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <button type="submit" className="w-full bg-primary text-white py-4 rounded-xl font-black flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                <Lock size={18} /> دخول
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ===== DASHBOARD =====
  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-destructive/10 text-destructive rounded-2xl"><ShieldAlert size={28} /></div>
          <div>
            <h1 className="text-2xl font-black">لوحة تحكم المدير</h1>
            <p className="text-muted-foreground text-xs">مرحباً بك، يمكنك إدارة المنصة من هنا</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => fetchData(true)} disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border hover:bg-secondary transition-colors font-bold text-sm">
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /> تحديث
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors font-bold text-sm">
            <LogOut size={16} /> خروج
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {[
          { label: "إجمالي المنشورات", value: stats.total, icon: FileText, color: "text-blue-500 bg-blue-500/10" },
          { label: "مفقود", value: stats.lost, icon: AlertTriangle, color: "text-destructive bg-destructive/10" },
          { label: "موجود", value: stats.found, icon: CheckCircle2, color: "text-green-500 bg-green-500/10" },
          { label: "مُعزَّز", value: stats.boosted, icon: Zap, color: "text-primary bg-primary/10" },
          { label: "المستخدمون", value: stats.users, icon: Users, color: "text-violet-500 bg-violet-500/10" },
          { label: "موثَّقون", value: stats.verified, icon: Shield, color: "text-amber-500 bg-amber-500/10" },
        ].map((s) => (
          <div key={s.label} className="glass-card rounded-2xl border p-4 flex flex-col items-center gap-2 text-center">
            <div className={`p-2 rounded-xl ${s.color}`}><s.icon size={20} /></div>
            <p className="text-2xl font-black">{s.value}</p>
            <p className="text-[10px] text-muted-foreground font-bold">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {[
          { key: "overview", label: "نظرة عامة", icon: BarChart3 },
          { key: "posts", label: `المنشورات (${data.posts.length})`, icon: FileText },
          { key: "users", label: `المستخدمون (${data.users.length})`, icon: Users },
          { key: "businesses", label: `الشركاء (${businesses.length})${stats.bizPending > 0 ? ` 🔴${stats.bizPending}` : ""}`, icon: Building2 },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === tab.key ? "bg-primary text-white shadow-lg" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Quick link to registration form */}
      {activeTab === "businesses" && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">طلبات الانضمام كشركاء تجاريين</p>
          <Link href="/business/register" target="_blank" className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
            <ExternalLink size={14} /> رابط فورم التسجيل
          </Link>
        </div>
      )}

      {/* Search Bar (for posts/users tabs) */}
      {activeTab !== "overview" && (
        <div className="relative mb-5">
          <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder={activeTab === "posts" ? "ابحث في المنشورات..." : "ابحث في المستخدمين..."}
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full pr-12 pl-4 py-3 rounded-xl border bg-secondary/50 focus:ring-2 focus:ring-primary outline-none font-medium" />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>
      ) : (
        <>
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="glass-card rounded-3xl border p-6">
                <h2 className="text-lg font-black mb-4 flex items-center gap-2"><TrendingUp size={20} className="text-primary" /> آخر المنشورات</h2>
                <div className="space-y-3">
                  {data.posts.slice(0, 5).map((post: any) => (
                    <div key={post._id} className="flex items-center justify-between gap-4 p-3 bg-secondary/30 rounded-xl">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{post.title}</p>
                        <p className="text-xs text-muted-foreground">{post.author?.name} • {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ar })}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${post.type === "lost" ? "bg-destructive/10 text-destructive" : "bg-green-500/10 text-green-500"}`}>
                          {post.type === "lost" ? "مفقود" : "موجود"}
                        </span>
                        <button onClick={() => handleDeletePost(post._id)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card rounded-3xl border p-6">
                <h2 className="text-lg font-black mb-4 flex items-center gap-2"><UserCheck size={20} className="text-primary" /> آخر المستخدمين</h2>
                <div className="space-y-3">
                  {data.users.slice(0, 5).map((u: any) => (
                    <div key={u._id} className="flex items-center justify-between gap-4 p-3 bg-secondary/30 rounded-xl">
                      <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-black shrink-0">{u.name?.charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                      {u.isVerified && <Shield size={16} className="text-primary shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Posts Tab */}
          {activeTab === "posts" && (
            <div className="glass-card rounded-3xl border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-secondary/50 text-muted-foreground text-xs">
                    <tr>
                      <th className="p-4 font-bold">الصورة</th>
                      <th className="p-4 font-bold">العنوان</th>
                      <th className="p-4 font-bold">صاحب المنشور</th>
                      <th className="p-4 font-bold">التواصل</th>
                      <th className="p-4 font-bold">النوع</th>
                      <th className="p-4 font-bold">المدينة</th>
                      <th className="p-4 font-bold">التاريخ</th>
                      <th className="p-4 font-bold text-center">حذف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filteredPosts.map((post: any) => (
                      <tr key={post._id} className="hover:bg-secondary/20 transition-colors text-sm">
                        <td className="p-4">
                          {post.images?.[0] ? (
                            <img src={post.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover border" />
                          ) : (
                            <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center text-xs text-muted-foreground">بلا صورة</div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="font-bold truncate max-w-[150px]">{post.title}</div>
                          <div className="text-[10px] text-primary font-bold">{post.category}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium">{post.author?.name || "مجهول"}</div>
                          <div className="text-[10px] text-muted-foreground">{post.author?.email}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            {post.author?.phone && <span className="text-[10px] flex items-center gap-1 font-bold"><Phone size={10} /> {post.author.phone}</span>}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${post.type === "lost" ? "bg-destructive/10 text-destructive" : "bg-green-500/10 text-green-500"}`}>
                            {post.type === "lost" ? "مفقود" : "موجود"}
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground">{post.city || "—"}</td>
                        <td className="p-4 text-muted-foreground text-[10px]">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ar })}</td>
                        <td className="p-4 text-center">
                          <button onClick={() => handleDeletePost(post._id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                    {filteredPosts.length === 0 && (
                      <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">لا توجد نتائج</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="glass-card rounded-3xl border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-secondary/50 text-muted-foreground text-xs">
                    <tr>
                      <th className="p-4 font-bold">الاسم</th>
                      <th className="p-4 font-bold">البريد والهاتف</th>
                      <th className="p-4 font-bold">الحالة</th>
                      <th className="p-4 font-bold">الدور</th>
                      <th className="p-4 font-bold">تاريخ التسجيل</th>
                      <th className="p-4 font-bold text-center">توثيق</th>
                      <th className="p-4 font-bold text-center">حذف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filteredUsers.map((u: any) => (
                      <tr key={u._id} className="hover:bg-secondary/20 transition-colors text-sm">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-black text-xs shrink-0">{u.name?.charAt(0)}</div>
                            <span className="font-medium">{u.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                           <div className="text-xs font-medium">{u.email}</div>
                           {u.phone && <div className="text-[10px] text-muted-foreground">{u.phone}</div>}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            {u.isPremium && <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-500/10 text-amber-500 w-fit">PREMIUM</span>}
                            {u.isVerified && <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-500/10 text-blue-500 w-fit">موثق</span>}
                          </div>
                        </td>
                        <td className="p-4">
                          {u.isAdmin
                            ? <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-primary/10 text-primary text-[10px]">مدير</span>
                            : <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-secondary text-secondary-foreground text-[10px]">{u.role === "partner" ? "شريك" : "مستخدم"}</span>}
                        </td>
                        <td className="p-4 text-muted-foreground text-[10px]">{formatDistanceToNow(new Date(u.createdAt), { addSuffix: true, locale: ar })}</td>
                        <td className="p-4 text-center">
                          <button onClick={() => handleToggleVerify(u._id, u.isVerified)}
                            className={`p-2 rounded-lg transition-colors ${u.isVerified ? "text-primary bg-primary/10 hover:bg-primary/20" : "text-muted-foreground hover:bg-secondary"}`}
                            title={u.isVerified ? "إلغاء التوثيق" : "توثيق الحساب"}>
                            {u.isVerified ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                          </button>
                        </td>
                        <td className="p-4 text-center">
                          <button onClick={() => handleDeleteUser(u._id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">لا توجد نتائج</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Businesses Tab */}
          {activeTab === "businesses" && (
            <div className="glass-card rounded-3xl border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-secondary/50 text-muted-foreground text-xs">
                    <tr>
                      <th className="p-4 font-bold">اسم المحل</th>
                      <th className="p-4 font-bold">صاحب المحل</th>
                      <th className="p-4 font-bold">الهاتف</th>
                      <th className="p-4 font-bold">المدينة</th>
                      <th className="p-4 font-bold">النوع</th>
                      <th className="p-4 font-bold text-center">الحالة</th>
                      <th className="p-4 font-bold text-center">إجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filteredBusinesses.map((b: any) => (
                      <tr key={b._id} className="hover:bg-secondary/20 transition-colors text-sm">
                        <td className="p-4 font-bold">
                          <div className="flex items-center gap-2">
                            <Building2 size={16} className="text-primary shrink-0" />
                            {b.businessName}
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">{b.ownerName}</td>
                        <td className="p-4 text-muted-foreground">{b.phone}</td>
                        <td className="p-4 text-muted-foreground">{b.city}</td>
                        <td className="p-4 text-muted-foreground text-xs">{b.category}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${
                            b.status === "approved" ? "bg-green-500/10 text-green-500" :
                            b.status === "rejected" ? "bg-destructive/10 text-destructive" :
                            "bg-amber-500/10 text-amber-500"
                          }`}>
                            {b.status === "approved" ? "✅ مقبول" : b.status === "rejected" ? "❌ مرفوض" : "⏳ بانتظار"}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1">
                            {b.status !== "approved" && (
                              <button onClick={() => handleBusinessStatus(b._id, "approved")}
                                className="p-1.5 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors" title="قبول">
                                <CheckCircle2 size={16} />
                              </button>
                            )}
                            {b.status !== "rejected" && (
                              <button onClick={() => handleBusinessStatus(b._id, "rejected")}
                                className="p-1.5 text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors" title="رفض">
                                <XCircle size={16} />
                              </button>
                            )}
                            <button onClick={() => handleDeleteBusiness(b._id)}
                              className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors" title="حذف">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredBusinesses.length === 0 && (
                      <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">لا توجد طلبات بعد</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
