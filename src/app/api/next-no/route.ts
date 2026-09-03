import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nextPadded } from "@/lib/doc-numbers";

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type") ?? "lr";

  if (type === "lr") {
    const rows = await prisma.lrBooking.findMany({ select: { lrNo: true } });
    return NextResponse.json({ value: nextPadded(rows.map((r) => r.lrNo), 3) });
  }
  if (type === "lhc") {
    const rows = await prisma.lhcContract.findMany({ select: { challanNo: true } });
    return NextResponse.json({ value: nextPadded(rows.map((r) => r.challanNo), 2) });
  }
  if (type === "party") {
    const rows = await prisma.party.findMany({ select: { id: true, partyCode: true } });
    const code = nextPadded(rows.map((r) => r.partyCode || r.id), 2);
    return NextResponse.json({ sr: rows.length + 1, partyCode: code });
  }
  if (type === "vehicle") {
    const last = await prisma.vehicle.findFirst({ orderBy: { id: "desc" } });
    return NextResponse.json({ sr: last ? last.id + 1 : 1 });
  }
  if (type === "slip") {
    const rows = await prisma.bookingSlip.findMany({ select: { receiptNo: true, slipNo: true } });
    const next = nextPadded(
      rows.flatMap((r) => [r.receiptNo, r.slipNo]),
      2,
    );
    return NextResponse.json({ sr: rows.length + 1, receiptNo: next });
  }
  if (type === "bill") {
    const rows = await prisma.bill.findMany({ select: { billNo: true } });
    return NextResponse.json({ value: nextPadded(rows.map((r) => r.billNo), 2) });
  }
  if (type === "fleet") {
    const last = await prisma.fleetVehicle.findFirst({ orderBy: { id: "desc" } });
    return NextResponse.json({ sr: last ? last.id + 1 : 1 });
  }
  if (type === "driver") {
    const last = await prisma.driver.findFirst({ orderBy: { id: "desc" } });
    return NextResponse.json({ sr: last ? last.id + 1 : 1 });
  }
  if (type === "vendor-voucher") {
    const last = await prisma.vendorVoucher.findFirst({ orderBy: { id: "desc" } });
    return NextResponse.json({ sr: last ? last.id + 1 : 1 });
  }
  return NextResponse.json({ error: "Unknown type" }, { status: 400 });
}
