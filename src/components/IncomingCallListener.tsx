"use client";

import { useState, useEffect } from "react";
import { Phone, PhoneOff, Video, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";
import { CallInterface } from "./CallInterface";

export function IncomingCallListener() {
  const { user } = useAuth();
  const { language, dir, t } = useLanguage();
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [activeCall, setActiveCall] = useState<any>(null);
  const [isRinging, setIsRinging] = useState(false);

  const [ringtone] = useState(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/1359/1359-preview.mp3"); // Standard digital ring
      audio.loop = true;
      return audio;
    }
    return null;
  });

  useEffect(() => {
    if (isRinging && ringtone) {
      ringtone.play().catch(e => console.log("Audio play failed, user interaction needed", e));
    } else if (ringtone) {
      ringtone.pause();
      ringtone.currentTime = 0;
    }
  }, [isRinging, ringtone]);

  useEffect(() => {
    if (!user) return;

    const checkCalls = async () => {
      try {
        const res = await fetch("/api/calls");
        const data = await res.json();
        if (data.success && data.data) {
          if (!activeCall && !isRinging) {
            setIncomingCall(data.data);
            setIsRinging(true);
            
            // Vibration for mobile
            if ("vibrate" in navigator) {
              navigator.vibrate([500, 200, 500, 200, 500]);
            }
          }
        } else if (isRinging) {
          // Call was cancelled by caller
          setIsRinging(false);
          setIncomingCall(null);
          if ("vibrate" in navigator) navigator.vibrate(0);
        }
      } catch (err) {
        console.error("Failed to check calls", err);
      }
    };

    const interval = setInterval(checkCalls, 500);
    return () => clearInterval(interval);
  }, [user, activeCall, isRinging]);

  const handleAccept = async () => {
    if (!incomingCall) return;
    
    // Stop vibration
    if ("vibrate" in navigator) navigator.vibrate(0);
    
    setActiveCall(incomingCall);
    setIsRinging(false);
  };

  const handleReject = async () => {
    if (!incomingCall) return;
    
    // Stop vibration
    if ("vibrate" in navigator) navigator.vibrate(0);
    
    try {
      await fetch("/api/calls/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callId: incomingCall._id, status: "rejected" })
      });
    } catch (err) {
      console.error(err);
    }
    setIncomingCall(null);
    setIsRinging(false);
  };

  return (
    <>
      <AnimatePresence>
        {isRinging && incomingCall && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 40 }}
              className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-[3rem] shadow-2xl p-8 text-white relative overflow-hidden"
              dir={dir}
            >
              {/* Animated Background Pulse */}
              <div className="absolute inset-0 z-0 flex items-center justify-center opacity-20">
                 <div className="w-64 h-64 bg-primary rounded-full blur-[100px] animate-pulse" />
              </div>

              <div className="relative z-10 flex flex-col items-center gap-8 text-center">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-primary/40 p-1.5 relative">
                    {incomingCall.caller?.avatar ? (
                      <Image src={incomingCall.caller.avatar} alt="" width={128} height={128} className="rounded-full object-cover w-full h-full shadow-2xl" />
                    ) : (
                      <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center text-4xl font-black">
                        {incomingCall.caller?.name.charAt(0)}
                      </div>
                    )}
                    <div className="absolute -inset-4 border-2 border-primary/20 rounded-full animate-ping" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-primary p-3 rounded-full shadow-2xl border-4 border-slate-900">
                    {incomingCall.type === 'video' ? <Video size={20} /> : <Phone size={20} />}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black">{incomingCall.caller?.name}</h3>
                  <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] animate-pulse">
                    {incomingCall.type === 'video' 
                      ? t("call.incoming.video") 
                      : t("call.incoming.voice")}
                  </p>
                </div>

                <div className="flex items-center gap-4 w-full mt-4">
                  <button
                    onClick={handleReject}
                    className="flex-1 bg-white/5 hover:bg-destructive/20 text-white hover:text-destructive border border-white/10 hover:border-destructive/30 h-20 rounded-[2rem] flex flex-col items-center justify-center gap-2 font-black transition-all group"
                  >
                    <div className="p-3 bg-destructive rounded-full shadow-lg shadow-destructive/20 group-hover:scale-110 transition-transform">
                       <PhoneOff size={24} />
                    </div>
                    <span className="text-[10px] uppercase tracking-widest">{language === 'ar' ? "رفض" : "Reject"}</span>
                  </button>
                  <button
                    onClick={handleAccept}
                    className="flex-1 bg-white/5 hover:bg-green-500/20 text-white hover:text-green-500 border border-white/10 hover:border-green-500/30 h-20 rounded-[2rem] flex flex-col items-center justify-center gap-2 font-black transition-all group"
                  >
                    <div className="p-3 bg-green-500 rounded-full shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform">
                       <Phone size={24} />
                    </div>
                    <span className="text-[10px] uppercase tracking-widest">{language === 'ar' ? "رد" : "Answer"}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {activeCall && (
        <CallInterface
          userName={activeCall.caller?.name || activeCall.receiver?.name}
          userAvatar={activeCall.caller?.avatar || activeCall.receiver?.avatar}
          mode={activeCall.type}
          status="connected"
          onEnd={() => setActiveCall(null)}
          callId={activeCall._id}
          isIncoming={!!activeCall.caller}
        />
      )}
    </>
  );
}
