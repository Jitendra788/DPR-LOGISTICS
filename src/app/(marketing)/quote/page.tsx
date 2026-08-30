import type { Metadata } from "next";
import { CheckCircle2, Package, Route, Truck } from "lucide-react";
import { company } from "@/data/marketing/company";
import { QuoteForm } from "@/components/marketing/QuoteForm";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Pickup Request",
  description: `Request a cargo pickup from ${company.name}. Share route, weight and dimensions for part load, FTL, trailer or container booking across India.`,
  path: "/quote",
  keywords: [
    "pickup request",
    "cargo booking Kolhapur",
    "part load pickup",
    "FTL booking India",
    "DPR Logistics quote",
    "Kagal MIDC cargo pickup",
  ],
});

const steps = [
  { icon: Route, title: "Share route", text: "Pickup & delivery stations" },
  { icon: Package, title: "Cargo details", text: "Type, weight & packages" },
  { icon: Truck, title: "We confirm", text: "Vehicle & pickup slot" },
];

export default function QuotePage() {
  return (
    <>
      <section className="mkt-page-hero mkt-page-hero-premium">
        <div className="mkt-container">
          <span className="mkt-eyebrow">Pickup Request</span>
          <h1>Book your next shipment</h1>
          <p>
            Part load, FTL, trailers or warehousing — submit details and our booking desk will email you a quote on{" "}
            {company.email}.
          </p>
        </div>
      </section>

      <section className="mkt-section mkt-lead-section">
        <div className="mkt-container">
          <div className="mkt-quote-steps">
            {steps.map((s) => (
              <div key={s.title} className="mkt-quote-step">
                <span className="mkt-quote-step-icon" aria-hidden>
                  <s.icon size={20} />
                </span>
                <div>
                  <strong>{s.title}</strong>
                  <p>{s.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mkt-lead-grid mkt-lead-grid-quote">
            <aside className="mkt-lead-aside">
              <div className="mkt-lead-card">
                <h2>What you get</h2>
                <ul className="mkt-lead-checks">
                  <li>
                    <CheckCircle2 aria-hidden /> Same-day booking desk response
                  </li>
                  <li>
                    <CheckCircle2 aria-hidden /> Part load &amp; FTL options
                  </li>
                  <li>
                    <CheckCircle2 aria-hidden /> GST billing &amp; LR copy
                  </li>
                  <li>
                    <CheckCircle2 aria-hidden /> Online GC / LR tracking
                  </li>
                </ul>
                <p className="mkt-lead-note">
                  Prefer phone? Call{" "}
                  <a href={`tel:${company.phone.replace(/\s/g, "")}`}>{company.phone}</a>
                  {company.phoneAlt ? (
                    <>
                      {" "}
                      / <a href={`tel:${company.phoneAlt.replace(/\s/g, "")}`}>{company.phoneAlt}</a>
                    </>
                  ) : null}
                </p>
              </div>
            </aside>

            <div className="mkt-lead-form-wrap">
              <div className="mkt-lead-form-head">
                <h2>Pickup request form</h2>
                <p>Submitted requests are emailed to <strong>{company.email}</strong>.</p>
              </div>
              <QuoteForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
