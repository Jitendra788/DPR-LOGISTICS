import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    partyName?: string;
    fromDate?: string;
    toDate?: string;
    fromStation?: string;
    toStation?: string;
    billAs?: string;
    source?: string;
    lrIds?: number[];
    billNo?: string;
    billDate?: string;
    poNo?: string;
    billAt?: string;
    amount?: number;
    cgstPct?: number;
    cgstAmt?: number;
    sgstPct?: number;
    sgstAmt?: number;
    igstPct?: number;
    igstAmt?: number;
    paidRs?: number;
    remark?: string;
    scanDate?: string;
    submitDate?: string;
  };

  if (!body.partyName) {
    return NextResponse.json({ error: "Billing party is required" }, { status: 400 });
  }

  try {
    let matched;

    if (body.lrIds?.length) {
      matched = await prisma.lrBooking.findMany({
        where: { id: { in: body.lrIds.map(Number) } },
      });
      const already = matched.filter((row) => row.billed);
      if (already.length) {
        return NextResponse.json({ error: "Some selected LRs are already billed" }, { status: 400 });
      }
      if (matched.length !== body.lrIds.length) {
        return NextResponse.json({ error: "Some selected LRs were not found" }, { status: 400 });
      }
    } else {
      const sourceFilter =
        body.source === "ROADWAYS"
          ? { source: "ROADWAYS" }
          : body.source
            ? { source: { in: [body.source, "CUSTOMER"] } }
            : {};

      const lrs = await prisma.lrBooking.findMany({
        where: {
          billingParty: body.partyName,
          billed: false,
          ...(body.fromStation ? { fromStation: body.fromStation } : {}),
          ...(body.toStation ? { toStation: body.toStation } : {}),
          ...(body.billAs ? { billAs: body.billAs } : {}),
          ...sourceFilter,
        },
      });

      matched = lrs.filter((row) => {
        if (body.fromDate && row.lrDate && row.lrDate < body.fromDate) return false;
        if (body.toDate && row.lrDate && row.lrDate > body.toDate) return false;
        return true;
      });
    }

    if (!matched.length) {
      return NextResponse.json({ error: "No unbilled LRs found for these filters" }, { status: 400 });
    }

    const last = await prisma.bill.findFirst({ orderBy: { id: "desc" } });
    const billNo = body.billNo?.trim() || `BILL-${String((last?.id ?? 0) + 1).padStart(4, "0")}`;
    const lrAmount = matched.reduce((sum, row) => sum + row.grandTotal, 0);
    const amount = Number(body.amount ?? lrAmount) || 0;
    const cgstAmt = Number(body.cgstAmt) || 0;
    const sgstAmt = Number(body.sgstAmt) || 0;
    const igstAmt = Number(body.igstAmt) || 0;

    const bill = await prisma.bill.create({
      data: {
        billNo,
        partyName: body.partyName,
        fromDate: body.fromDate ?? body.billDate ?? "",
        toDate: body.toDate ?? body.billDate ?? "",
        fromStation: body.fromStation ?? "",
        toStation: body.toStation ?? "",
        amount,
        lrCount: matched.length,
        source: body.source ?? "DPR",
        poNo: body.poNo ?? "",
        billAt: body.billAt ?? "",
        billDate: body.billDate ?? body.toDate ?? "",
        cgstPct: Number(body.cgstPct) || 0,
        cgstAmt: cgstAmt || Number(((amount * (Number(body.cgstPct) || 0)) / 100).toFixed(2)),
        sgstPct: Number(body.sgstPct) || 0,
        sgstAmt: sgstAmt || Number(((amount * (Number(body.sgstPct) || 0)) / 100).toFixed(2)),
        igstPct: Number(body.igstPct) || 0,
        igstAmt: igstAmt || Number(((amount * (Number(body.igstPct) || 0)) / 100).toFixed(2)),
        paidRs: Number(body.paidRs) || 0,
        remark: body.remark ?? "",
        scanDate: body.scanDate ?? "",
        submitDate: body.submitDate ?? "",
      },
    });

    await prisma.lrBooking.updateMany({
      where: { id: { in: matched.map((r) => r.id) } },
      data: { billed: true, billNo },
    });

    return NextResponse.json({ bill, lrCount: matched.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bill failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
