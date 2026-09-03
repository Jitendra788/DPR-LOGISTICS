import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { resetErpData } from "@/lib/reset-erp";
import { apiError } from "@/lib/handle-api-error";

function isAdminSession(raw: string | undefined) {
  if (!raw) return false;
  try {
    const session = JSON.parse(raw) as { role?: string };
    return session.role === "Admin";
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const raw = (await cookies()).get("dpr_session")?.value;
  if (!isAdminSession(raw)) {
    return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { confirm?: string };
  if (body.confirm !== "RESET_ERP") {
    return NextResponse.json({ error: "Send { confirm: \"RESET_ERP\" } to wipe ERP data" }, { status: 400 });
  }

  try {
    const result = await resetErpData();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return apiError(err, "ERP reset failed");
  }
}
