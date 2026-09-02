import type { TrackingEvent, TrackingStage, ShipmentTracking } from "@/data/marketing/tracking";
import { findMockTracking } from "@/data/marketing/tracking";
import { prisma } from "@/lib/prisma";
import {
  findTripByCustomerToken,
  findTripByLrNo,
  getLocationHistory,
  makeShareToken,
  normalizePhone,
  publicTripPayload,
} from "@/services/trackingCoreService";

export type TrackingResult =
  | {
      ok: true;
      data: ShipmentTracking & {
        verified: boolean;
        needsMobile?: boolean;
        mobileHint?: string;
        trackUrl?: string | null;
      };
    }
  | { ok: false; error: string; code: "NOT_FOUND" | "INVALID" | "FORBIDDEN" | "SERVER" };

const STAGE_LABELS: Record<TrackingStage, string> = {
  booked: "Booked",
  picked_up: "Picked Up",
  in_transit: "In Transit",
  arrived_at_hub: "Arrived at Hub",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
};

function buildEvents(current: TrackingStage, location: string, startedAt?: string): TrackingEvent[] {
  const order: TrackingStage[] = [
    "booked",
    "picked_up",
    "in_transit",
    "arrived_at_hub",
    "out_for_delivery",
    "delivered",
  ];
  const idx = order.indexOf(current);
  return order.map((stage, i) => ({
    stage,
    label: STAGE_LABELS[stage],
    location: i === idx ? location : i < idx ? location : "—",
    timestamp: i <= idx && stage === "in_transit" && startedAt ? startedAt.replace(" ", "T") + ":00" : null,
    status: i < idx ? "completed" : i === idx ? "current" : "pending",
  }));
}

function tripStatusToStage(status: string): TrackingStage {
  if (status === "Completed") return "delivered";
  if (status === "InTransit") return "in_transit";
  return "booked";
}

function maskName(name: string) {
  const t = name.trim();
  if (!t || t === "-") return "-";
  if (t.length <= 3) return `${t[0] ?? ""}**`;
  return `${t.slice(0, 2)}****${t.slice(-2)}`;
}

function mobileHintFromPhones(phones: string[]) {
  const digits = phones.map(normalizePhone).filter((p) => p.length === 10);
  if (!digits.length) return "";
  const last2 = digits[0]!.slice(-2);
  return `Registered mobile ends with **${last2}`;
}

async function resolveBookingPhones(names: string[]) {
  const cleaned = [...new Set(names.map((n) => n.trim()).filter(Boolean))];
  if (!cleaned.length) return [] as string[];
  const parties = await prisma.party.findMany({ take: 2000 });
  const phones: string[] = [];
  for (const name of cleaned) {
    const hit = parties.find((p) => p.name.trim().toLowerCase() === name.toLowerCase());
    if (hit?.contact) phones.push(hit.contact);
  }
  return phones;
}

function last4Matches(phones: string[], last4: string) {
  const want = last4.replace(/\D/g, "").slice(-4);
  if (want.length !== 4) return false;
  return phones.some((p) => normalizePhone(p).endsWith(want));
}

async function getLrTrackToken(lrId: number) {
  const row = await prisma.lrBooking.findUnique({
    where: { id: lrId },
    select: { trackToken: true },
  });
  return String(row?.trackToken ?? "").trim();
}

async function setLrTrackToken(lrId: number, token: string) {
  await prisma.lrBooking.update({
    where: { id: lrId },
    data: { trackToken: token },
  });
}

async function findLrIdByTrackToken(token: string) {
  return prisma.lrBooking.findFirst({
    where: { trackToken: token },
    select: { id: true, lrNo: true },
  });
}

async function ensureLrTrackToken(lrId: number, existing = "") {
  const current = existing || (await getLrTrackToken(lrId));
  if (current) return current;
  const trackToken = makeShareToken("lr");
  await setLrTrackToken(lrId, trackToken);
  return trackToken;
}

export async function attachBookingTrackToken<T extends { id: number }>(created: T) {
  const trackToken = await ensureLrTrackToken(created.id);
  return { ...created, trackToken };
}

export function stripBookingTrackToken(data: Record<string, unknown>) {
  const next = { ...data };
  delete next.trackToken;
  return next;
}

type Built = {
  full: ShipmentTracking & { trackUrl?: string | null };
  phones: string[];
  trackToken: string;
};

