import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { billNo?: string };
  if (!body.billNo?.trim()) {
    return NextResponse.json({ error: "Bill no is required" }, { status: 400 });
  }

  const result = await prisma.lrBooking.updateMany({
    where: { billNo: body.billNo.trim() },
    data: { billed: false, billNo: "" },
  });

  return NextResponse.json({ ok: true, count: result.count });
}
