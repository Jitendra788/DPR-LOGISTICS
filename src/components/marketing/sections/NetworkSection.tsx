import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { ScrollReveal } from "@/components/marketing/ScrollReveal";
import { MarketingButton } from "@/components/marketing/Button";

/** Primary north–south corridor shown on the India network map */
const corridor = [
  { id: "delhi", label: "Delhi", x: 52, y: 12, labelSide: "top" as const },
  { id: "ahmedabad", label: "Ahmedabad", x: 34, y: 34, labelSide: "left" as const },
  { id: "mumbai", label: "Mumbai", x: 48, y: 52, labelSide: "right" as const },
  { id: "kolhapur", label: "Kolhapur", x: 56, y: 70, labelSide: "right" as const, hub: true },
  { id: "bangalore", label: "Bangalore", x: 68, y: 88, labelSide: "right" as const },
];

export function NetworkSection() {
  const pathD = corridor.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");

  return (
    <section className="mkt-section mkt-network-section mkt-network-section-premium">
      <div className="mkt-container mkt-network-grid">
        <ScrollReveal>
          <SectionHeading
            eyebrow="India Network Map"
            title="Our network across India"
            subtitle="A clear north–south corridor linking Delhi, Ahmedabad, Mumbai, Kolhapur and Bangalore — with pan-India branch coverage beyond these hubs."
          />
          <MarketingButton href="/network" variant="primary" className="mkt-btn-lg">
            Explore Network <ArrowRight aria-hidden className="mkt-btn-icon" />
          </MarketingButton>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="mkt-network-map-wrap mkt-network-map-premium mkt-network-corridor">
            <svg
              viewBox="0 0 100 100"
              className="mkt-network-map"
              role="img"
              aria-label="India network corridor: Delhi to Ahmedabad to Mumbai to Kolhapur to Bangalore"
            >
              <defs>
                <linearGradient id="corridorGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0b1f33" stopOpacity="0.04" />
                  <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#0b1f33" stopOpacity="0.04" />
                </linearGradient>
                <linearGradient id="corridorLine" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
              </defs>

              <rect width="100" height="100" fill="url(#corridorGlow)" rx="3" />

              {/* Soft India silhouette hint */}
              <path
                className="mkt-network-india-hint"
                d="M48 8 C58 10 66 18 68 28 C72 40 78 48 76 58 C74 70 70 80 64 90 C58 96 50 98 42 94 C34 90 28 80 26 68 C24 56 28 46 32 36 C36 24 40 12 48 8 Z"
                fill="rgba(11,31,51,0.04)"
                stroke="rgba(11,31,51,0.08)"
                strokeWidth="0.35"
              />

              {/* Corridor spine */}
              <path
                d={pathD}
                fill="none"
                stroke="url(#corridorLine)"
                strokeWidth="0.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mkt-network-corridor-line"
              />
              <path
                d={pathD}
                fill="none"
                stroke="rgba(245,158,11,0.25)"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {corridor.map((city) => {
                const labelX =
                  city.labelSide === "left" ? city.x - 4 : city.labelSide === "top" ? city.x : city.x + 4;
                const labelY =
                  city.labelSide === "top" ? city.y - 5 : city.y + 1.2;
                const anchor =
                  city.labelSide === "left" ? "end" : city.labelSide === "top" ? "middle" : "start";

                return (
                  <g key={city.id} className={city.hub ? "mkt-network-hub" : undefined}>
                    <circle
                      cx={city.x}
                      cy={city.y}
                      r={city.hub ? 4.2 : 3.2}
                      fill="rgba(245,158,11,0.18)"
                      className="mkt-network-node-ring"
                    />
                    <circle
                      cx={city.x}
                      cy={city.y}
                      r={city.hub ? 2.2 : 1.7}
                      fill={city.hub ? "#0b1f33" : "#f59e0b"}
                      stroke="#ffffff"
                      strokeWidth="0.6"
                    />
                    <text
                      x={labelX}
                      y={labelY}
                      textAnchor={anchor}
                      className="mkt-network-city-label"
                      fill="#172033"
                      fontSize="3.6"
                      fontWeight="700"
                      letterSpacing="0.06"
                    >
                      {city.label.toUpperCase()}
                    </text>
                    {city.hub ? (
                      <text
                        x={city.x + 4}
                        y={city.y + 5}
                        textAnchor="start"
                        fill="#d97706"
                        fontSize="2.4"
                        fontWeight="600"
                      >
                        HQ
                      </text>
                    ) : null}
                  </g>
                );
              })}
            </svg>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
