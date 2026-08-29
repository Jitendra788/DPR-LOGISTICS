import type { Metadata } from "next";
import { InnerPage } from "@/components/marketing/InnerPage";
import { company } from "@/data/marketing/company";

import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Current Openings",
  description: "Current job openings at DPR Logistics — operations, booking desk, fleet coordination and customer care roles.",
  path: "/careers/openings",
});

export default function OpeningsPage() {
  return (
    <InnerPage eyebrow="Careers" title="Current Openings" subtitle="Share your profile with our HR desk.">
      <p>We hire for operations, customer care, billing and driver coordination as routes grow.</p>
      <p>
        Email your CV to <a href={`mailto:${company.email}`}>{company.email}</a> with the role in the subject line, or call{" "}
        {company.phone}.
      </p>
    </InnerPage>
  );
}
