export type TransportRoute = {
  slug: string;
  from: string;
  to: string;
  stateFrom: string;
  stateTo: string;
  title: string;
  description: string;
  seoDescription: string;
  distance: string;
  transitTime: string;
  services: readonly string[];
  highlights: readonly string[];
  faqs: readonly { q: string; a: string }[];
};

export const transportRoutes: TransportRoute[] = [
  {
    slug: "kolhapur-to-pune",
    from: "Kolhapur",
    to: "Pune",
    stateFrom: "Maharashtra",
    stateTo: "Maharashtra",
    title: "Kolhapur to Pune Transport",
    description:
      "Regular part load and FTL cargo transport from Kolhapur and Kagal MIDC to Pune, Chakan, Pimpri and Hadapsar industrial areas.",
    seoDescription:
      "Kolhapur to Pune transport — part load and FTL cargo services by DPR Logistics. Book pickup, track GC/LR online. Reliable Maharashtra lane from Kagal MIDC.",
    distance: "~230 km",
    transitTime: "1–2 days (part load) · Same/next day (FTL)",
    services: ["Part Load", "Full Truck Load", "Express Cargo", "Door Pickup"],
    highlights: [
      "Daily scheduled part load on Kolhapur–Pune corridor",
      "Coverage for Chakan, Pimpri, Hadapsar and Pune city",
      "Online GC/LR tracking and GST-compliant billing",
      "Door pickup from Kagal MIDC and Kolhapur industrial areas",
    ],
    faqs: [
      {
        q: "What is the transit time for Kolhapur to Pune part load?",
        a: "Part load typically reaches Pune within 1–2 days depending on booking cut-off and hub schedule. FTL direct movement can be same day or next day.",
      },
      {
        q: "Do you offer door pickup in Kolhapur?",
        a: "Yes. Share pickup address and cargo details via dprlogistics.in/quote or call +91 93562 59949.",
      },
    ],
  },
  {
    slug: "kolhapur-to-mumbai",
    from: "Kolhapur",
    to: "Mumbai",
    stateFrom: "Maharashtra",
    stateTo: "Maharashtra",
    title: "Kolhapur to Mumbai Transport",
    description:
      "Cargo transport from Kolhapur to Mumbai, Navi Mumbai, Bhiwandi and Andheri hubs — part load, FTL and trailer services on a reliable western corridor lane.",
    seoDescription:
      "Kolhapur to Mumbai transport services — part load, FTL and trailers by DPR Logistics. Cargo movement to Bhiwandi, Navi Mumbai and Mumbai hubs with online tracking.",
    distance: "~380 km",
    transitTime: "1–3 days (part load) · 1–2 days (FTL)",
    services: ["Part Load", "Full Truck Load", "Trailers", "Door-to-Door"],
    highlights: [
      "Regular lanes to Bhiwandi, Navi Mumbai and Andheri hubs",
      "Part load and dedicated FTL on the same account",
      "Suitable for textile, engineering and trading cargo",
      "POD confirmation and customer care follow-up",
    ],
    faqs: [
      {
        q: "Can I send part load from Kolhapur to Bhiwandi warehouse?",
        a: "Yes. Part load is available to Bhiwandi, Navi Mumbai and Mumbai delivery points on scheduled routes.",
      },
      {
        q: "Is FTL available for factory dispatches?",
        a: "Yes. We allocate dedicated vehicles for full truck load movement with door pickup from Kolhapur/Kagal MIDC.",
      },
    ],
  },
  {
    slug: "kolhapur-to-ahmedabad",
    from: "Kolhapur",
    to: "Ahmedabad",
    stateFrom: "Maharashtra",
    stateTo: "Gujarat",
    title: "Kolhapur to Ahmedabad Transport",
    description:
      "Maharashtra–Gujarat corridor transport from Kolhapur to Ahmedabad and Sanand industrial belt — part load, FTL and container movement.",
    seoDescription:
      "Kolhapur to Ahmedabad transport — part load and FTL cargo on Maharashtra–Gujarat corridor. DPR Logistics booking, tracking and GST billing.",
    distance: "~800 km",
    transitTime: "2–4 days (part load) · 2–3 days (FTL)",
    services: ["Part Load", "Full Truck Load", "Containers", "Warehousing"],
    highlights: [
      "Western corridor lane to Ahmedabad and Sanand belt",
      "Hub connectivity for cost-effective part load",
      "FTL for high-volume factory and trading dispatches",
      "Container movement available on request",
    ],
    faqs: [
      {
        q: "What cargo types move on Kolhapur–Ahmedabad lane?",
        a: "Textile, engineering goods, auto components, chemicals and general trading merchandise on part load and FTL.",
      },
      {
        q: "How do I get a freight quote?",
        a: "Submit pickup request at dprlogistics.in/quote with weight, dimensions and delivery address.",
      },
    ],
  },
  {
    slug: "kolhapur-to-surat",
    from: "Kolhapur",
    to: "Surat",
    stateFrom: "Maharashtra",
    stateTo: "Gujarat",
    title: "Kolhapur to Surat Transport",
    description:
      "Regular cargo transport from Kolhapur to Surat textile and industrial belt — part load and FTL with hub connectivity across the Maharashtra–Gujarat corridor.",
    seoDescription:
      "Kolhapur to Surat transport — part load and FTL for textile and industrial cargo. DPR Logistics scheduled routes to Ring Road and Pandesara belt.",
    distance: "~650 km",
    transitTime: "2–4 days (part load) · 2–3 days (FTL)",
    services: ["Part Load", "Full Truck Load", "Express Cargo"],
    highlights: [
      "Strong lane for textile and trading cargo to Surat",
      "Scheduled part load with hub connectivity",
      "Delivery to Ring Road, Pandesara and Surat city",
      "Online tracking by GC/LR number",
    ],
    faqs: [
      {
        q: "Is Surat textile cargo handled regularly?",
        a: "Yes. Kolhapur–Surat is one of our active corridors for textile rolls, garments and trading goods.",
      },
      {
        q: "Can I track my Surat-bound shipment?",
        a: "Enter your GC/LR number at dprlogistics.in/tracking for live status updates.",
      },
    ],
  },
  {
    slug: "kolhapur-to-bangalore",
    from: "Kolhapur",
    to: "Bangalore",
    stateFrom: "Maharashtra",
    stateTo: "Karnataka",
    title: "Kolhapur to Bangalore Transport",
    description:
      "Pan-India cargo transport from Kolhapur to Bangalore — part load and FTL to Whitefield, Peenya and Bangalore industrial routes.",
    seoDescription:
      "Kolhapur to Bangalore transport — part load and FTL cargo services by DPR Logistics. Reliable south India lane with online GC/LR tracking.",
    distance: "~630 km",
    transitTime: "3–5 days (part load) · 2–4 days (FTL)",
    services: ["Part Load", "Full Truck Load", "Trailers"],
    highlights: [
      "South India lane from Kolhapur hub",
      "Coverage for Whitefield and Peenya industrial areas",
      "Part load and dedicated FTL options",
      "GST billing and documented POD",
    ],
    faqs: [
      {
        q: "What is typical transit for Kolhapur to Bangalore?",
        a: "Part load usually takes 3–5 days via hub connections. FTL direct movement is typically 2–4 days.",
      },
      {
        q: "Do you handle industrial machinery to Bangalore?",
        a: "Yes. FTL and trailer options are available for machinery and project cargo on request.",
      },
    ],
  },
  {
    slug: "kolhapur-to-delhi",
    from: "Kolhapur",
    to: "Delhi NCR",
    stateFrom: "Maharashtra",
    stateTo: "Delhi",
    title: "Kolhapur to Delhi NCR Transport",
    description:
      "Long-haul cargo transport from Kolhapur to Delhi NCR — part load and FTL to Gurgaon, Faridabad and Delhi hubs with pan-India network support.",
    seoDescription:
      "Kolhapur to Delhi NCR transport — part load and FTL long-haul cargo by DPR Logistics. Book pickup to Gurgaon, Faridabad and Delhi delivery points.",
    distance: "~1,600 km",
    transitTime: "5–8 days (part load) · 4–6 days (FTL)",
    services: ["Part Load", "Full Truck Load", "Trailers", "Containers"],
    highlights: [
      "North India long-haul from Kolhapur origin hub",
      "Delivery to Gurgaon, Faridabad and Delhi NCR",
      "Part load for economy, FTL for urgent full loads",
      "Milestone tracking at every hub",
    ],
    faqs: [
      {
        q: "How long does Kolhapur to Delhi transport take?",
        a: "Part load typically takes 5–8 days. FTL direct movement is usually 4–6 days depending on route and cargo type.",
      },
      {
        q: "Is container transport available to Delhi?",
        a: "Yes. 20 ft and 40 ft domestic container movement is available on request.",
      },
    ],
  },
  {
    slug: "kolhapur-to-hyderabad",
    from: "Kolhapur",
    to: "Hyderabad",
    stateFrom: "Maharashtra",
    stateTo: "Telangana",
    title: "Kolhapur to Hyderabad Transport",
    description:
      "Cargo transport from Kolhapur to Hyderabad on pan-India lanes — part load and FTL for trading, textile and industrial shipments.",
    seoDescription:
      "Kolhapur to Hyderabad transport — part load and FTL cargo by DPR Logistics. Book pickup and track shipments online to Telangana.",
    distance: "~550 km",
    transitTime: "3–5 days (part load) · 2–4 days (FTL)",
    services: ["Part Load", "Full Truck Load", "Door Pickup"],
    highlights: [
      "Regular pan-India lane to Hyderabad",
      "Part load hub connectivity for cost savings",
      "FTL for time-sensitive full loads",
      "Customer care support throughout transit",
    ],
    faqs: [
      {
        q: "Can I book Kolhapur to Hyderabad part load online?",
        a: "Yes. Use dprlogistics.in/quote to submit pickup details. Our desk confirms booking and shares LR copy.",
      },
      {
        q: "Is COD available on this lane?",
        a: "Cheque on delivery (COD) is available on selected lanes. Contact customer care for eligibility.",
      },
    ],
  },
  {
    slug: "kolhapur-to-nagpur",
    from: "Kolhapur",
    to: "Nagpur",
    stateFrom: "Maharashtra",
    stateTo: "Maharashtra",
    title: "Kolhapur to Nagpur Transport",
    description:
      "Maharashtra internal lane from Kolhapur to Nagpur — part load and FTL for central India connectivity and onward north-bound distribution.",
    seoDescription:
      "Kolhapur to Nagpur transport — part load and FTL within Maharashtra by DPR Logistics. Central India corridor with online tracking.",
    distance: "~750 km",
    transitTime: "2–4 days (part load) · 2–3 days (FTL)",
    services: ["Part Load", "Full Truck Load", "Express Cargo"],
    highlights: [
      "Central Maharashtra corridor connectivity",
      "Gateway for onward north and east distribution",
      "Scheduled part load and dedicated FTL",
      "Competitive rates for regular shippers",
    ],
    faqs: [
      {
        q: "Is Nagpur a hub for further north-bound cargo?",
        a: "Yes. Many shippers use Kolhapur–Nagpur as a leg for onward distribution to central and north India.",
      },
      {
        q: "What documents are needed for booking?",
        a: "Invoice, packing list and GST details. Our booking desk guides you through LR documentation at pickup.",
      },
    ],
  },
  {
    slug: "pune-to-kolhapur",
    from: "Pune",
    to: "Kolhapur",
    stateFrom: "Maharashtra",
    stateTo: "Maharashtra",
    title: "Pune to Kolhapur Transport",
    description:
      "Reverse lane cargo transport from Pune to Kolhapur and Kagal MIDC — part load and FTL for inbound factory and trading shipments.",
    seoDescription:
      "Pune to Kolhapur transport — part load and FTL cargo by DPR Logistics. Reliable reverse lane on the Pune–Kolhapur corridor.",
    distance: "~230 km",
    transitTime: "1–2 days (part load) · Same/next day (FTL)",
    services: ["Part Load", "Full Truck Load", "Door Delivery"],
    highlights: [
      "Reverse lane on active Pune–Kolhapur corridor",
      "Pickup from Chakan, Pimpri and Pune city",
      "Delivery to Kagal MIDC and Kolhapur",
      "Same account for both direction bookings",
    ],
    faqs: [
      {
        q: "Do you pick up from Pune industrial areas?",
        a: "Yes. Door pickup is available from Chakan, Pimpri, Hadapsar and Pune city on request.",
      },
      {
        q: "Can I use the same account for Pune–Kolhapur and Kolhapur–Pune?",
        a: "Yes. Regular shippers manage both directions on one account with consolidated billing.",
      },
    ],
  },
  {
    slug: "mumbai-to-kolhapur",
    from: "Mumbai",
    to: "Kolhapur",
    stateFrom: "Maharashtra",
    stateTo: "Maharashtra",
    title: "Mumbai to Kolhapur Transport",
    description:
      "Inbound cargo from Mumbai and Bhiwandi to Kolhapur — part load and FTL for raw materials, trading goods and factory supplies.",
    seoDescription:
      "Mumbai to Kolhapur transport — part load and FTL from Bhiwandi, Navi Mumbai and Mumbai to Kagal MIDC. DPR Logistics reverse lane booking.",
    distance: "~380 km",
    transitTime: "1–3 days (part load) · 1–2 days (FTL)",
    services: ["Part Load", "Full Truck Load", "Door Pickup"],
    highlights: [
      "Pickup from Bhiwandi, Navi Mumbai and Mumbai hubs",
      "Delivery to Kolhapur and Kagal MIDC",
      "Part load for smaller consignments",
      "FTL for bulk inbound factory supplies",
    ],
    faqs: [
      {
        q: "Do you collect from Bhiwandi warehouse?",
        a: "Yes. Pickup from Bhiwandi, Navi Mumbai and Mumbai is available on scheduled routes.",
      },
      {
        q: "How do I track Mumbai to Kolhapur shipments?",
        a: "Use dprlogistics.in/tracking with your GC/LR number for status updates.",
      },
    ],
  },
];

export function getTransportRoute(slug: string) {
  return transportRoutes.find((r) => r.slug === slug);
}

export function getPopularRoutes(limit = 6) {
  return transportRoutes.slice(0, limit);
}
