"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Lock, ShieldCheck, Truck, UserRound } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { api } from "@/lib/api-client";
import { homePathForModules, modulesFromSession } from "@/lib/modules";
import "./login.css";

function safeNextPath(fallback: string) {
  if (typeof window === "undefined") return fallback;
  const raw = new URLSearchParams(window.location.search).get("next");
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/login")) return fallback;
  return raw;
}

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setUsernameError("");
    setPasswordError("");

    const form = new FormData(e.currentTarget);
    const username = form.get("username");
    const password = form.get("password");

    let invalid = false;
    if (!String(username ?? "").trim()) {
      setUsernameError("Enter your username");
      invalid = true;
    }
    if (!String(password ?? "")) {
      setPasswordError("Enter your password");
      invalid = true;
    }
    if (invalid) return;

    setLoading(true);
    try {
      const res = await api<{ modules?: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      const home = homePathForModules(modulesFromSession(res.modules ?? "*"));
      router.push(safeNextPath(home));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dpr-login">
      <main className="dpr-login-main">
        <div className="dpr-login-stack">
          <section className="dpr-login-card" aria-labelledby="login-heading">
            <div className="dpr-login-brand">
              <BrandLogo variant="header" width={200} height={80} priority className="dpr-login-logo" />
              <div>
                <p>DPR Logistics — Transport &amp; Logistics Management System</p>
              </div>
            </div>

            <div className="dpr-login-intro">
              <h1 id="login-heading">DPR Login</h1>
              <p>Sign in to the DPR Logistics admin portal &amp; operations dashboard</p>
            </div>

            {error ? (
              <p className="dpr-login-alert" role="alert">
                {error}
              </p>
            ) : null}

            <form className="dpr-login-form" onSubmit={onSubmit} noValidate>
              <div className="dpr-login-field">
                <label htmlFor="username">Username</label>
                <div className="dpr-login-input-wrap">
                  <UserRound className="dpr-login-lead" size={18} aria-hidden="true" />
                  <input
                    id="username"
                    name="username"
                    className="dpr-login-input"
                    placeholder="Enter your username"
                    autoComplete="username"
                    required
                    aria-invalid={usernameError ? "true" : "false"}
                    aria-describedby={usernameError ? "username-error" : undefined}
                    onChange={() => {
                      setUsernameError("");
                      setError("");
                    }}
                  />
                </div>
                {usernameError ? (
                  <p id="username-error" className="dpr-login-field-error">
                    {usernameError}
                  </p>
                ) : null}
              </div>

              <div className="dpr-login-field">
                <label htmlFor="password">Password</label>
                <div className="dpr-login-input-wrap">
                  <Lock className="dpr-login-lead" size={18} aria-hidden="true" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="dpr-login-input is-password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    aria-invalid={passwordError ? "true" : "false"}
                    aria-describedby={passwordError ? "password-error" : undefined}
                    onChange={() => {
                      setPasswordError("");
                      setError("");
                    }}
                  />
                  <button
                    type="button"
                    className="dpr-login-eye"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordError ? (
                  <p id="password-error" className="dpr-login-field-error">
                    {passwordError}
                  </p>
                ) : null}
              </div>

              <button type="submit" className="dpr-login-submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="dpr-login-spin" aria-hidden="true" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={18} aria-hidden="true" />
                  </>
                )}
              </button>
            </form>

            <div className="dpr-login-secure">
              <ShieldCheck size={16} aria-hidden="true" />
              <p>
                <strong>Secure & Protected</strong>
                <span>Your login information is securely handled.</span>
              </p>
            </div>
          </section>

          <div className="dpr-login-booking">
            <p>Need to book a shipment?</p>
            <Link href="/customer-booking">Customer Booking</Link>
          </div>
        </div>
      </main>

      <aside className="dpr-login-visual" aria-hidden="true">
        <LogisticsArt />
        <div className="dpr-login-visual-inner">
          <span className="dpr-login-kicker">
            <Truck size={14} />
            DPR Operations Hub
          </span>
          <h2>DPR Logistics admin portal</h2>
          <p className="dpr-login-visual-copy">
            Sign in to manage DPR bookings, fleet, drivers, billing and POD from one workspace.
          </p>
          <div className="dpr-login-pills">
            <span>Bookings</span>
            <span>Vehicles</span>
            <span>Drivers</span>
            <span>Billing</span>
            <span>POD</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

function LogisticsArt() {
  return (
    <svg className="dpr-login-art" viewBox="0 0 720 900" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dprGrid" width="36" height="36" patternUnits="userSpaceOnUse">
          <path d="M36 0H0V36" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="720" height="900" fill="url(#dprGrid)" />
      <path
        d="M80 220C180 180 240 280 340 250C440 220 500 140 620 170"
        stroke="rgba(45,212,191,0.28)"
        strokeWidth="2"
        strokeDasharray="8 10"
      />
      <path
        d="M40 430C150 390 210 520 330 490C450 460 510 360 700 400"
        stroke="rgba(148,163,184,0.22)"
        strokeWidth="2"
        strokeDasharray="6 12"
      />
      <path
        d="M90 680C190 620 280 740 410 700C540 660 600 560 690 590"
        stroke="rgba(45,212,191,0.18)"
        strokeWidth="2"
        strokeDasharray="8 10"
      />
      <circle cx="180" cy="206" r="7" fill="#2dd4bf" />
      <circle cx="340" cy="250" r="5" fill="#94a3b8" />
      <circle cx="540" cy="158" r="6" fill="#5eead4" />
      <circle cx="330" cy="490" r="7" fill="#2dd4bf" />
      <circle cx="610" cy="382" r="5" fill="#94a3b8" />
      <rect x="470" y="250" width="150" height="92" rx="10" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" />
      <rect x="488" y="268" width="42" height="56" rx="4" fill="rgba(15,118,110,0.45)" />
      <rect x="540" y="280" width="28" height="44" rx="4" fill="rgba(15,118,110,0.28)" />
      <rect x="578" y="292" width="24" height="32" rx="4" fill="rgba(15,118,110,0.2)" />
      <g transform="translate(120 540)">
        <rect x="18" y="18" width="168" height="58" rx="10" fill="rgba(15,118,110,0.55)" />
        <rect x="186" y="32" width="58" height="44" rx="8" fill="#14b8a6" />
        <circle cx="58" cy="84" r="14" fill="#0f172a" stroke="#99f6e4" strokeWidth="3" />
        <circle cx="168" cy="84" r="14" fill="#0f172a" stroke="#99f6e4" strokeWidth="3" />
        <rect x="36" y="32" width="36" height="22" rx="3" fill="rgba(204,251,241,0.35)" />
      </g>
    </svg>
  );
}
