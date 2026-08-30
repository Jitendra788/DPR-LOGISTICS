import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nowStamp } from "@/services/trackingCoreService";

export async function GET() {
  try {
    const alerts = await prisma.trackingAlert.findMany({
      where: { acknowledgedAt: "" },
      orderBy: { id: "desc" },
      take: 100,
      include: { trip: true },
    });

    return NextResponse.json({
      ok: true,
      data: alerts.map((a) => ({
        id: a.id,
        tripId: a.tripId,
        tripNo: a.trip.tripNo,
        vehNo: a.trip.vehNo,
        driverPhone: a.trip.driverPhone,
        type: a.type,
        message: a.message,
        severity: a.severity,
        triggeredAt: a.triggeredAt,
      })),
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not load alerts." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { id?: number; ids?: number[] };
    const ids = body.ids?.length ? body.ids : body.id ? [body.id] : [];
    if (!ids.length) {
      return NextResponse.json({ ok: false, error: "Alert id required." }, { status: 400 });
    }

    await prisma.trackingAlert.updateMany({
      where: { id: { in: ids }, acknowledgedAt: "" },
      data: { acknowledgedAt: nowStamp() },
    });

    return NextResponse.json({ ok: true, acknowledged: ids.length });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not acknowledge alert." }, { status: 500 });
  }
}
