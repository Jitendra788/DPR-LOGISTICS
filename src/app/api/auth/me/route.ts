import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth-session";

export async function GET() {
  const raw = (await cookies()).get("dpr_session")?.value;
  const user = verifySessionToken(raw);
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      branch: user.branch,
    },
  });
}
