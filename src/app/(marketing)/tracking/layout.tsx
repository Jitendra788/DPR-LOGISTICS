import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Track Shipment — GC / LR Tracking",
  description:
    "Track your DPR Logistics shipment online. Enter GC, LR or docket number to view booking details, current location and delivery status in real time.",
  path: "/tracking",
  keywords: ["GC tracking", "LR tracking", "shipment tracking DPR Logistics", "docket status online"],
});

export default function TrackingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
