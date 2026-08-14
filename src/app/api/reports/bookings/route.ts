import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const fromDate = searchParams.get("fromDate") ?? "";
  const toDate = searchParams.get("toDate") ?? "";
  const billingParty = searchParams.get("billingParty") ?? "";
  const fromStation = searchParams.get("fromStation") ?? "";
  const toStation = searchParams.get("toStation") ?? "";

  const rows = await prisma.lrBooking.findMany({
    where: {
      ...(billingParty ? { billingParty } : {}),
      ...(fromStation ? { fromStation } : {}),
      ...(toStation ? { toStation } : {}),
    },
    orderBy: { id: "desc" },
  });

  const filtered = rows.filter((row) => {
    if (fromDate && row.lrDate && row.lrDate < fromDate) return false;
    if (toDate && row.lrDate && row.lrDate > toDate) return false;
    return true;
  });

  return NextResponse.json(filtered);
}
