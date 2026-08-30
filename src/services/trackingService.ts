import type { TrackingEvent, TrackingStage, ShipmentTracking } from "@/data/marketing/tracking";
import { findMockTracking } from "@/data/marketing/tracking";
import { findTripByLrNo, getLocationHistory, publicTripPayload } from "@/services/trackingCoreService";

export type TrackingResult =
  | { ok: true; data: ShipmentTracking }
  | { ok: false; error: string; code: "NOT_FOUND" | "INVALID" | "SERVER" };

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

async function trackFromDatabase(trackingNumber: string): Promise<TrackingResult | null> {
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
  if (trip) {
    const history = await getLocationHistory(trip.id, 200);
    const payload = publicTripPayload(trip, history);
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
      customerTrackUrl: payload.customerTrackToken ? `/track/${payload.customerTrackToken}` : null,
    };
  }

  const stage = trip ? tripStatusToStage(trip.status) : lr?.podStatus === "Delivered" ? "delivered" : "booked";
  const currentLocation =
    live?.lastLat != null
      ? `${live.lastLat.toFixed(4)}, ${live.lastLng!.toFixed(4)} (live GPS)`
      : trip?.status === "InTransit"
        ? "In transit — awaiting GPS"
        : origin;

  return {
    ok: true,
    data: {
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
    },
  };
}

export async function trackShipment(trackingNumber: string): Promise<TrackingResult> {
  const trimmed = trackingNumber.trim();
  if (!trimmed) {
    return { ok: false, error: "Please enter a GC / LR / Docket number.", code: "INVALID" };
  }
  if (trimmed.length < 3) {
    return { ok: false, error: "Tracking number is too short. Check and try again.", code: "INVALID" };
  }

  try {
    const fromDb = await trackFromDatabase(trimmed);
    if (fromDb) return fromDb;
  } catch {
    /* fall through to mock */
  }

  const mock = findMockTracking(trimmed);
  if (mock) return { ok: true, data: mock };

  return {
    ok: false,
    error: "No shipment found for this tracking number. Please verify and try again.",
    code: "NOT_FOUND",
  };
}
