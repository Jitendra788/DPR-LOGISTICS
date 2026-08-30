import type { Metadata } from "next";
import { company } from "@/data/marketing/company";
import { InnerPage } from "@/components/marketing/InnerPage";
import { MarketingButton } from "@/components/marketing/Button";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "About DPR Logistics | Fleet Owners Kolhapur",
  description: `${company.name} — fleet owners and transport contractors from Kolhapur, Maharashtra. Pan-India part load & FTL, GST billing, LR booking, POD and online tracking from Kagal MIDC.`,
  path: "/about",
  keywords: [
    "about DPR Logistics",
    "fleet owners Kolhapur",
    "transport contractors Maharashtra",
    "logistics company profile Kolhapur",
  ],
});

export default function AboutPage() {
  return (
    <InnerPage
      eyebrow="About Us"
      title={`${company.name} Corporate Profile`}
      subtitle={company.shortDescription}
    >
      <p>{company.description}</p>
      <p>
        Head office: {company.address}. We operate as fleet owners and transport contractors with GST-compliant billing,
        LR booking, POD follow-up and a pan-India movement network.
      </p>
      <p>
        <MarketingButton href="/about/mission" variant="outline">
          Mission, Vision & Values
        </MarketingButton>
      </p>
    </InnerPage>
  );
}
