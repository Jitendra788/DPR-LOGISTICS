import type { Metadata } from "next";
import { faqs } from "@/data/marketing/statistics";
import { InnerPage } from "@/components/marketing/InnerPage";
import { JsonLd } from "@/components/marketing/JsonLd";
import { createPageMetadata, faqJsonLd } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "FAQs — Tracking, Booking, GST Billing & Customer Care",
  description:
    "DPR Logistics FAQs: how to track GC / LR online, mobile last 4 digit verification, WhatsApp secret track link, part load & FTL pickup, GST billing, POD and customer care in Kolhapur.",
  path: "/contact/faq",
  keywords: [
    "DPR Logistics FAQ",
    "GC LR tracking FAQ",
    "how to track shipment India",
    "part load FTL booking FAQ",
    "GST logistics billing Kolhapur",
    "POD proof of delivery",
    "DPR Logistics customer care",
    "WhatsApp shipment tracking link",
    "lorry receipt tracking",
    "Kagal MIDC transport company FAQ",
  ],
});

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqJsonLd(faqs)} />
      <InnerPage
        eyebrow="Contact Us"
        title="Frequently asked questions"
        subtitle="Tracking, pickup booking, GST billing, POD and customer care — answers from the DPR desk."
        cta={{ href: "/tracking", label: "Track your shipment" }}
        highlights={[
          "Exact GC / LR tracking",
          "Mobile last-4 privacy check",
          "WhatsApp / SMS track link",
          "GST billing & POD help",
        ]}
      >
        <div className="mkt-faq-list">
          {faqs.map((f, i) => (
            <details key={f.q} className="mkt-faq-item" open={i < 2}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </InnerPage>
    </>
  );
}
