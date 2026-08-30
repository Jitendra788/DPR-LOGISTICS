export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  seoDescription: string;
  category: string;
  cover: string;
  publishedAt: string;
  readTime: string;
  author: string;
  content: readonly string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "how-to-track-gc-lr-online",
    title: "How to Track Your GC / LR Shipment Online with DPR Logistics",
    excerpt:
      "Step-by-step guide to track your consignment using GC, LR or docket number on dprlogistics.in — view status, hub milestones and expected delivery.",
    seoDescription:
      "Learn how to track DPR Logistics shipments online. Enter your GC, LR or docket number at dprlogistics.in/tracking for real-time cargo status.",
    category: "Tracking",
    cover: "/marketing/blog/track-gc-lr.jpg",
    publishedAt: "2026-08-15",
    readTime: "4 min",
    author: "DPR Logistics Team",
    content: [
      "Every DPR Logistics consignment is assigned a GC (Goods Consignment) or LR (Lorry Receipt) number at the time of booking. This unique number is your key to tracking the shipment from pickup to final delivery.",
      "To track online, visit dprlogistics.in/tracking and enter your GC, LR or docket number in the search field. The system displays booking details, current hub location, transit milestones and expected delivery date.",
      "Tracking is available 24/7 for all active consignments. If your shipment has just been booked, status may show as 'Booked' or 'At Origin Hub' until the vehicle is dispatched.",
      "For consignees who do not have the LR number, contact the shipper or our customer care desk at +91 93562 59949 with the invoice reference. Our team can share the tracking number and current status.",
      "Pro tip: Save your LR copy digitally. It contains the GC number, route, freight charges and delivery terms — everything needed for tracking and POD follow-up.",
    ],
  },
  {
    slug: "part-load-vs-ftl-which-to-choose",
    title: "Part Load vs Full Truck Load (FTL): Which Transport Option Is Right for You?",
    excerpt:
      "Compare part load and FTL cargo transport — cost, transit time, cargo size and when to choose each option for Maharashtra, Gujarat and pan-India shipments.",
    seoDescription:
      "Part load vs FTL transport guide by DPR Logistics. Compare shared cargo and dedicated truck options for cost-effective and time-sensitive shipments across India.",
    category: "Services",
    cover: "/marketing/blog/part-load-ftl.jpg",
    publishedAt: "2026-08-10",
    readTime: "6 min",
    author: "DPR Logistics Team",
    content: [
      "Choosing between part load and full truck load (FTL) depends on cargo volume, urgency, budget and handling requirements. Both options are available on the same DPR Logistics account.",
      "Part load is ideal when your shipment does not fill an entire truck. Cargo moves on scheduled routes with hub connectivity — a cost-effective option for regular Kolhapur–Pune, Kolhapur–Mumbai and Gujarat lanes. Transit follows the route schedule with consolidated loading at origin hubs.",
      "Full truck load (FTL) gives you a dedicated vehicle for the entire trip. Choose FTL when you have high-volume cargo, time-sensitive delivery, fragile goods requiring exclusive handling, or ODC/project cargo that cannot share space.",
      "For most SME and trading shipments under 5 tonnes on regular lanes, part load offers the best balance of cost and reliability. For factory dispatches, textile rolls, machinery or full-container loads, FTL is typically more efficient.",
      "Not sure which to pick? Submit a pickup request at dprlogistics.in/quote with cargo weight, dimensions and lane. Our booking desk recommends the best option and confirms rates before vehicle allocation.",
    ],
  },
  {
    slug: "logistics-partner-kolhapur-manufacturers",
    title: "Choosing a Logistics Partner in Kolhapur: What Manufacturers Should Look For",
    excerpt:
      "Key criteria for Kolhapur and MIDC manufacturers when selecting a transport partner — on-time delivery, GST billing, POD, route coverage and tracking.",
    seoDescription:
      "Guide for Kolhapur manufacturers on choosing a reliable logistics partner. DPR Logistics — part load, FTL, trailers, GST billing and pan-India network from Kagal MIDC.",
    category: "Industry",
    cover: "/marketing/blog/kolhapur-manufacturers.jpg",
    publishedAt: "2026-08-05",
    readTime: "5 min",
    author: "DPR Logistics Team",
    content: [
      "Kolhapur and Kagal MIDC host a strong base of foundries, auto-component makers, textile units and trading firms — all dependent on dependable outbound and inbound logistics.",
      "When evaluating a transport partner, start with route coverage. Your logistics provider should have regular lanes to Pune, Mumbai, Ahmedabad, Surat, Bangalore and North India — not ad-hoc arrangements that delay dispatch.",
      "On-time delivery track record matters more than the lowest freight quote. Ask about POD (Proof of Delivery) turnaround, billing cycle and whether LR copies are shared digitally at booking.",
      "GST-compliant billing, transparent freight calculation and a single account for both part load and FTL simplify finance and dispatch coordination. Technology — online tracking, pickup requests and bill-wise outstanding — reduces follow-up calls.",
      "DPR Logistics operates from Kagal MIDC with 10+ years of fleet and contract transport experience. We serve manufacturers and traders on Kolhapur–Pune, Kolhapur–Gujarat and pan-India corridors with dedicated customer care support.",
    ],
  },
  {
    slug: "warehousing-tips-for-distributors",
    title: "Warehousing & Distribution Tips for Trading Houses and Distributors",
    excerpt:
      "How short-term warehousing, cross-dock and scheduled dispatch help distributors manage inventory and reduce last-mile delivery delays.",
    seoDescription:
      "Warehousing and distribution tips for Indian trading houses. Short-term storage, cross-dock and onward part load or FTL dispatch from DPR Logistics corridor hubs.",
    category: "Warehousing",
    cover: "/marketing/blog/warehousing-distribution.jpg",
    publishedAt: "2026-07-28",
    readTime: "5 min",
    author: "DPR Logistics Team",
    content: [
      "Trading houses and distributors often face a gap between factory dispatch and customer delivery schedules. Short-term warehousing at corridor hubs bridges this gap without long-term lease commitments.",
      "Cross-dock operations — receiving inbound cargo, sorting and reloading for outbound lanes — reduce storage days and speed up distribution to retail or dealer networks.",
      "Combine warehousing with scheduled part load or FTL dispatch on the same account. This gives you one partner for storage, loading/unloading and transport with unified billing and tracking.",
      "Plan weekly dispatch calendars aligned with route schedules. Regular Kolhapur–Pune and Maharashtra–Gujarat lanes operate on fixed frequencies — booking ahead secures vehicle allocation during peak seasons.",
      "DPR Logistics offers short-term and contract warehousing with onward dispatch across western and southern corridors. Contact our team for storage requirements and lane planning.",
    ],
  },
  {
    slug: "maharashtra-gujarat-transport-corridor-guide",
    title: "Maharashtra–Gujarat Transport Corridor: Routes, Cargo Types & Booking Tips",
    excerpt:
      "Overview of the busy Maharashtra–Gujarat freight corridor — key lanes, common cargo types, part load schedules and how to book transport from Kolhapur and Pune.",
    seoDescription:
      "Maharashtra to Gujarat transport guide — Kolhapur, Pune, Mumbai to Ahmedabad and Surat. Part load, FTL and trailer services by DPR Logistics on the western industrial corridor.",
    category: "Routes",
    cover: "/marketing/blog/maharashtra-gujarat-corridor.jpg",
    publishedAt: "2026-07-20",
    readTime: "6 min",
    author: "DPR Logistics Team",
    content: [
      "The Maharashtra–Gujarat corridor is one of India's busiest freight routes, connecting Kolhapur, Pune and Mumbai with Ahmedabad, Surat and the wider Gujarat industrial belt.",
      "Common cargo on this corridor includes textile rolls and garments, engineering goods, auto components, chemicals, agro products and general trading merchandise. Both part load and FTL options are in high demand.",
      "Part load services run on scheduled routes with hub connectivity — suitable for consignments that do not require a dedicated vehicle. FTL and trailers handle full factory dispatches, steel, machinery and project cargo.",
      "Transit times vary by origin, destination and service type. Kolhapur to Surat part load typically moves via hub connections over 2–4 days depending on booking cut-off and route schedule. FTL direct movement is faster for full loads.",
      "Book early during festival and textile seasons when Gujarat-bound volumes peak. Use dprlogistics.in/quote for pickup requests or call +91 93562 59949 for contract lane rates on regular Maharashtra–Gujarat movement.",
    ],
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((p) => p.slug === slug);
}

export function getLatestPosts(limit = 3) {
  return [...blogPosts]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, limit);
}
