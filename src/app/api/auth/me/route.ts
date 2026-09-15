import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUserAllowedModules, verifySessionToken } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { modulesToSession, resolveModules } from "@/lib/modules";

export async function GET() {
  const raw = (await cookies()).get("dpr_session")?.value;
  const session = verifySessionToken(raw);
  if (!session) return NextResponse.json({ user: null });

  try {
    const row = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        name: true,
        role: true,
        branch: true,
        status: true,
        sessionVersion: true,
        username: true,
      },
    });
    if (!row || row.status !== "Active") {
      return NextResponse.json({ user: null });
    }
    if (Number(row.sessionVersion ?? 1) !== Number(session.sv ?? 0)) {
      return NextResponse.json({ user: null });
    }
    if (row.username !== session.username) {
      return NextResponse.json({ user: null });
    }

    const allowedModules = await getUserAllowedModules(session.id);
    const mods = modulesToSession(resolveModules(row.role, allowedModules));

    return NextResponse.json({
      user: {
        id: session.id,
        username: session.username,
        name: row.name,
        role: row.role,
        branch: row.branch || session.branch,
        modules: mods,
      },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}
