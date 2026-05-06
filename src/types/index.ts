// ─── Shared Types ──────────────────────────────────────────────────────────

export type PostType = "lost" | "found";
export type PostStatus = "active" | "resolved" | "deleted";

export interface Author {
  _id: string;
  name: string;
  avatar?: string;
  isVerified?: boolean;
}

export interface Post {
  _id: string;
  type: PostType;
  title: string;
  description: string;
  category: string;
  location: string;
  city: string;
  date: string; // ISO string from JSON
  images: string[];
  locationCoords?: {
    lat: number;
    lng: number;
  };
  author: Author;
  status: PostStatus;
  boosted: boolean;
  createdAt: string; // ISO string from JSON
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
