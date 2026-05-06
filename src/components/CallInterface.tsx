"use client";

import { useState, useEffect, useRef } from "react";
import { 
  PhoneOff, Mic, MicOff, Volume2, User, 
  ShieldCheck, Video, VideoOff, Camera, Loader2 
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

interface CallInterfaceProps {
  userName: string;
  userAvatar?: string;
  onEnd: () => void;
  status?: "calling" | "connected" | "ended";
  mode?: "audio" | "video";
  callId?: string;
  isIncoming?: boolean;
}

export function CallInterface({ 
  userName, 
  userAvatar, 
  onEnd, 
  status: initialStatus = "calling",
  mode: initialMode = "audio",
  callId,
  isIncoming = false
}: CallInterfaceProps) {
  const { t, dir } = useLanguage();
  const [status, setStatus] = useState(initialStatus);
  const [mode, setMode] = useState(initialMode);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(mode === "video");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pc = useRef<RTCPeerConnection | null>(null);

  const addedCandidates = useRef<Set<string>>(new Set());
  
  const [outgoingRingtone] = useState(() => {
    if (typeof window !== 'undefined' && !isIncoming) {
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/1350/1350-preview.mp3"); // Outgoing pulse
      audio.loop = true;
      return audio;
    }
    return null;
  });

  useEffect(() => {
    if (status === "calling" && outgoingRingtone && !isIncoming) {
      outgoingRingtone.play().catch(() => {});
    } else if (outgoingRingtone) {
      outgoingRingtone.pause();
      outgoingRingtone.currentTime = 0;
    }
  }, [status, outgoingRingtone, isIncoming]);

  // Initialize WebRTC
  useEffect(() => {
    if (!callId) return;
    
    const initWebRTC = async () => {
      try {
        console.log("Initializing WebRTC for call:", callId, "isIncoming:", isIncoming);
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: mode === "video", 
          audio: true 
        });
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        const config = { iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" }
        ] };
        pc.current = new RTCPeerConnection(config);

        stream.getTracks().forEach(track => {
          console.log("Adding track:", track.kind);
          pc.current?.addTrack(track, stream);
        });

        pc.current.ontrack = (event) => {
          console.log("Received remote track:", event.streams[0]);
          setRemoteStream(event.streams[0]);
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
          setStatus("connected");
        };

        pc.current.oniceconnectionstatechange = () => {
          console.log("ICE Connection State:", pc.current?.iceConnectionState);
          if (pc.current?.iceConnectionState === "disconnected" || 
              pc.current?.iceConnectionState === "failed" || 
              pc.current?.iceConnectionState === "closed") {
            handleEnd();
          }
        };

        pc.current.onicecandidate = (event) => {
          if (event.candidate) {
            fetch("/api/calls/ice", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                callId, 
                candidate: event.candidate, 
                role: isIncoming ? "receiver" : "caller" 
              })
            });
          }
        };

        if (isIncoming) {
          // Receiver side
          const res = await fetch(`/api/calls/${callId}`);
          const data = await res.json();
          if (data.success && data.data.sdpOffer) {
            console.log("Receiver: Setting remote description (offer)");
            await pc.current.setRemoteDescription(new RTCSessionDescription(JSON.parse(data.data.sdpOffer)));
            const answer = await pc.current.createAnswer();
            await pc.current.setLocalDescription(answer);
            
            await fetch("/api/calls/respond", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                callId, 
                status: "ongoing", 
                sdpAnswer: JSON.stringify(answer) 
              })
            });
          }
        } else {
          // Caller side
          console.log("Caller: Creating offer");
          const offer = await pc.current.createOffer();
          await pc.current.setLocalDescription(offer);
          
          await fetch("/api/calls", { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              callId, 
              sdpOffer: JSON.stringify(offer) 
            })
          });
        }
      } catch (err) {
        console.error("WebRTC Init Error:", err);
      }
    };

    initWebRTC();

    return () => {
      pc.current?.close();
      localStream?.getTracks().forEach(t => t.stop());
    };
  }, [callId, isIncoming, mode]);

  // Polling for Answer (Caller side) and ICE Candidates
  useEffect(() => {
    if (!callId || status === "ended") return;

    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/calls/${callId}`);
        const data = await res.json();
        
        if (data.success) {
          const call = data.data;
          
          if (call.status === "rejected" || call.status === "ended") {
            handleEnd();
            return;
          }

          // Handle SDP Answer (Caller only)
          if (!isIncoming && call.sdpAnswer && pc.current?.signalingState === "have-local-offer") {
            console.log("Caller: Received answer, setting remote description");
            await pc.current.setRemoteDescription(new RTCSessionDescription(JSON.parse(call.sdpAnswer)));
          }

          // Handle ICE Candidates
          const remoteCandidatesField = isIncoming ? "callerIceCandidates" : "receiverIceCandidates";
          const candidates = call[remoteCandidatesField] || [];
          for (const candStr of candidates) {
            if (!addedCandidates.current.has(candStr)) {
              try {
                const cand = JSON.parse(candStr);
                await pc.current?.addIceCandidate(new RTCIceCandidate(cand));
                addedCandidates.current.add(candStr);
                console.log("Added remote ICE candidate");
              } catch (e) {}
            }
          }
        }
      } catch (err) {}
    }, 500);

    return () => clearInterval(poll);
  }, [callId, status, isIncoming]);

  // Ensure remote stream is attached when element mounts
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, status]);

  // Ensure local stream is attached when video is turned on
  useEffect(() => {
    if (isVideoOn && localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [isVideoOn, localStream]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === "connected") {
      timer = setInterval(() => setDuration((prev) => prev + 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [status]);

  // Apply Mute and Video toggles to tracks
  useEffect(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });
      
      const videoTracks = localStream.getVideoTracks();
      if (isVideoOn && videoTracks.length === 0) {
        // Upgrade to video: fetch video track
        const upgradeVideo = async () => {
          try {
            const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
            const videoTrack = videoStream.getVideoTracks()[0];
            localStream.addTrack(videoTrack);
            if (pc.current) {
              pc.current.addTrack(videoTrack, localStream);
              // Re-negotiate
              const offer = await pc.current.createOffer();
              await pc.current.setLocalDescription(offer);
              // Send new offer... (Simplified for now, standard WebRTC renegotiation)
            }
            // Trigger re-render of effect
            setLocalStream(new MediaStream(localStream.getTracks()));
          } catch (err) {
            console.error("Failed to upgrade to video", err);
            setIsVideoOn(false);
          }
        };
        upgradeVideo();
      } else {
        videoTracks.forEach(track => {
          track.enabled = isVideoOn;
        });
      }
    }
  }, [isMuted, isVideoOn, localStream]);

  // Handle Speaker (Volume) toggle
  useEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = !isSpeaker;
    }
  }, [isSpeaker]);

  // Handle tab close/navigation
  useEffect(() => {
    const handleBeforeUnload = () => {
      handleEnd();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [callId, localStream]);

  const handleEnd = async () => {
    if (callId) {
      // Don't wait for fetch to update UI
      fetch("/api/calls/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callId, status: "ended" })
      });
    }
    pc.current?.close();
    localStream?.getTracks().forEach(track => track.stop());
    setStatus("ended");
    onEnd();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-[300] bg-slate-950 flex flex-col items-center justify-between overflow-hidden text-white" dir={dir}>
      {/* Remote Video Background */}
      <div className="absolute inset-0 z-0 bg-slate-900">
        <video 
          ref={remoteVideoRef} 
          autoPlay 
          playsInline 
          className={cn(
            "w-full h-full object-cover transition-opacity duration-1000",
            remoteStream ? "opacity-100" : "opacity-0"
          )}
        />
        
        {!remoteStream && (
          <div className="absolute inset-0 flex items-center justify-center">
            {userAvatar ? (
               <div className="relative w-full h-full">
                  <Image src={userAvatar} alt="" fill className="object-cover blur-3xl opacity-30" />
                  <div className="absolute inset-0 flex items-center justify-center">
                     <div className="w-40 h-40 rounded-full border-4 border-white/10 overflow-hidden shadow-2xl">
                        <Image src={userAvatar} alt="" width={160} height={160} className="w-full h-full object-cover" />
                     </div>
                  </div>
               </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center opacity-10">
                <User size={200} />
              </div>
            )}
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40" />
      </div>

      {/* Local Preview */}
      {isVideoOn && (
        <motion.div 
          drag
          dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
          className={cn(
            "absolute top-8 w-32 h-48 bg-slate-800 rounded-2xl border border-white/20 shadow-2xl overflow-hidden z-20 cursor-move",
            dir === 'rtl' ? 'left-8' : 'right-8'
          )}
        >
          <video 
            ref={localVideoRef} 
            autoPlay 
            muted 
            playsInline 
            className="w-full h-full object-cover mirror"
          />
        </motion.div>
      )}

      {/* Header Info */}
      <div className="relative z-10 flex flex-col items-center gap-6 mt-12 text-center">
        {status !== "connected" && !remoteStream && (
          <div className="relative">
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-32 h-32 rounded-full border-2 border-primary/50 flex items-center justify-center p-1"
            >
              {userAvatar ? (
                <Image src={userAvatar} alt={userName} width={128} height={128} className="rounded-full object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center">
                  <User size={64} className="text-white/20" />
                </div>
              )}
            </motion.div>
          </div>
        )}
        
        <div className="space-y-1">
          <h2 className="text-3xl font-black">{userName}</h2>
          <p className={cn(
            "text-sm font-bold uppercase tracking-[0.2em]",
            status === "connected" ? "text-green-400" : "text-primary animate-pulse"
          )}>
            {status === "calling" ? t("call.calling") : status === "connected" ? formatDuration(duration) : t("call.ended")}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="relative z-10 w-full max-w-lg px-6 flex flex-col gap-8 mb-12">
        <div className="flex items-center justify-center gap-6">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center transition-all",
              isMuted ? "bg-white text-slate-950" : "bg-white/10 text-white hover:bg-white/20"
            )}
          >
            {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
          </button>

          <button 
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center transition-all",
              isVideoOn ? "bg-white text-slate-950" : "bg-white/10 text-white hover:bg-white/20"
            )}
          >
            {isVideoOn ? <Video size={22} /> : <VideoOff size={22} />}
          </button>

          <button 
            onClick={handleEnd}
            className="w-16 h-16 bg-destructive text-white rounded-full flex items-center justify-center shadow-2xl shadow-destructive/40 hover:scale-105 active:scale-95 transition-all"
          >
            <PhoneOff size={28} />
          </button>

          <button 
            onClick={() => setIsSpeaker(!isSpeaker)}
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center transition-all",
              isSpeaker ? "bg-white text-slate-950" : "bg-white/10 text-white hover:bg-white/20"
            )}
          >
            <Volume2 size={22} />
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 opacity-40">
          <ShieldCheck size={14} className="text-green-400" />
          <span className="text-[10px] font-black uppercase tracking-widest">{t("call.secure")}</span>
        </div>
      </div>
    </div>
  );
}
