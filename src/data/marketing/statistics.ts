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
    a: "Visit dprlogistics.in/tracking and enter your GC, LR or docket number. You will see booking details, current status and expected delivery timeline.",
  },
  {
    q: "How do I request a pickup for part load or FTL?",
    a: "Open the Pickup Request form on dprlogistics.in/quote. Share origin, destination, cargo weight, dimensions and contact number. Our booking desk confirms vehicle allocation and pickup time.",
  },
  {
    q: "Which routes does DPR Logistics cover?",
    a: "We operate from Kolhapur with regular lanes across Maharashtra, Gujarat, Delhi NCR, Bangalore, Hyderabad, Chennai, Kolkata and other major industrial metros. Visit the Network page for branch details.",
  },
  {
    q: "Do you offer part load and full truck load transport?",
    a: "Yes. Part load for cost-effective shared cargo on scheduled routes. FTL, trailers and containers for dedicated high-volume, ODC and project cargo movement.",
  },
  {
    q: "Does DPR Logistics provide warehousing?",
    a: "Yes. We offer short-term and contract warehousing with loading, unloading, cross-dock and onward dispatch from key corridor points.",
  },
  {
    q: "How can I raise a service complaint?",
    a: "Use the Service Complaint form under Contact Us, or call customer care at +91 93562 59949 with your LR number and shipment details.",
  },
];
