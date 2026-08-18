import type { Metadata } from "next";
import { clients } from "@/data/marketing/company";
import { InnerPage } from "@/components/marketing/InnerPage";

export const metadata: Metadata = { title: "Our Clients" };

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
