import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUserAllowedModules, verifySessionToken } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { modulesToSession, resolveModules } from "@/lib/modules";

export async function GET() {
  const raw = (await cookies()).get("dpr_session")?.value;
  const session = verifySessionToken(raw);
  if (!session) return NextResponse.json({ user: null });

  let mods = session.mods || "*";
  let name = session.name;
  let role = session.role;
  let branch = session.branch;
  try {
    const row = await prisma.user.findUnique({
      where: { id: session.id },
      select: { name: true, role: true, branch: true, status: true },
    });
    if (!row || row.status !== "Active") {
      return NextResponse.json({ user: null });
    }
    name = row.name;
    role = row.role;
    branch = row.branch || session.branch;
    const allowedModules = await getUserAllowedModules(session.id);
    mods = modulesToSession(resolveModules(row.role, allowedModules));
  } catch {
    /* use session snapshot */
  }

  return NextResponse.json({
    user: {
      id: session.id,
      username: session.username,
      name,
      role,
      branch,
      modules: mods,
    },
  });
}
