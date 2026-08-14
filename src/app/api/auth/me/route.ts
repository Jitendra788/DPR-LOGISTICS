import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const raw = (await cookies()).get("dpr_session")?.value;
  if (!raw) return NextResponse.json({ user: null });
  try {
    return NextResponse.json({ user: JSON.parse(raw) });
  } catch {
    return NextResponse.json({ user: null });
  }
}
