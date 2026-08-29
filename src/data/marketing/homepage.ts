export const heroContent = {
  brand: "DPR Logistics",
  headline: "Reliable Logistics.\nDelivered With Confidence.",
  description:
    "Part load, FTL, trailers and warehousing from Kolhapur — with live GC/LR tracking across India.",
  primaryCta: "Get a Quote",
  servicesCta: "Services",
  trackLabel: "Track by GC / LR number",
  trackPlaceholder: "Enter GC/LR",
  trackButton: "Track",
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
    description: "Cost-effective shared cargo on scheduled routes with hub connectivity.",
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
    id: "containers",
    category: "Containers",
    title: "Containers",
    description: "Container movement within India for secure, high-volume cargo.",
    href: "/services/containers",
    icon: "door",
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
