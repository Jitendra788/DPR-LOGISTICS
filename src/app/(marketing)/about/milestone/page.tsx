import type { Metadata } from "next";
import { milestones } from "@/data/marketing/company";
import { InnerPage } from "@/components/marketing/InnerPage";

import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Milestones",
  description:
    "DPR Logistics milestones — from Kolhapur fleet operations in 2014 to pan-India network expansion and digital LR booking platform.",
  path: "/about/milestone",
});

export default function MilestonePage() {
  return (
    <InnerPage eyebrow="About Us" title="Milestone" subtitle="How DPR Logistics has grown.">
      {milestones.map((m) => (
        <p key={m.year}>
          <strong>{m.year} — {m.title}.</strong> {m.text}
        </p>
      ))}
    </InnerPage>
  );
}
