export type TrackingStage =
  | "booked"
  | "picked_up"
  | "in_transit"
  | "arrived_at_hub"
  | "out_for_delivery"
  | "delivered";

export type TrackingEvent = {
  stage: TrackingStage;
  label: string;
  timestamp: string | null;
  location: string;
  status: "completed" | "current" | "pending";
};

export type ShipmentTracking = {
  trackingNumber: string;
  bookingDate: string;
  origin: string;
  destination: string;
  consignee: string;
  currentLocation: string;
  vehicleNumber: string;
  expectedDelivery: string;
  events: TrackingEvent[];
};

const STAGE_LABELS: Record<TrackingStage, string> = {
  booked: "Booked",
  picked_up: "Picked Up",
  in_transit: "In Transit",
  arrived_at_hub: "Arrived at Hub",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
};

/** Mock tracking records — replace via trackingService when backend is ready. */
export const mockTrackingData: Record<string, ShipmentTracking> = {
  "SL-2026-00142": {
    trackingNumber: "SL-2026-00142",
    bookingDate: "2026-08-15",
    origin: "Mumbai, Maharashtra",
    destination: "Bangalore, Karnataka",
    consignee: "Precision Components Pvt Ltd",
    currentLocation: "Pune Hub, Maharashtra",
    vehicleNumber: "MH-04-AB-7821",
    expectedDelivery: "2026-08-19",
    events: buildEvents("in_transit", "Pune Hub, Maharashtra"),
  },
  "SL-2026-00098": {
    trackingNumber: "SL-2026-00098",
    bookingDate: "2026-08-14",
    origin: "Ahmedabad, Gujarat",
    destination: "Delhi NCR",
    consignee: "Northline Retailers",
    currentLocation: "Out for delivery — Gurgaon",
    vehicleNumber: "GJ-01-CD-4410",
    expectedDelivery: "2026-08-18",
    events: buildEvents("out_for_delivery", "Gurgaon, Haryana"),
  },
  "SL-2026-00201": {
    trackingNumber: "SL-2026-00201",
    bookingDate: "2026-08-10",
    origin: "Surat, Gujarat",
    destination: "Chennai, Tamil Nadu",
    consignee: "Southern Textiles Co.",
    currentLocation: "Delivered — Chennai",
    vehicleNumber: "GJ-05-EF-9923",
    expectedDelivery: "2026-08-16",
    events: buildEvents("delivered", "Chennai, Tamil Nadu"),
  },
};

function buildEvents(current: TrackingStage, location: string): TrackingEvent[] {
  const order: TrackingStage[] = [
    "booked",
    "picked_up",
    "in_transit",
    "arrived_at_hub",
    "out_for_delivery",
    "delivered",
  ];
  const currentIdx = order.indexOf(current);
  const timestamps = [
    "2026-08-15T09:30:00",
    "2026-08-15T14:00:00",
    "2026-08-16T08:15:00",
    "2026-08-17T11:45:00",
    "2026-08-18T07:20:00",
    "2026-08-18T16:10:00",
  ];

  return order.map((stage, idx) => ({
    stage,
    label: STAGE_LABELS[stage],
    timestamp: idx <= currentIdx ? timestamps[idx] : null,
    location: idx === currentIdx ? location : idx < currentIdx ? "Completed" : "Pending",
    status: idx < currentIdx ? "completed" : idx === currentIdx ? "current" : "pending",
  }));
}

export function findMockTracking(number: string): ShipmentTracking | null {
  const key = number.trim().toUpperCase();
  return mockTrackingData[key] ?? mockTrackingData[number.trim()] ?? null;
}
