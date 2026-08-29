export type ServiceIcon = "part-load" | "ftl" | "trailer" | "container" | "warehouse" | "care";

export type ServiceItem = {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  body: string;
  seoDescription: string;
  href: string;
  icon: ServiceIcon;
  featured?: boolean;
};

export const services: ServiceItem[] = [
  {
    id: "part-load",
    title: "Part Load",
    shortTitle: "Part Load",
    description: "Cost-effective shared cargo transport on scheduled pan-India routes with hub connectivity.",
    body: "Book smaller consignments on scheduled routes with hub connectivity across Maharashtra, Gujarat and major metros. Ideal when you do not need a full vehicle but still want reliable transit, GST billing and online GC/LR tracking.",
    seoDescription:
      "Part load cargo transport across India from DPR Logistics. Shared cargo on scheduled routes from Kolhapur to Maharashtra, Gujarat, Delhi, Bangalore and pan-India hubs.",
    href: "/services/part-load",
    icon: "part-load",
    featured: true,
  },
  {
    id: "ftl",
    title: "Full Truck Load (FTL)",
    shortTitle: "Full Truck Load",
    description: "Dedicated trucks for FTL, ODC and project cargo with door pickup and online booking.",
    body: "Get a dedicated vehicle for high-volume or time-sensitive cargo. We arrange open body, closed body and suitable truck types for industrial, textile and trading shipments — with door pickup and milestone tracking.",
    seoDescription:
      "Full truck load (FTL) transport services in India. Dedicated vehicles for high-volume, ODC and project cargo with door pickup from DPR Logistics Kolhapur.",
    href: "/services/ftl",
    icon: "ftl",
    featured: true,
  },
  {
    id: "trailers",
    title: "Trailers within India",
    shortTitle: "Trailers",
    description: "Safe trailer transport for heavy, steel and industrial cargo across India.",
    body: "Trailer capacity for machinery, steel coils, project cargo and long-length consignments. Experienced drivers, route planning and compliance support for heavy haul movement on domestic lanes.",
    seoDescription:
      "Trailer transport services across India for heavy industrial, steel and project cargo. Safe in-time trailer movement from DPR Logistics.",
    href: "/services/trailers",
    icon: "trailer",
    featured: true,
  },
  {
    id: "containers",
    title: "Containers Within India",
    shortTitle: "Containers",
    description: "20 ft and 40 ft container movement on domestic lanes with sealed handling.",
    body: "Move containerised cargo between factories, ICDs, ports and warehouses with sealed handling, documentation support and milestone updates at every hub.",
    seoDescription:
      "Domestic container transport in India — 20 ft and 40 ft container movement between factories, ICDs and warehouses with DPR Logistics.",
    href: "/services/containers",
    icon: "container",
    featured: true,
  },
  {
    id: "warehousing",
    title: "Warehousing & Logistics",
    shortTitle: "Warehousing",
    description: "Short-term and contract warehousing with loading, dispatch and distribution support.",
    body: "Short-term and contract warehousing at key western and southern corridor points. Inventory handling, loading/unloading, cross-dock and onward part load or FTL dispatch from our network.",
    seoDescription:
      "Warehousing and logistics services in Maharashtra and pan-India. Short-term storage, loading/unloading and onward cargo dispatch from DPR Logistics.",
    href: "/services/warehousing",
    icon: "warehouse",
    featured: true,
  },
  {
    id: "customer-care",
    title: "Customer Care",
    shortTitle: "Customer Care",
    description: "Booking support, GC/LR tracking help and POD follow-up for every consignment.",
    body: "Reach our customer care desk for LR status, pickup scheduling, billing queries, service complaints and account assistance. Available Mon–Sat, 9 AM – 7 PM.",
    seoDescription:
      "DPR Logistics customer care — booking support, shipment tracking, POD follow-up and service assistance. Call +91 93562 59949.",
    href: "/contact/care",
    icon: "care",
    featured: true,
  },
];

export const extraServices = [
  {
    id: "value-added",
    title: "Value Added Services",
    href: "/services/value-added",
    points: [
      "Centralized billing facility",
      "Single window for transport and logistics needs",
      "Cheque on delivery (COD) on selected lanes",
      "POD upload and bill-wise outstanding reports",
    ],
  },
  {
    id: "customized",
    title: "Customized Services",
    href: "/services/customized",
    points: [
      "Booking and delivery alerts by SMS / email",
      "Consignment tracking by GC / LR number",
      "Dedicated account coordination for regular shippers",
      "Contract rates for FTL and part-load programmes",
    ],
  },
  {
    id: "excellence",
    title: "Excellence in Service",
    href: "/services/excellence",
    points: [
      "Focus on on-time delivery across contracted routes",
      "Priority handling on selected lanes",
      "Covered godown / secure parking at operating points",
      "Documented POD and GST-compliant billing",
    ],
  },
] as const;

export const featuredServices = services.filter((s) => s.featured);
export const transportServices = services.filter((s) => s.id !== "customer-care");

export function getService(id: string) {
  return services.find((s) => s.id === id) ?? extraServices.find((s) => s.id === id);
}
