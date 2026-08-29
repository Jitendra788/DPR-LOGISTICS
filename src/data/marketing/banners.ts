export type BannerBranch = {
  code: string;
  name: string;
  phone: string;
  email?: string;
};

export type HomeBanner = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  gradient: string;
  accent: string;
  branches?: BannerBranch[];
  cta?: { label: string; href: string };
  image?: string;
};

export const homeBanners: HomeBanner[] = [
  {
    id: "network",
    eyebrow: "Network Expansion",
    title: "Pan-India cargo network from Kolhapur",
    subtitle:
      "Regular part load & FTL lanes across Maharashtra, Gujarat, Delhi NCR, Bangalore, Hyderabad and major industrial metros.",
    gradient: "linear-gradient(125deg, #ff6b35 0%, #f7931e 22%, #ffd23f 45%, #7b2cbf 78%, #e040fb 100%)",
    accent: "#7b2cbf",
    branches: [
      { code: "KLP", name: "Kolhapur HQ", phone: "+91 93562 59949", email: "dprkolhapur@gmail.com" },
      { code: "PUN", name: "Pune", phone: "+91 93562 59949" },
      { code: "MUM", name: "Mumbai", phone: "+91 93562 59949" },
      { code: "AMD", name: "Ahmedabad", phone: "+91 93562 59949" },
      { code: "SUR", name: "Surat", phone: "+91 93562 59949" },
    ],
    cta: { label: "Explore Network", href: "/network" },
  },
  {
    id: "tracking",
    eyebrow: "Track Online",
    title: "Track every shipment by GC / LR number",
    subtitle: "Real-time booking status, hub milestones and delivery timeline — only on dprlogistics.in",
    gradient: "linear-gradient(125deg, #0ea5e9 0%, #2563eb 35%, #7c3aed 70%, #db2777 100%)",
    accent: "#2563eb",
    cta: { label: "GC Tracking", href: "/tracking" },
  },
  {
    id: "services",
    eyebrow: "Our Services",
    title: "Part Load · FTL · Trailers · Warehousing",
    subtitle: "Dedicated vehicles or cost-effective shared cargo — book pickup online with GST-compliant billing.",
    gradient: "linear-gradient(125deg, #059669 0%, #0d9488 30%, #14b8a6 55%, #f59e0b 85%, #ef4444 100%)",
    accent: "#059669",
    cta: { label: "Pickup Request", href: "/quote" },
  },
  {
    id: "routes",
    eyebrow: "Popular Lanes",
    title: "Kolhapur → Pune · Mumbai · Gujarat",
    subtitle: "Daily scheduled routes for manufacturers, traders and textile exporters across western India.",
    gradient: "linear-gradient(125deg, #dc2626 0%, #ea580c 25%, #ca8a04 50%, #16a34a 75%, #0891b2 100%)",
    accent: "#ea580c",
    cta: { label: "View Routes", href: "/routes" },
  },
];
