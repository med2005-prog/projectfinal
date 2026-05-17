"use client";

import { useState, useEffect } from "react";
import { Bell, Check, Trash2, Loader2, MessageCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const { t, dir } = useLanguage();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true })
      });
      if (res.ok) {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "match": return <CheckCircle2 className="text-green-500" size={20} />;
      case "message": return <MessageCircle className="text-blue-500" size={20} />;
      case "boost_expiry": return <AlertTriangle className="text-amber-500" size={20} />;
      default: return <Info className="text-primary" size={20} />;
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="animate-spin text-primary" size={40} /></div>;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4" dir={dir}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight">{t("notif.title")}</h1>
          <p className="text-muted-foreground font-bold">{t("notif.subtitle")}</p>
        </div>
        <button 
          onClick={markAllAsRead}
          className="text-sm font-black text-primary hover:underline flex items-center gap-2"
        >
          <Check size={16} />
          {t("notif.markRead")}
        </button>
      </div>

      <div className="space-y-4">
        {notifications.length > 0 ? notifications.map((notif) => (
          <div 
            key={notif._id}
            onClick={() => !notif.isRead && markAsRead(notif._id)}
            className={cn(
              "p-6 rounded-[2rem] border transition-all cursor-pointer relative overflow-hidden group",
              notif.isRead ? "bg-card/50 opacity-70" : "bg-card shadow-lg border-primary/20"
            )}
          >
            {!notif.isRead && <div className="absolute top-0 left-0 w-1 h-full bg-primary" />}
            
            <div className="flex gap-4">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                notif.isRead ? "bg-secondary" : "bg-primary/10"
              )}>
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-black text-sm">{notif.title}</h3>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{notif.message}</p>
              </div>
            </div>
          </div>
        )) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-30">
            <Bell size={64} />
            <p className="text-xl font-black">{t("notif.empty")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
