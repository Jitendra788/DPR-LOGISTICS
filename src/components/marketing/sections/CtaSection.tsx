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
              <h2>Ready to Move Your Business Forward?</h2>
              <p>
                Talk to our logistics experts and find the right transportation solution for your business.
              </p>
              <div className="mkt-cta-panel-actions">
                <MarketingButton href="/quote" variant="primary">
                  Get a Quote
                </MarketingButton>
                <MarketingButton href="/contact" variant="outline">
                  Talk to an Expert
                </MarketingButton>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
