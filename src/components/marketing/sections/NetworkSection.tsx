import { ArrowRight, MapPin } from "lucide-react";
import { networkCities } from "@/data/marketing/branches";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { ScrollReveal } from "@/components/marketing/ScrollReveal";
import { MarketingButton } from "@/components/marketing/Button";

const cityPositions: Record<string, { x: number; y: number }> = {
  Kolhapur: { x: 30, y: 70 },
  "Delhi NCR": { x: 42, y: 28 },
  Jaipur: { x: 38, y: 38 },
  Ahmedabad: { x: 28, y: 48 },
  Surat: { x: 26, y: 55 },
  Mumbai: { x: 24, y: 62 },
  Pune: { x: 32, y: 66 },
  Indore: { x: 40, y: 52 },
  Nagpur: { x: 48, y: 58 },
  Hyderabad: { x: 48, y: 72 },
  Bangalore: { x: 44, y: 88 },
  Chennai: { x: 52, y: 92 },
  Kolkata: { x: 68, y: 52 },
};

export function NetworkSection() {
  return (
    <section className="mkt-section mkt-network-section mkt-network-section-premium">
      <div className="mkt-container mkt-network-grid">
        <ScrollReveal>
          <SectionHeading
            eyebrow="Pan-India Network"
            title="Our Network Across India"
            subtitle="Strategic coverage from Kolhapur across Maharashtra, Gujarat and major industrial metros."
          />
          <p className="mkt-network-note">
            <MapPin aria-hidden className="inline-icon" />
            Network cities are representative. Visit the network page for branch details.
          </p>
          <MarketingButton href="/network" variant="primary" className="mkt-btn-lg">
            Explore Network <ArrowRight aria-hidden className="mkt-btn-icon" />
          </MarketingButton>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="mkt-network-map-wrap mkt-network-map-premium" aria-hidden>
            <svg viewBox="0 0 100 100" className="mkt-network-map">
              <defs>
                <radialGradient id="netGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#0d9488" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#0b1f3a" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width="100" height="100" fill="url(#netGlow)" rx="4" />
              <path
                d="M30 70 L32 66 L24 62 M30 70 L38 38 L28 48 L24 62 M42 28 L38 38 L40 52 L48 58 M48 58 L48 72 L44 88 M40 52 L48 72"
                fill="none"
                stroke="rgba(13,148,136,0.35)"
                strokeWidth="0.4"
                strokeDasharray="1.5 1.5"
              />
              {networkCities.map((city) => {
                const pos = cityPositions[city] ?? { x: 50, y: 50 };
                return (
                  <g key={city}>
                    <circle cx={pos.x} cy={pos.y} r="1.8" fill="#0d9488" />
                    <circle cx={pos.x} cy={pos.y} r="3.5" fill="#0d9488" opacity="0.15" />
                    <text x={pos.x + 2.5} y={pos.y + 0.8} fontSize="3.2" fill="#334155" fontWeight="600">
                      {city.split(" ")[0]}
                    </text>
                  </g>
                );
              })}
            </svg>
            <div className="mkt-network-tags">
              {networkCities.slice(0, 6).map((city) => (
                <span key={city}>{city}</span>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
