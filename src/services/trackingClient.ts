import type { ShipmentTracking } from "@/data/marketing/tracking";

export type TrackingResult =
  | { ok: true; data: ShipmentTracking }
  | { ok: false; error: string; code: "NOT_FOUND" | "INVALID" | "SERVER" };

export async function trackShipmentViaApi(trackingNumber: string): Promise<TrackingResult> {
  const res = await fetch("/api/public/tracking", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ trackingNumber }),
  });
  return (await res.json()) as TrackingResult;
}
