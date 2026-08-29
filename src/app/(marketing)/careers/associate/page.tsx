import type { Metadata } from "next";
import { InnerPage } from "@/components/marketing/InnerPage";

import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Business Associate",
  description: "Become a DPR Logistics business associate — booking and delivery partner programme across Maharashtra and pan-India lanes.",
  path: "/careers/associate",
});

export default function AssociatePage() {
  return (
    <InnerPage
      eyebrow="Partner Center"
      title="Business Associate"
      subtitle="Work with DPR Logistics as a booking or delivery associate."
      cta={{ href: "/contact", label: "Contact Details" }}
    >
      <p>
        Associates help with local booking, delivery and customer coordination. Tell us your city, vehicle access and
        expected volume — our team will review and get back.
      </p>
    </InnerPage>
  );
}
