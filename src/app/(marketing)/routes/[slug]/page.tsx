import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTransportRoute, transportRoutes } from "@/data/marketing/routes";
import { company } from "@/data/marketing/company";
import { JsonLd } from "@/components/marketing/JsonLd";
import { MarketingButton } from "@/components/marketing/Button";
import { absoluteUrl, createPageMetadata, faqJsonLd, routeJsonLd } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return transportRoutes.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const route = getTransportRoute(slug);
  if (!route) return { title: "Route" };
  return createPageMetadata({
    title: `${route.title} | Part Load & FTL`,
    description: route.seoDescription,
    path: `/routes/${slug}`,
    keywords: [
      route.title,
      `${route.from} to ${route.to} transport`,
      `${route.from} to ${route.to} part load`,
      `${route.from} to ${route.to} FTL`,
      `${route.from} to ${route.to} cargo`,
      "goods transport booking",
    ],
  });
}

export default async function RouteDetailPage({ params }: Props) {
  const { slug } = await params;
  const route = getTransportRoute(slug);
  if (!route) notFound();

  const url = absoluteUrl(`/routes/${slug}`);

  return (
    <>
      <JsonLd data={[routeJsonLd(route, url), faqJsonLd(route.faqs)]} />
      <section className="mkt-page-hero mkt-page-hero-premium">
        <div className="mkt-container">
          <span className="mkt-eyebrow">Transport Route</span>
          <h1>{route.title}</h1>
          <p>{route.description}</p>
          <div className="mkt-route-hero-stats">
            <span>{route.distance}</span>
            <span>{route.transitTime}</span>
            <span>{route.stateFrom} → {route.stateTo}</span>
          </div>
        </div>
      </section>

      <section className="mkt-section">
        <div className="mkt-container mkt-prose">
          <h2>Services on this lane</h2>
          <ul>
            {route.services.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>

          <h2>Why shippers choose DPR on {route.from}–{route.to}</h2>
          <ul>
            {route.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>

          <h2>FAQs — {route.from} to {route.to}</h2>
          {route.faqs.map((f) => (
            <div key={f.q}>
              <p><strong>{f.q}</strong></p>
              <p>{f.a}</p>
            </div>
          ))}

          <div className="mkt-cta-band" style={{ marginTop: "2.5rem" }}>
            <div>
              <h3>Book {route.from} to {route.to} transport</h3>
              <p>Request pickup or call {company.phone} for contract lane rates.</p>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <MarketingButton href="/quote" variant="secondary">Pickup Request</MarketingButton>
              <MarketingButton href="/tracking" variant="outline">Track Shipment</MarketingButton>
            </div>
          </div>

          <p style={{ marginTop: "2rem" }}>
            <Link href="/routes" className="mkt-service-link">← All routes</Link>
          </p>
        </div>
      </section>
    </>
  );
}
