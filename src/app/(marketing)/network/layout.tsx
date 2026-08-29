import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Network & Branches",
  description:
    "DPR Logistics pan-India network — branches and regular lanes from Kolhapur across Maharashtra, Gujarat, Delhi NCR, Bangalore, Hyderabad, Chennai and major metros.",
  path: "/network",
  keywords: [
    "DPR Logistics branches",
    "logistics network India",
    "Kolhapur transport network",
    "Maharashtra Gujarat transport lanes",
  ],
});

export default function NetworkLayout({ children }: { children: React.ReactNode }) {
  return children;
}
