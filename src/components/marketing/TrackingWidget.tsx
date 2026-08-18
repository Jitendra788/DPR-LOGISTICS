"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { heroDemoShipments } from "@/data/marketing/homepage";

type Props = {
  defaultValue?: string;
  compact?: boolean;
  className?: string;
  variant?: "default" | "premium";
  showDemo?: boolean;
};

export function TrackingWidget({
  defaultValue = "",
  compact = false,
  className = "",
  variant = "default",
  showDemo = false,
}: Props) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    router.push(`/tracking?q=${encodeURIComponent(q)}`);
  }

  const premium = variant === "premium";

  return (
    <div className={`mkt-tracking-stack ${className}`.trim()}>
      <form
        className={`mkt-tracking-widget ${compact ? "mkt-tracking-widget-compact" : ""} ${premium ? "mkt-tracking-widget-premium" : ""}`.trim()}
        onSubmit={onSubmit}
      >
        <div className="mkt-tracking-widget-head">
          <Search aria-hidden />
          <div>
            <h3>Track Your Shipment</h3>
            {!compact ? <p>GC / LR / Docket Number</p> : null}
          </div>
        </div>
        <div className="mkt-tracking-widget-body">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter tracking number"
            aria-label="Tracking number"
          />
          <button type="submit">
            Track Shipment <ArrowRight aria-hidden className="mkt-btn-arrow" />
          </button>
        </div>
      </form>

      {showDemo ? (
        <div className="mkt-hero-demo-cards" aria-label="Demo shipment previews — not live data">
          <span className="mkt-demo-label">Demo preview — not live data</span>
          <div className="mkt-hero-demo-row">
            {heroDemoShipments.map((item) => (
              <div key={item.id} className="mkt-hero-demo-card">
                <div className="mkt-hero-demo-card-head">
                  <span>Shipment Status</span>
                  <strong>{item.status}</strong>
                </div>
                <p>{item.route}</p>
                <div className="mkt-hero-demo-card-foot">
                  <span>Expected Delivery</span>
                  <strong>{item.eta}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
