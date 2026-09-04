import { createHmac, timingSafeEqual, randomBytes, scryptSync } from "node:crypto";
import type { SessionUser } from "@/lib/auth-session-edge";

export type { SessionUser };

const COOKIE = "dpr_session";
const MAX_AGE_SEC = 60 * 60 * 12;

export function sessionCookieName() {
  return COOKIE;
}

export function sessionMaxAge() {
  return MAX_AGE_SEC;
}

function sessionSecret() {
  const explicit = process.env.SESSION_SECRET?.trim();
  if (explicit) return explicit;

  // Fallback so production is not locked out if SESSION_SECRET was forgotten on Vercel.
  // Prefer setting SESSION_SECRET explicitly; rotating it will invalidate existing cookies.
  const derived =
    process.env.DATABASE_URL?.trim() ||
    process.env.POSTGRES_PRISMA_URL?.trim() ||
    process.env.POSTGRES_URL?.trim() ||
    "";
  if (derived) return `dpr-session-v1:${derived}`;

  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    throw new Error("SESSION_SECRET env is required in production");
  }
  return "dev-only-session-secret-change-me";
}

function b64url(input: string | Buffer) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromB64url(input: string) {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  return Buffer.from(input.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

function sign(payloadB64: string) {
  // Match edge verifier encoding (base64url via standard base64 + replace)
  return createHmac("sha256", sessionSecret())
    .update(payloadB64)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function createSessionToken(user: Omit<SessionUser, "exp">, maxAgeSec = MAX_AGE_SEC) {
  const payload: SessionUser = {
    ...user,
    exp: Math.floor(Date.now() / 1000) + maxAgeSec,
  };
  const payloadB64 = b64url(JSON.stringify(payload));
  return `${payloadB64}.${sign(payloadB64)}`;
}

/** Verify signed session cookie. Rejects forged / expired / legacy unsigned JSON. */
export function verifySessionToken(raw?: string | null): SessionUser | null {
  if (!raw?.trim()) return null;
  const parts = raw.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, sig] = parts;
  if (!payloadB64 || !sig) return null;
  const expected = sign(payloadB64);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const payload = JSON.parse(fromB64url(payloadB64).toString("utf8")) as SessionUser;
    if (!payload?.id || !payload.username || !payload.exp) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return {
      id: Number(payload.id),
      username: String(payload.username),
      name: String(payload.name || ""),
      role: String(payload.role || "Operator"),
      branch: String(payload.branch || ""),
      exp: Number(payload.exp),
    };
  } catch {
    return null;
  }
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  if (!stored) return false;
  if (stored.startsWith("scrypt$")) {
    const [, salt, hash] = stored.split("$");
    if (!salt || !hash) return false;
    const next = scryptSync(password, salt, 64).toString("hex");
    try {
      return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(next, "hex"));
    } catch {
      return false;
    }
  }
  // Legacy plaintext — migrate on successful login
  return stored === password;
}

export function isHashedPassword(stored: string) {
  return stored.startsWith("scrypt$");
}

export function stripPassword<T extends Record<string, unknown>>(row: T): Omit<T, "password"> {
  const { password: _p, ...rest } = row;
  return rest;
}

export function stripPasswords(rows: Array<Record<string, unknown>>) {
  return rows.map((row) => stripPassword(row));
}

export function isAdminRole(role?: string | null) {
  return String(role || "").toLowerCase() === "admin";
}

export function sessionCookieOptions(maxAgeSec = MAX_AGE_SEC) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSec,
    secure: process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL),
  };
}
