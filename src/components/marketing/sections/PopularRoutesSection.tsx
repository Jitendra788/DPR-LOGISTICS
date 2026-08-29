import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { getPopularRoutes } from "@/data/marketing/routes";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { ScrollReveal } from "@/components/marketing/ScrollReveal";
import { MarketingButton } from "@/components/marketing/Button";

export function PopularRoutesSection() {
  const routes = getPopularRoutes(6);

  return (
    <section className="mkt-section mkt-section-alt">
      <div className="mkt-container">
        <ScrollReveal>
          <SectionHeading
            eyebrow="Popular Routes"
            title="Cargo on key India lanes"
            subtitle="Regular part load and FTL from Kolhapur to Pune, Mumbai, Gujarat and pan-India metros."
          />
        </ScrollReveal>
        <div className="mkt-grid-3">
          {routes.map((route, idx) => (
            <ScrollReveal key={route.slug} delay={idx * 40}>
              <article className="mkt-route-card mkt-route-card-compact">
                <div className="mkt-route-card-head">
                  <MapPin aria-hidden size={16} />
                  <span>
                    {route.from} → {route.to}
                  </span>
                </div>
                <h3>
                  <Link href={`/routes/${route.slug}`}>{route.title}</Link>
                </h3>
                <p>{route.transitTime}</p>
                <Link href={`/routes/${route.slug}`} className="mkt-service-link">
                  Route details <ArrowRight aria-hidden size={14} />
                </Link>
              </article>
            </ScrollReveal>
          ))}
        </div>
        <div className="mkt-section-more">
          <MarketingButton href="/routes" variant="outline">
            View All Routes <ArrowRight aria-hidden className="mkt-btn-icon" />
          </MarketingButton>
        </div>
      </div>
    </section>
  );
}
