import type { Metadata } from "next";
import { managementTeam } from "@/data/marketing/company";
import { InnerPage } from "@/components/marketing/InnerPage";

import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Management Team",
  description: "Meet the DPR Logistics leadership team — operations, customer care and fleet management driving pan-India cargo delivery.",
  path: "/about/management",
});

export default function ManagementPage() {
  return (
    <InnerPage eyebrow="About Us" title="Management Team" subtitle="Leadership that runs daily operations.">
      <div className="mkt-value-grid">
        {managementTeam.map((m) => (
          <article key={m.role} className="mkt-value-card">
            <h3>{m.name}</h3>
            <p><strong>{m.role}</strong></p>
            <p>{m.bio}</p>
          </article>
        ))}
      </div>
    </InnerPage>
  );
}
