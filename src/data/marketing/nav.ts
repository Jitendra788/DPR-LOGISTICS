export type NavChild = { label: string; href: string };
export type NavItem = {
  label: string;
  href?: string;
  highlight?: boolean;
  children?: NavChild[];
};

export const marketingNav: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "About Us",
    href: "/about",
    children: [
      { label: "Corporate Profile", href: "/about" },
      { label: "Mission, Vision & Value", href: "/about/mission" },
      { label: "Management Team", href: "/about/management" },
      { label: "Milestone", href: "/about/milestone" },
      { label: "History", href: "/about/history" },
      { label: "Our Clients", href: "/about/clients" },
    ],
  },
  {
    label: "Services",
    href: "/services",
    children: [
      { label: "Part Load", href: "/services/part-load" },
      { label: "Full Truck Load (FTL)", href: "/services/ftl" },
      { label: "Trailers within India", href: "/services/trailers" },
      { label: "Containers Within India", href: "/services/containers" },
      { label: "Warehousing & Logistics", href: "/services/warehousing" },
      { label: "Value Added Service", href: "/services/value-added" },
      { label: "Customized Service", href: "/services/customized" },
      { label: "Excellence in Service", href: "/services/excellence" },
    ],
  },
  {
    label: "Careers",
    href: "/careers",
    children: [
      { label: "Work Culture", href: "/careers" },
      { label: "Current Openings", href: "/careers/openings" },
      { label: "Business Associate", href: "/careers/associate" },
      { label: "Vendor Registration", href: "/careers/vendor" },
    ],
  },
  {
    label: "Media Center",
    href: "/media",
    children: [
      { label: "Awards & Recognitions", href: "/media/awards" },
      { label: "Gallery", href: "/media" },
    ],
  },
  {
    label: "Contact Us",
    href: "/contact",
    children: [
      { label: "Contact Details", href: "/contact" },
      { label: "Pickup Request", href: "/quote" },
      { label: "Customer Care", href: "/contact/care" },
      { label: "FAQs", href: "/contact/faq" },
      { label: "Service Complaint", href: "/contact/complaint" },
    ],
  },
  { label: "GC Tracking", href: "/tracking", highlight: true },
];

export const MARKETING_ROUTES = [
  "/",
  "/about",
  "/services",
  "/tracking",
  "/network",
  "/business-solutions",
  "/quote",
  "/contact",
  "/careers",
  "/media",
  "/privacy",
  "/terms",
] as const;

export function isMarketingRoute(pathname: string) {
  if (pathname === "/") return true;
  return [
    "/about",
    "/services",
    "/tracking",
    "/network",
    "/business-solutions",
    "/quote",
    "/contact",
    "/careers",
    "/media",
    "/privacy",
    "/terms",
  ].some((route) => pathname === route || pathname.startsWith(`${route}/`));
}
