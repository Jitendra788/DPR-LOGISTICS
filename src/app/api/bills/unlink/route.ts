import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/handle-api-error";
import { syncBillAfterLrRemoved } from "@/lib/cascade-delete";
import { requireSession } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;

  try {
    let body: { billNo?: string; lrId?: number };
    try {
      body = (await req.json()) as { billNo?: string; lrId?: number };
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    if (!body.billNo?.trim()) {
      return NextResponse.json({ error: "Bill no is required" }, { status: 400 });
    }

    const billNo = body.billNo.trim();
    const lrId = Number(body.lrId) || 0;

    if (lrId) {
      const row = await prisma.lrBooking.findFirst({ where: { id: lrId, billNo } });
      if (!row) {
        return NextResponse.json({ error: "LR not linked to this bill" }, { status: 404 });
      }
      await prisma.lrBooking.update({
        where: { id: lrId },
        data: { billed: false, billNo: "" },
      });
      await syncBillAfterLrRemoved(billNo);
      return NextResponse.json({ ok: true, count: 1, lrId });
    }

    const result = await prisma.lrBooking.updateMany({
      where: { billNo },
      data: { billed: false, billNo: "" },
    });
    await syncBillAfterLrRemoved(billNo);

    return NextResponse.json({ ok: true, count: result.count });
  } catch (err) {
    return apiError(err, "Unlink failed");
  }
}
