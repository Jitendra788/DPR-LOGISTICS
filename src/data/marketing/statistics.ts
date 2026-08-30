export type StatItem = {
  id: string;
  /** Numeric value for animated counter */
  value: number;
  /** Suffix appended after formatted number, e.g. "+" */
  suffix: string;
  label: string;
  /** Optional display override for large numbers */
  display?: string;
};

export const statistics: StatItem[] = [
  { id: "experience", value: 10, suffix: "+", label: "Years Experience" },
  { id: "branches", value: 50, suffix: "+", label: "Branches" },
  { id: "vehicles", value: 100, suffix: "+", label: "Vehicles" },
  { id: "shipments", value: 500, suffix: "+", label: "Daily Shipments" },
  { id: "customers", value: 10000, suffix: "+", label: "Customers", display: "10K+" },
];

export const faqs = [
  {
    q: "How do I track my DPR Logistics consignment?",
    a: "Go to dprlogistics.in/tracking and enter the exact GC / LR / docket number printed on your LR copy (example: LR-22463). You will first see limited status — origin, destination and delivery stage. Extra digits or a guessed number will not match.",
  },
  {
    q: "Why do I need mobile last 4 digits to see full tracking details?",
    a: "GC / LR numbers run in sequence, so anyone could try nearby numbers. Full details (consignee name, vehicle number, live GPS) unlock only after you enter the last 4 digits of the consignee or consignor mobile saved in Party Master. This protects customer privacy.",
  },
  {
    q: "What is a secret track link? How do I get it on WhatsApp or SMS?",
    a: "Every booking gets a unique track link that cannot be guessed. After LR save, booking staff can share it via WhatsApp or SMS from LR Booking or Trip Desk. Opening that link shows full shipment status without typing the LR number.",
  },
  {
    q: "My tracking number is not found. What should I check?",
    a: "Type the LR exactly as on the print copy — including the LR- prefix. Do not add mobile digits into the same box. If the consignment was just booked, wait a few minutes and try again, or call customer care at +91 93562 59949 with the LR number.",
  },
  {
    q: "How do I request a pickup for part load or FTL?",
    a: "Open the Pickup Request form on dprlogistics.in/quote. Share origin, destination, cargo weight, dimensions and a contact number. Our booking desk confirms vehicle allocation and pickup time.",
  },
  {
    q: "Which routes does DPR Logistics cover?",
    a: "We operate from Kagal MIDC, Kolhapur with regular lanes across Maharashtra, Gujarat, Delhi NCR, Bangalore, Hyderabad, Chennai, Kolkata and other major industrial metros. See the Network page for branches.",
  },
  {
    q: "Do you offer part load and full truck load (FTL) transport?",
    a: "Yes. Part load is cost-effective shared cargo on scheduled routes. FTL, trailers and containers are for dedicated high-volume, ODC and project cargo.",
  },
  {
    q: "Does DPR Logistics provide warehousing?",
    a: "Yes. Short-term and contract warehousing with loading, unloading, cross-dock and onward part load or FTL dispatch from key corridor hubs.",
  },
  {
    q: "Is billing GST compliant? What is your GSTIN?",
    a: "Yes. We issue GST invoices with LR copies. GSTIN: 27BNLPK2073C1Z5. For bill or outstanding queries, contact accounts or customer care with your party name and LR / bill number.",
  },
  {
    q: "How can I get POD (Proof of Delivery)?",
    a: "POD status is updated after delivery. Share your LR number with customer care at +91 93562 59949 or +91 93716 62142, or email dprlogistics2142@gmail.com for POD follow-up.",
  },
  {
    q: "How can I raise a service complaint?",
    a: "Use the Service Complaint form under Contact Us, or call +91 93562 59949 with your LR number, route and issue. We log and follow up from the booking desk.",
  },
  {
    q: "Where is DPR Logistics located and what are working hours?",
    a: "Head office: Shree Mahalaxmi Petrol Pump, 5 Star MIDC Road, Kagal, Dist. Kolhapur 416216. Working hours: Monday–Saturday, 9:00 AM – 7:00 PM. Email: dprlogistics2142@gmail.com.",
  },
];
