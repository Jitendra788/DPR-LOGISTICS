import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { clearTransactionsKeepMaster } from "@/lib/reset-erp";
import { apiError } from "@/lib/handle-api-error";

/**
 * Admin-only: clear transactional ERP data on this server, keep master data.
 * Body: { confirm: "CLEAR_TRANSACTIONS" }
 */
export async function POST(req: NextRequest) {
  try {
    const auth = requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    const body = (await req.json().catch(() => ({}))) as { confirm?: string };
    if (body.confirm !== "CLEAR_TRANSACTIONS") {
      return NextResponse.json(
        { error: 'Send JSON { "confirm": "CLEAR_TRANSACTIONS" } to proceed.' },
        { status: 400 },
      );
    }

    const result = await clearTransactionsKeepMaster();
    return NextResponse.json({
      ok: true,
      message: "Transactional data cleared. Master data kept. LR/Bill/LHC numbering restarted.",
      ...result,
    });
  } catch (err) {
    return apiError(err, "Clear transactions failed");
  }
}
