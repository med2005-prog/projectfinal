import { useState, useEffect, useCallback } from "react";
import { Post, ApiResponse } from "@/types";

export function usePosts(filters: { type?: string; category?: string; q?: string; lat?: number; lng?: number; radius?: number } = {}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const searchParams = new URLSearchParams();
      if (filters.type && filters.type !== "all") searchParams.append("type", filters.type);
      if (filters.category) searchParams.append("category", filters.category);
      if (filters.q) searchParams.append("q", filters.q);
      if (filters.lat !== undefined) searchParams.append("lat", filters.lat.toString());
      if (filters.lng !== undefined) searchParams.append("lng", filters.lng.toString());
      if (filters.radius !== undefined) searchParams.append("radius", filters.radius.toString());

      const response = await fetch(`/api/posts?${searchParams.toString()}`);
      const result: ApiResponse<Post[]> = await response.json();

      if (result.success) {
        setPosts(result.data);
        setError(null);
      } else {
        setError(result.error || "Failed to fetch posts");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [filters.type, filters.category, filters.q, filters.lat, filters.lng, filters.radius]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, error, refetch: fetchPosts };
}