async function buildFromLrTrip(trackingNumber: string): Promise<Built | null> {
  const match = await findTripByLrNo(trackingNumber);
  if (!match) return null;
  const { lr, trip } = match;
  if (!lr && !trip) return null;

  const origin = trip?.fromStation || lr?.fromStation || "—";
  const destination = trip?.toStation || lr?.toStation || "—";
  const vehNo = trip?.vehNo || lr?.vehNo || "—";
  const bookingDate = lr?.lrDate || trip?.startedAt?.slice(0, 10) || "—";
  const consignee = lr?.consignee || "—";

  let live: ShipmentTracking["live"] = null;
  let trackUrl: string | null = null;

  if (trip) {
    const history = await getLocationHistory(trip.id, 200);
    const payload = publicTripPayload(trip, history);
    const customerToken = payload.customerTrackToken || "";
    trackUrl = customerToken ? `/track/${customerToken}` : null;
    live = {
      tripNo: payload.tripNo,
      status: payload.status,
      lastLat: payload.lastLat,
      lastLng: payload.lastLng,
      lastLocationAt: payload.lastLocationAt,
      etaMinutes: payload.etaMinutes,
      distanceRemainingKm: payload.distanceRemainingKm,
      route: payload.route,
      mapsUrl: payload.mapsUrl,
      customerTrackUrl: trackUrl,
    };
  }

  let trackToken = "";
  if (lr) {
    trackToken = await ensureLrTrackToken(lr.id, (lr as { trackToken?: string }).trackToken || "");
    if (!trackUrl) trackUrl = `/track/${trackToken}`;
  }

  const stage = trip ? tripStatusToStage(trip.status) : lr?.podStatus === "Delivered" ? "delivered" : "booked";
  const currentLocation =
    live?.lastLat != null
      ? `${live.lastLat.toFixed(4)}, ${live.lastLng!.toFixed(4)} (live GPS)`
      : trip?.status === "InTransit"
        ? "In transit — awaiting GPS"
        : origin;

  const phones = lr
    ? await resolveBookingPhones([lr.consignee, lr.consignor, lr.billingParty])
    : [];

  return {
    phones,
    trackToken: trackToken || trip?.customerTrackToken || "",
    full: {
      trackingNumber: lr?.lrNo || trackingNumber,
      bookingDate,
      origin,
      destination,
      consignee,
      currentLocation,
      vehicleNumber: vehNo,
      expectedDelivery: trip?.etaMinutes ? `~${Math.round(trip.etaMinutes / 60)}h ${trip.etaMinutes % 60}m` : "—",
      events: buildEvents(stage, currentLocation, trip?.startedAt),
      live,
      trackUrl,
    },
  };
}

function toLimited(full: ShipmentTracking, phones: string[]): TrackingResult {
  const statusLabel = full.events.find((e) => e.status === "current")?.label || "Booked";
  return {
    ok: true,
    data: {
      trackingNumber: full.trackingNumber,
      bookingDate: full.bookingDate,
      origin: full.origin,
      destination: full.destination,
      consignee: maskName(full.consignee),
      currentLocation: statusLabel === "In Transit" ? "In transit" : full.origin,
      vehicleNumber: "Hidden",
      expectedDelivery: full.expectedDelivery,
      events: full.events.map((e) => ({
        ...e,
        location: e.status === "pending" ? "—" : e.status === "current" ? statusLabel : "Completed",
        timestamp: null,
      })),
      live: null,
      verified: false,
      needsMobile: true,
      mobileHint: mobileHintFromPhones(phones) || "Enter last 4 digits of consignee / consignor mobile",
      trackUrl: null,
    },
  };
}

export async function trackShipment(input: {
  trackingNumber?: string;
  mobileLast4?: string;
  trackToken?: string;
}): Promise<TrackingResult> {
  const token = String(input.trackToken ?? "").trim();
  const trimmed = String(input.trackingNumber ?? "").trim();
  const mobileLast4 = String(input.mobileLast4 ?? "").replace(/\D/g, "").slice(-4);

  try {
    // Secret link → full details
    if (token) {
      const trip = await findTripByCustomerToken(token);
      if (trip) {
        const built = await buildFromLrTrip(trip.lrNos.split(/[,;\s]+/).map((s) => s.trim()).filter(Boolean)[0] || trip.tripNo);
        if (built) {
          return { ok: true, data: { ...built.full, verified: true, needsMobile: false, trackUrl: `/track/${token}` } };
        }
      }
      const byToken = await findLrIdByTrackToken(token);
      const lr = byToken ? await prisma.lrBooking.findUnique({ where: { id: byToken.id } }) : null;
      if (lr) {
        const built = await buildFromLrTrip(lr.lrNo);
        if (built) {
          return { ok: true, data: { ...built.full, verified: true, needsMobile: false, trackUrl: `/track/${token}` } };
        }
      }
      return { ok: false, error: "This tracking link is invalid or expired.", code: "NOT_FOUND" };
    }

    if (!trimmed) {
      return { ok: false, error: "Please enter a GC / LR / Docket number.", code: "INVALID" };
    }
    if (trimmed.length < 3) {
      return { ok: false, error: "Tracking number is too short. Check and try again.", code: "INVALID" };
    }

    const fromDb = await buildFromLrTrip(trimmed);
    if (fromDb) {
      if (mobileLast4.length === 4) {
        if (!fromDb.phones.length) {
          return {
            ok: false,
            error: "No mobile on file for this LR. Ask booking desk for your secret track link.",
            code: "FORBIDDEN",
          };
        }
        if (!last4Matches(fromDb.phones, mobileLast4)) {
          return {
            ok: false,
            error: "Mobile last 4 digits do not match. Try again or use your secret track link.",
            code: "FORBIDDEN",
          };
        }
        return {
          ok: true,
          data: {
            ...fromDb.full,
            verified: true,
            needsMobile: false,
            trackUrl: fromDb.full.trackUrl ?? (fromDb.trackToken ? `/track/${fromDb.trackToken}` : null),
          },
        };
      }
      return toLimited(fromDb.full, fromDb.phones);
    }

    const mock = findMockTracking(trimmed);
    if (mock) {
      // Demo: last 4 "0142" unlocks full mock details
      if (mobileLast4 === "0142") {
        return { ok: true, data: { ...mock, verified: true, needsMobile: false, trackUrl: null } };
      }
      return toLimited(mock, ["9999900142"]);
    }

    return {
      ok: false,
      error: "No shipment found for this tracking number. Type the exact LR from the print copy (example: LR-22463), not extra digits.",
      code: "NOT_FOUND",
    };
  } catch {
    return { ok: false, error: "Tracking service unavailable.", code: "SERVER" };
  }
}
