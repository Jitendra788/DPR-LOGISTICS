import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lastSixMonths, monthKey, parseLooseDate } from "@/lib/chart-dates";
import { requireSession } from "@/lib/api-auth";
import { isAdminRole } from "@/lib/auth-session";
import { hasModule, modulesFromSession } from "@/lib/modules";
import { ownedRecordIds } from "@/lib/data-scope";

export const dynamic = "force-dynamic";

function money(n: number) {
  return Number((Number(n) || 0).toFixed(2));
}

export async function GET(req: NextRequest) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;

  const modules = modulesFromSession(session.mods);
  const admin = isAdminRole(session.role);
  if (!admin && !hasModule(modules, "dashboard")) {
    return NextResponse.json({ error: "Dashboard access not allowed for this user" }, { status: 403 });
  }

  const showFinance = admin;
  const ownedBookingIds = admin ? null : await ownedRecordIds("bookings", session.username);
  const bookingWhere =
    ownedBookingIds === null
      ? {}
      : ownedBookingIds.length
        ? { id: { in: ownedBookingIds } }
        : { id: { in: [-1] } };

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
    bookingFinance,
    lhcFinance,
    maintFinance,
  ] = await Promise.all([
    prisma.lrBooking.count({ where: bookingWhere }),
    prisma.lrBooking.count({ where: { ...bookingWhere, lhcNo: "" } }),
    prisma.lrBooking.count({ where: { ...bookingWhere, billed: false } }),
    admin ? prisma.party.count() : Promise.resolve(0),
    prisma.lrBooking.count({ where: { ...bookingWhere, billed: true } }),
    prisma.lrBooking.findMany({
      where: bookingWhere,
      orderBy: { id: "desc" },
      take: 6,
      select: { lrNo: true, lrDate: true, billingParty: true, podStatus: true },
    }),
    prisma.lrBooking.findMany({
      where: bookingWhere,
      orderBy: { id: "desc" },
      take: 800,
      select: { lrDate: true, createdAt: true, grandTotal: true, total: true, freight: true },
    }),
    admin
      ? prisma.bill.findMany({
          orderBy: { id: "desc" },
          take: 6,
          select: { billNo: true, partyName: true },
        })
      : Promise.resolve([] as Array<{ billNo: string; partyName: string }>),
    admin
      ? prisma.moneyReceipt.findMany({
          orderBy: { id: "desc" },
          take: 6,
          select: { id: true, receiptNo: true, partyName: true },
        })
      : Promise.resolve([] as Array<{ id: number; receiptNo: string; partyName: string }>),
    admin ? prisma.vehicle.count() : Promise.resolve(0),
    admin ? prisma.fleetVehicle.findMany({ select: { vehNo: true, status: true } }) : Promise.resolve([]),
    admin
      ? prisma.lhcContract.findMany({ where: { paid: false }, select: { vehNo: true } })
      : Promise.resolve([] as Array<{ vehNo: string }>),
    admin ? prisma.maintenance.findMany({ select: { vehNo: true }, take: 500 }) : Promise.resolve([]),
    showFinance
      ? prisma.lrBooking.findMany({
          select: {
            lrDate: true,
            createdAt: true,
            grandTotal: true,
            total: true,
            freight: true,
          },
          take: 5000,
        })
      : Promise.resolve([]),
    showFinance
      ? prisma.lhcContract.findMany({
          select: { challanDate: true, lorryFreight: true },
          take: 5000,
        })
      : Promise.resolve([]),
    showFinance
      ? prisma.maintenance.findMany({
          select: {
            serviceDate: true,
            amount: true,
            diesel: true,
            otherExpenses: true,
            fasTag: true,
          },
          take: 5000,
        })
      : Promise.resolve([]),
  ]);

  const monthly = months.map((m) => ({
    label: m.label,
    value: chartBookings.filter((b) => {
      const d = parseLooseDate(b.lrDate) ?? (b.createdAt ? new Date(b.createdAt) : null);
      return d ? monthKey(d) === m.key : false;
    }).length,
  }));

  function bookingRevenue(b: { grandTotal: number; total: number; freight: number }) {
    const g = Number(b.grandTotal) || 0;
    if (g > 0) return g;
    const t = Number(b.total) || 0;
    if (t > 0) return t;
    return Number(b.freight) || 0;
  }

  function maintCost(m: {
    amount: number;
    diesel: number;
    otherExpenses: number;
    fasTag: number;
  }) {
    return (
      (Number(m.amount) || 0) +
      (Number(m.diesel) || 0) +
      (Number(m.otherExpenses) || 0) +
      (Number(m.fasTag) || 0)
    );
  }

  const revenue = money(bookingFinance.reduce((s, b) => s + bookingRevenue(b), 0));
  const lhcCost = money(lhcFinance.reduce((s, r) => s + (Number(r.lorryFreight) || 0), 0));
  const maintCostTotal = money(maintFinance.reduce((s, m) => s + maintCost(m), 0));
  const profit = money(revenue - lhcCost - maintCostTotal);

  const monthlyProfit = showFinance
    ? months.map((m) => {
        const rev = bookingFinance
          .filter((b) => {
            const d = parseLooseDate(b.lrDate) ?? (b.createdAt ? new Date(b.createdAt) : null);
            return d ? monthKey(d) === m.key : false;
          })
          .reduce((s, b) => s + bookingRevenue(b), 0);
        const hire = lhcFinance
          .filter((r) => {
            const d = parseLooseDate(r.challanDate);
            return d ? monthKey(d) === m.key : false;
          })
          .reduce((s, r) => s + (Number(r.lorryFreight) || 0), 0);
        const maint = maintFinance
          .filter((row) => {
            const d = parseLooseDate(row.serviceDate);
            return d ? monthKey(d) === m.key : false;
          })
          .reduce((s, row) => s + maintCost(row), 0);
        return { label: m.label, value: money(rev - hire - maint) };
      })
    : [];

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
    showFinance,
    branchScoped: !admin,
    stats: {
      totalBookings,
      pendingLorryHire,
      pendingBill,
      customers,
      profit: showFinance ? profit : undefined,
    },
    finance: showFinance
      ? {
          revenue,
          lhcCost,
          maintCost: maintCostTotal,
          profit,
          marginPct: revenue > 0 ? money((profit / revenue) * 100) : 0,
        }
      : null,
    billedCount,
    unbilledCount: pendingBill,
    monthly,
    monthlyProfit: showFinance ? monthlyProfit : [],
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
