import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calcBillTaxes } from "@/lib/bill-totals";
import { lrBillableAmount, isMeterBillAs } from "@/lib/lr-totals";
import { isUniqueViolation, userFacingError } from "@/lib/handle-api-error";
import { docSourceWhere, nextModuleDoc, normalizeDocSource } from "@/lib/module-docs";
import { isBillableLrType, normalizeLrType } from "@/lib/lr-type";

export const dynamic = "force-dynamic";

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
      const expected = normalizeDocSource(body.source);
      const wrongModule = matched.filter((row) => normalizeDocSource(row.source) !== expected);
      if (wrongModule.length) {
        return NextResponse.json(
          { error: `Selected LRs belong to another module (${expected === "ROADWAYS" ? "DPR" : "Roadways"})` },
          { status: 400 },
        );
      }
      const notTbb = matched.filter((row) => !isBillableLrType(row.lrType));
      if (notTbb.length) {
        return NextResponse.json(
          {
            error: `Only TBB LRs can be billed. Remove ${notTbb
              .map((r) => `${r.lrNo} (${normalizeLrType(r.lrType)})`)
              .join(", ")}`,
          },
          { status: 400 },
        );
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
          ...sourceFilter,
        },
      });

      matched = lrs.filter((row) => {
        if (!isBillableLrType(row.lrType)) return false;
        if (body.fromDate && row.lrDate && row.lrDate < body.fromDate) return false;
        if (body.toDate && row.lrDate && row.lrDate > body.toDate) return false;
        if (body.billAs) {
          if (isMeterBillAs(body.billAs)) {
            if (!isMeterBillAs(row.billAs)) return false;
          } else if ((row.billAs || "Weight").toLowerCase() !== body.billAs.toLowerCase()) {
            return false;
          }
        }
        return true;
      });
    }

    if (!matched.length) {
      return NextResponse.json({ error: "No unbilled TBB LRs found for these filters" }, { status: 400 });
    }

    const billSource = normalizeDocSource(body.source);
    const lastBills = await prisma.bill.findMany({
      where: docSourceWhere(billSource),
      select: { billNo: true },
    });
    let billNo = body.billNo?.trim() || nextModuleDoc(
      lastBills.map((r) => r.billNo),
      2,
      billSource,
    );
    const lrAmount = matched.reduce((sum, row) => sum + lrBillableAmount(row), 0);
    const amount = Number(body.amount ?? lrAmount) || 0;
    const taxes = calcBillTaxes(
      amount,
      Number(body.cgstPct) || 0,
      Number(body.sgstPct) || 0,
      Number(body.igstPct) || 0,
    );
    const cgstAmt = Number(body.cgstAmt) || taxes.cgstAmt;
    const sgstAmt = Number(body.sgstAmt) || taxes.sgstAmt;
    const igstAmt = Number(body.igstAmt) || taxes.igstAmt;

    const billData = {
      billNo,
      partyName: body.partyName,
      fromDate: body.fromDate ?? body.billDate ?? "",
      toDate: body.toDate ?? body.billDate ?? "",
      fromStation: body.fromStation ?? "",
      toStation: body.toStation ?? "",
      amount,
      lrCount: matched.length,
      source: billSource,
      poNo: body.poNo ?? "",
      billAt: body.billAt ?? "",
      billDate: body.billDate ?? body.toDate ?? "",
      cgstPct: Number(body.cgstPct) || 0,
      cgstAmt,
      sgstPct: Number(body.sgstPct) || 0,
      sgstAmt,
      igstPct: Number(body.igstPct) || 0,
      igstAmt,
      paidRs: Number(body.paidRs) || 0,
      remark: body.remark ?? "",
      scanDate: body.scanDate ?? "",
      submitDate: body.submitDate ?? "",
    };

    let bill;
    for (let attempt = 0; attempt < 8; attempt++) {
      try {
        bill = await prisma.bill.create({ data: { ...billData, billNo } });
        break;
      } catch (err) {
        if (!isUniqueViolation(err, "billNo")) throw err;
        const rows = await prisma.bill.findMany({
          where: docSourceWhere(billSource),
          select: { billNo: true },
        });
        billNo = nextModuleDoc(
          rows.map((r) => r.billNo),
          2,
          billSource,
        );
      }
    }
    if (!bill) {
      return NextResponse.json({ error: "Could not assign a unique bill number. Please try again." }, { status: 400 });
    }

    await prisma.lrBooking.updateMany({
      where: { id: { in: matched.map((r) => r.id) } },
      data: { billed: true, billNo },
    });

    return NextResponse.json({ bill, lrCount: matched.length });
  } catch (err) {
    return NextResponse.json({ error: userFacingError(err, "Could not generate bill. Please try again.") }, { status: 400 });
  }
}
