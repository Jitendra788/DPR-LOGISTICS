import type { Metadata } from "next";
import { company } from "@/data/marketing/company";
import { InnerPage } from "@/components/marketing/InnerPage";

import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "History",
  description:
    "History of DPR Logistics — regional fleet operator from Kolhapur growing into a multi-route transport contractor serving manufacturers and traders across India.",
  path: "/about/history",
});

export default function HistoryPage() {
  return (
    <InnerPage eyebrow="About Us" title="Our History" subtitle={`Since ${company.foundedYear}.`}>
      <p>{company.history}</p>
      <p>{company.mdMessage}</p>
    </InnerPage>
  );
}
