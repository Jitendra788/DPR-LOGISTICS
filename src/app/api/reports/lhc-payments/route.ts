import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const fromDate = searchParams.get("fromDate") ?? "";
  const toDate = searchParams.get("toDate") ?? "";
  const vehNo = searchParams.get("vehNo") ?? "";
  const brokerName = searchParams.get("brokerName") ?? "";
  const lhcNo = searchParams.get("lhcNo") ?? "";
  const paid = searchParams.get("paid");

  const rows = await prisma.lhcContract.findMany({
    where: {
      ...(vehNo ? { vehNo } : {}),
      ...(brokerName ? { brokerName } : {}),
      ...(lhcNo ? { challanNo: lhcNo } : {}),
      ...(paid === "true" ? { paid: true } : {}),
      ...(paid === "false" ? { paid: false } : {}),
    },
    orderBy: { id: "desc" },
  });

  const filtered = rows.filter((row) => {
    const date = row.paidDate || row.challanDate;
    if (fromDate && date && date < fromDate) return false;
    if (toDate && date && date > toDate) return false;
    return true;
  });

  return NextResponse.json(filtered);
}
