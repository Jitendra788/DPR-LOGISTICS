export type NavChild = { label: string; href: string };
export type NavItem = {
  label: string;
  href?: string;
  highlight?: boolean;
  children?: NavChild[];
};

/** Primary header nav — matches site IA wireframe */
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
  { label: "Network", href: "/network" },
  { label: "Routes", href: "/routes" },
  {
    label: "Media",
    href: "/media",
    children: [
      { label: "Awards & Recognitions", href: "/media/awards" },
      { label: "Gallery", href: "/media" },
      { label: "Blog", href: "/blog" },
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
];

/** Full mobile menu (includes tracking + contact) */
export const marketingMobileNav: NavItem[] = [
  ...marketingNav,
  { label: "Track Shipment", href: "/tracking", highlight: true },
  { label: "Get Quote", href: "/quote" },
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
];

export const MARKETING_ROUTES = [
  "/",
  "/about",
  "/services",
  "/tracking",
  "/network",
  "/routes",
  "/business-solutions",
  "/quote",
  "/contact",
  "/careers",
  "/media",
  "/blog",
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
    "/routes",
    "/business-solutions",
    "/quote",
    "/contact",
    "/careers",
    "/media",
    "/blog",
    "/privacy",
    "/terms",
  ].some((route) => pathname === route || pathname.startsWith(`${route}/`));
}
