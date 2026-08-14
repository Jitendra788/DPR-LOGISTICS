import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type") ?? "lr";
  if (type === "lr") {
    const last = await prisma.lrBooking.findFirst({ orderBy: { id: "desc" } });
    return NextResponse.json({ value: `LR-${String((last?.id ?? 0) + 22451).padStart(5, "0")}` });
  }
  if (type === "lhc") {
    const last = await prisma.lhcContract.findFirst({ orderBy: { id: "desc" } });
    return NextResponse.json({ value: String((last?.id ?? 0) + 2249) });
  }
  if (type === "party") {
    const last = await prisma.party.findFirst({ orderBy: { id: "desc" } });
    return NextResponse.json({
      sr: (last?.id ?? 0) + 1,
      partyCode: String((last?.id ?? 0) + 1006),
    });
  }
  if (type === "vehicle") {
    const last = await prisma.vehicle.findFirst({ orderBy: { id: "desc" } });
    return NextResponse.json({ sr: (last?.id ?? 0) + 1 });
  }
  if (type === "slip") {
    const last = await prisma.bookingSlip.findFirst({ orderBy: { id: "desc" } });
    return NextResponse.json({
      sr: (last?.id ?? 0) + 504,
      receiptNo: String((last?.id ?? 0) + 438),
    });
  }
  if (type === "bill") {
    const last = await prisma.bill.findFirst({ orderBy: { id: "desc" } });
    return NextResponse.json({ value: String((last?.id ?? 0) + 2177) });
  }
  if (type === "fleet") {
    const last = await prisma.fleetVehicle.findFirst({ orderBy: { id: "desc" } });
    return NextResponse.json({ sr: (last?.id ?? 0) + 27 });
  }
  if (type === "driver") {
    const last = await prisma.driver.findFirst({ orderBy: { id: "desc" } });
    return NextResponse.json({ sr: (last?.id ?? 0) + 37 });
  }
  if (type === "vendor-voucher") {
    const last = await prisma.vendorVoucher.findFirst({ orderBy: { id: "desc" } });
    return NextResponse.json({ sr: (last?.id ?? 0) + 835 });
  }
  return NextResponse.json({ error: "Unknown type" }, { status: 400 });
}
