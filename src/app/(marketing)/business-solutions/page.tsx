import type { Metadata } from "next";
import { businessSolutions } from "@/data/marketing/businessSolutions";
import { company } from "@/data/marketing/company";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { MarketingButton } from "@/components/marketing/Button";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Business Solutions",
  description: `B2B, e-commerce, retail, industrial and bulk logistics solutions from ${company.name}. Contract transport, warehousing and distribution programmes for enterprise shippers.`,
  path: "/business-solutions",
});

export default function BusinessSolutionsPage() {
  return (
    <>
      <section className="mkt-page-hero">
        <div className="mkt-container">
          <span className="mkt-eyebrow">Business Solutions</span>
          <h1>Logistics programs built for scale</h1>
          <p>Structured solutions for enterprises, e-commerce brands, retailers and industrial shippers who need reliability at volume.</p>
        </div>
      </section>

      <section className="mkt-section">
        <div className="mkt-container">
          <SectionHeading
            eyebrow="Industries we serve"
            title="Tailored supply chain support"
            subtitle="Combine transport, warehousing and distribution into a program that fits your business model."
          />
          <div className="mkt-solution-grid">
            {businessSolutions.map((item) => (
              <article key={item.id} className="mkt-solution-card">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
          <div className="mkt-cta-band">
            <div>
              <h3>Become a Business Partner</h3>
              <p>Partner with DPR Logistics for dedicated lanes, SLA-backed service and account management.</p>
            </div>
            <MarketingButton href="/contact" variant="secondary">
              Contact Sales
            </MarketingButton>
          </div>
        </div>
      </section>
    </>
  );
}
