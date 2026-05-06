import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function optimizeImage(url: string, width = 800, quality = 'auto') {
  if (!url) return url;
  if (url.includes('cloudinary.com')) {
    const parts = url.split('/upload/');
    if (parts.length === 2) {
      return `${parts[0]}/upload/c_scale,w_${width},q_${quality},f_auto/${parts[1]}`;
    }
  }
  return url;
}

