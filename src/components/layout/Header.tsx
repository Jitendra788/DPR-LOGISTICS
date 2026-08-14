"use client";

import { Bell, ChevronDown, LogOut, Menu, Moon, Sun, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api-client";
import { useTheme } from "@/hooks/useTheme";
import { GlobalSearch } from "./GlobalSearch";

type Props = {
  collapsed: boolean;
  onToggle: () => void;
  isDesktop: boolean;
  mobileOpen: boolean;
};

type SessionUser = { username?: string; name?: string; branch?: string };

type DashStats = {
  pendingLorryHire: number;
  pendingBill: number;
};

export function Header({ collapsed, onToggle, isDesktop, mobileOpen }: Props) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [stats, setStats] = useState<DashStats>({ pendingLorryHire: 0, pendingBill: 0 });
  const [profileOpen, setProfileOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api<{ user: SessionUser | null }>("/api/auth/me")
      .then((res) => setUser(res.user))
      .catch(() => undefined);
    api<DashStats>("/api/dashboard")
      .then((res) =>
        setStats({
          pendingLorryHire: res.pendingLorryHire ?? 0,
          pendingBill: res.pendingBill ?? 0,
        }),
      )
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (profileRef.current && !profileRef.current.contains(t)) setProfileOpen(false);
      if (notesRef.current && !notesRef.current.contains(t)) setNotesOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const displayName = user?.name || (user?.username ? capitalize(user.username) : "Admin User");
  const badge = stats.pendingBill + stats.pendingLorryHire;

  return (
    <header className="erp-header">
      <div className="erp-header-left">
        <button
          type="button"
          onClick={onToggle}
          className="erp-icon-btn"
          aria-label={isDesktop ? (collapsed ? "Expand sidebar" : "Collapse sidebar") : mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={isDesktop ? !collapsed : mobileOpen}
        >
          <Menu className="h-5 w-5" />
        </button>
        {(!isDesktop || collapsed) && (
          <Link href="/" className="erp-header-logo">
            DPR Logistics
          </Link>
        )}
      </div>

      <GlobalSearch />

      <div className="erp-header-right">
        <button
          type="button"
          className="erp-icon-btn erp-theme-toggle"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          onClick={toggleTheme}
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <div className="relative" ref={notesRef}>
          <button
            type="button"
            className="erp-icon-btn"
            aria-label={`Notifications${badge ? `, ${badge} pending` : ""}`}
            aria-expanded={notesOpen}
            onClick={() => {
              setNotesOpen((v) => !v);
              setProfileOpen(false);
            }}
          >
            <Bell className="h-5 w-5" />
            {badge > 0 ? <span className="erp-badge">{badge > 99 ? "99+" : badge}</span> : null}
          </button>
          {notesOpen ? (
            <div className="erp-dropdown erp-dropdown-wide" role="menu">
              <p className="erp-dropdown-title">Alerts</p>
              <Link href="/bills/generation" className="erp-dropdown-item" onClick={() => setNotesOpen(false)}>
                <span>Pending bills</span>
                <strong>{stats.pendingBill}</strong>
              </Link>
              <Link href="/lhc/contract" className="erp-dropdown-item" onClick={() => setNotesOpen(false)}>
                <span>Pending lorry hire</span>
                <strong>{stats.pendingLorryHire}</strong>
              </Link>
              {badge === 0 ? <p className="erp-dropdown-empty">No pending alerts</p> : null}
            </div>
          ) : null}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            type="button"
            className="erp-profile-btn"
            aria-label="User menu"
            aria-expanded={profileOpen}
            onClick={() => {
              setProfileOpen((v) => !v);
              setNotesOpen(false);
            }}
          >
            <span className="erp-avatar erp-avatar-sm" aria-hidden>
              <UserRound className="h-4 w-4" />
            </span>
            <span className="erp-profile-meta">
              <span className="erp-profile-name">{displayName}</span>
              <span className="erp-profile-role">{user?.branch || "DPR Logistics"}</span>
            </span>
            <ChevronDown className="h-4 w-4 opacity-70" />
          </button>
          {profileOpen ? (
            <div className="erp-dropdown" role="menu">
              <p className="erp-dropdown-title">{displayName}</p>
              <Link href="/master/users" className="erp-dropdown-item" onClick={() => setProfileOpen(false)}>
                Profile / Users
              </Link>
              <button type="button" className="erp-dropdown-item text-left" onClick={toggleTheme}>
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </button>
              <button type="button" className="erp-dropdown-item text-left" onClick={logout}>
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
