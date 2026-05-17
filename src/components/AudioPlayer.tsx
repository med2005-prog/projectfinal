"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Loader2, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

interface AudioPlayerProps {
  src: string;
  isSender?: boolean;
  avatar?: string;
}

export function AudioPlayer({ src, isSender, avatar }: AudioPlayerProps) {
  const { dir } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // Consistent waveform bars
  const [waveformBars] = useState(() => 
    [...Array(30)].map(() => Math.random() * 0.6 + 0.3)
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      if (audio.duration && audio.duration !== Infinity) {
        setDuration(audio.duration);
      }
      setIsLoading(false);
    };

    const setAudioTime = () => setCurrentTime(audio.currentTime);

    audio.addEventListener("loadedmetadata", setAudioData);
    audio.addEventListener("timeupdate", setAudioTime);
    audio.addEventListener("ended", () => setIsPlaying(false));

    return () => {
      audio.removeEventListener("loadedmetadata", setAudioData);
      audio.removeEventListener("timeupdate", setAudioTime);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleSpeed = () => {
    const rates = [1, 1.5, 2];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = (currentTime / (duration || 1));

  return (
    <div className={cn(
      "flex items-center gap-3 py-1 min-w-[280px] max-w-full group w-full",
      isSender ? "text-white" : "text-foreground"
    )}>
      <audio ref={audioRef} src={src} preload="metadata" />
      
      {/* Avatar with Mic Indicator */}
      <div className="relative shrink-0">
        <div className={cn(
          "w-12 h-12 rounded-full overflow-hidden shadow-sm",
          isSender ? "bg-white/20" : "bg-secondary"
        )}>
          {avatar ? (
            <Image src={avatar} alt="" width={48} height={48} className="object-cover w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-40">
               <Mic size={24} />
            </div>
          )}
        </div>
        <div className={cn(
          "absolute -bottom-1 w-5 h-5 rounded-full flex items-center justify-center shadow-md",
          dir === 'rtl' ? '-left-1' : '-right-1',
          isSender ? "bg-white text-primary" : "bg-primary text-white"
        )}>
          <Mic size={10} strokeWidth={3} className={isSender ? "text-blue-500" : "text-white"} />
        </div>
      </div>

      {/* Play/Pause Button */}
      <button 
        onClick={togglePlay}
        disabled={isLoading}
        className="shrink-0 transition-transform active:scale-90 ml-1 mr-1"
      >
        {isLoading ? (
          <Loader2 className="animate-spin opacity-50" size={32} />
        ) : isPlaying ? (
          <Pause size={32} fill="currentColor" className="border-0" />
        ) : (
          <Play size={32} fill="currentColor" className="border-0" />
        )}
      </button>

      {/* Waveform & Time */}
      <div className="flex-1 flex flex-col min-w-0 justify-center h-12 relative">
        <div className="relative h-6 flex items-center gap-[3px] w-full mt-1">
          {waveformBars.map((height, i) => {
            const barProgress = i / waveformBars.length;
            const isActive = progress >= barProgress;
            return (
              <div 
                key={i}
                className={cn(
                  "flex-1 rounded-full transition-all duration-150 min-w-[2px]",
                  isActive 
                    ? (isSender ? "bg-white" : "bg-primary") 
                    : (isSender ? "bg-white/40" : "bg-primary/30")
                )}
                style={{ 
                  height: `${height * 100}%`,
                }}
              />
            );
          })}
          
          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={currentTime}
            onChange={(e) => {
              const time = parseFloat(e.target.value);
              setCurrentTime(time);
              if (audioRef.current) audioRef.current.currentTime = time;
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
        </div>
        
        <div className={cn(
          "text-[11px] font-bold mt-1 opacity-90",
          dir === 'rtl' ? "text-left" : "text-right"
        )}>
           <span>{currentTime > 0 ? formatTime(currentTime) : (duration > 0 ? formatTime(duration) : "0:00")}</span>
        </div>
      </div>

      {/* Speed Button (Appears on right like WhatsApp) */}
      <button 
        onClick={toggleSpeed}
        className={cn(
          "shrink-0 px-1.5 py-0.5 rounded bg-black/5 text-[10px] font-black tracking-tighter transition-all hover:bg-black/10",
          isSender ? "text-white bg-white/20" : "text-primary bg-primary/5"
        )}
      >
        {playbackRate}x
      </button>
    </div>
  );
}
