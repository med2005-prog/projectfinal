"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface ImageUploadProps {
  onUpload: (url: string) => void;
  onRemove: () => void;
  value?: string;
  onChangeLoading?: (loading: boolean) => void;
}

export function ImageUpload({ onUpload, onRemove, value, onChangeLoading }: ImageUploadProps) {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    onChangeLoading?.(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      if (data.success && data.url) {
        onUpload(data.url);
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error uploading image");
    } finally {
      setLoading(false);
      onChangeLoading?.(false);
    }
  };

  return (
    <div className="space-y-4">
      {value ? (
        <div className="relative aspect-video rounded-2xl overflow-hidden group border border-border shadow-sm">
          <img src={value} alt="Upload preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button 
              type="button"
              onClick={onRemove}
              className="bg-destructive text-white p-2 rounded-full hover:scale-110 transition-transform shadow-lg"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "aspect-video rounded-2xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group",
            loading && "pointer-events-none opacity-60"
          )}
        >
          {loading ? (
            <Loader2 className="animate-spin text-primary" size={32} />
          ) : (
            <>
              <div className="p-4 rounded-full bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <ImageIcon size={32} />
              </div>
              <div className="text-center">
                <p className="font-bold">
                  {t("common.clickToUpload")}
                </p>
                <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-2">
                  PNG, JPG حتى 10MB
                </p>
              </div>
            </>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*" 
          />
        </div>
      )}
    </div>
  );
}
