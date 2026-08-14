import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [totalBookings, pendingLorryHire, pendingBill, customers] = await Promise.all([
    prisma.lrBooking.count(),
    prisma.lrBooking.count({ where: { lhcNo: "" } }),
    prisma.lrBooking.count({ where: { billed: false } }),
    prisma.party.count(),
  ]);

  return NextResponse.json({ totalBookings, pendingLorryHire, pendingBill, customers });
}
