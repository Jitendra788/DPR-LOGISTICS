"use client";

import { FormEvent, useState } from "react";
import { trackShipmentViaApi, type TrackingResult } from "@/services/trackingService";
import { ShipmentTimeline } from "@/components/marketing/ShipmentTimeline";
import { EmptyState, ErrorState, LoadingState } from "@/components/marketing/States";
import { ScrollReveal } from "@/components/marketing/ScrollReveal";

export function TrackingSection() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackingResult | null>(null);

  async function runSearch(number: string) {
    const trimmed = number.trim();
    if (!trimmed) {
      setResult(null);
      return;
    }
    setLoading(true);
    setResult(null);
    const res = await trackShipmentViaApi(trimmed);
    setResult(res);
    setLoading(false);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    runSearch(query);
  }

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
            <p>Enter your GC / LR / Docket number to view booking details, current location and delivery timeline.</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={80}>
          <form className="mkt-tracking-widget mkt-tracking-widget-dark mkt-tracking-widget-premium" onSubmit={onSubmit}>
            <div className="mkt-tracking-widget-body">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter GC / LR / Docket Number"
                aria-label="Tracking number"
              />
              <button type="submit">Track Shipment</button>
            </div>
          </form>
        </ScrollReveal>

        <div className="mkt-tracking-section-result">
          {loading ? <LoadingState label="Fetching shipment status…" /> : null}

          {!loading && result && !result.ok ? (
            <ErrorState title="Shipment not found" description={result.error} />
          ) : null}

          {!loading && !result ? (
            <EmptyState
              title="Enter a tracking number"
              description="Use your GC, LR or docket number to view shipment milestones and delivery status."
            />
          ) : null}

          {!loading && result?.ok ? (
            <div className="mkt-tracking-result mkt-tracking-result-premium">
              <div className="mkt-tracking-result-head">
                <h2>Shipment #{result.data.trackingNumber}</h2>
                <span className="mkt-tracking-live-badge">Live Status</span>
              </div>
              <div className="mkt-tracking-meta">
                <div>
                  <span>Origin</span>
                  <strong>{result.data.origin}</strong>
                </div>
                <div>
                  <span>Destination</span>
                  <strong>{result.data.destination}</strong>
                </div>
                <div>
                  <span>Current Location</span>
                  <strong>{result.data.currentLocation}</strong>
                </div>
                <div>
                  <span>Expected Delivery</span>
                  <strong>{result.data.expectedDelivery}</strong>
                </div>
              </div>
              <ShipmentTimeline events={result.data.events} />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
