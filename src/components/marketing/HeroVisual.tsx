"use client";

import Image from "next/image";
import { ArrowRight, MapPin, Package, Truck } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { heroDemoShipments } from "@/data/marketing/homepage";
import { BRAND_LOGO_HEADER } from "@/lib/brand";

export function HeroVisual() {
  const router = useRouter();
  const [value, setValue] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    router.push(`/tracking?q=${encodeURIComponent(q)}`);
  }

  return (
    <>
      <div className="mkt-hero-visual-wrap mkt-hero-visual-premium">
        <div className="mkt-hero-visual-scene" aria-hidden>
          <div className="mkt-hero-scene-mesh" />
          <div className="mkt-hero-scene-sky" />
          <div className="mkt-hero-scene-road" />
          <div className="mkt-hero-scene-glow-ring" />
          <svg className="mkt-hero-scene-routes" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice">
            <path d="M0 280 Q150 240 300 260 T600 250" fill="none" stroke="rgba(18,184,166,0.35)" strokeWidth="2" />
            <path d="M80 320 Q220 290 380 310 T580 300" fill="none" stroke="rgba(244,183,64,0.25)" strokeWidth="1.5" strokeDasharray="8 6" />
            {[
              [120, 265], [260, 255], [400, 268], [520, 258],
            ].map(([cx, cy], i) => (
              <circle key={i} className="mkt-hero-scene-node" cx={cx} cy={cy} r="5" fill="#12B8A6" opacity="0.85" />
            ))}
          </svg>
          <div className="mkt-hero-scene-truck">
            <div className="mkt-hero-logo-frame">
              <Image
                src={BRAND_LOGO_HEADER}
                alt=""
                width={287}
                height={222}
                quality={95}
                priority
                sizes="(max-width: 768px) 160px, 240px"
                className="mkt-hero-scene-logo"
              />
            </div>
          </div>
          <div className="mkt-hero-scene-badge">
            <Truck aria-hidden />
            <span>500+ Daily Shipments</span>
          </div>
          <div className="mkt-hero-scene-badge mkt-hero-scene-badge-2">
            <Package aria-hidden />
            <span>Pan-India Network</span>
          </div>
        </div>

        <form className="mkt-hero-track-panel mkt-hero-track-panel-premium" onSubmit={onSubmit}>
          <div className="mkt-hero-track-panel-head">
            <MapPin aria-hidden />
            <div>
              <strong>Track Your Shipment</strong>
              <span>GC / LR / Docket Number</span>
            </div>
          </div>
          <div className="mkt-hero-track-panel-body">
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter tracking number"
              aria-label="Tracking number"
            />
            <button type="submit">
              Track <ArrowRight aria-hidden />
            </button>
          </div>
        </form>
      </div>

      <div className="mkt-hero-float-cards mkt-hero-float-cards-premium" aria-label="Demo shipment previews — not live data">
        <span className="mkt-demo-label">Demo preview</span>
        {heroDemoShipments.map((item) => (
          <div key={item.id} className="mkt-hero-float-card mkt-hero-float-card-premium">
            <div className="mkt-hero-float-status">
              <span className="mkt-hero-float-status-dot" aria-hidden />
              Live status
            </div>
            <div className="mkt-hero-float-card-label">Shipment Status</div>
            <div className="mkt-hero-float-card-value">{item.status}</div>
            <div className="mkt-hero-float-card-route">{item.route}</div>
            <div className="mkt-hero-float-card-foot">
              <span>Expected Delivery</span>
              <strong>{item.eta}</strong>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
