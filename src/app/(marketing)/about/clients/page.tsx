import type { Metadata } from "next";
import { clients } from "@/data/marketing/company";
import { InnerPage } from "@/components/marketing/InnerPage";

import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Our Clients",
  description:
    "DPR Logistics serves manufacturers, textile exporters, trading houses and distribution partners across Maharashtra, Gujarat and pan-India corridors.",
  path: "/about/clients",
});

export default function ClientsPage() {
  return (
    <InnerPage eyebrow="About Us" title="Our Clients" subtitle="A sample of industry partners we serve.">
      <div className="mkt-client-row">
        {clients.map((c) => (
          <span key={c}>{c}</span>
        ))}
      </div>
    </InnerPage>
  );
}
