"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, Search } from "lucide-react";

type Props = {
  defaultValue?: string;
  compact?: boolean;
  className?: string;
  variant?: "default" | "premium";
};

export function TrackingWidget({
  defaultValue = "",
  compact = false,
  className = "",
  variant = "default",
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
    <form
      className={`mkt-tracking-widget ${compact ? "mkt-tracking-widget-compact" : ""} ${premium ? "mkt-tracking-widget-premium" : ""} ${className}`.trim()}
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
  );
}
