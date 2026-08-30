"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Phone } from "lucide-react";
import { homeBanners } from "@/data/marketing/banners";
import { BRAND_LOGO_HEADER } from "@/lib/brand";

const INTERVAL_MS = 6000;

export function HeroBannerCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = homeBanners.length;

  const next = useCallback(() => setActive((i) => (i + 1) % total), [total]);
  const prev = useCallback(() => setActive((i) => (i - 1 + total) % total), [total]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, INTERVAL_MS);
    return () => clearInterval(t);
  }, [next, paused]);

  return (
    <section
      className="mkt-banner-carousel"
      aria-label="Promotional banners"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mkt-banner-viewport">
        <div className="mkt-banner-track" style={{ transform: `translateX(-${active * 100}%)` }}>
          {homeBanners.map((banner) => (
            <article
              key={banner.id}
              className="mkt-banner-slide"
              style={{ background: banner.gradient }}
              aria-hidden={banner.id !== homeBanners[active]?.id}
            >
              <div className="mkt-banner-slide-bg" aria-hidden />
              <div className="mkt-container mkt-banner-slide-inner">
                <div className="mkt-banner-copy">
                  <Image
                    src={BRAND_LOGO_HEADER}
                    alt=""
                    width={140}
                    height={54}
                    className="mkt-banner-logo"
                    aria-hidden
                  />
                  <span className="mkt-banner-eyebrow">{banner.eyebrow}</span>
                  <h2>{banner.title}</h2>
                  <p>{banner.subtitle}</p>
                  {banner.cta ? (
                    <Link href={banner.cta.href} className="mkt-banner-cta">
                      {banner.cta.label}
                    </Link>
                  ) : null}
                </div>

                {banner.branches?.length ? (
                  <div className="mkt-banner-branches">
                    <h3>New &amp; Regular Lanes — Contact Details</h3>
                    <ul>
                      {banner.branches.map((b) => (
                        <li key={b.code}>
                          <MapPin aria-hidden size={14} />
                          <div>
                            <strong>
                              {b.code} — {b.name}
                            </strong>
                            <a href={`tel:${b.phone.replace(/\s/g, "")}`}>
                              <Phone aria-hidden size={12} /> {b.phone}
                            </a>
                            {b.phoneAlt ? (
                              <a href={`tel:${b.phoneAlt.replace(/\s/g, "")}`}>
                                <Phone aria-hidden size={12} /> {b.phoneAlt}
                              </a>
                            ) : null}
                            {b.email ? <span>{b.email}</span> : null}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="mkt-banner-visual" aria-hidden>
                    <div className="mkt-banner-truck">🚛</div>
                    <div className="mkt-banner-map-tags">
                      <span>Maharashtra</span>
                      <span>Gujarat</span>
                      <span>Karnataka</span>
                      <span>Delhi NCR</span>
                    </div>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>

      <button type="button" className="mkt-banner-nav mkt-banner-nav-prev" onClick={prev} aria-label="Previous banner">
        <ChevronLeft aria-hidden />
      </button>
      <button type="button" className="mkt-banner-nav mkt-banner-nav-next" onClick={next} aria-label="Next banner">
        <ChevronRight aria-hidden />
      </button>

      <div className="mkt-banner-dots" role="tablist" aria-label="Banner slides">
        {homeBanners.map((banner, idx) => (
          <button
            key={banner.id}
            type="button"
            role="tab"
            aria-selected={idx === active}
            aria-label={`Slide ${idx + 1}: ${banner.eyebrow}`}
            className={idx === active ? "active" : ""}
            onClick={() => setActive(idx)}
          />
        ))}
      </div>
    </section>
  );
}
