import type { Metadata } from "next";
import { JsonLd } from "@/components/marketing/JsonLd";
import { faqs } from "@/data/marketing/statistics";
import { createPageMetadata, faqJsonLd } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Track Shipment — GC / LR Tracking",
  description:
    "Track DPR Logistics GC / LR online. Enter the exact docket number for limited status, then verify with consignee or consignor mobile last 4 digits for full details, vehicle and GPS. Or open the WhatsApp / SMS secret track link.",
  path: "/tracking",
  keywords: [
    "GC tracking",
    "LR tracking",
    "lorry receipt tracking",
    "docket tracking online",
    "shipment tracking DPR Logistics",
    "track consignment Kolhapur",
    "GC LR status online",
    "WhatsApp shipment tracking link",
    "cargo tracking Maharashtra",
  ],
});

export default function TrackingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={faqJsonLd(faqs.slice(0, 4))} />
      {children}
    </>
  );
}
