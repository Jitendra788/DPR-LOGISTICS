import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Network & Branches | Pan-India Cargo Coverage",
  description:
    "DPR Logistics network from Kolhapur / Kagal MIDC — regular lanes across Maharashtra, Gujarat, Delhi NCR, Bangalore, Hyderabad, Chennai and major industrial metros.",
  path: "/network",
  keywords: [
    "DPR Logistics branches",
    "transport network Maharashtra",
    "pan India cargo network",
    "Kolhapur logistics hubs",
    "Gujarat Maharashtra transport network",
  ],
});

export default function NetworkLayout({ children }: { children: React.ReactNode }) {
  return children;
}
