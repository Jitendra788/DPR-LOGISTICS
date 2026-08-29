"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { heroContent } from "@/data/marketing/homepage";
import { MarketingButton } from "./Button";

export function Hero() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [lineOne, lineTwo] = heroContent.headline.split("\n");

  function onTrack(e: FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    router.push(`/tracking?q=${encodeURIComponent(q)}`);
  }

  return (
    <section className="mkt-hero mkt-hero-cinematic">
      <div className="mkt-hero-stage" aria-hidden>
        <div className="mkt-hero-stage-base" />
        <div className="mkt-hero-stage-wash" />
        <div className="mkt-hero-stage-grid" />
        <svg className="mkt-hero-stage-routes" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice">
          <path
            className="mkt-hero-route mkt-hero-route-a"
            d="M-40 520 C280 420 520 560 760 480 S1180 360 1480 420"
            fill="none"
            stroke="rgba(245,158,11,0.35)"
            strokeWidth="2"
          />
          <path
            className="mkt-hero-route mkt-hero-route-b"
            d="M-20 620 C320 540 580 680 860 600 S1240 500 1500 560"
            fill="none"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="1.5"
            strokeDasharray="10 8"
          />
          {[
            [220, 470],
            [520, 510],
            [780, 470],
            [1080, 400],
          ].map(([cx, cy], i) => (
            <circle key={i} className="mkt-hero-route-node" cx={cx} cy={cy} r="5" fill="#F59E0B" />
          ))}
        </svg>
        <div className="mkt-hero-stage-glow mkt-hero-stage-glow-a" />
        <div className="mkt-hero-stage-glow mkt-hero-stage-glow-b" />
      </div>

      <div className="mkt-container mkt-hero-content">
        <div className="mkt-hero-copy mkt-animate-in">
          <p className="mkt-hero-brand">{heroContent.brand}</p>
          <h1>
            <span className="mkt-hero-headline-line">{lineOne}</span>
            <span className="mkt-hero-headline-accent">{lineTwo}</span>
          </h1>
          <p className="mkt-hero-lead">{heroContent.description}</p>

          <form className="mkt-hero-track" onSubmit={onTrack}>
            <label htmlFor="hero-track-input" className="mkt-hero-track-label">
              {heroContent.trackLabel}
            </label>
            <div className="mkt-hero-track-row">
              <input
                id="hero-track-input"
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={heroContent.trackPlaceholder}
                autoComplete="off"
              />
              <button type="submit">{heroContent.trackButton}</button>
            </div>
          </form>

          <div className="mkt-hero-actions">
            <MarketingButton href="/quote" variant="primary" className="mkt-btn-lg">
              {heroContent.primaryCta}
            </MarketingButton>
            <Link href="/services" className="mkt-hero-services-link">
              {heroContent.servicesCta} <ArrowRight aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
