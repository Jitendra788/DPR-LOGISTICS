"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const INTERVAL_MS = 45_000;

/**
 * Keeps lastSeenAt fresh and forces login redirect when sessionVersion is revoked
 * (e.g. password changed).
 */
export function SessionHeartbeat() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/login") return;

    let cancelled = false;

    async function ping() {
      try {
        const res = await fetch("/api/auth/session", {
          method: "POST",
          credentials: "include",
        });
        if (cancelled) return;
        if (res.status === 401) {
          const next = `${window.location.pathname}${window.location.search}`;
          const login = next && next !== "/" ? `/login?next=${encodeURIComponent(next)}` : "/login";
          window.location.assign(login);
        }
      } catch {
        /* network blip — retry on next interval */
      }
    }

    void ping();
    const id = window.setInterval(() => void ping(), INTERVAL_MS);
    const onFocus = () => void ping();
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [pathname]);

  return null;
}
