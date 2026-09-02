import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lrNoEquals, stripLrPrefix } from "@/lib/lr-no";

function resolveBookingIds(lrNos: string[], all: { id: number; lrNo: string }[]) {
  const ids: number[] = [];
  const missing: string[] = [];

  for (const input of lrNos) {
    const trimmed = input.trim();
    if (!trimmed) continue;
    const match = all.find((row) => lrNoEquals(row.lrNo, trimmed));
    if (match) ids.push(match.id);
    else missing.push(stripLrPrefix(trimmed));
  }

  return { ids: [...new Set(ids)], missing };
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    lrNos?: string[];
    lhcNo?: string;
    previousLhcNo?: string;
  };

  const lhcNo = String(body.lhcNo ?? "").trim();
  const lrNos = (body.lrNos ?? []).map((x) => x.trim()).filter(Boolean);
  const previousLhcNo = String(body.previousLhcNo ?? "").trim();

  if (!lhcNo) {
    return NextResponse.json({ error: "LHC number is required" }, { status: 400 });
  }

  try {
    if (previousLhcNo && previousLhcNo !== lhcNo) {
      await prisma.lrBooking.updateMany({
        where: { lhcNo: previousLhcNo },
        data: { lhcNo: "" },
      });
    }

    const all = await prisma.lrBooking.findMany({ select: { id: true, lrNo: true } });
    const { ids, missing } = resolveBookingIds(lrNos, all);

    if (lrNos.length && missing.length) {
      return NextResponse.json({ error: `LR not found: ${missing.join(", ")}` }, { status: 400 });
    }

    if (ids.length) {
      await prisma.lrBooking.updateMany({
        where: { id: { in: ids } },
        data: { lhcNo },
      });
    }

    return NextResponse.json({ ok: true, count: ids.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Link failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const body = (await req.json()) as { lhcNo?: string };
  const lhcNo = String(body.lhcNo ?? "").trim();
  if (!lhcNo) {
    return NextResponse.json({ error: "LHC number is required" }, { status: 400 });
  }

  try {
    const result = await prisma.lrBooking.updateMany({
      where: { lhcNo },
      data: { lhcNo: "" },
    });
    return NextResponse.json({ ok: true, count: result.count });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unlink failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
