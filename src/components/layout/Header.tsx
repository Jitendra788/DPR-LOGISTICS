"use client";

import { Bell, ChevronDown, LogOut, Menu, Moon, Sun, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api-client";
import { ADMIN_HOME } from "@/lib/admin-routes";
import { BrandLogo } from "@/components/BrandLogo";
import { useTheme } from "@/hooks/useTheme";
import { GlobalSearch } from "./GlobalSearch";

type Props = {
  collapsed: boolean;
  onToggle: () => void;
  isDesktop: boolean;
  mobileOpen: boolean;
};

type SessionUser = { username?: string; name?: string; branch?: string };

type NoteItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  count: number;
};

export function Header({ collapsed, onToggle, isDesktop, mobileOpen }: Props) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [badge, setBadge] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notesRef = useRef<HTMLDivElement>(null);

  function loadNotes() {
    api<{ badge: number; items: NoteItem[] }>("/api/notifications")
      .then((res) => {
        setNotes(res.items ?? []);
        setBadge(res.badge ?? 0);
      })
      .catch(() => undefined);
  }

  useEffect(() => {
    api<{ user: SessionUser | null }>("/api/auth/me")
      .then((res) => setUser(res.user))
      .catch(() => undefined);
    loadNotes();
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
          <Link href={ADMIN_HOME} className="erp-header-logo">
            <BrandLogo variant="header" width={120} height={48} className="erp-header-logo-img" />
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
              setNotesOpen((v) => {
                const next = !v;
                if (next) loadNotes();
                return next;
              });
              setProfileOpen(false);
            }}
          >
            <Bell className="h-5 w-5" />
            {badge > 0 ? <span className="erp-badge">{badge > 99 ? "99+" : badge}</span> : null}
          </button>
          {notesOpen ? (
            <div className="erp-dropdown erp-dropdown-wide" role="menu">
              <p className="erp-dropdown-title">{badge ? `You have ${badge} notification${badge === 1 ? "" : "s"}` : "Notifications"}</p>
              {notes.length ? (
                notes.map((n) => (
                  <Link key={n.id} href={n.href} className="erp-dropdown-item erp-note-item" onClick={() => setNotesOpen(false)}>
                    <span>
                      <span className="erp-note-title">{n.title}</span>
                      <span className="erp-note-detail">{n.detail}</span>
                    </span>
                    <strong>{n.count}</strong>
                  </Link>
                ))
              ) : (
                <p className="erp-dropdown-empty">No pending alerts</p>
              )}
              <Link href="/dashboard" className="erp-dropdown-foot" onClick={() => setNotesOpen(false)}>
                View dashboard
              </Link>
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
