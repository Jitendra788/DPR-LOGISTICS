import Link from "next/link";
import {
  ArrowRight,
  Globe2,
  Headphones,
  MapPin,
  Shield,
  Sparkles,
  Truck,
} from "lucide-react";
import { whyDprFeatures, whyDprSubtitle } from "@/data/marketing/homepage";
import { ScrollReveal } from "@/components/marketing/ScrollReveal";
import { SectionHeading } from "@/components/marketing/SectionHeading";

const icons = [Globe2, MapPin, Shield, Truck, Headphones, Sparkles];

export function WhyDprSection() {
  return (
    <section className="mkt-section mkt-why-section">
      <div className="mkt-container mkt-why-grid">
        <ScrollReveal className="mkt-why-visual">
          <div className="mkt-why-visual-inner mkt-why-visual-premium" aria-hidden>
            <div className="mkt-why-visual-badge">
              <Truck />
              <span>Nationwide Operations</span>
            </div>
            <div className="mkt-why-visual-map">
              <svg viewBox="0 0 400 420" className="mkt-india-map" role="img" aria-label="India network illustration">
                <defs>
                  <linearGradient id="whyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0d9488" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#0b1f3a" stopOpacity="0.15" />
                  </linearGradient>
                </defs>
                <path
                  d="M200 30 C240 50 280 80 290 120 C300 160 320 200 310 240 C300 280 280 320 250 350 C220 380 180 390 150 370 C120 350 90 320 80 280 C70 240 90 200 110 160 C130 120 160 50 200 30 Z"
                  fill="url(#whyGrad)"
                  stroke="rgba(13,148,136,0.35)"
                  strokeWidth="1.5"
                />
                {[
                  [200, 80], [240, 140], [180, 180], [220, 240], [170, 300], [250, 320],
                ].map(([cx, cy], i) => (
                  <g key={i}>
                    <circle cx={cx} cy={cy} r="6" fill="#0d9488" opacity="0.9" />
                    <circle cx={cx} cy={cy} r="12" fill="#0d9488" opacity="0.15" />
                  </g>
                ))}
                <path
                  d="M200 80 L240 140 L180 180 L220 240"
                  fill="none"
                  stroke="rgba(13,148,136,0.4)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
              </svg>
            </div>
            <div className="mkt-why-visual-stat">
              <strong>50+</strong>
              <span>Network Points</span>
            </div>
          </div>
        </ScrollReveal>

        <div>
          <SectionHeading
            eyebrow="Why DPR Logistics"
            title="Why businesses choose DPR"
            subtitle={whyDprSubtitle}
          />
          <ol className="mkt-why-list">
            {whyDprFeatures.map((item, idx) => {
              const Icon = icons[idx] ?? Globe2;
              return (
                <ScrollReveal key={item.num} delay={idx * 60}>
                  <li className="mkt-why-item mkt-why-item-premium">
                    <span className="mkt-why-num">{item.num}</span>
                    <span className="mkt-why-icon">
                      <Icon aria-hidden />
                    </span>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </div>
                  </li>
                </ScrollReveal>
              );
            })}
          </ol>
          <Link href="/about" className="mkt-why-link">
            Learn about DPR <ArrowRight aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
