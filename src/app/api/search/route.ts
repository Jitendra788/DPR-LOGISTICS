import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripLrPrefix } from "@/lib/lr-no";

type Hit = {
  type: "lr" | "vehicle" | "driver" | "party" | "lhc" | "bill";
  title: string;
  subtitle: string;
  href: string;
};

function has(value: string | null | undefined, q: string) {
  return (value ?? "").toLowerCase().includes(q);
}

function matchesLr(lrNo: string, q: string) {
  if (has(lrNo, q)) return true;
  const plain = stripLrPrefix(lrNo).toLowerCase();
  if (plain.includes(q)) return true;
  const qDigits = q.replace(/\D/g, "");
  if (qDigits.length >= 2 && plain.replace(/\D/g, "").includes(qDigits)) return true;
  return false;
}

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase();
  if (q.length < 1) return NextResponse.json({ query: q, results: [] as Hit[] });

  const [bookings, vehicles, drivers, parties, contracts, bills] = await Promise.all([
    prisma.lrBooking.findMany({ orderBy: { id: "desc" }, take: 400 }),
    prisma.vehicle.findMany({ orderBy: { id: "desc" }, take: 400 }),
    prisma.driver.findMany({ orderBy: { id: "desc" }, take: 400 }),
    prisma.party.findMany({ orderBy: { id: "desc" }, take: 400 }),
    prisma.lhcContract.findMany({ orderBy: { id: "desc" }, take: 400 }),
    prisma.bill.findMany({ orderBy: { id: "desc" }, take: 400 }),
  ]);

  const results: Hit[] = [];

  for (const row of bills) {
    if (has(row.billNo, q) || has(row.partyName, q) || has(row.poNo, q)) {
      const isMeter = (row.billAt || "").toLowerCase().includes("mtr");
      results.push({
        type: "bill",
        title: `Bill ${row.billNo}`,
        subtitle: [row.partyName, row.billDate].filter(Boolean).join(" · ") || "Bill",
        href: `${isMeter ? "/bills/meterwise" : "/bills/weightwise"}?billNo=${encodeURIComponent(row.billNo)}`,
      });
    }
    if (results.length >= 25) break;
  }

  for (const row of bookings) {
    if (
      matchesLr(row.lrNo, q) ||
      has(row.vehNo, q) ||
      has(row.billingParty, q) ||
      has(row.consignor, q) ||
      has(row.consignee, q) ||
      has(row.fromStation, q) ||
      has(row.toStation, q) ||
      has(row.billNo, q)
    ) {
      results.push({
        type: "lr",
        title: `LR ${stripLrPrefix(row.lrNo)}`,
        subtitle: [row.vehNo, row.billingParty, row.fromStation && row.toStation ? `${row.fromStation} → ${row.toStation}` : ""]
          .filter(Boolean)
          .join(" · "),
        href: `/booking/lr?lrNo=${encodeURIComponent(row.lrNo)}`,
      });
    }
    if (results.length >= 25) break;
  }

  for (const row of vehicles) {
    if (has(row.vehNo, q) || has(row.ownerName, q) || has(row.ownerMob, q)) {
      results.push({
        type: "vehicle",
        title: row.vehNo,
        subtitle: [row.ownerName, row.ownerMob].filter(Boolean).join(" · ") || "Vehicle",
        href: `/master/vehicles?vehNo=${encodeURIComponent(row.vehNo)}`,
      });
    }
  }

  for (const row of drivers) {
    if (has(row.name, q) || has(row.mobile, q) || has(row.licenceNo, q)) {
      results.push({
        type: "driver",
        title: row.name,
        subtitle: [row.category || "Driver", row.mobile, row.licenceNo].filter(Boolean).join(" · "),
        href: `/master/drivers?name=${encodeURIComponent(row.name)}`,
      });
    }
  }

  for (const row of parties) {
    if (has(row.name, q) || has(row.contact, q) || has(row.gst, q) || has(row.partyCode, q)) {
      results.push({
        type: "party",
        title: row.name,
        subtitle: [row.partyType, row.contact, row.gst].filter(Boolean).join(" · ") || "Customer",
        href: `/master/party?name=${encodeURIComponent(row.name)}`,
      });
    }
  }

  for (const row of contracts) {
    if (has(row.challanNo, q) || has(row.vehNo, q) || has(row.driverName, q) || has(row.ownerName, q) || has(row.brokerName, q)) {
      results.push({
        type: "lhc",
        title: `LHC ${row.challanNo}`,
        subtitle: [row.vehNo, row.driverName, row.fromStation && row.toStation ? `${row.fromStation} → ${row.toStation}` : ""]
          .filter(Boolean)
          .join(" · "),
        href: `/lhc/contract?challanNo=${encodeURIComponent(row.challanNo)}`,
      });
    }
  }

  return NextResponse.json({ query: q, results: results.slice(0, 25) });
}
