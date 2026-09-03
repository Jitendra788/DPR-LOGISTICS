import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sanitize } from "@/lib/resources";
import { nextPadded } from "@/lib/doc-numbers";
import { createWithUniqueRetry } from "@/lib/unique-create";
import { userFacingError } from "@/lib/handle-api-error";
import { stripBookingTrackToken } from "@/services/trackingService";

export const dynamic = "force-dynamic";

async function nextCustomerLrNo() {
  const rows = await prisma.lrBooking.findMany({ select: { lrNo: true } });
  return nextPadded(rows.map((r) => r.lrNo), 3);
}

export async function GET(req: NextRequest) {
  const lrNo = req.nextUrl.searchParams.get("lrNo");
  if (lrNo) {
    const row = await prisma.lrBooking.findFirst({
      where: { lrNo, source: "CUSTOMER" },
    });
    if (!row) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    return NextResponse.json(row);
  }

  const [nextLrNo, stations] = await Promise.all([
    nextCustomerLrNo(),
    prisma.station.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
  ]);

  return NextResponse.json({
    lrNo: nextLrNo,
    stations: stations.map((s) => s.name),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const data = {
      ...stripBookingTrackToken(sanitize(body, "bookings")),
      lrNo: String(body.lrNo || (await nextCustomerLrNo())),
      source: "CUSTOMER",
      billed: false,
      lhcNo: "",
      podStatus: "Pending",
    };

    const created = await createWithUniqueRetry("bookings", data);
    return NextResponse.json(created);
  } catch (err) {
    return NextResponse.json({ error: userFacingError(err, "Could not save booking. Please try again.") }, { status: 400 });
  }
}
