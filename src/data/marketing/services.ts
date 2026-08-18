export type ServiceIcon = "part-load" | "ftl" | "trailer" | "container" | "warehouse" | "care";

export type ServiceItem = {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  body: string;
  href: string;
  icon: ServiceIcon;
  featured?: boolean;
};

export const services: ServiceItem[] = [
  {
    id: "part-load",
    title: "Part Load",
    shortTitle: "Part Load",
    description: "Prompt customer support for booking all types of goods as shared / part-load cargo.",
    body: "Book smaller consignments on scheduled routes with hub connectivity. Ideal when you do not need a full vehicle but still want reliable transit and tracking.",
    href: "/services/part-load",
    icon: "part-load",
    featured: true,
  },
  {
    id: "ftl",
    title: "Full Truck Load (FTL)",
    shortTitle: "Full Truck Load",
    description: "Dedicated trucks for FTL, ODC and project cargo with online pickup requests.",
    body: "Get a dedicated vehicle for high-volume or time-sensitive cargo. We arrange suitable body types and coordinate door pickup on request.",
    href: "/services/ftl",
    icon: "ftl",
    featured: true,
  },
  {
    id: "trailers",
    title: "Trailers within India",
    shortTitle: "Trailers",
    description: "Safe, in-time trailer movement for heavy and industrial loads across India.",
    body: "Trailer capacity for machinery, steel, project cargo and long-length consignments with experienced drivers and route planning.",
    href: "/services/trailers",
    icon: "trailer",
    featured: true,
  },
  {
    id: "containers",
    title: "Containers Within India",
    shortTitle: "Containers",
    description: "20 ft and 40 ft container movement and project-load booking on domestic lanes.",
    body: "Move containerised cargo between factories, ICDs, ports and warehouses with sealed handling and milestone updates.",
    href: "/services/containers",
    icon: "container",
    featured: true,
  },
  {
    id: "warehousing",
    title: "Warehousing & Logistics",
    shortTitle: "Warehousing",
    description: "Storage and distribution support at key western and southern corridors.",
    body: "Short-term and contract warehousing with inventory handling, loading/unloading and onward transport from our network points.",
    href: "/services/warehousing",
    icon: "warehouse",
    featured: true,
  },
  {
    id: "customer-care",
    title: "Customer Care",
    shortTitle: "Customer Care",
    description: "Prompt booking help, tracking support and POD follow-up for every consignment.",
    body: "Call or write to our customer care desk for LR status, pickup scheduling, complaints and account assistance.",
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
