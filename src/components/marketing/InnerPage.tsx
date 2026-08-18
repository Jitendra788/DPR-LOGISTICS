import type { ReactNode } from "react";
import { MarketingButton } from "./Button";

export function InnerPage({
  eyebrow,
  title,
  subtitle,
  children,
  cta,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  cta?: { href: string; label: string };
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
      <section className="mkt-section">
        <div className="mkt-container mkt-prose">
          {children}
          {cta ? (
            <p style={{ marginTop: "1.75rem" }}>
              <MarketingButton href={cta.href}>{cta.label}</MarketingButton>
            </p>
          ) : null}
        </div>
      </section>
    </>
  );
}
