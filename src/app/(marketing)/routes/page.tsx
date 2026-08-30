import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, Truck } from "lucide-react";
import { transportRoutes } from "@/data/marketing/routes";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Cargo Routes | Kolhapur to Pune, Mumbai, Bangalore & More",
  description:
    "Popular DPR Logistics cargo routes from Kolhapur — Pune, Mumbai, Ahmedabad, Surat, Bangalore, Delhi, Hyderabad, Chennai. Part load & FTL with online GC/LR tracking.",
  path: "/routes",
  keywords: [
    "Kolhapur to Pune part load",
    "Kolhapur to Mumbai transport rate",
    "Kolhapur to Bangalore cargo",
    "Kolhapur to Ahmedabad FTL",
    "Kolhapur to Surat transport",
    "Kolhapur to Delhi goods transport",
    "Maharashtra Gujarat cargo route",
  ],
});

export default function RoutesPage() {
  return (
    <>
      <section className="mkt-page-hero mkt-page-hero-premium">
        <div className="mkt-container">
          <span className="mkt-eyebrow">Routes</span>
          <h1>Popular Cargo Routes</h1>
          <p>
            Regular part load and FTL lanes from Kolhapur across Maharashtra, Gujarat and pan-India metros.
            Select your route for service details, transit times and booking.
          </p>
        </div>
      </section>

      <section className="mkt-section">
        <div className="mkt-container">
          <div className="mkt-grid-3">
            {transportRoutes.map((route) => (
              <article key={route.slug} className="mkt-route-card">
                <div className="mkt-route-card-head">
                  <MapPin aria-hidden size={18} />
                  <span>
                    {route.from} → {route.to}
                  </span>
                </div>
                <h2>
                  <Link href={`/routes/${route.slug}`}>{route.title}</Link>
                </h2>
                <p>{route.description}</p>
                <ul className="mkt-route-stats">
                  <li><Truck aria-hidden size={14} /> {route.distance}</li>
                  <li><ClockIcon /> {route.transitTime}</li>
                </ul>
                <Link href={`/routes/${route.slug}`} className="mkt-service-link">
                  View route details <ArrowRight aria-hidden size={16} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function ClockIcon() {
  return (
    <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}
