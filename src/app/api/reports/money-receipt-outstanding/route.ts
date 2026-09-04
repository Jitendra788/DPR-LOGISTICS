import { NextRequest, NextResponse } from "next/server";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { billFreightAmount, billGrandTotal } from "@/lib/bill-totals";
import { lrBillableAmount } from "@/lib/lr-totals";
import { displayToIso } from "@/lib/dates";
import { apiError } from "@/lib/handle-api-error";
import { docSourceWhere, normalizeDocSource } from "@/lib/module-docs";

function normalizeDate(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const fromDisplay = displayToIso(trimmed);
  if (/^\d{4}-\d{2}-\d{2}$/.test(fromDisplay)) return fromDisplay;
  return trimmed;
}

function matchesParty(partyName: string, filter: string) {
  if (!filter.trim()) return true;
  return partyName.trim().toLowerCase().includes(filter.trim().toLowerCase());
}

export async function GET(req: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        {
          error:
            "Database not connected. In Vercel: Storage → open dpr-logistics-db → Connect Project → then Deployments → Redeploy.",
        },
        { status: 503 },
      );
    }
    const { searchParams } = req.nextUrl;
    const partyName = searchParams.get("partyName") ?? "";
    const billNoFilter = searchParams.get("billNo") ?? "";
    const fromDate = normalizeDate(searchParams.get("fromDate") ?? "");
    const toDate = normalizeDate(searchParams.get("toDate") ?? "");
    const sourceParam = searchParams.get("source");
    const sourceFilter = sourceParam ? docSourceWhere(sourceParam) : undefined;
    const receiptSource = sourceParam ? normalizeDocSource(sourceParam) : null;

    const [bills, receipts, lrs] = await Promise.all([
      prisma.bill.findMany({
        where: sourceFilter,
        orderBy: { id: "desc" },
      }),
      prisma.moneyReceipt.findMany(
        receiptSource
          ? {
              where:
                receiptSource === "ROADWAYS"
                  ? { source: "ROADWAYS" }
                  : { OR: [{ source: "DPR" }, { source: "CUSTOMER" }, { source: "" }] },
            }
          : undefined,
      ),
      prisma.lrBooking.findMany({
        where: {
          billNo: { not: "" },
          ...(sourceFilter ?? {}),
        },
      }),
    ]);

    const lrSumByBill: Record<string, number> = {};
    lrs.forEach((row) => {
      if (!row.billNo) return;
      lrSumByBill[row.billNo] = (lrSumByBill[row.billNo] || 0) + lrBillableAmount(row);
    });

    const paidByBill: Record<string, number> = {};
    receipts.forEach((r) => {
      if (!r.billNo) return;
      paidByBill[r.billNo] =
        (paidByBill[r.billNo] || 0) +
        (r.paidAmt || r.amount || 0) +
        (r.tdsAmt || 0) +
        (r.otherDed || 0);
    });

    const rows = bills
      .filter((b) => {
        if (billNoFilter.trim() && b.billNo !== billNoFilter.trim()) return false;
        if (!matchesParty(b.partyName, partyName)) return false;
        const d = normalizeDate(b.billDate || b.fromDate);
        if (fromDate && d && d < fromDate) return false;
        if (toDate && d && d > toDate) return false;
        return true;
      })
      .map((b) => {
        const lrSum = lrSumByBill[b.billNo] || 0;
        const beforeTax = billFreightAmount(b, lrSum);
        const billAmount = billGrandTotal(b, beforeTax);
        const paid = paidByBill[b.billNo] || 0;
        const outstanding = Number(Math.max(0, billAmount - paid).toFixed(2));
        return {
          billNo: b.billNo,
          partyName: b.partyName,
          date: b.billDate || b.fromDate,
          beforeTax,
          outstanding,
          billAmount,
          paid,
          source: b.source,
          id: b.id,
        };
      })
      .filter((row) => row.outstanding > 0 && row.billAmount > 0)
      .map((row, i) => ({ ...row, srNo: row.id || i + 1 }));

    return NextResponse.json(rows);
  } catch (err) {
    return apiError(err, "Money receipt outstanding report failed");
  }
}
