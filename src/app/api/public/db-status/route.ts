import { NextResponse } from "next/server";
import { databaseUrlKeysPresent, pickDatabaseUrl } from "@/lib/database-url";

export async function GET() {
  return NextResponse.json({
    configured: Boolean(pickDatabaseUrl()),
    vercel: Boolean(process.env.VERCEL),
    env: process.env.VERCEL_ENV ?? "unknown",
    keys: databaseUrlKeysPresent(),
  });
}
