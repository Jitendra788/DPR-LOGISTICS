import { prisma } from "@/lib/prisma";

export type LocationSource = "phone" | "device" | "sim";

export function normalizePhone(value: string) {
  return value.replace(/\D/g, "").slice(-10);
}

export function makeShareToken(prefix = "lt") {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function nowStamp() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const r = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return r * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function findLiveTripByPhone(phoneRaw: string) {
  const phone = normalizePhone(phoneRaw);
  if (phone.length !== 10) return null;
  return prisma.tripDesk.findFirst({
    where: { driverPhone: phone, status: "InTransit" },
    orderBy: { id: "desc" },
  });
}

export async function findTripByShareToken(token: string) {
  const shareToken = token.trim();
  if (!shareToken) return null;
  return prisma.tripDesk.findFirst({
    where: { shareToken, status: "InTransit" },
    orderBy: { id: "desc" },
  });
}

export async function findTripByCustomerToken(token: string) {
  const customerTrackToken = token.trim();
  if (!customerTrackToken) return null;
  return prisma.tripDesk.findFirst({
    where: {
      customerTrackToken,
      status: { in: ["InTransit", "Completed"] },
    },
    orderBy: { id: "desc" },
  });
}

export async function findTripByLrNo(lrRaw: string) {
  const q = lrRaw.trim();
  if (!q) return null;
  const qLower = q.toLowerCase();

  let lr = await prisma.lrBooking.findFirst({ where: { lrNo: q } });
  if (!lr) {
    const allLr = await prisma.lrBooking.findMany({ take: 500, orderBy: { id: "desc" } });
    lr = allLr.find((r) => r.lrNo.toLowerCase() === qLower) ?? null;
  }

  const trips = await prisma.tripDesk.findMany({
    where: { lrNos: { not: "" } },
    orderBy: { id: "desc" },
    take: 200,
  });

  const trip =
    trips.find((t) =>
      t.lrNos
        .split(/[,;\s]+/)
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
        .includes(qLower),
    ) ??
    trips.find((t) => t.lrNos.toLowerCase().includes(qLower)) ??
    null;

  return { lr, trip };
}

export async function getLocationHistory(tripId: number, limit = 500) {
  return prisma.tripLocationLog.findMany({
    where: { tripId },
    orderBy: { recordedAt: "asc" },
    take: limit,
  });
}

type TripLike = {
  id: number;
  tripNo: string;
  driverPhone: string;
  driverName: string;
  vehNo: string;
  fromStation: string;
  toStation: string;
  lrNos: string;
  status: string;
  startedAt: string;
  completedAt: string;
  lastLat: number;
  lastLng: number;
  lastLocationAt: string;
  customerTrackToken: string;
  etaMinutes: number;
  distanceRemainingKm: number;
  destLat: number;
  destLng: number;
};

export function publicTripPayload(
  trip: TripLike,
  history?: { lat: number; lng: number; recordedAt: string; source: string }[],
) {
  const hasLocation = trip.lastLat !== 0 || trip.lastLng !== 0;
  const route = (history ?? []).map((p) => ({ lat: p.lat, lng: p.lng, at: p.recordedAt, source: p.source }));

  return {
    tripId: trip.id,
    tripNo: trip.tripNo,
    driverPhone: trip.driverPhone,
    driverName: trip.driverName,
    vehNo: trip.vehNo,
    fromStation: trip.fromStation,
    toStation: trip.toStation,
    lrNos: trip.lrNos,
    status: trip.status,
    startedAt: trip.startedAt,
    completedAt: trip.completedAt,
    lastLat: hasLocation ? trip.lastLat : null,
    lastLng: hasLocation ? trip.lastLng : null,
    lastLocationAt: trip.lastLocationAt || null,
    etaMinutes: trip.etaMinutes > 0 ? trip.etaMinutes : null,
    distanceRemainingKm: trip.distanceRemainingKm > 0 ? Math.round(trip.distanceRemainingKm * 10) / 10 : null,
    customerTrackToken: trip.customerTrackToken || null,
    mapsUrl: hasLocation ? `https://www.google.com/maps?q=${trip.lastLat},${trip.lastLng}` : null,
    route,
  };
}

export async function recordLocationUpdate(input: {
  tripId: number;
  lat: number;
  lng: number;
  source: LocationSource;
  speed?: number;
  heading?: number;
  accuracy?: number;
}) {
  const { tripId, lat, lng, source, speed = 0, heading = 0, accuracy = 0 } = input;
  const recordedAt = nowStamp();

  const trip = await prisma.tripDesk.findUnique({ where: { id: tripId } });
  if (!trip || trip.status !== "InTransit") return null;

  await prisma.tripLocationLog.create({
    data: {
      tripId,
      lat,
      lng,
      speed,
      heading,
      accuracy,
      source,
      recordedAt,
    },
  });

  let distanceRemainingKm = trip.distanceRemainingKm;
  let etaMinutes = trip.etaMinutes;

  if (trip.destLat !== 0 || trip.destLng !== 0) {
    distanceRemainingKm = haversineKm(lat, lng, trip.destLat, trip.destLng);
    const recent = await prisma.tripLocationLog.findMany({
      where: { tripId },
      orderBy: { id: "desc" },
      take: 10,
    });
    if (recent.length >= 2) {
      const speeds = recent
        .filter((p) => p.speed > 5)
        .map((p) => p.speed);
      const avgSpeed = speeds.length ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 40;
      etaMinutes = Math.round((distanceRemainingKm / Math.max(avgSpeed, 20)) * 60);
    } else {
      etaMinutes = Math.round((distanceRemainingKm / 40) * 60);
    }
  }

  const updated = await prisma.tripDesk.update({
    where: { id: tripId },
    data: {
      lastLat: lat,
      lastLng: lng,
      lastLocationAt: recordedAt,
      distanceRemainingKm,
      etaMinutes,
    },
  });

  if (distanceRemainingKm > 0 && distanceRemainingKm <= 15 && trip.destLat !== 0) {
    await createAlertIfNew(tripId, "near_destination", `Vehicle ${trip.vehNo || trip.tripNo} is ~${Math.round(distanceRemainingKm)} km from destination.`);
  }

  return updated;
}

export async function createAlertIfNew(tripId: number, type: string, message: string) {
  const existing = await prisma.trackingAlert.findFirst({
    where: { tripId, type, acknowledgedAt: "" },
    orderBy: { id: "desc" },
  });
  if (existing) return existing;

  return prisma.trackingAlert.create({
    data: {
      tripId,
      type,
      message,
      severity: type === "offline" ? "high" : "medium",
      channel: "erp",
      triggeredAt: nowStamp(),
    },
  });
}

export async function runTrackingAlertChecks() {
  const active = await prisma.tripDesk.findMany({ where: { status: "InTransit" } });
  const created: string[] = [];
  const now = Date.now();
  const offlineMs = 30 * 60 * 1000;

  for (const trip of active) {
    if (!trip.lastLocationAt) {
      if (trip.startedAt) {
        const started = new Date(trip.startedAt.replace(" ", "T")).getTime();
        if (now - started > offlineMs) {
          await createAlertIfNew(trip.id, "offline", `No GPS update for trip ${trip.tripNo} (${trip.vehNo || "vehicle"}).`);
          created.push(`offline:${trip.tripNo}`);
        }
      }
      continue;
    }

    const last = new Date(trip.lastLocationAt.replace(" ", "T")).getTime();
    if (now - last > offlineMs) {
      await createAlertIfNew(
        trip.id,
        "offline",
        `No GPS update for 30+ minutes — trip ${trip.tripNo}, ${trip.vehNo || "vehicle"}.`,
      );
      created.push(`offline:${trip.tripNo}`);
    }
  }

  return { checked: active.length, alertsCreated: created.length, details: created };
}

export async function findTripForIngest(input: { imei?: string; vehNo?: string; simMsisdn?: string }) {
  const imei = input.imei?.trim();
  const vehNo = input.vehNo?.trim().toUpperCase();
  const sim = input.simMsisdn ? normalizePhone(input.simMsisdn) : "";

  if (imei) {
    const t = await prisma.tripDesk.findFirst({
      where: { deviceImei: imei, status: "InTransit" },
      orderBy: { id: "desc" },
    });
    if (t) return t;
  }

  if (vehNo) {
    const t = await prisma.tripDesk.findFirst({
      where: { vehNo, status: "InTransit" },
      orderBy: { id: "desc" },
    });
    if (t) return t;
  }

  if (sim.length === 10) {
    const t = await prisma.tripDesk.findFirst({
      where: { simMsisdn: sim, status: "InTransit" },
      orderBy: { id: "desc" },
    });
    if (t) return t;
  }

  return null;
}
