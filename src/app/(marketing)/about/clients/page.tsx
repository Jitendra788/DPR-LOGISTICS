import type { Metadata } from "next";
import Image from "next/image";
import { clients, valuableCustomers } from "@/data/marketing/company";
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
    <InnerPage eyebrow="About Us" title="Our Clients" subtitle="Industry partners we serve across key corridors.">
      <div className="mkt-clients-static">
        {valuableCustomers.map((client) => (
          <div key={client.id} className="mkt-clients-item">
            <Image src={client.logo} alt={client.name} width={180} height={72} className="mkt-clients-logo" />
          </div>
        ))}
      </div>
      <div className="mkt-client-row" style={{ marginTop: "1.5rem" }}>
        {clients.map((c) => (
          <span key={c}>{c}</span>
        ))}
      </div>
    </InnerPage>
  );
}
