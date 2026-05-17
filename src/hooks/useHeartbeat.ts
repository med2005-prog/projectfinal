"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function useHeartbeat() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const ping = () => {
      fetch("/api/auth/heartbeat", { method: "POST" }).catch(() => {});
    };

    // Ping immediately
    ping();

    // Then every 0.5 seconds (Extreme speed)
    const interval = setInterval(ping, 500);

    return () => clearInterval(interval);
  }, [user]);
}
