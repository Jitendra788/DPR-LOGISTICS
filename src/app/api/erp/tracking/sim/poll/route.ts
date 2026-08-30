import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSimTrackConfig } from "@/lib/simTrackConfig";
import { pollAllSimTrips, pollSimTrip } from "@/services/simTrackService";

export async function GET() {
  try {
    const cfg = getSimTrackConfig();
    const result = await pollAllSimTrips();
    return NextResponse.json({ ok: true, config: { provider: cfg.provider, pollMinutes: cfg.pollMinutes }, data: result });
  } catch {
    return NextResponse.json({ ok: false, error: "SIM poll failed." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { tripId?: number };
    if (body.tripId) {
      const result = await pollSimTrip(Number(body.tripId));
      return NextResponse.json({ ok: result.ok, data: result });
    }

    const result = await pollAllSimTrips();
    return NextResponse.json({ ok: true, data: result });
  } catch {
    return NextResponse.json({ ok: false, error: "SIM poll failed." }, { status: 500 });
  }
}
