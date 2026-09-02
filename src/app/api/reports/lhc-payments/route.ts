import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { displayToIso } from "@/lib/dates";

function normalizeDate(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const fromDisplay = displayToIso(trimmed);
  if (/^\d{4}-\d{2}-\d{2}$/.test(fromDisplay)) return fromDisplay;
  return trimmed;
}

function matchesField(value: string, filter: string) {
  if (!filter.trim()) return true;
  return value.trim().toLowerCase().includes(filter.trim().toLowerCase());
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const fromDate = normalizeDate(searchParams.get("fromDate") ?? "");
  const toDate = normalizeDate(searchParams.get("toDate") ?? "");
  const vehNo = searchParams.get("vehNo") ?? "";
  const brokerName = searchParams.get("brokerName") ?? "";
  const lhcNo = searchParams.get("lhcNo") ?? "";
  const paid = searchParams.get("paid");

  const rows = await prisma.lhcContract.findMany({
    where: {
      ...(paid === "true" ? { paid: true } : {}),
      ...(paid === "false" ? { paid: false } : {}),
    },
    orderBy: { id: "desc" },
  });

  const filtered = rows.filter((row) => {
    const date = normalizeDate(row.paidDate || row.challanDate);
    if (fromDate && date && date < fromDate) return false;
    if (toDate && date && date > toDate) return false;
    if (!matchesField(row.vehNo, vehNo)) return false;
    if (!matchesField(row.brokerName, brokerName)) return false;
    if (lhcNo.trim() && !row.challanNo.toLowerCase().includes(lhcNo.trim().toLowerCase())) return false;
    return true;
  });

  return NextResponse.json(filtered);
}
