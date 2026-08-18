import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { todayIso } from "@/lib/dates";

export type NotificationItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  count: number;
};

function daysUntil(iso: string) {
  if (!iso || iso.length < 10) return null;
  const d = new Date(iso.slice(0, 10) + "T00:00:00");
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / 86400000);
}

export async function GET() {
  const today = todayIso();
  const [pendingBill, pendingLhc, pendingPod, unpaidLhc, vehicles, fleet] = await Promise.all([
    prisma.lrBooking.count({ where: { billed: false } }),
    prisma.lrBooking.count({ where: { lhcNo: "" } }),
    prisma.lrBooking.count({ where: { podStatus: { not: "Received" } } }),
    prisma.lhcContract.count({ where: { paid: false } }),
    prisma.vehicle.findMany({ select: { vehNo: true, policyExpDate: true, fitnessExp: true } }),
    prisma.fleetVehicle.findMany({ select: { vehNo: true, policyExpDate: true, fitnessExp: true } }),
  ]);

  const docs = [...vehicles, ...fleet];
  let expiring = 0;
  let expired = 0;
  for (const v of docs) {
    for (const date of [v.policyExpDate, v.fitnessExp]) {
      const days = daysUntil(date);
      if (days === null) continue;
      if (days < 0) expired += 1;
      else if (days <= 30) expiring += 1;
    }
  }

  const items: NotificationItem[] = [];
  if (pendingBill > 0) {
    items.push({
      id: "pending-bill",
      title: "Pending bills",
      detail: `${pendingBill} LR(s) not billed yet`,
      href: "/bills/weightwise",
      count: pendingBill,
    });
  }
  if (pendingLhc > 0) {
    items.push({
      id: "pending-lhc",
      title: "Pending lorry hire",
      detail: `${pendingLhc} LR(s) waiting for LHC`,
      href: "/lhc/contract",
      count: pendingLhc,
    });
  }
  if (pendingPod > 0) {
    items.push({
      id: "pending-pod",
      title: "Pending POD",
      detail: `${pendingPod} LR(s) POD not received`,
      href: "/lhc/pod-status",
      count: pendingPod,
    });
  }
  if (unpaidLhc > 0) {
    items.push({
      id: "unpaid-lhc",
      title: "Unpaid LHC",
      detail: `${unpaidLhc} challan(s) payment pending`,
      href: "/lhc/payment",
      count: unpaidLhc,
    });
  }
  if (expired > 0) {
    items.push({
      id: "docs-expired",
      title: "Documents expired",
      detail: `${expired} vehicle document(s) expired`,
      href: "/vehicle-register",
      count: expired,
    });
  }
  if (expiring > 0) {
    items.push({
      id: "docs-expiring",
      title: "Documents expiring",
      detail: `${expiring} vehicle document(s) due in 30 days`,
      href: "/vehicle-register",
      count: expiring,
    });
  }

  const badge = items.reduce((s, i) => s + i.count, 0);
  return NextResponse.json({ badge, asOf: today, items });
}
