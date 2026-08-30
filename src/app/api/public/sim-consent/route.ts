import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { approveSimConsent, resolveSimPhone } from "@/services/simTrackService";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  if (!token) {
    return NextResponse.json({ ok: false, error: "Token required." }, { status: 400 });
  }

  const trip = await prisma.tripDesk.findFirst({ where: { simConsentToken: token.trim() } });
  if (!trip) {
    return NextResponse.json({ ok: false, error: "Invalid consent link." }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    data: {
      tripNo: trip.tripNo,
      vehNo: trip.vehNo,
      fromStation: trip.fromStation,
      toStation: trip.toStation,
      driverName: trip.driverName,
      simPhone: resolveSimPhone(trip),
      consentStatus: trip.simConsentStatus || "Pending",
      consentAt: trip.simConsentAt,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { token?: string; action?: string };
    const token = String(body.token ?? "").trim();
    if (!token) {
      return NextResponse.json({ ok: false, error: "Token required." }, { status: 400 });
    }

    if (body.action === "deny") {
      const trip = await prisma.tripDesk.findFirst({ where: { simConsentToken: token } });
      if (!trip) {
        return NextResponse.json({ ok: false, error: "Invalid link." }, { status: 404 });
      }
      await prisma.tripDesk.update({
        where: { id: trip.id },
        data: { simConsentStatus: "Denied" },
      });
      return NextResponse.json({ ok: true, status: "Denied" });
    }

    const result = await approveSimConsent(token);
    if (!result.ok) {
      return NextResponse.json(result, { status: 404 });
    }
    return NextResponse.json({ ok: true, status: "Approved", tripNo: result.tripNo, vehNo: result.vehNo });
  } catch {
    return NextResponse.json({ ok: false, error: "Consent update failed." }, { status: 500 });
  }
}
