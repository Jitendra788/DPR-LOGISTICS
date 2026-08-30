import type { Metadata } from "next";
import { JsonLd } from "@/components/marketing/JsonLd";
import { faqs } from "@/data/marketing/statistics";
import { createPageMetadata, faqJsonLd } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Track GC / LR Online | Shipment & Consignment Status",
  description:
    "Track DPR Logistics GC, LR or docket online. Enter exact consignment number for status, verify with mobile last 4 digits for full details, vehicle & GPS — or open WhatsApp track link.",
  path: "/tracking",
  keywords: [
    "track GC online",
    "track LR online",
    "track my consignment",
    "track my shipment India",
    "lorry receipt status",
    "goods consignment tracking",
    "docket number tracking",
    "DPR Logistics tracking",
    "cargo tracking Kolhapur",
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
