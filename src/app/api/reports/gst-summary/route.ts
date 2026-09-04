import { NextRequest, NextResponse } from "next/server";
import { billFreightAmount, calcBillTaxes, billGrandTotal } from "@/lib/bill-totals";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { apiError } from "@/lib/handle-api-error";
import { sumLrBillableAmount } from "@/lib/lr-totals";
import { displayToIso } from "@/lib/dates";
import { docSourceWhere } from "@/lib/module-docs";

export const dynamic = "force-dynamic";

function normalizeDate(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const fromDisplay = displayToIso(trimmed);
  if (/^\d{4}-\d{2}-\d{2}$/.test(fromDisplay)) return fromDisplay;
  return trimmed;
}

function billDateOf(bill: { billDate: string; fromDate: string; toDate: string; createdAt: Date }) {
  return normalizeDate(bill.billDate || bill.toDate || bill.fromDate || bill.createdAt.toISOString().slice(0, 10));
}

export async function GET(req: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { error: "Database not connected. Connect Neon in Vercel Storage and redeploy." },
        { status: 503 },
      );
    }

    const { searchParams } = req.nextUrl;
    // GET wipe removed — use `npm run db:reset-erp` locally only.

    const fromDate = normalizeDate(searchParams.get("fromDate") ?? "");
    const toDate = normalizeDate(searchParams.get("toDate") ?? "");
    const sourceParam = searchParams.get("source");
    const sourceFilter = sourceParam ? docSourceWhere(sourceParam) : undefined;

    const [bills, parties, lrs] = await Promise.all([
      prisma.bill.findMany({ where: sourceFilter, orderBy: { id: "asc" } }),
      prisma.party.findMany({ select: { name: true, gst: true } }),
      prisma.lrBooking.findMany({
        where: { billed: true, billNo: { not: "" }, ...(sourceFilter ?? {}) },
        select: {
          billNo: true,
          freight: true,
          hamali: true,
          other: true,
          barrier: true,
          doorCollection: true,
          stCharges: true,
          haltage: true,
          insurance: true,
          serviceTax: true,
          total: true,
          grandTotal: true,
        },
      }),
    ]);

    const gstByParty = new Map<string, string>();
    for (const party of parties) {
      const key = party.name.trim().toLowerCase();
      if (!key) continue;
      if (!gstByParty.has(key) && party.gst.trim()) gstByParty.set(key, party.gst.trim());
    }

    const lrsByBill: Record<string, typeof lrs> = {};
    for (const lr of lrs) {
      if (!lr.billNo) continue;
      (lrsByBill[lr.billNo] ??= []).push(lr);
    }

    const rows = bills
      .map((bill, index) => {
        const date = billDateOf(bill);
        const linked = lrsByBill[bill.billNo] ?? [];
        const lrSum = sumLrBillableAmount(linked);
        let beforeTax = billFreightAmount(bill, lrSum);
        let cgstPct = Number(bill.cgstPct) || 0;
        let sgstPct = Number(bill.sgstPct) || 0;
        let igstPct = Number(bill.igstPct) || 0;
        let cgstAmt = Number(bill.cgstAmt) || 0;
        let sgstAmt = Number(bill.sgstAmt) || 0;
        let igstAmt = Number(bill.igstAmt) || 0;

        // Fill missing amount cells from % (and vice versa) so report matches bill entry
        if (beforeTax > 0) {
          if (cgstPct > 0 && cgstAmt <= 0) cgstAmt = Number(((beforeTax * cgstPct) / 100).toFixed(2));
          if (sgstPct > 0 && sgstAmt <= 0) sgstAmt = Number(((beforeTax * sgstPct) / 100).toFixed(2));
          if (igstPct > 0 && igstAmt <= 0) igstAmt = Number(((beforeTax * igstPct) / 100).toFixed(2));
          if (!cgstPct && cgstAmt > 0) cgstPct = Number(((cgstAmt / beforeTax) * 100).toFixed(2));
          if (!sgstPct && sgstAmt > 0) sgstPct = Number(((sgstAmt / beforeTax) * 100).toFixed(2));
          if (!igstPct && igstAmt > 0) igstPct = Number(((igstAmt / beforeTax) * 100).toFixed(2));
        } else if (cgstAmt + sgstAmt + igstAmt <= 0 && (cgstPct || sgstPct || igstPct)) {
          const taxes = calcBillTaxes(beforeTax, cgstPct, sgstPct, igstPct);
          cgstAmt = taxes.cgstAmt;
          sgstAmt = taxes.sgstAmt;
          igstAmt = taxes.igstAmt;
        }

        const afterTax =
          cgstAmt + sgstAmt + igstAmt > 0
            ? Number((beforeTax + cgstAmt + sgstAmt + igstAmt).toFixed(2))
            : billGrandTotal(bill, beforeTax);

        return {
          srNo: index + 1,
          billNo: bill.billNo,
          billDate: date,
          partyName: bill.partyName,
          gstNo: gstByParty.get(bill.partyName.trim().toLowerCase()) ?? "",
          beforeTax: Number(beforeTax.toFixed(2)),
          cgstPct,
          cgstAmt: Number(cgstAmt.toFixed(2)),
          sgstPct,
          sgstAmt: Number(sgstAmt.toFixed(2)),
          igstPct,
          igstAmt: Number(igstAmt.toFixed(2)),
          afterTax,
          _sortDate: date,
        };
      })
      .filter((row) => {
        if (fromDate && row._sortDate && row._sortDate < fromDate) return false;
        if (toDate && row._sortDate && row._sortDate > toDate) return false;
        return true;
      })
      .sort((a, b) => a._sortDate.localeCompare(b._sortDate) || String(a.billNo).localeCompare(String(b.billNo)))
      .map((row, i) => {
        const { _sortDate: _, ...rest } = row;
        return { ...rest, srNo: i + 1 };
      });

    return NextResponse.json(rows);
  } catch (err) {
    return apiError(err, "GST summary report failed");
  }
}
