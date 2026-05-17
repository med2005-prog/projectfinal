"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Trash2, Play, Pause, Loader2, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface VoiceRecorderProps {
  onSend: (audioBlob: Blob) => void;
  onCancel: () => void;
}

export function VoiceRecorder({ onSend, onCancel }: VoiceRecorderProps) {
  const { language, t, dir } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const shouldSendRef = useRef(false);
  const isInitializing = useRef(false);

  useEffect(() => {
    if (isInitializing.current) return;
    isInitializing.current = true;
    
    startRecording();
    return () => {
      isInitializing.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current) {
        if (mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
        }
        mediaRecorderRef.current.stream.getTracks().forEach(track => {
          track.stop();
          track.enabled = false;
        });
      }
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const startRecording = async () => {
    setError(null);
    // Safety delay to allow browser to release hardware from previous sessions
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      // Force stop any lingering tracks in this window
      try {
        const existingStreams = await navigator.mediaDevices.enumerateDevices();
        // This is a hint to the browser to prepare
      } catch (e) {}

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        if (shouldSendRef.current) {
          onSend(blob);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (err: any) {
      console.error("Error accessing microphone:", err);
      if (err.name === "NotReadableError") {
        setError(language === 'ar' ? "الميكروفون مشغول حالياً" : "Le micro est déjà utilisé");
      } else {
        setError(language === 'ar' ? "فشل الوصول إلى الميكروفون" : "Échec d'accès au micro");
      }
      setTimeout(() => onCancel(), 3000); 
    }
  };

  const handleStopAndSend = () => {
    if (mediaRecorderRef.current && isRecording) {
      shouldSendRef.current = true;
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    } else if (audioBlob) {
      onSend(audioBlob);
    }
  };

  const handleCancel = () => {
    if (mediaRecorderRef.current && isRecording) {
      shouldSendRef.current = false;
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
    onCancel();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    if (!audioRef.current && audioBlob) {
      audioRef.current = new Audio(URL.createObjectURL(audioBlob));
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex items-center gap-3 bg-secondary/80 px-4 py-1.5 min-h-[48px] rounded-[24px] shadow-sm border border-border/50 w-full">
      {isRecording ? (
        <>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-destructive rounded-full animate-pulse" />
            <span className="text-[15px] font-mono text-foreground">{formatTime(recordingTime)}</span>
          </div>
          
          <div className="flex-1 flex justify-center text-muted-foreground/70 text-sm font-medium animate-pulse">
            {language === 'ar' ? "تحدث الآن..." : "Parlez maintenant..."}
          </div>

          <button onClick={handleCancel} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
            <Trash2 size={20} />
          </button>
          
          <button 
            onClick={handleStopAndSend}
            className="w-10 h-10 shrink-0 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:opacity-90 transition-all shadow-md ml-auto"
          >
            <Send size={18} className={dir === 'rtl' ? 'mr-0.5 rotate-180' : 'ml-0.5'} />
          </button>
        </>
      ) : audioBlob ? (
        <>
          <button onClick={handlePlayPause} className="p-2 text-primary hover:bg-primary/10 rounded-full">
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </button>
          <div className="flex-1 text-sm font-bold text-muted-foreground">
            {t("common.voiceMessage")} ({formatTime(recordingTime)})
          </div>
          <button onClick={handleCancel} className="p-2 text-muted-foreground hover:text-destructive">
            <Trash2 size={18} />
          </button>
          
          <button 
            onClick={handleStopAndSend}
            className="w-10 h-10 shrink-0 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:opacity-90 transition-all shadow-md ml-auto"
          >
            <Send size={18} className={dir === 'rtl' ? 'mr-0.5 rotate-180' : 'ml-0.5'} />
          </button>
        </>
      ) : error ? (
        <div className="flex-1 flex items-center justify-between gap-2 px-2">
           <span className="text-[10px] font-bold text-destructive animate-pulse truncate">{error}</span>
           <button 
             onClick={() => startRecording()} 
             className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full hover:bg-primary/20 transition-all"
           >
             {language === 'ar' ? "إعادة" : "Réessayer"}
           </button>
           <button onClick={onCancel} className="p-1 text-muted-foreground hover:text-destructive">
             <X size={14} />
           </button>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
           <Loader2 size={16} className="animate-spin" />
        </div>
      )}
    </div>
  );
}
