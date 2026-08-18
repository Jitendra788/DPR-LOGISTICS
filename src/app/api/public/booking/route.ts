import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sanitize } from "@/lib/resources";

function nextLrNo(lastId: number) {
  return `LR-${String(lastId + 22451).padStart(5, "0")}`;
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

  const [last, stations] = await Promise.all([
    prisma.lrBooking.findFirst({ orderBy: { id: "desc" } }),
    prisma.station.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
  ]);

  return NextResponse.json({
    lrNo: nextLrNo(last?.id ?? 0),
    stations: stations.map((s) => s.name),
  });
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Record<string, unknown>;
  const last = await prisma.lrBooking.findFirst({ orderBy: { id: "desc" } });
  const lrNo = String(body.lrNo || nextLrNo(last?.id ?? 0));

  const exists = await prisma.lrBooking.findUnique({ where: { lrNo } });
  if (exists) {
    return NextResponse.json({ error: "LR number already exists. Refresh and try again." }, { status: 400 });
  }

  try {
    const created = await prisma.lrBooking.create({
      data: {
        ...sanitize(body, "bookings"),
        lrNo,
        source: "CUSTOMER",
        billed: false,
        lhcNo: "",
        podStatus: "Pending",
      } as never,
    });
    return NextResponse.json(created);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Booking failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
