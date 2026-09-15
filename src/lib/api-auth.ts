import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, type SessionUser, isAdminRole } from "@/lib/auth-session";

export function sessionFromRequest(req: NextRequest): SessionUser | null {
  const raw = req.cookies.get("dpr_session")?.value;
  return verifySessionToken(raw);
}

/** Cookie signature check + live sessionVersion / Active status from DB. */
export async function resolveLiveSession(req: NextRequest): Promise<SessionUser | null> {
  const user = sessionFromRequest(req);
  if (!user) return null;
  try {
    const row = await prisma.user.findUnique({
      where: { id: user.id },
      select: { sessionVersion: true, status: true, username: true },
    });
    if (!row || row.status !== "Active") return null;
    if (Number(row.sessionVersion ?? 1) !== Number(user.sv ?? 0)) return null;
    if (row.username !== user.username) return null;
    return user;
  } catch {
    return null;
  }
}

export async function requireSession(req: NextRequest): Promise<SessionUser | NextResponse> {
  const user = await resolveLiveSession(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return user;
}

export async function requireAdmin(req: NextRequest): Promise<SessionUser | NextResponse> {
  const user = await requireSession(req);
  if (user instanceof NextResponse) return user;
  if (!isAdminRole(user.role)) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  return user;
}

/** Simple in-memory rate limit (per server instance). */
const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const row = hits.get(key);
  if (!row || row.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  row.count += 1;
  if (row.count > limit) {
    return { ok: false, remaining: 0, retryAfterMs: row.resetAt - now };
  }
  return { ok: true, remaining: limit - row.count };
}

/** Users with lastSeen within this window are considered online. */
export const ONLINE_WINDOW_MS = 5 * 60 * 1000;

export function onlineSinceDate(now = Date.now()) {
  return new Date(now - ONLINE_WINDOW_MS);
}
