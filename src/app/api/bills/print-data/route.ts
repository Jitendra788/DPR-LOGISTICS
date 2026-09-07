import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { billFreightAmount, billGrandTotal, calcBillTaxes } from "@/lib/bill-totals";
import { sumLrBillableAmount } from "@/lib/lr-totals";
import { verifyBillPrintShareToken } from "@/lib/lr-email";
import { sessionFromRequest } from "@/lib/api-auth";
import { apiError } from "@/lib/handle-api-error";

export async function GET(req: NextRequest) {
  try {
    const billNo = req.nextUrl.searchParams.get("billNo")?.trim() ?? "";
    const share = req.nextUrl.searchParams.get("share")?.trim() || "";
    if (!billNo) return NextResponse.json({ error: "Bill no required" }, { status: 400 });

    const session = sessionFromRequest(req);
    if (!session) {
      if (!verifyBillPrintShareToken(share)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const bill = await prisma.bill.findFirst({ where: { billNo } });
    if (!bill) return NextResponse.json({ error: "Bill not found" }, { status: 404 });

    if (!session && !verifyBillPrintShareToken(share, bill.billNo) && !verifyBillPrintShareToken(share, billNo)) {
      return NextResponse.json({ error: "Invalid print link" }, { status: 403 });
    }

    const [party, lrs] = await Promise.all([
      prisma.party.findFirst({ where: { name: bill.partyName } }),
      prisma.lrBooking.findMany({ where: { billNo }, orderBy: { id: "asc" } }),
    ]);

    const lrFreightSum = sumLrBillableAmount(lrs);
    const freight = billFreightAmount(bill, lrFreightSum);
    const taxes = calcBillTaxes(freight, bill.cgstPct, bill.sgstPct, bill.igstPct);
    const grandTotal = billGrandTotal({ ...bill, ...taxes }, freight);

    return NextResponse.json({
      bill: { ...bill, freight, ...taxes, grandTotal },
      party,
      lrs,
    });
  } catch (err) {
    return apiError(err, "Bill print data failed");
  }
}
