import type { Metadata } from "next";
import Link from "next/link";
import { extraServices, transportServices } from "@/data/marketing/services";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { ServiceCard } from "@/components/marketing/ServiceCard";
import { MarketingButton } from "@/components/marketing/Button";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Part Load, FTL, Trailer & Warehousing Services",
  description:
    "DPR Logistics services in Kolhapur — part load booking, full truck load (FTL), trailer, container, ODC cargo and warehousing across Maharashtra, Gujarat and pan-India. Request pickup online.",
  path: "/services",
  keywords: [
    "part load service Kolhapur",
    "FTL service Maharashtra",
    "trailer booking India",
    "container cargo transport",
    "ODC project cargo",
    "warehouse for rent Kolhapur",
    "goods transport services India",
  ],
});

export default function ServicesPage() {
  return (
    <>
      <section className="mkt-page-hero mkt-page-hero-premium">
        <div className="mkt-container">
          <span className="mkt-eyebrow">Services</span>
          <h1>Transport & Cargo Services</h1>
          <p>
            Part load, full truck load, trailers, containers and warehousing — with online GC/LR tracking, pickup
            requests and dedicated customer care across India.
          </p>
        </div>
      </section>
      <section className="mkt-section">
        <div className="mkt-container">
          <SectionHeading eyebrow="Transport Service" title="Move cargo the way your business needs" />
          <div className="mkt-grid-3">
            {transportServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
          <div className="mkt-highlight-grid mkt-section-stack">
            {extraServices.map((block) => (
              <article key={block.id} className="mkt-highlight-card">
                <h3>{block.title}</h3>
                <ul>
                  {block.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                <Link href={block.href} className="mkt-service-link">Read More</Link>
              </article>
            ))}
          </div>
          <div className="mkt-cta-band">
            <div>
              <h3>Need a pickup?</h3>
              <p>Share route and cargo details — our desk will confirm the best service.</p>
            </div>
            <MarketingButton href="/quote" variant="secondary">Pickup Request</MarketingButton>
          </div>
        </div>
      </section>
    </>
  );
}
