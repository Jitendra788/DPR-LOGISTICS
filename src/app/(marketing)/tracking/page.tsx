"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { trackShipmentViaApi, type TrackingResult } from "@/services/trackingClient";
import { ShipmentTimeline } from "@/components/marketing/ShipmentTimeline";
import { EmptyState, ErrorState, LoadingState } from "@/components/marketing/States";

const LiveTrackMap = dynamic(() => import("@/components/tracking/LiveTrackMap").then((m) => m.LiveTrackMap), {
  ssr: false,
  loading: () => <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>Loading map…</div>,
});

function TrackingContent() {
  const searchParams = useSearchParams();
  const initial = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initial);
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

  useEffect(() => {
    if (initial) runSearch(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    runSearch(query);
  }

  return (
    <>
      <section className="mkt-page-hero mkt-page-hero-premium">
        <div className="mkt-container">
          <span className="mkt-eyebrow">Tracking</span>
          <h1>Track your shipment in real time</h1>
          <p>Enter your GC / LR / Docket number to view booking details, current location and delivery timeline.</p>
          <p className="mkt-page-hero-note">
            Demo: <strong>SL-2026-00142</strong> · Real LR: Trip Desk mein jo LR link hai wo yahan search karo
          </p>
        </div>
      </section>

      <section className="mkt-section">
        <div className="mkt-container mkt-tracking-page">
          <form className="mkt-tracking-widget" onSubmit={onSubmit}>
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

          {loading ? <LoadingState label="Fetching shipment status…" /> : null}

          {!loading && result && !result.ok ? (
            <ErrorState title="Shipment not found" description={result.error} />
          ) : null}

          {!loading && !result && !initial ? (
            <EmptyState
              title="Enter a tracking number"
              description="Use your GC, LR or docket number to view shipment milestones and delivery status."
            />
          ) : null}

          {!loading && result?.ok ? (
            <div className="mkt-tracking-result">
              <h2 style={{ margin: "0 0 1rem", color: "var(--mkt-navy)" }}>{result.data.trackingNumber}</h2>
              <div className="mkt-tracking-meta">
                <div><span>Booking Date</span><strong>{result.data.bookingDate}</strong></div>
                <div><span>Origin</span><strong>{result.data.origin}</strong></div>
                <div><span>Destination</span><strong>{result.data.destination}</strong></div>
                <div><span>Consignee</span><strong>{result.data.consignee}</strong></div>
                <div><span>Current Location</span><strong>{result.data.currentLocation}</strong></div>
                <div><span>Vehicle Number</span><strong>{result.data.vehicleNumber}</strong></div>
                <div><span>Expected Delivery</span><strong>{result.data.expectedDelivery}</strong></div>
              </div>
              <ShipmentTimeline events={result.data.events} />
              {result.data.live?.lastLat != null && result.data.live.lastLng != null ? (
                <div style={{ marginTop: "1.5rem" }}>
                  <h3 style={{ margin: "0 0 0.75rem", color: "var(--mkt-navy)" }}>Live on map</h3>
                  <LiveTrackMap
                    lastLat={result.data.live.lastLat}
                    lastLng={result.data.live.lastLng}
                    route={result.data.live.route}
                    fromLabel={result.data.origin}
                    toLabel={result.data.destination}
                    height={380}
                  />
                  {result.data.live.customerTrackUrl ? (
                    <p style={{ marginTop: "0.75rem", fontSize: "0.875rem" }}>
                      Share link:{" "}
                      <a href={result.data.live.customerTrackUrl} className="mkt-link">
                        {typeof window !== "undefined" ? window.location.origin : ""}
                        {result.data.live.customerTrackUrl}
                      </a>
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading tracking…" />}>
      <TrackingContent />
    </Suspense>
  );
}
