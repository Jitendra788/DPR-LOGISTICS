import type { Metadata } from "next";
import { company } from "@/data/marketing/company";

import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Privacy Policy",
  description: `Privacy policy for ${company.name} website and online booking services at dprlogistics.in.`,
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <section className="mkt-section">
      <div className="mkt-container mkt-legal">
        <span className="mkt-eyebrow">Legal</span>
        <h1 style={{ color: "var(--mkt-navy)", marginBottom: "0.75rem" }}>Privacy Policy</h1>
        <p>This privacy policy explains how {company.name} collects, uses and protects information submitted through our website and customer channels.</p>
        <h2>Information we collect</h2>
        <p>We may collect contact details, shipment information, quote requests and communication records when you use our forms or support channels.</p>
        <h2>How we use information</h2>
        <p>Information is used to provide logistics services, respond to enquiries, improve our website experience and meet legal or operational requirements.</p>
        <h2>Data protection</h2>
        <p>We apply reasonable administrative and technical safeguards. Production systems should be connected to secure backend services before handling live customer data.</p>
        <h2>Contact</h2>
        <p>For privacy-related questions, email {company.email}.</p>
      </div>
    </section>
  );
}
