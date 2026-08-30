import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLocationHistory, publicTripPayload, runTrackingAlertChecks } from "@/services/trackingCoreService";
import { pollAllSimTrips } from "@/services/simTrackService";

export async function GET() {
  try {
    await runTrackingAlertChecks();
    const simPoll = await pollAllSimTrips();

    const trips = await prisma.tripDesk.findMany({
      where: { status: "InTransit" },
      orderBy: { id: "desc" },
    });

    const alerts = await prisma.trackingAlert.findMany({
      where: { acknowledgedAt: "" },
      orderBy: { id: "desc" },
      take: 50,
      include: { trip: true },
    });

    const data = await Promise.all(
      trips.map(async (trip) => {
        const history = await getLocationHistory(trip.id, 100);
        return publicTripPayload(trip, history);
      }),
    );

    return NextResponse.json({
      ok: true,
      data: {
        trips: data,
        simPoll,
        alerts: alerts.map((a) => ({
          id: a.id,
          tripId: a.tripId,
          tripNo: a.trip.tripNo,
          vehNo: a.trip.vehNo,
          type: a.type,
          message: a.message,
          severity: a.severity,
          triggeredAt: a.triggeredAt,
        })),
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not load tracking desk." }, { status: 500 });
  }
}

export async function POST() {
  try {
    const alertResult = await runTrackingAlertChecks();
    const simPoll = await pollAllSimTrips();
    return NextResponse.json({ ok: true, data: { alerts: alertResult, simPoll } });
  } catch {
    return NextResponse.json({ ok: false, error: "Alert check failed." }, { status: 500 });
  }
}
