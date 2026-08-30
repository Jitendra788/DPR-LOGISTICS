import type { ReactNode } from "react";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { MarketingButton } from "./Button";

export function InnerPage({
  eyebrow,
  title,
  subtitle,
  children,
  cta,
  highlights,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  cta?: { href: string; label: string };
  highlights?: string[];
}) {
  return (
    <>
      <section className="mkt-page-hero mkt-page-hero-premium">
        <div className="mkt-container">
          <span className="mkt-eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </section>

      <section className="mkt-section mkt-inner-section">
        <div className="mkt-container mkt-inner-layout">
          <div className="mkt-inner-main mkt-prose mkt-prose-rich">
            <div className="mkt-inner-panel">{children}</div>
            {cta ? (
              <div className="mkt-inner-cta">
                <MarketingButton href={cta.href} className="mkt-btn-lg">
                  {cta.label} <ArrowRight aria-hidden className="mkt-btn-icon" />
                </MarketingButton>
              </div>
            ) : null}
          </div>

          <aside className="mkt-inner-aside">
            <div className="mkt-inner-aside-card">
              <div className="mkt-inner-aside-head">
                <Sparkles aria-hidden size={18} />
                <strong>Why DPR</strong>
              </div>
              <ul className="mkt-inner-highlights">
                {(
                  highlights ?? [
                    "Pan-India cargo network",
                    "GC / LR online tracking",
                    "GST billing & LR copy",
                    "Dedicated booking desk",
                  ]
                ).map((item) => (
                  <li key={item}>
                    <CheckCircle2 aria-hidden size={16} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <MarketingButton href="/quote" variant="outline" className="mkt-inner-aside-btn">
                Get a Quote
              </MarketingButton>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
