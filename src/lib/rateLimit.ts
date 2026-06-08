import { NextResponse } from "next/server";

// Simple in-memory rate limiting map
const ipCache = new Map<string, { count: number; resetTime: number }>();

// Cleanup interval to prevent memory leaks by cleaning up expired records
if (typeof global !== "undefined") {
  const globalAny = global as any;
  if (!globalAny.__rateLimitCleanupInterval) {
    globalAny.__rateLimitCleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, value] of ipCache.entries()) {
        if (now > value.resetTime) {
          ipCache.delete(key);
        }
      }
    }, 60000); // Run cleanup every minute
  }
}

interface RateLimitConfig {
  limit: number;      // Maximum number of requests allowed
  windowMs: number;   // Time window in milliseconds
}

export function isRateLimited(
  ip: string,
  route: string,
  config: RateLimitConfig
): { limited: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = `${ip}:${route}`;
  const record = ipCache.get(key);

  if (!record || now > record.resetTime) {
    // Start a new time window
    const resetTime = now + config.windowMs;
    ipCache.set(key, { count: 1, resetTime });
    return { limited: false, remaining: config.limit - 1, resetTime };
  }

  if (record.count >= config.limit) {
    return { limited: true, remaining: 0, resetTime: record.resetTime };
  }

  record.count += 1;
  return { limited: false, remaining: config.limit - record.count, resetTime: record.resetTime };
}
