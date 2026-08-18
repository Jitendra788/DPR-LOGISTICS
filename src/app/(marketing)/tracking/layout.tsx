import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Shipment",
  description: "Track your GC, LR or docket number with DPR Logistics.",
};

export default function TrackingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
