import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  findLiveTripByPhone,
  findTripByShareToken,
  findTripByCustomerToken,
  getLocationHistory,
  publicTripPayload,
  recordLocationUpdate,
  normalizePhone,
} from "@/services/trackingCoreService";

export async function GET(req: NextRequest) {
  try {
    const phone = req.nextUrl.searchParams.get("phone") ?? "";
    const token = req.nextUrl.searchParams.get("token") ?? "";
    const customer = req.nextUrl.searchParams.get("customer") ?? "";
    const tripId = req.nextUrl.searchParams.get("tripId");

    let trip = null;
    if (tripId) {
      trip = await prisma.tripDesk.findUnique({ where: { id: Number(tripId) } });
      if (trip && trip.status !== "InTransit" && trip.status !== "Completed") trip = null;
    } else if (customer) {
      trip = await findTripByCustomerToken(customer);
    } else if (token) {
      trip = await findTripByShareToken(token);
    } else {
      trip = await findLiveTripByPhone(phone);
    }

    if (!trip) {
      return NextResponse.json(
        { ok: false, error: "No live trip found. Trip must be In Transit (or use valid customer link)." },
        { status: 404 },
      );
    }

    const history = await getLocationHistory(trip.id, 300);
    return NextResponse.json({ ok: true, data: publicTripPayload(trip, history) });
  } catch {
    return NextResponse.json({ ok: false, error: "Live tracking unavailable." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      token?: string;
      phone?: string;
      lat?: number;
      lng?: number;
      speed?: number;
      heading?: number;
      accuracy?: number;
    };

    const lat = Number(body.lat);
    const lng = Number(body.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json({ ok: false, error: "Invalid location." }, { status: 400 });
    }
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      return NextResponse.json({ ok: false, error: "Location out of range." }, { status: 400 });
    }

    let trip = body.token ? await findTripByShareToken(body.token) : null;
    if (!trip && body.phone) {
      trip = await findLiveTripByPhone(body.phone);
    }
    if (!trip) {
      return NextResponse.json(
        { ok: false, error: "No live trip found. Start the trip from Trip Desk first." },
        { status: 404 },
      );
    }

    const phone = normalizePhone(body.phone ?? trip.driverPhone);
    if (phone && phone !== trip.driverPhone) {
      return NextResponse.json({ ok: false, error: "Phone does not match this trip." }, { status: 403 });
    }

    const updated = await recordLocationUpdate({
      tripId: trip.id,
      lat,
      lng,
      source: "phone",
      speed: Number(body.speed) || 0,
      heading: Number(body.heading) || 0,
      accuracy: Number(body.accuracy) || 0,
    });

    if (!updated) {
      return NextResponse.json({ ok: false, error: "Trip is not In Transit." }, { status: 400 });
    }

    const history = await getLocationHistory(trip.id, 300);
    return NextResponse.json({ ok: true, data: publicTripPayload(updated, history) });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not update location." }, { status: 500 });
  }
}
