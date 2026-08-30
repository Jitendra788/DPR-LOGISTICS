"use client";

import { ScrollReveal } from "@/components/marketing/ScrollReveal";
import { TrackingSearchPanel } from "@/components/marketing/TrackingSearchPanel";

export function TrackingSection() {
  return (
    <section className="mkt-section mkt-tracking-section mkt-tracking-section-dark" id="track">
      <div className="mkt-container">
        <ScrollReveal>
          <div className="mkt-section-head mkt-section-head-center mkt-section-head-premium mkt-tracking-head-dark">
            <span className="mkt-eyebrow mkt-eyebrow-light">Shipment Tracking</span>
            <h2>
              Track Every Shipment.
              <br />
              Every Mile.
            </h2>
            <p>
              Enter GC / LR for limited status. Full details unlock with mobile last 4 digits, or use your secret track
              link from WhatsApp / SMS.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={80}>
          <div className="mkt-tracking-section-result">
            <TrackingSearchPanel dark premium />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
