import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sessionFromRequest } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  const session = sessionFromRequest(req);
  if (session?.id) {
    try {
      await prisma.user.update({
        where: { id: session.id },
        data: { lastSeenAt: null },
      });
    } catch {
      /* ignore — still clear cookie */
    }
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("dpr_session", "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
