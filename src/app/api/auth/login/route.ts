import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { username, password, branch } = (await req.json()) as {
      username?: string;
      password?: string;
      branch?: string;
    };
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || user.password !== password || user.status !== "Active") {
      return NextResponse.json({ error: "Invalid login" }, { status: 401 });
    }
    const selectedBranch = branch || user.branch || "DPR Logistics";
    const session = JSON.stringify({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      branch: selectedBranch,
    });
    const res = NextResponse.json({ ok: true, name: user.name, role: user.role, branch: selectedBranch });
    res.cookies.set("dpr_session", session, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    });
    return res;
  } catch (err) {
    console.error("Login failed", err);
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}
