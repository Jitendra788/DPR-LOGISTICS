import { findMockTracking, type ShipmentTracking } from "@/data/marketing/tracking";

export type TrackingResult =
  | { ok: true; data: ShipmentTracking }
  | { ok: false; error: string; code: "NOT_FOUND" | "INVALID" | "SERVER" };

export async function trackShipment(trackingNumber: string): Promise<TrackingResult> {
  const trimmed = trackingNumber.trim();
  if (!trimmed) {
    return { ok: false, error: "Please enter a GC / LR / Docket number.", code: "INVALID" };
  }
  if (trimmed.length < 4) {
    return { ok: false, error: "Tracking number is too short. Check and try again.", code: "INVALID" };
  }

  // Simulate network latency for realistic UX
  await new Promise((r) => setTimeout(r, 600));

  const data = findMockTracking(trimmed);
  if (!data) {
    return {
      ok: false,
      error: "No shipment found for this tracking number. Please verify and try again.",
      code: "NOT_FOUND",
    };
  }
  return { ok: true, data };
}

export async function trackShipmentViaApi(trackingNumber: string): Promise<TrackingResult> {
  const res = await fetch("/api/public/tracking", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ trackingNumber }),
  });
  const data = (await res.json()) as TrackingResult;
  return data;
}
