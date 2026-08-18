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
    q: "How do I track my consignment?",
    a: "Use GC Tracking on this website. Enter your GC / LR / Docket number to see the latest status.",
  },
  {
    q: "How do I request a pickup?",
    a: "Open Pickup Request, share from–to stations, cargo details and a contact number. Our desk will confirm.",
  },
  {
    q: "Do you offer part load and full truck load?",
    a: "Yes. Part load for shared cargo and FTL / trailers / containers for dedicated movement.",
  },
  {
    q: "How can I raise a service complaint?",
    a: "Use Service Complaint under Contact Us, or call customer care with your LR number.",
  },
];
