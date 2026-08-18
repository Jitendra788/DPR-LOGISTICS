import type { Metadata } from "next";
import { milestones } from "@/data/marketing/company";
import { InnerPage } from "@/components/marketing/InnerPage";

export const metadata: Metadata = { title: "Milestone" };

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
