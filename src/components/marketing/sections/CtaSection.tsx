import { MarketingButton } from "@/components/marketing/Button";
import { ScrollReveal } from "@/components/marketing/ScrollReveal";

export function CtaSection() {
  return (
    <section className="mkt-section mkt-cta-section">
      <div className="mkt-container">
        <ScrollReveal>
          <div className="mkt-cta-panel mkt-cta-panel-premium">
            <div className="mkt-cta-panel-bg" aria-hidden />
            <div className="mkt-cta-panel-content">
              <h2>Ready to move cargo with DPR?</h2>
              <p>Track a shipment, request a quote, or talk to our booking desk today.</p>
              <div className="mkt-cta-panel-actions">
                <MarketingButton href="/tracking" variant="primary">
                  Track Shipment
                </MarketingButton>
                <MarketingButton href="/quote" variant="outline">
                  Get a Quote
                </MarketingButton>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
