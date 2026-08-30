import type { ShipmentTracking } from "@/data/marketing/tracking";

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

export async function trackShipmentViaApi(input: {
  trackingNumber?: string;
  mobileLast4?: string;
  trackToken?: string;
}): Promise<TrackingResult> {
  const res = await fetch("/api/public/tracking", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return (await res.json()) as TrackingResult;
}
