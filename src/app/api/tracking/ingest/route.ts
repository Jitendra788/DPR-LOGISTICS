import { NextRequest, NextResponse } from "next/server";
import {
  findTripForIngest,
  recordLocationUpdate,
  getLocationHistory,
  publicTripPayload,
} from "@/services/trackingCoreService";

function ingestKey(req: NextRequest) {
  const header = req.headers.get("x-tracking-key") ?? req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const expected = process.env.TRACKING_INGEST_KEY || "dpr-tracking-dev";
  return header === expected;
}

export async function POST(req: NextRequest) {
  if (!ingestKey(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized ingest key." }, { status: 401 });
  }

  try {
    const body = (await req.json()) as {
      imei?: string;
      vehNo?: string;
      simMsisdn?: string;
      lat?: number;
      lng?: number;
      speed?: number;
      heading?: number;
      accuracy?: number;
      source?: "device" | "sim";
    };

    const lat = Number(body.lat);
    const lng = Number(body.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json({ ok: false, error: "Invalid lat/lng." }, { status: 400 });
    }

    const trip = await findTripForIngest({
      imei: body.imei,
      vehNo: body.vehNo,
      simMsisdn: body.simMsisdn,
    });

    if (!trip) {
      return NextResponse.json({ ok: false, error: "No In Transit trip for device/vehicle/SIM." }, { status: 404 });
    }

    const source = body.source === "sim" ? "sim" : "device";
    const updated = await recordLocationUpdate({
      tripId: trip.id,
      lat,
      lng,
      source,
      speed: Number(body.speed) || 0,
      heading: Number(body.heading) || 0,
      accuracy: Number(body.accuracy) || 0,
    });

    if (!updated) {
      return NextResponse.json({ ok: false, error: "Trip not In Transit." }, { status: 400 });
    }

    const history = await getLocationHistory(trip.id, 50);
    return NextResponse.json({ ok: true, data: publicTripPayload(updated, history) });
  } catch {
    return NextResponse.json({ ok: false, error: "Ingest failed." }, { status: 500 });
  }
}
