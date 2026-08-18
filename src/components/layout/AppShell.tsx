"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { isMarketingRoute } from "@/lib/marketing-routes";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { ThemeInit } from "./ThemeInit";

const COLLAPSE_KEY = "dpr_sidebar_collapsed";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!isDesktop) setMobileOpen(false);
  }, [pathname, isDesktop]);

  function onToggle() {
    if (isDesktop) {
      setCollapsed((v) => {
        const next = !v;
        try {
          localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
        } catch {
          /* ignore */
        }
        return next;
      });
    } else {
      setMobileOpen((v) => !v);
    }
  }

  if (
    isMarketingRoute(pathname) ||
    pathname === "/login" ||
    pathname.startsWith("/customer-booking") ||
    pathname.startsWith("/booking/lr/print") ||
    pathname.startsWith("/lhc/contract/print") ||
    pathname.startsWith("/bills/print") ||
    pathname.startsWith("/roadways/booking-slip/print")
  ) {
    return (
      <>
        <ThemeInit />
        {children}
      </>
    );
  }

  const sidebarOpen = isDesktop || mobileOpen;
  const rail = isDesktop && collapsed;

  return (
    <div className="app-shell min-h-screen bg-content" suppressHydrationWarning>
      <ThemeInit />
      {!isDesktop && mobileOpen ? (
        <button
          type="button"
          className="erp-backdrop"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}
      <Sidebar
        open={sidebarOpen}
        collapsed={rail}
        isDesktop={isDesktop}
        onNavigate={() => !isDesktop && setMobileOpen(false)}
      />
      <main className={`erp-main ${isDesktop ? (rail ? "erp-main-rail" : "erp-main-open") : ""}`}>
        <Header
          collapsed={rail}
          onToggle={onToggle}
          isDesktop={isDesktop}
          mobileOpen={mobileOpen}
        />
        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}
