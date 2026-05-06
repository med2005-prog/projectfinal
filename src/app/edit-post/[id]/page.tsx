"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { ImageUpload } from "@/components/ImageUpload";
import { Loader2, Save, ArrowLeft } from "lucide-react";

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { t, dir, language } = useLanguage();
  const resolvedParams = use(params);
  
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: ""
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${resolvedParams.id}`);
        const data = await res.json();
        if (data.success) {
          if (data.data.author._id !== user?._id) {
            router.push("/"); // Only owner can edit
            return;
          }
          setPost(data.data);
          setFormData({
            title: data.data.title || "",
            description: data.data.description || "",
            imageUrl: data.data.imageUrl || ""
          });
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    if (user && resolvedParams.id) fetchPost();
  }, [user, resolvedParams.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/posts/${resolvedParams.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/posts/${resolvedParams.id}`);
      } else {
        setError(data.error || "Failed to update");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-6" dir={dir}>
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-2 text-muted-foreground mb-6 hover:text-foreground"
      >
        <ArrowLeft size={20} className={dir === 'rtl' ? 'rotate-180' : ''} />
        {t("common.back")}
      </button>

      <div className="glass-card p-8 rounded-3xl border">
        <h1 className="text-3xl font-black mb-8">
          {t("edit.title")}
        </h1>

        {error && <p className="text-destructive mb-4 font-bold">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2">
              {t("common.title")}
              {t("form.whatLost")}
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full p-4 rounded-xl border bg-secondary/50 focus:ring-2 focus:ring-primary outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">
              {t("form.details")}
            </label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              rows={5}
              className="w-full p-4 rounded-xl border bg-secondary/50 focus:ring-2 focus:ring-primary outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">
              {t("form.image")}
            </label>
            <ImageUpload
              value={formData.imageUrl}
              onChange={(url) => setFormData({...formData, imageUrl: url})}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-primary text-white p-4 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            {t("edit.save")}
          </button>
        </form>
      </div>
    </div>
  );
}
