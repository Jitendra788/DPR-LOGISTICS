import type { Metadata } from "next";
import { company } from "@/data/marketing/company";
import { QuoteForm } from "@/components/marketing/QuoteForm";

export const metadata: Metadata = {
  title: "Pickup Request",
  description: `Request a cargo pickup from ${company.name}.`,
};

export default function QuotePage() {
  return (
    <>
      <section className="mkt-page-hero">
        <div className="mkt-container">
          <span className="mkt-eyebrow">Pickup Request</span>
          <h1>Request a pickup</h1>
          <p>Share your route, cargo details and contact information. Our team will confirm booking support.</p>
        </div>
      </section>

      <section className="mkt-section">
        <div className="mkt-container" style={{ maxWidth: 820 }}>
          <QuoteForm />
        </div>
      </section>
    </>
  );
}
