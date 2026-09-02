import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { billFreightAmount, billGrandTotal } from "@/lib/bill-totals";
import { sumLrBillableAmount } from "@/lib/lr-totals";

export async function GET(req: NextRequest) {
  const billNo = req.nextUrl.searchParams.get("billNo")?.trim() ?? "";
  if (!billNo) return NextResponse.json({ error: "Bill no required" }, { status: 400 });

  const bill = await prisma.bill.findFirst({ where: { billNo } });
  if (!bill) return NextResponse.json({ error: "Bill not found" }, { status: 404 });

  const [party, lrs] = await Promise.all([
    prisma.party.findFirst({ where: { name: bill.partyName } }),
    prisma.lrBooking.findMany({ where: { billNo }, orderBy: { id: "asc" } }),
  ]);

  const lrFreightSum = sumLrBillableAmount(lrs);
  const freight = billFreightAmount(bill, lrFreightSum);
  const grandTotal = billGrandTotal(bill, freight);

  return NextResponse.json({
    bill: { ...bill, freight, grandTotal },
    party,
    lrs,
  });
}
