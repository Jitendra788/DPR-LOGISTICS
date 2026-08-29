import type { Metadata } from "next";
import { faqs } from "@/data/marketing/statistics";
import { InnerPage } from "@/components/marketing/InnerPage";
import { JsonLd } from "@/components/marketing/JsonLd";
import { createPageMetadata, faqJsonLd } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "FAQs",
  description:
    "Frequently asked questions about DPR Logistics — shipment tracking, part load & FTL booking, pickup requests, routes, warehousing and customer care.",
  path: "/contact/faq",
});

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqJsonLd(faqs)} />
      <InnerPage eyebrow="Contact Us" title="FAQs" subtitle="Common questions about booking, tracking and billing.">
        {faqs.map((f) => (
          <p key={f.q}>
            <strong>{f.q}</strong>
            <br />
            {f.a}
          </p>
        ))}
      </InnerPage>
    </>
  );
}
