import { getSimTrackConfig, toMsisdn } from "@/lib/simTrackConfig";
import { prisma } from "@/lib/prisma";
import {
  createAlertIfNew,
  makeShareToken,
  normalizePhone,
  nowStamp,
  recordLocationUpdate,
} from "@/services/trackingCoreService";

export type SimLocationResult = {
  ok: boolean;
  lat?: number;
  lng?: number;
  accuracy?: number;
  error?: string;
};

type TripSimRow = {
  id: number;
  tripNo: string;
  vehNo: string;
  driverPhone: string;
  simMsisdn: string;
  trackingMode: string;
  simConsentStatus: string;
  lastLat: number;
  lastLng: number;
};

export function resolveSimPhone(trip: TripSimRow) {
  const fromField = normalizePhone(trip.simMsisdn);
  if (fromField.length === 10) return fromField;
  return normalizePhone(trip.driverPhone);
}

export function isSimTrackTrip(trip: TripSimRow) {
  if (trip.trackingMode === "sim") return true;
  return normalizePhone(trip.simMsisdn).length === 10;
}

export function canPollSim(trip: TripSimRow) {
  const cfg = getSimTrackConfig();
  if (!cfg.enabled) return false;
  if (!isSimTrackTrip(trip)) return false;
  if (resolveSimPhone(trip).length !== 10) return false;
  if (!cfg.skipConsent && trip.simConsentStatus !== "Approved") return false;
  return true;
}

async function fetchMockSimLocation(trip: TripSimRow): Promise<SimLocationResult> {
  const seed = trip.id * 1000;
  const t = Date.now() / 60000;
  const baseLat = trip.lastLat !== 0 ? trip.lastLat : 18.52 + (seed % 100) / 1000;
  const baseLng = trip.lastLng !== 0 ? trip.lastLng : 73.85 + (seed % 100) / 1000;
  const lat = baseLat + Math.sin(t / 10 + seed) * 0.08;
  const lng = baseLng + Math.cos(t / 12 + seed) * 0.08;
  return { ok: true, lat, lng, accuracy: 250 };
}

async function fetchGenericSimLocation(msisdn: string): Promise<SimLocationResult> {
  const cfg = getSimTrackConfig();
  if (!cfg.apiUrl) {
    return { ok: false, error: "SIM_TRACK_API_URL not configured." };
  }

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (cfg.apiKey) {
      headers.Authorization = `Bearer ${cfg.apiKey}`;
      headers["X-Api-Key"] = cfg.apiKey;
    }

    const res = await fetch(cfg.apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({ msisdn, msisdn91: toMsisdn(msisdn.slice(-10)) }),
      cache: "no-store",
    });

    const json = (await res.json()) as Record<string, unknown>;
    if (!res.ok) {
      return { ok: false, error: String(json.message ?? json.error ?? "SIM API error") };
    }

    const data = (json.data ?? json.location ?? json) as Record<string, unknown>;
    const lat = Number(data.lat ?? data.latitude);
    const lng = Number(data.lng ?? data.longitude ?? data.lon);
    const accuracy = Number(data.accuracy ?? data.radius ?? 300);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return { ok: false, error: "SIM API returned invalid coordinates." };
    }

    return { ok: true, lat, lng, accuracy: Number.isFinite(accuracy) ? accuracy : 300 };
  } catch {
    return { ok: false, error: "SIM API unreachable." };
  }
}

export async function fetchSimLocationForTrip(trip: TripSimRow): Promise<SimLocationResult> {
  const phone = resolveSimPhone(trip);
  const cfg = getSimTrackConfig();

  if (cfg.provider === "mock") {
    return fetchMockSimLocation(trip);
  }

  return fetchGenericSimLocation(toMsisdn(phone) || phone);
}

export async function ensureSimConsentToken(tripId: number) {
  const trip = await prisma.tripDesk.findUnique({ where: { id: tripId } });
  if (!trip) return null;

  if (trip.simConsentToken && trip.simConsentStatus === "Approved") {
    return trip;
  }

  const token = trip.simConsentToken || makeShareToken("sc");
  return prisma.tripDesk.update({
    where: { id: tripId },
    data: {
      simConsentToken: token,
      simConsentStatus: trip.simConsentStatus || "Pending",
    },
  });
}

export async function approveSimConsent(token: string) {
  const trip = await prisma.tripDesk.findFirst({
    where: { simConsentToken: token.trim() },
  });
  if (!trip) return { ok: false as const, error: "Invalid consent link." };

  await prisma.tripDesk.update({
    where: { id: trip.id },
    data: {
      simConsentStatus: "Approved",
      simConsentAt: nowStamp(),
    },
  });

  return { ok: true as const, tripNo: trip.tripNo, vehNo: trip.vehNo };
}

export async function pollSimTrip(tripId: number) {
  const trip = await prisma.tripDesk.findUnique({ where: { id: tripId } });
  if (!trip || trip.status !== "InTransit") {
    return { ok: false, error: "Trip not In Transit." };
  }

  if (!canPollSim(trip)) {
    const reason =
      trip.simConsentStatus !== "Approved"
        ? "Driver SIM consent pending."
        : "SIM tracking not configured for this trip.";
    return { ok: false, error: reason };
  }

  const loc = await fetchSimLocationForTrip(trip);
  const pollAt = nowStamp();

  if (!loc.ok || loc.lat == null || loc.lng == null) {
    await prisma.tripDesk.update({
      where: { id: tripId },
      data: { simLastPollAt: pollAt, simLastPollError: loc.error ?? "Unknown error" },
    });
    await createAlertIfNew(tripId, "sim_poll_failed", `SIM track failed for ${trip.tripNo}: ${loc.error}`);
    return { ok: false, error: loc.error };
  }

  await recordLocationUpdate({
    tripId,
    lat: loc.lat,
    lng: loc.lng,
    source: "sim",
    accuracy: loc.accuracy ?? 300,
  });

  await prisma.tripDesk.update({
    where: { id: tripId },
    data: { simLastPollAt: pollAt, simLastPollError: "" },
  });

  return { ok: true, lat: loc.lat, lng: loc.lng, accuracy: loc.accuracy };
}

export async function pollAllSimTrips() {
  const cfg = getSimTrackConfig();
  if (!cfg.enabled) {
    return {
      polled: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[],
      message: "SIM track disabled (SIM_TRACK_PROVIDER=off).",
    };
  }

  const trips = await prisma.tripDesk.findMany({ where: { status: "InTransit" } });
  let polled = 0;
  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const trip of trips) {
    if (!isSimTrackTrip(trip)) {
      skipped++;
      continue;
    }

    if (!canPollSim(trip)) {
      skipped++;
      continue;
    }

    if (trip.simLastPollAt) {
      const last = new Date(trip.simLastPollAt.replace(" ", "T")).getTime();
      const gapMs = cfg.pollMinutes * 60 * 1000;
      if (Date.now() - last < gapMs) {
        skipped++;
        continue;
      }
    }

    polled++;
    const result = await pollSimTrip(trip.id);
    if (result.ok) updated++;
    else if (result.error) errors.push(`${trip.tripNo}: ${result.error}`);
  }

  return { polled, updated, skipped, errors, provider: cfg.provider };
}
