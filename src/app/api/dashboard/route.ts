import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lastSixMonths, monthKey, parseLooseDate } from "@/lib/chart-dates";

export const dynamic = "force-dynamic";

export async function GET() {
  const months = lastSixMonths();

  const [
    totalBookings,
    pendingLorryHire,
    pendingBill,
    customers,
    billedCount,
    recentBookings,
    chartBookings,
    recentBills,
    recentReceipts,
    vehicleCount,
    fleet,
    unpaidLhc,
    maintRows,
  ] = await Promise.all([
    prisma.lrBooking.count(),
    prisma.lrBooking.count({ where: { lhcNo: "" } }),
    prisma.lrBooking.count({ where: { billed: false } }),
    prisma.party.count(),
    prisma.lrBooking.count({ where: { billed: true } }),
    prisma.lrBooking.findMany({
      orderBy: { id: "desc" },
      take: 6,
      select: { lrNo: true, lrDate: true, billingParty: true, podStatus: true },
    }),
    prisma.lrBooking.findMany({
      orderBy: { id: "desc" },
      take: 800,
      select: { lrDate: true, createdAt: true },
    }),
    prisma.bill.findMany({
      orderBy: { id: "desc" },
      take: 6,
      select: { billNo: true, partyName: true },
    }),
    prisma.moneyReceipt.findMany({
      orderBy: { id: "desc" },
      take: 6,
      select: { id: true, receiptNo: true, partyName: true },
    }),
    prisma.vehicle.count(),
    prisma.fleetVehicle.findMany({ select: { vehNo: true, status: true } }),
    prisma.lhcContract.findMany({
      where: { paid: false },
      select: { vehNo: true },
    }),
    prisma.maintenance.findMany({ select: { vehNo: true }, take: 500 }),
  ]);

  const monthly = months.map((m) => ({
    label: m.label,
    value: chartBookings.filter((b) => {
      const d = parseLooseDate(b.lrDate) ?? (b.createdAt ? new Date(b.createdAt) : null);
      return d ? monthKey(d) === m.key : false;
    }).length,
  }));

  const onTripSet = new Set(unpaidLhc.map((r) => r.vehNo).filter(Boolean));
  const maintSet = new Set(maintRows.map((m) => m.vehNo).filter(Boolean));
  const fleetAvail = fleet.filter((f) => (f.status || "Available").toLowerCase() === "available").length;
  const onTrip = onTripSet.size;
  const maint = [...maintSet].filter((v) => !onTripSet.has(v)).length;
  const available = fleet.length ? fleetAvail : Math.max(0, vehicleCount - onTrip - maint);
  const pending = Math.max(0, vehicleCount - available - onTrip - maint);

  const podUpdates = recentBookings
    .filter((b) => (b.podStatus || "").toLowerCase() === "received")
    .slice(0, 5)
    .map((b) => ({ k: b.lrNo, v: b.podStatus || "Received" }));

  return NextResponse.json({
    stats: { totalBookings, pendingLorryHire, pendingBill, customers },
    billedCount,
    unbilledCount: pendingBill,
    monthly,
    vehicles: {
      total: vehicleCount,
      available,
      onTrip,
      maint,
      pending,
    },
    recent: {
      bookings: recentBookings.slice(0, 5).map((b) => ({
        k: b.lrNo,
        v: b.billingParty || b.lrDate,
      })),
      bills: recentBills.map((b) => ({ k: b.billNo, v: b.partyName })),
      payments: recentReceipts.map((r) => ({
        k: r.receiptNo || `#${r.id}`,
        v: r.partyName,
      })),
      pod: podUpdates,
    },
  });
}
