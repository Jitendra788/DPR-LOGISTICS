import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveLiveSession, onlineSinceDate } from "@/lib/api-auth";
import { apiError } from "@/lib/handle-api-error";

/** Keep session alive + refresh lastSeenAt; 401 if password changed / session revoked. */
export async function POST(req: NextRequest) {
  try {
    const session = await resolveLiveSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await prisma.user.update({
      where: { id: session.id },
      data: { lastSeenAt: new Date() },
    });
    return NextResponse.json({
      ok: true,
      user: {
        id: session.id,
        username: session.username,
        name: session.name,
        role: session.role,
        branch: session.branch,
      },
    });
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
