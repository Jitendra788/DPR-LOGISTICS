"use client";

import dynamic from "next/dynamic";
import { FormEvent, useEffect, useState } from "react";
import { trackShipmentViaApi, type TrackingResult } from "@/services/trackingClient";
import { ShipmentTimeline } from "@/components/marketing/ShipmentTimeline";
import { EmptyState, ErrorState, LoadingState } from "@/components/marketing/States";

const LiveTrackMap = dynamic(() => import("@/components/tracking/LiveTrackMap").then((m) => m.LiveTrackMap), {
  ssr: false,
  loading: () => <div style={{ padding: "1.5rem", textAlign: "center", color: "#64748b" }}>Loading map…</div>,
});

function whatsappShare(url: string, lrNo: string) {
  const text = `Track your DPR Logistics shipment ${lrNo}: ${url}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

function smsShare(url: string, lrNo: string) {
  const text = `Track your DPR Logistics shipment ${lrNo}: ${url}`;
  return `sms:?body=${encodeURIComponent(text)}`;
}

type Props = {
  initialQuery?: string;
  dark?: boolean;
  premium?: boolean;
  showEmpty?: boolean;
  heroNote?: boolean;
};

export function TrackingSearchPanel({
  initialQuery = "",
  dark = false,
  premium = false,
  showEmpty = true,
  heroNote = false,
}: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [mobileLast4, setMobileLast4] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [pendingLr, setPendingLr] = useState("");

  async function runSearch(number: string, last4 = "") {
    const trimmed = number.trim();
    if (!trimmed) {
      setResult(null);
      setPendingLr("");
      return;
    }
    setLoading(true);
    setResult(null);
    const res = await trackShipmentViaApi({ trackingNumber: trimmed, mobileLast4: last4 });
    setResult(res);
    if (res.ok) setPendingLr(trimmed);
    setLoading(false);
  }

  useEffect(() => {
    if (initialQuery.trim()) {
      setQuery(initialQuery);
      runSearch(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  function onTrack(e: FormEvent) {
    e.preventDefault();
    setMobileLast4("");
    runSearch(query);
  }

  function onVerify(e: FormEvent) {
    e.preventDefault();
    runSearch(pendingLr || query, mobileLast4);
  }

  const widgetClass = [
    "mkt-tracking-widget",
    dark ? "mkt-tracking-widget-dark" : "",
    premium ? "mkt-tracking-widget-premium" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const absoluteTrackUrl =
    result?.ok && result.data.trackUrl && typeof window !== "undefined"
      ? `${window.location.origin}${result.data.trackUrl}`
      : result?.ok && result.data.trackUrl
        ? result.data.trackUrl
        : null;

  return (
    <div className="mkt-tracking-search-panel">
      {heroNote ? (
        <p className="mkt-page-hero-note" style={{ marginBottom: "1rem" }}>
          Public view shows limited status. Full details need <strong>mobile last 4 digits</strong> (demo:{" "}
          <strong>SL-2026-00142</strong> + <strong>0142</strong>).
        </p>
      ) : null}

      <form className={widgetClass} onSubmit={onTrack}>
        <div className="mkt-tracking-widget-body">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Exact LR from print — e.g. LR-22463"
            aria-label="Tracking number"
            autoComplete="off"
          />
          <button type="submit">Track Shipment</button>
        </div>
      </form>

      {loading ? <LoadingState label="Fetching shipment status…" /> : null}

      {!loading && result && !result.ok ? (
        <ErrorState
          title={result.code === "FORBIDDEN" ? "Verification failed" : "Shipment not found"}
          description={result.error}
        />
      ) : null}

      {!loading && !result && showEmpty ? (
        <EmptyState
          title="Enter a tracking number"
          description="You will see limited status first. Enter mobile last 4 digits for full details, or open your secret track link."
        />
      ) : null}

      {!loading && result?.ok ? (
        <div className={`mkt-tracking-result${premium ? " mkt-tracking-result-premium" : ""}`}>
          <div className="mkt-tracking-result-head">
            <h2 style={{ margin: 0, color: dark && !premium ? "#fff" : "var(--mkt-navy)" }}>
              Shipment #{result.data.trackingNumber}
            </h2>
            <span className={`mkt-tracking-live-badge${result.data.verified ? "" : " is-limited"}`}>
              {result.data.verified ? "Verified · Full details" : "Limited public status"}
            </span>
          </div>

          {!result.data.verified ? (
            <form className="mkt-tracking-verify" onSubmit={onVerify}>
              <p>
                {result.data.mobileHint ||
                  "Enter last 4 digits of consignee / consignor mobile to unlock full details."}
              </p>
              <div className="mkt-tracking-verify-row">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={mobileLast4}
                  onChange={(e) => setMobileLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="Last 4 digits"
                  aria-label="Mobile last 4 digits"
                  required
                />
                <button type="submit">Unlock details</button>
              </div>
            </form>
          ) : null}

          <div className="mkt-tracking-meta">
            <div>
              <span>Origin</span>
              <strong>{result.data.origin}</strong>
            </div>
            <div>
              <span>Destination</span>
              <strong>{result.data.destination}</strong>
            </div>
            {result.data.verified ? (
              <>
                <div>
                  <span>Booking Date</span>
                  <strong>{result.data.bookingDate}</strong>
                </div>
                <div>
                  <span>Consignee</span>
                  <strong>{result.data.consignee}</strong>
                </div>
                <div>
                  <span>Vehicle Number</span>
                  <strong>{result.data.vehicleNumber}</strong>
                </div>
              </>
            ) : null}
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

          {result.data.verified && result.data.live?.lastLat != null && result.data.live.lastLng != null ? (
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
            </div>
          ) : null}

          {result.data.verified && absoluteTrackUrl ? (
            <div className="mkt-tracking-share">
              <p>
                Secret track link (share on WhatsApp / SMS):{" "}
                <a href={result.data.trackUrl!} className="mkt-link">
                  {absoluteTrackUrl}
                </a>
              </p>
              <div className="mkt-tracking-share-actions">
                <a
                  className="mkt-btn mkt-btn-primary mkt-btn-sm"
                  href={whatsappShare(absoluteTrackUrl, result.data.trackingNumber)}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp
                </a>
                <a className="mkt-btn mkt-btn-outline mkt-btn-sm" href={smsShare(absoluteTrackUrl, result.data.trackingNumber)}>
                  SMS
                </a>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
