import { NextResponse } from "next/server";
import { isMailConfigured, warmMailTransport } from "@/lib/mail";

/** Fire-and-forget SMTP connect so first Email click is faster. */
export async function POST() {
  if (!isMailConfigured()) {
    return NextResponse.json({ ok: false, configured: false });
  }
  try {
    await warmMailTransport();
    return NextResponse.json({ ok: true, configured: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "SMTP warmup failed";
    return NextResponse.json({ ok: false, configured: true, error: message }, { status: 503 });
  }
}
