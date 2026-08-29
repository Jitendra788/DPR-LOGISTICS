import { QuoteForm } from "@/components/marketing/QuoteForm";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { ScrollReveal } from "@/components/marketing/ScrollReveal";

export function QuoteSection() {
  return (
    <section className="mkt-section mkt-quote-section" id="get-quote">
      <div className="mkt-container mkt-quote-grid">
        <ScrollReveal>
          <SectionHeading
            eyebrow="Get a Quote"
            title="Request pickup or freight estimate"
            subtitle="Share origin, destination and cargo details — our booking desk responds with the right part-load or FTL plan."
          />
          <ul className="mkt-quote-points">
            <li>Part load &amp; FTL options on the same request</li>
            <li>GST-compliant billing and POD follow-up</li>
            <li>Coverage across Maharashtra, Gujarat and pan-India</li>
          </ul>
        </ScrollReveal>
        <ScrollReveal delay={80}>
          <div className="mkt-quote-form-wrap">
            <QuoteForm />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
