"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Trash2, Play, Pause, Loader2, Send } from "lucide-react";
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
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const shouldSendRef = useRef(false);

  useEffect(() => {
    startRecording();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
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
    try {
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
    } catch (err) {
      console.error("Error accessing microphone:", err);
      onCancel(); // exit if no mic
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
      ) : (
        <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
           <Loader2 size={16} className="animate-spin" />
        </div>
      )}
    </div>
  );
}
