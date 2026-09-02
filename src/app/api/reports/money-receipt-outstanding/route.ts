import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { billFreightAmount, billGrandTotal } from "@/lib/bill-totals";
import { displayToIso } from "@/lib/dates";

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
  const { searchParams } = req.nextUrl;
  const partyName = searchParams.get("partyName") ?? "";
  const fromDate = normalizeDate(searchParams.get("fromDate") ?? "");
  const toDate = normalizeDate(searchParams.get("toDate") ?? "");

  const [bills, receipts] = await Promise.all([
    prisma.bill.findMany({ orderBy: { id: "desc" } }),
    prisma.moneyReceipt.findMany(),
  ]);

  const paidByBill: Record<string, number> = {};
  receipts.forEach((r) => {
    if (!r.billNo) return;
    paidByBill[r.billNo] = (paidByBill[r.billNo] || 0) + (r.paidAmt || r.amount || 0);
  });

  const rows = bills
    .filter((b) => {
      if (!matchesParty(b.partyName, partyName)) return false;
      const d = normalizeDate(b.billDate || b.fromDate);
      if (fromDate && d && d < fromDate) return false;
      if (toDate && d && d > toDate) return false;
      return true;
    })
    .map((b) => {
      const freight = billFreightAmount(b);
      const billAmount = billGrandTotal(b, freight);
      const paid = paidByBill[b.billNo] || 0;
      const outstanding = Number(Math.max(0, billAmount - paid).toFixed(2));
      return {
        billNo: b.billNo,
        partyName: b.partyName,
        date: b.billDate || b.fromDate,
        beforeTax: freight,
        outstanding,
        billAmount,
        paid,
      };
    })
    .filter((row) => row.outstanding > 0 && row.billAmount > 0)
    .map((row, i) => ({ ...row, srNo: i + 1 }));

  return NextResponse.json(rows);
}
