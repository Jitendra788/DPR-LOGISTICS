import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, type SessionUser, isAdminRole } from "@/lib/auth-session";

export function sessionFromRequest(req: NextRequest): SessionUser | null {
  const raw = req.cookies.get("dpr_session")?.value;
  return verifySessionToken(raw);
}

export function requireSession(req: NextRequest): SessionUser | NextResponse {
  const user = sessionFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return user;
}

export function requireAdmin(req: NextRequest): SessionUser | NextResponse {
  const user = requireSession(req);
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
