import type { Metadata } from "next";
import { managementTeam } from "@/data/marketing/company";
import { InnerPage } from "@/components/marketing/InnerPage";

export const metadata: Metadata = { title: "Management Team" };

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
