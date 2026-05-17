"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
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
  Loader2,
  Clock,
  ShieldCheck,
  Building2,
  Mail
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
// Dynamic import for Leaflet
const LocationPicker = dynamic(() => import("@/components/LocationPicker"), { 
  ssr: false,
  loading: () => (
    <div className="h-[280px] rounded-2xl bg-secondary/50 border-2 border-border flex items-center justify-center">
      <Loader2 size={24} className="animate-spin text-primary/30" />
    </div>
  )
});

export default function BusinessDashboard() {
  const { t, dir, language } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Business status and data
  const [businessStatus, setBusinessStatus] = useState<"loading" | "none" | "pending" | "approved" | "rejected">("loading");
  const [businessData, setBusinessData] = useState<any>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Check business registration status
  useEffect(() => {
    if (!user) return;
    
    const checkBusiness = async () => {
      try {
        const res = await fetch("/api/business/check-status");
        const data = await res.json();
        if (data.success) {
          if (!data.hasBusiness) {
            setBusinessStatus("none");
          } else {
            setBusinessStatus(data.status);
            setBusinessData(data.data);
          }
        } else {
          setBusinessStatus("none");
        }
      } catch {
        setBusinessStatus("none");
      }
    };
    checkBusiness();
  }, [user]);

  const handleUpdateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateSuccess(false);
    try {
      const res = await fetch("/api/business/update-my", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(businessData)
      });
      const data = await res.json();
      if (data.success) {
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdateLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setBusinessData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنشور؟")) return;
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setPosts(prev => prev.filter(p => p._id !== postId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Redirect to register if no business
  useEffect(() => {
    if (businessStatus === "none" && user) {
      router.push("/business/register");
    }
  }, [businessStatus, user, router]);

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
    if (user && businessStatus === "approved") fetchBusinessPosts();
  }, [user, businessStatus]);

  // Loading state
  if (authLoading || businessStatus === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="flex flex-col h-screen items-center justify-center space-y-4" dir={dir}>
        <h2 className="text-2xl font-bold">يجب تسجيل الدخول أولاً</h2>
        <Link href="/login" className="text-primary hover:underline font-bold">تسجيل الدخول</Link>
      </div>
    );
  }

  // Redirecting to register
  if (businessStatus === "none") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  // 🕐 PENDING APPROVAL
  if (businessStatus === "pending") {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6 relative overflow-hidden" dir={dir}>
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-amber-500/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
        
        <div className="relative z-10 max-w-lg w-full">
          <div className="bg-white/60 backdrop-blur-3xl border border-white rounded-[4rem] p-12 shadow-2xl shadow-primary/5 text-center space-y-8">
            <div className="relative mx-auto w-28 h-28">
              <div className="absolute inset-0 bg-amber-500/10 rounded-full animate-ping" />
              <div className="relative w-28 h-28 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-2xl">
                <Clock size={48} className="text-white" strokeWidth={1.5} />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-black text-primary tracking-tight mb-3">طلبك قيد المراجعة</h1>
              <p className="text-primary/50 font-bold text-sm leading-relaxed">شكراً لتسجيلك كشريك. فريقنا يراجع طلبك حالياً.</p>
            </div>
            <Link href="/" className="inline-block bg-primary text-white px-10 py-4 rounded-2xl font-black shadow-xl">العودة للرئيسية</Link>
          </div>
        </div>
      </div>
    );
  }

  // ❌ REJECTED
  if (businessStatus === "rejected") {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6" dir={dir}>
        <div className="bg-white/60 backdrop-blur-3xl border border-white rounded-[4rem] p-12 shadow-2xl max-w-lg w-full text-center space-y-6">
          <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
             <ShieldCheck size={48} />
          </div>
          <h1 className="text-2xl font-black text-primary">تم رفض الطلب</h1>
          <p className="text-primary/50 font-bold text-sm">للأسف، لم يتم قبول طلبك. يمكنك التواصل معنا لمعرفة السبب.</p>
          <Link href="/" className="bg-primary text-white px-8 py-3 rounded-xl font-black">الرئيسية</Link>
        </div>
      </div>
    );
  }

  // ✅ APPROVED
  const stats = [
    { label: "إجمالي المنشورات", value: posts.length.toString(), icon: Package, color: "text-blue-500" },
    { label: "المشاهدات", value: posts.reduce((acc, p) => acc + (p.views || 0), 0).toString(), icon: Eye, color: "text-primary" },
    { label: "النقرات", value: "0", icon: MousePointer2, color: "text-secondary-500" },
    { label: "العناصر المرجعة", value: "0", icon: CheckCircle, color: "text-green-500" },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2D1B4D] relative overflow-hidden font-sans" dir={dir}>
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />

      <div className="relative z-10 flex h-screen p-4 gap-6">
        {/* Sidebar */}
        <aside className={cn(
          "w-72 bg-white/40 backdrop-blur-3xl rounded-[3rem] border border-white/40 p-8 flex flex-col shadow-2xl shadow-primary/5 hidden lg:flex",
          dir === 'rtl' ? "order-last" : "order-first"
        )}>
          <div className="flex items-center gap-3 mb-12 px-2">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30">
              <Zap size={28} className="text-white" fill="currentColor" />
            </div>
            <span className="font-black text-2xl tracking-tighter text-primary">Partner<span className="text-black">ly</span></span>
          </div>

          <nav className="flex-1 space-y-3">
            {[
              { id: "overview", label: "نظرة عامة", icon: LayoutDashboard },
              { id: "posts", label: "إدارة المنشورات", icon: Package },
              { id: "settings", label: "الإعدادات", icon: Settings },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm transition-all duration-500",
                  activeTab === item.id 
                    ? "bg-primary text-white shadow-2xl shadow-primary/30" 
                    : "text-primary/40 hover:text-primary hover:bg-primary/5"
                )}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto p-6 bg-primary/5 rounded-3xl border border-primary/10">
             <p className="text-[10px] font-black text-primary/40 uppercase mb-2">الدعم الفني</p>
             <p className="text-xs font-bold text-primary/60">تواصل معنا للمساعدة</p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto no-scrollbar space-y-8 pb-10">
          {/* Header Bar */}
          <header className="flex items-center justify-between bg-white/40 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-white/60 shadow-xl shadow-primary/5">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-primary">
                {activeTab === 'overview' ? "نظرة عامة" : activeTab === 'posts' ? "إدارة المنشورات" : "الإعدادات"}
              </h1>
              <p className="text-primary/30 font-bold text-xs mt-1">إدارة أعمالك ومنشوراتك بكل سهولة</p>
            </div>
            <Link href="/report/found" className="flex items-center gap-2 bg-primary text-white font-black py-4 px-8 rounded-2xl shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all">
              <PlusCircle size={22} />
              إضافة إعلان جديد
            </Link>
          </header>

          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                  <div key={stat.label} className="bg-white/60 backdrop-blur-2xl border border-white p-8 rounded-[3rem] shadow-xl shadow-primary/5 hover:bg-white/80 hover:-translate-y-1 transition-all duration-500 group flex flex-col items-center text-center">
                    <div className={cn("p-4 rounded-2xl bg-primary/5 mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-500", stat.color)}>
                      <stat.icon size={32} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-primary/40 uppercase tracking-widest">{stat.label}</p>
                      <p className="text-4xl font-black mt-1 text-primary">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Activity Table */}
              <div className="bg-white/60 backdrop-blur-3xl border border-white p-8 rounded-[3rem] shadow-2xl shadow-primary/5">
                <div className="p-4 flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black flex items-center gap-2 text-primary">
                    <Package size={22} className="text-primary" />
                    المنشورات الأخيره
                  </h3>
                  <button className="text-sm font-black text-primary/40 hover:text-primary transition-colors" onClick={() => setActiveTab('posts')}>عرض الكل</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full" dir={dir}>
                    <thead className="bg-primary/5 text-[10px] font-black uppercase text-primary/40 tracking-[0.2em]">
                      <tr>
                        <th className="px-8 py-5 text-right">العنوان</th>
                        <th className="px-8 py-5 text-right">المشاهدات</th>
                        <th className="px-8 py-5 text-right">الحالة</th>
                        <th className="px-8 py-5 text-left">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/5">
                      {posts.slice(0, 5).map((post) => (
                        <tr key={post._id} className="hover:bg-white/40 transition-all group">
                          <td className="px-8 py-6 font-black text-sm text-primary">{post.title}</td>
                          <td className="px-8 py-6 text-sm font-black text-primary/40">{post.views || 0}</td>
                          <td className="px-8 py-6">
                            <span className={cn(
                              "px-3 py-1 rounded-lg text-[10px] font-black",
                              post.status === "active" ? "bg-green-500/10 text-green-600" : "bg-primary/10 text-primary"
                            )}>{post.status === 'active' ? "نشط" : "مكتمل"}</span>
                          </td>
                          <td className="px-8 py-6 text-left">
                            <button className="p-2 text-primary/20 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"><MoreVertical size={20} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "posts" && (
            <div className="bg-white/60 backdrop-blur-3xl border border-white p-10 rounded-[3rem] shadow-2xl shadow-primary/5">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-black text-primary tracking-tight">إدارة المنشورات</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {posts.map(post => (
                  <div key={post._id} className="bg-white/80 p-8 rounded-[3.5rem] border border-white shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden">
                    <div className="flex gap-6 relative z-10">
                      <div className="w-28 h-28 bg-primary/5 rounded-[2rem] flex items-center justify-center text-primary/20 italic text-[10px] font-black overflow-hidden">
                        {post.images?.[0] ? <img src={post.images[0]} className="w-full h-full object-cover" alt="" /> : "بدون صورة"}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-xl text-primary mb-2 line-clamp-1">{post.title}</h4>
                        <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest flex items-center gap-2"><Eye size={14} /> {post.views || 0} مشاهدة</p>
                        <div className="flex gap-3 mt-6">
                          <Link 
                            href={`/edit-post/${post._id}`}
                            className="px-6 py-2.5 bg-primary text-white text-[11px] font-black rounded-xl shadow-lg hover:scale-105 transition-all"
                          >
                            تعديل
                          </Link>
                          <button 
                            onClick={() => handleDeletePost(post._id)}
                            className="px-6 py-2.5 bg-red-500/10 text-red-500 text-[11px] font-black rounded-xl hover:bg-red-500 hover:text-white transition-all"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="max-w-3xl bg-white/60 backdrop-blur-3xl border border-white p-12 rounded-[4rem] shadow-2xl shadow-primary/5">
              <div className="mb-10 flex justify-between items-end">
                <div>
                  <h3 className="text-3xl font-black text-primary tracking-tight">إعدادات الشريك</h3>
                  <p className="text-primary/40 font-bold text-xs mt-1">تعديل معلومات حسابك التجاري</p>
                </div>
                {updateSuccess && (
                  <div className="bg-green-500/10 text-green-600 px-4 py-2 rounded-xl text-xs font-black animate-bounce">
                    تم الحفظ بنجاح ✨
                  </div>
                )}
              </div>

              <form onSubmit={handleUpdateBusiness} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="group">
                    <label className="text-[10px] font-black text-primary/40 uppercase mb-3 block mr-4 tracking-widest">اسم المحل</label>
                    <div className="relative">
                      <Building2 size={18} className="absolute top-1/2 -translate-y-1/2 right-6 text-primary/20" />
                      <input 
                        type="text" 
                        value={businessData?.businessName || ""} 
                        onChange={(e) => updateField("businessName", e.target.value)}
                        className="w-full bg-white/40 border border-white/60 p-5 pr-14 rounded-[2rem] font-black text-sm outline-none text-primary focus:border-primary/30 transition-all" 
                      />
                    </div>
                  </div>
                  <div className="group">
                    <label className="text-[10px] font-black text-primary/40 uppercase mb-3 block mr-4 tracking-widest">اسم صاحب المحل</label>
                    <div className="relative">
                      <Mail size={18} className="absolute top-1/2 -translate-y-1/2 right-6 text-primary/20" />
                      <input 
                        type="text" 
                        value={businessData?.ownerName || ""} 
                        onChange={(e) => updateField("ownerName", e.target.value)}
                        className="w-full bg-white/40 border border-white/60 p-5 pr-14 rounded-[2rem] font-black text-sm outline-none text-primary focus:border-primary/30 transition-all" 
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="text-[10px] font-black text-primary/40 uppercase mb-3 block mr-4 tracking-widest">رقم الهاتف</label>
                    <input 
                      type="text" 
                      value={businessData?.phone || ""} 
                      onChange={(e) => updateField("phone", e.target.value)}
                      className="w-full bg-white/40 border border-white/60 p-5 rounded-[2rem] font-black text-sm outline-none text-primary focus:border-primary/30 transition-all" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-primary/40 uppercase mb-3 block mr-4 tracking-widest">الموقع الإلكتروني</label>
                    <input 
                      type="text" 
                      value={businessData?.website || ""} 
                      onChange={(e) => updateField("website", e.target.value)}
                      className="w-full bg-white/40 border border-white/60 p-5 rounded-[2rem] font-black text-sm outline-none text-primary focus:border-primary/30 transition-all" 
                    />
                  </div>
                </div>

                {/* Map Picker for Settings */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-primary/40 uppercase block mr-4 tracking-widest">تحديث الموقع على الخريطة</label>
                  <div className="rounded-[2.5rem] overflow-hidden border-2 border-white shadow-xl">
                    <LocationPicker 
                      onLocationSelect={(lat, lng, address) => {
                        setBusinessData((prev: any) => ({ ...prev, lat, lng, address }));
                      }} 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-primary/40 uppercase mb-3 block mr-4 tracking-widest">العنوان التفصيلي</label>
                  <input 
                    type="text" 
                    value={businessData?.address || ""} 
                    onChange={(e) => updateField("address", e.target.value)}
                    className="w-full bg-white/40 border border-white/60 p-5 rounded-[2rem] font-black text-sm outline-none text-primary focus:border-primary/30 transition-all" 
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-primary/40 uppercase mb-3 block mr-4 tracking-widest">وصف المحل</label>
                  <textarea 
                    rows={4}
                    value={businessData?.description || ""} 
                    onChange={(e) => updateField("description", e.target.value)}
                    className="w-full bg-white/40 border border-white/60 p-6 rounded-[2.5rem] font-black text-sm outline-none text-primary focus:border-primary/30 transition-all resize-none" 
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={updateLoading}
                  className="w-full bg-primary text-white py-5 rounded-[2.5rem] font-black shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {updateLoading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                  حفظ جميع التغييرات
                </button>

                <div className="p-8 bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-[2.5rem] border border-amber-500/20 text-center text-amber-700">
                  <p className="font-black text-sm mb-1 tracking-tight flex items-center justify-center gap-2">
                    <ShieldCheck size={20} /> حساب شريك موثق ✅
                  </p>
                  <p className="text-amber-600/60 text-[10px] font-bold">معلوماتك تظهر للمستخدمين لضمان المصداقية وسرعة التواصل.</p>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
