import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveLiveSession, onlineSinceDate } from "@/lib/api-auth";
import { apiError } from "@/lib/handle-api-error";
import {
  createSessionToken,
  getUserAllowedModules,
  sessionCookieOptions,
  sessionMaxAge,
} from "@/lib/auth-session";
import { modulesToSession, resolveModules } from "@/lib/modules";

/** Keep session alive + refresh lastSeenAt; 401 if password changed / session revoked. */
export async function POST(req: NextRequest) {
  try {
    const session = await resolveLiveSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const row = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        branch: true,
        sessionVersion: true,
      },
    });
    if (!row) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: session.id },
      data: { lastSeenAt: new Date() },
    });

    const allowedModules = await getUserAllowedModules(row.id);
    const mods = modulesToSession(resolveModules(row.role, allowedModules));
    const token = createSessionToken({
      id: row.id,
      username: row.username,
      name: row.name,
      role: row.role,
      branch: session.branch || row.branch,
      sv: Number(row.sessionVersion ?? 1),
      mods,
    });

    const res = NextResponse.json({
      ok: true,
      user: {
        id: row.id,
        username: row.username,
        name: row.name,
        role: row.role,
        branch: session.branch || row.branch,
        modules: mods,
      },
    });
    res.cookies.set("dpr_session", token, sessionCookieOptions(sessionMaxAge()));
    return res;
  } catch (err) {
    return apiError(err, "Heartbeat failed");
  }
}

/** Currently logged-in users (lastSeen within online window). */
export async function GET(req: NextRequest) {
  try {
    const session = await resolveLiveSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const since = onlineSinceDate();
    const rows = await prisma.user.findMany({
      where: {
        status: "Active",
        lastSeenAt: { gte: since },
      },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        branch: true,
        lastSeenAt: true,
      },
      orderBy: { lastSeenAt: "desc" },
    });
    return NextResponse.json({
      count: rows.length,
      users: rows.map((row) => ({
        ...row,
        lastSeenAt: row.lastSeenAt?.toISOString() ?? null,
        isYou: row.id === session.id,
      })),
    });
  } catch (err) {
    return apiError(err, "Could not load online users");
  }
}
