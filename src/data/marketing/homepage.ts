export const heroContent = {
  badge: "Trusted Logistics Partner",
  headline: "Moving India Forward,\nOne Shipment at a Time.",
  description:
    "Reliable transportation and logistics solutions built for businesses that never stop moving.",
  trustPoints: ["Pan-India Coverage", "Real-time Tracking", "Secure Handling"],
} as const;

export type HomeService = {
  id: string;
  category: string;
  title: string;
  description: string;
  href: string;
  icon: "part-load" | "ftl" | "trailer" | "warehouse" | "express" | "door";
};

export const homeServices: HomeService[] = [
  {
    id: "part-load",
    category: "Shared Cargo",
    title: "Part Load",
    description: "Cost-effective shared cargo movement on scheduled routes with hub connectivity.",
    href: "/services/part-load",
    icon: "part-load",
  },
  {
    id: "ftl",
    category: "Dedicated Fleet",
    title: "Full Truck Load",
    description: "Dedicated vehicles for high-volume, time-sensitive and project cargo.",
    href: "/services/ftl",
    icon: "ftl",
  },
  {
    id: "trailers",
    category: "Heavy Haul",
    title: "Trailers",
    description: "Safe trailer movement for industrial, steel and long-length consignments.",
    href: "/services/trailers",
    icon: "trailer",
  },
  {
    id: "warehousing",
    category: "Storage",
    title: "Warehousing",
    description: "Short-term and contract storage with loading, unloading and onward dispatch.",
    href: "/services/warehousing",
    icon: "warehouse",
  },
  {
    id: "express",
    category: "Priority",
    title: "Express Cargo",
    description: "Accelerated transit for urgent consignments on priority lanes.",
    href: "/services/excellence",
    icon: "express",
  },
  {
    id: "door-to-door",
    category: "End-to-End",
    title: "Door-to-Door Delivery",
    description: "Pickup to final delivery with milestone updates at every stage.",
    href: "/services/value-added",
    icon: "door",
  },
];

export const whyDprSubtitle = "Built for businesses that cannot afford delays.";

export const whyDprFeatures = [
  {
    num: "01",
    title: "Pan-India Network",
    description: "Strategic coverage across major industrial corridors and distribution hubs.",
  },
  {
    num: "02",
    title: "Real-Time Visibility",
    description: "Track consignments by GC / LR number with clear status milestones.",
  },
  {
    num: "03",
    title: "Secure Handling",
    description: "Trained teams, documented POD and careful cargo handling at every touchpoint.",
  },
  {
    num: "04",
    title: "Reliable Delivery",
    description: "Consistent on-time performance backed by route planning and fleet coordination.",
  },
  {
    num: "05",
    title: "Technology Driven",
    description: "Digital LR booking, billing and tracking on a unified logistics platform.",
  },
  {
    num: "06",
    title: "Dedicated Support",
    description: "Responsive booking desk and customer care for shippers and consignees.",
  },
] as const;

export const howItWorksSteps = [
  { num: "01", title: "Book Shipment", description: "Share cargo details and lane requirements online or by phone." },
  { num: "02", title: "Pickup", description: "Vehicle allocation and door pickup as per your schedule." },
  { num: "03", title: "Track in Transit", description: "Monitor milestones from hub to hub in real time." },
  { num: "04", title: "Delivered", description: "POD confirmation and billing as per your account terms." },
] as const;

/** Clearly marked demo preview — not live tracking data */
export const heroDemoShipments = [
  {
    id: "demo-1",
    status: "In Transit",
    route: "Delhi → Jaipur",
    eta: "18 Aug",
  },
  {
    id: "demo-2",
    status: "Out for Delivery",
    route: "Pune → Kolhapur",
    eta: "Today",
  },
] as const;
