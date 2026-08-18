import { ArrowRight, MapPin, Shield, Truck } from "lucide-react";
import { heroContent } from "@/data/marketing/homepage";
import { MarketingButton } from "./Button";
import { HeroVisual } from "./HeroVisual";

const trustIcons = [MapPin, Truck, Shield];

export function Hero() {
  const [lineOne, lineTwo] = heroContent.headline.split("\n");

  return (
    <section className="mkt-hero mkt-hero-premium">
      <div className="mkt-hero-bg" aria-hidden>
        <div className="mkt-hero-bg-gradient" />
        <div className="mkt-hero-bg-grid" />
        <div className="mkt-hero-bg-glow mkt-hero-bg-glow-1" />
        <div className="mkt-hero-bg-glow mkt-hero-bg-glow-2" />
      </div>

      <div className="mkt-container mkt-hero-grid">
        <div className="mkt-hero-copy mkt-hero-copy-premium mkt-animate-in">
          <span className="mkt-hero-badge">{heroContent.badge.toUpperCase()}</span>
          <h1>
            <span className="mkt-hero-headline-line">{lineOne}</span>
            <span className="mkt-hero-headline-accent">{lineTwo}</span>
          </h1>
          <p>{heroContent.description}</p>
          <div className="mkt-hero-actions">
            <MarketingButton href="/tracking" variant="primary" className="mkt-btn-lg">
              Track Shipment <ArrowRight aria-hidden className="mkt-btn-icon" />
            </MarketingButton>
            <MarketingButton href="/quote" variant="outline" className="mkt-btn-lg">
              Get a Quote
            </MarketingButton>
          </div>
          <ul className="mkt-hero-trust-row">
            {heroContent.trustPoints.map((point, i) => {
              const Icon = trustIcons[i] ?? MapPin;
              return (
                <li key={point} className="mkt-hero-trust-pill">
                  <Icon aria-hidden /> {point}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mkt-hero-visual mkt-animate-in-delay">
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}
