import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAlertIfNew } from "@/services/trackingCoreService";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { tripId?: number; type?: string };
    const tripId = Number(body.tripId);
    const type = body.type?.trim() || "trip_started";
    if (!tripId) {
      return NextResponse.json({ ok: false, error: "tripId required." }, { status: 400 });
    }

    const trip = await prisma.tripDesk.findUnique({ where: { id: tripId } });
    if (!trip) {
      return NextResponse.json({ ok: false, error: "Trip not found." }, { status: 404 });
    }

    const messages: Record<string, string> = {
      trip_started: `Trip ${trip.tripNo} started — ${trip.vehNo || "vehicle"} on ${trip.fromStation} → ${trip.toStation}.`,
      trip_completed: `Trip ${trip.tripNo} completed.`,
    };

    await createAlertIfNew(tripId, type, messages[type] ?? `Trip event: ${type}`);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Event failed." }, { status: 500 });
  }
}
