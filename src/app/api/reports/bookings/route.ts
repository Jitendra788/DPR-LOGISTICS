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

function inDateRange(lrDate: string, fromDate: string, toDate: string) {
  const rowDate = normalizeDate(lrDate);
  if (!rowDate) return true;
  if (fromDate && rowDate < fromDate) return false;
  if (toDate && rowDate > toDate) return false;
  return true;
}

function matchesField(value: string, filter: string) {
  if (!filter.trim()) return true;
  return value.trim().toLowerCase().includes(filter.trim().toLowerCase());
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const fromDate = normalizeDate(searchParams.get("fromDate") ?? "");
  const toDate = normalizeDate(searchParams.get("toDate") ?? "");
  const billingParty = searchParams.get("billingParty") ?? "";
  const fromStation = searchParams.get("fromStation") ?? "";
  const toStation = searchParams.get("toStation") ?? "";

  const rows = await prisma.lrBooking.findMany({
    orderBy: { id: "desc" },
  });

  const filtered = rows.filter(
    (row) =>
      inDateRange(row.lrDate, fromDate, toDate) &&
      matchesField(row.billingParty, billingParty) &&
      matchesField(row.fromStation, fromStation) &&
      matchesField(row.toStation, toStation),
  );

  return NextResponse.json(filtered);
}
