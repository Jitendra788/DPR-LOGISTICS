import type { Metadata } from "next";
import { InnerPage } from "@/components/marketing/InnerPage";

import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Awards & Recognitions",
  description: "Awards and recognitions earned by DPR Logistics for on-time delivery, customer service and operational excellence.",
  path: "/media/awards",
});

export default function AwardsPage() {
  return (
    <InnerPage eyebrow="Media Center" title="Awards & Recognitions" subtitle="Recognition for dependable transport service.">
      <p>DPR Logistics is built on on-time movement and customer follow-up. Formal awards and press notes will appear on this page.</p>
    </InnerPage>
  );
}
