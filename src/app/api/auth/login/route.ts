import { NextRequest, NextResponse } from "next/server";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import {
  createSessionToken,
  hashPassword,
  isHashedPassword,
  sessionCookieOptions,
  sessionMaxAge,
  verifyPassword,
} from "@/lib/auth-session";
import { rateLimit } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        {
          error:
            "Database not connected. In Vercel: Storage → open dpr-logistics-db → Connect Project → then Deployments → Redeploy.",
        },
        { status: 503 },
      );
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
    const limited = rateLimit(`login:${ip}`, 20, 15 * 60 * 1000);
    if (!limited.ok) {
      return NextResponse.json({ error: "Too many login attempts. Try again later." }, { status: 429 });
    }

    const { username, password, branch } = (await req.json()) as {
      username?: string;
      password?: string;
      branch?: string;
    };
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    const userLimit = rateLimit(`login-user:${username.toLowerCase()}`, 10, 15 * 60 * 1000);
    if (!userLimit.ok) {
      return NextResponse.json({ error: "Too many login attempts. Try again later." }, { status: 429 });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || user.status !== "Active" || !verifyPassword(password, user.password)) {
      return NextResponse.json({ error: "Invalid login" }, { status: 401 });
    }

    // Migrate legacy plaintext passwords to scrypt on successful login
    if (!isHashedPassword(user.password)) {
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashPassword(password) },
      });
    }

    const selectedBranch = branch || user.branch || "DPR Logistics";
    const token = createSessionToken({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      branch: selectedBranch,
    });
    const res = NextResponse.json({ ok: true, name: user.name, role: user.role, branch: selectedBranch });
    res.cookies.set("dpr_session", token, sessionCookieOptions(sessionMaxAge()));
    return res;
  } catch (err) {
    console.error("Login failed", err);
    const message = err instanceof Error ? err.message : "";
    if (/SESSION_SECRET/i.test(message)) {
      return NextResponse.json(
        { error: "Server misconfigured: set SESSION_SECRET in Vercel env, then redeploy." },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
