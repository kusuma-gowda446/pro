"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { logout } from "@/app/actions";

export function AutoLock() {
  const router = useRouter();
  const pathname = usePathname();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 5 minutes = 300,000 ms
  const TIMEOUT_MS = 5 * 60 * 1000;

  const performLogout = async () => {
    // Attempt client-side redirect immediately for better UX
    router.push("/login");
    await logout();
  };

  useEffect(() => {
    // Don't run auto-lock logic on the login page itself
    if (pathname === "/login") return;

    const resetTimer = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        performLogout();
      }, TIMEOUT_MS);
    };

    // Set up inactivity listeners
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer, { passive: true });
    });
    
    resetTimer();

    // Lock on refresh / close
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Use sendBeacon to immediately invalidate the session cookie on the server
      navigator.sendBeacon('/api/auth/logout');
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [pathname]);

  return null;
}
