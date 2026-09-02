import { NextRequest, NextResponse } from "next/server";
import { billFreightAmount, calcBillTaxes } from "@/lib/bill-totals";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { apiError } from "@/lib/handle-api-error";
import { lrBillableAmount, sumLrBillableAmount } from "@/lib/lr-totals";
import { displayToIso } from "@/lib/dates";

function normalizeDate(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const fromDisplay = displayToIso(trimmed);
  if (/^\d{4}-\d{2}-\d{2}$/.test(fromDisplay)) return fromDisplay;
  return trimmed;
}

function billTaxTotal(
  bill: {
    amount: number;
    cgstPct: number;
    cgstAmt: number;
    sgstPct: number;
    sgstAmt: number;
    igstPct: number;
    igstAmt: number;
  },
  lrSum: number,
) {
  const stored = (bill.cgstAmt || 0) + (bill.sgstAmt || 0) + (bill.igstAmt || 0);
  if (stored > 0) return stored;

  const freight = billFreightAmount(bill, lrSum);
  const taxes = calcBillTaxes(freight, bill.cgstPct, bill.sgstPct, bill.igstPct);
  return Number((taxes.cgstAmt + taxes.sgstAmt + taxes.igstAmt).toFixed(2));
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
    const fromDate = normalizeDate(searchParams.get("fromDate") ?? "");
    const toDate = normalizeDate(searchParams.get("toDate") ?? "");

    const [lrs, bills] = await Promise.all([
      prisma.lrBooking.findMany({ orderBy: { lrDate: "desc" } }),
      prisma.bill.findMany(),
    ]);

    const billByNo = Object.fromEntries(bills.map((bill) => [bill.billNo, bill]));
    const lrsByBill: Record<string, typeof lrs> = {};
    lrs.forEach((lr) => {
      if (!lr.billNo) return;
      (lrsByBill[lr.billNo] ??= []).push(lr);
    });

    const rows = lrs
      .filter((lr) => {
        const d = normalizeDate(lr.lrDate);
        if (fromDate && d && d < fromDate) return false;
        if (toDate && d && d > toDate) return false;
        return true;
      })
      .map((lr) => {
        const freight = lrBillableAmount(lr) || Number(lr.freight) || 0;
        let gst = Number(lr.gst) || 0;

        if (lr.billNo && billByNo[lr.billNo]) {
          const bill = billByNo[lr.billNo]!;
          const siblings = lrsByBill[lr.billNo] ?? [lr];
          const lrSum = sumLrBillableAmount(siblings);
          const billTax = billTaxTotal(bill, lrSum);
          if (billTax > 0 && lrSum > 0) {
            gst = Number(((billTax * freight) / lrSum).toFixed(2));
          }
        }

        return {
          lrNo: lr.lrNo,
          lrDate: lr.lrDate,
          billingParty: lr.billingParty,
          freight,
          gst,
          grandTotal: Number((freight + gst).toFixed(2)),
          gstPaidBy: lr.gstPaidBy,
          billNo: lr.billNo,
        };
      });

    return NextResponse.json(rows);
  } catch (err) {
    return apiError(err, "GST summary report failed");
  }
}
