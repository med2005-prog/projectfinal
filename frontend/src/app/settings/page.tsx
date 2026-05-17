"use client";

import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  User, 
  Bell, 
  Globe, 
  LogOut, 
  ChevronRight,
  Camera,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Smartphone
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { t, dir, language, setLanguage } = useLanguage();
  const { user, logout, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || "Member",
    phone: user?.phone || "+212 6XX-XXXXXX"
  });
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    matching: true
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editField, setEditField] = useState<{ key: string, label: string, value: string } | null>(null);
  const [otpStep, setOtpStep] = useState<"none" | "sending" | "verifying">("none");
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "Member",
        phone: user.phone || "+212 6XX-XXXXXX"
      });
      if ((user as any).notifications) {
        setNotifications((user as any).notifications);
      }
    }
  }, [user]);

  const saveProfile = async (updates: any) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error("Failed to save");
      
      const data = await res.json();
      if (data.success) {
        await refreshUser();
      }
    } catch (err) {
      console.error(err);
      alert(t("settings.saveError") || "Error saving settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        await saveProfile({ avatar: data.url });
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error(err);
      alert(t("common.failedImageUpload"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditConfirm = async () => {
    if (!editField) return;
    const updates = { [editField.key]: editField.value };
    await saveProfile(updates);
    setEditField(null);
  };

  const sendOTP = async () => {
    setOtpStep("sending");
    setOtpError("");
    try {
      const res = await fetch("/api/auth/send-otp", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setOtpStep("verifying");
      } else {
        setOtpError(data.error || "Failed to send code");
        setOtpStep("none");
      }
    } catch (err) {
      setOtpError("Connection error");
      setOtpStep("none");
    }
  };

  const verifyOTP = async () => {
    setIsSaving(true);
    setOtpError("");
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: otpCode })
      });
      const data = await res.json();
      if (data.success) {
        setOtpSuccess(true);
        setTimeout(() => {
          setOtpStep("none");
          setOtpSuccess(false);
          refreshUser();
        }, 2000);
      } else {
        setOtpError(data.error || "Incorrect code");
      }
    } catch (err) {
      setOtpError("Connection error");
    } finally {
      setIsSaving(false);
    }
  };

  const sections = [
    {
      id: "profile",
      title: t("settings.profile"),
      icon: User,
      items: [
        { label: t("settings.editName"), value: profileData.name, key: "name", editable: true },
        { label: t("settings.email"), value: user?.email || "mohammed@example.com", editable: false },
        { label: t("settings.phone"), value: profileData.phone, key: "phone", editable: true }
      ]
    },
    {
      id: "notifications",
      title: t("settings.notifications"),
      icon: Bell,
      items: [
        { label: t("settings.push"), type: "toggle", key: "push" },
        { label: t("settings.emailUpdates"), type: "toggle", key: "email" },
        { label: t("settings.matchingAlerts"), type: "toggle", key: "matching" }
      ]
    },
    {
      id: "appearance",
      title: t("settings.appearance"),
      icon: Globe,
      items: [
        { 
          label: t("settings.language"), 
          type: "select", 
          options: [
            { code: "en", name: "English" },
            { code: "fr", name: "Français" },
            { code: "ar", name: "العربية" }
          ],
          current: language
        }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" dir={dir}>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleAvatarChange} 
        accept="image/*" 
        className="hidden" 
      />

      <div className="mb-10">
        <h1 className="text-3xl font-black tracking-tight">{t("nav.settings")}</h1>
        <p className="text-muted-foreground mt-1 font-bold">
           {language === 'ar' ? "قم بتخصيص حسابك وتفضيلاتك." : "Personalize your account and preferences."}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 space-y-1">
          {sections.map((section) => (
            <button 
              key={section.id}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                section.id === "profile" ? "bg-primary text-white" : "text-muted-foreground hover:bg-secondary"
              )}
            >
              <section.icon size={18} />
              {section.title}
            </button>
          ))}
          <div className="pt-4 mt-4 border-t">
            <button 
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-destructive hover:bg-destructive/10 transition-all"
            >
              <LogOut size={18} />
              {t("auth.form.logout")}
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-6">
          <div className="bg-card border rounded-3xl p-6 flex items-center gap-6">
             <div className="relative group">
                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center overflow-hidden border-4 border-background shadow-lg relative">
                   {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <User size={40} className="text-muted-foreground" />}
                   {isUploading && (
                     <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Loader2 className="animate-spin text-white" size={24} />
                     </div>
                   )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute bottom-0 right-0 p-1.5 bg-primary text-white rounded-full shadow-lg border-2 border-background hover:scale-110 active:scale-95 transition-all"
                >
                   <Camera size={12} />
                </button>
             </div>
             <div>
                <h3 className="text-lg font-black tracking-tight">{user?.name || "Member"}</h3>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                  {t("profile.memberSince")} 2024
                </p>
             </div>
          </div>

          {sections.map((section) => (
            <div key={section.id} className="bg-card border rounded-3xl overflow-hidden">
               <div className="px-6 py-4 border-b bg-muted/30">
                  <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground">{section.title}</h4>
               </div>
               <div className="divide-y divide-border">
                  {section.items.map((item: any, idx: number) => (
                    <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                       <span className="text-sm font-bold text-foreground">{item.label}</span>
                       
                       {item.type === "toggle" ? (
                         <button 
                           onClick={async () => {
                             const newNotifs = { ...notifications, [item.key!]: !notifications[item.key as keyof typeof notifications] };
                             setNotifications(newNotifs);
                             await saveProfile({ notifications: newNotifs });
                           }}
                           className={cn(
                             "w-11 h-6 rounded-full relative transition-colors duration-200 ease-in-out focus:outline-none",
                             (notifications as any)[item.key!] ? "bg-primary" : "bg-muted-foreground/30"
                           )}
                         >
                           <div className={cn(
                             "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm",
                             dir === 'rtl' 
                               ? ((notifications as any)[item.key!] ? "-translate-x-6" : "-translate-x-1")
                               : ((notifications as any)[item.key!] ? "translate-x-6" : "translate-x-1")
                           )} />
                         </button>
                       ) : item.type === "select" ? (
                         <div className="flex gap-2">
                            {item.options?.map((opt: any) => (
                              <button 
                                key={opt.code}
                                onClick={() => setLanguage(opt.code as any)}
                                className={cn(
                                  "px-3 py-1 rounded-lg text-xs font-black transition-all",
                                  language === opt.code ? "bg-primary text-white" : "bg-secondary text-muted-foreground hover:text-foreground"
                                )}
                              >
                                {opt.name}
                              </button>
                            ))}
                         </div>
                       ) : (
                         <div 
                           onClick={() => item.editable && setEditField({ key: item.key, label: item.label, value: item.value })}
                           className={cn(
                             "flex items-center gap-2 text-sm font-bold transition-colors group cursor-pointer",
                             item.editable ? "text-foreground hover:text-primary" : "text-muted-foreground"
                           )}
                         >
                           {item.value}
                           {item.key === "phone" && user?.phone && (
                               (user as any).isPhoneVerified ? (
                                 <div className="flex items-center gap-1 text-[10px] bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full">
                                    <ShieldCheck size={10} /> {language === 'ar' ? "موثق" : "Verified"}
                                 </div>
                               ) : (
                                 <button 
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     sendOTP();
                                   }}
                                   className="text-[10px] bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full hover:bg-amber-500 hover:text-white transition-all"
                                 >
                                    {language === 'ar' ? "وثق الآن" : "Verify Now"}
                                 </button>
                               )
                            )}
                           {item.editable && <ChevronRight size={14} className={cn("transition-transform group-hover:translate-x-1", dir === 'rtl' ? 'rotate-180 group-hover:-translate-x-1' : '')} />}
                         </div>
                       )}
                    </div>
                  ))}
               </div>
            </div>
          ))}

          <div className="p-6 bg-destructive/5 border border-destructive/20 rounded-3xl flex items-center justify-between gap-4">
             <div>
                <h4 className="text-sm font-black text-destructive">{t("settings.accountDeletion")}</h4>
                <p className="text-xs text-muted-foreground mt-1 font-bold">{t("settings.deleteDesc")}</p>
             </div>
             <button className="px-4 py-2 border border-destructive/30 rounded-xl text-xs font-black text-destructive hover:bg-destructive hover:text-white transition-all whitespace-nowrap">
                {t("settings.deleteBtn")}
             </button>
          </div>
        </div>
      </div>

      {editField && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-background w-full max-w-md rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />
              
              <h3 className="text-xl font-black mb-6 relative z-10">{editField.label}</h3>
              
              <div className="space-y-4 relative z-10">
                 <input 
                   type="text"
                   autoFocus
                   value={editField.value}
                   onChange={(e) => setEditField({ ...editField, value: e.target.value })}
                   className="w-full py-4 px-6 rounded-2xl bg-secondary/50 border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-bold transition-all"
                 />
                 
                 <div className="flex gap-3 pt-2">
                    <button 
                      onClick={() => setEditField(null)}
                      className="flex-1 py-3.5 rounded-2xl font-black text-muted-foreground hover:bg-secondary transition-all"
                    >
                      {t("common.cancel")}
                    </button>
                    <button 
                      onClick={handleEditConfirm}
                      disabled={isSaving}
                      className="flex-1 py-3.5 rounded-2xl bg-primary text-white font-black shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center"
                    >
                      {isSaving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : t("common.save")}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {otpStep !== "none" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-background w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden text-center">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mr-24 -mt-24" />
              
              {otpSuccess ? (
                <div className="space-y-6 animate-in zoom-in duration-300">
                  <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-500/10">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-2xl font-black">{language === 'ar' ? "تم التوثيق بنجاح!" : "Verified Successfully!"}</h3>
                  <p className="text-muted-foreground font-bold">{language === 'ar' ? "تم تأكيد رقم هاتفك." : "Your phone number has been confirmed."}</p>
                </div>
              ) : (
                <div className="space-y-8 relative z-10">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto">
                    {otpStep === "sending" ? <Loader2 className="animate-spin" size={32} /> : <Smartphone size={32} />}
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-black mb-2">{language === 'ar' ? "تأكيد رقم الهاتف" : "Verify Phone"}</h3>
                    <p className="text-muted-foreground font-bold text-sm leading-relaxed">
                      {language === 'ar' 
                        ? `لقد أرسلنا كود التفعيل إلى الرقم ${user?.phone}. يرجى إدخاله للمتابعة.` 
                        : `We sent a code to ${user?.phone}. Please enter it to continue.`}
                    </p>
                  </div>

                  {otpError && (
                    <div className="p-4 bg-destructive/10 text-destructive text-xs font-bold rounded-2xl animate-in shake duration-300">
                      {otpError}
                    </div>
                  )}

                  <div className="space-y-4">
                    <input 
                      type="text"
                      placeholder="------"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="w-full text-center text-4xl tracking-[1rem] py-6 rounded-3xl bg-secondary/50 border-2 border-transparent focus:border-primary outline-none font-black transition-all"
                      autoFocus
                    />
                    
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setOtpStep("none")}
                        className="flex-1 py-4 rounded-2xl font-black text-muted-foreground hover:bg-secondary transition-all"
                      >
                        {t("common.cancel")}
                      </button>
                      <button 
                        onClick={verifyOTP}
                        disabled={isSaving || otpCode.length < 6}
                        className="flex-1 py-4 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
                      >
                        {isSaving ? <Loader2 className="animate-spin" /> : (language === 'ar' ? "تأكيد" : "Confirm")}
                      </button>
                    </div>
                  </div>
                  
                  <button 
                    onClick={sendOTP}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    {language === 'ar' ? "إعادة إرسال الكود" : "Resend Code"}
                  </button>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
}
