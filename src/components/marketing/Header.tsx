"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, Phone, X } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { company } from "@/data/marketing/company";
import { marketingNav, type NavItem } from "@/data/marketing/nav";

const TRACKING_HREF = "/tracking";

function isActive(pathname: string, item: NavItem) {
  if (item.href && pathname === item.href) return true;
  return item.children?.some((c) => pathname === c.href || pathname.startsWith(`${c.href}/`)) ?? false;
}

/** Nav items excluding GC Tracking — shown as header CTA instead */
const headerNav = marketingNav.filter((item) => item.href !== TRACKING_HREF);

export function MarketingHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [expanded, setExpanded] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setExpanded("");
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("mkt-nav-open", open);
    return () => document.body.classList.remove("mkt-nav-open");
  }, [open]);

  return (
    <header className={`mkt-header ${scrolled ? "mkt-header-scrolled" : ""}`}>
      <div className="mkt-container mkt-header-inner">
        <div className="mkt-header-brand">
          <Link href="/" className="mkt-brand" aria-label={`${company.name} home`}>
            <BrandLogo variant="header" priority className="mkt-brand-logo" />
          </Link>
        </div>

        <nav className="mkt-nav" aria-label="Main navigation">
          {headerNav.map((item) =>
            item.children ? (
              <div key={item.label} className="mkt-nav-drop">
                <Link
                  href={item.href || item.children[0].href}
                  className={isActive(pathname, item) ? "mkt-nav-link active" : "mkt-nav-link"}
                >
                  {item.label}
                  <ChevronDown aria-hidden className="mkt-nav-caret" />
                </Link>
                <div className="mkt-nav-menu">
                  {item.children.map((child) => (
                    <Link key={child.href} href={child.href} className={pathname === child.href ? "active" : ""}>
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={item.label}
                href={item.href || "/"}
                className={pathname === item.href ? "mkt-nav-link active" : "mkt-nav-link"}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="mkt-header-cta">
          <div className="mkt-header-phone">
            <span className="mkt-header-phone-icon">
              <Phone aria-hidden />
            </span>
            <span className="mkt-header-phone-text">
              <span className="mkt-header-phone-label">Talk To Us</span>
              <a href={`tel:${company.phone.replace(/\s/g, "")}`} className="mkt-header-phone-num">
                {company.phone}
              </a>
              {company.phoneAlt ? (
                <a href={`tel:${company.phoneAlt.replace(/\s/g, "")}`} className="mkt-header-phone-num mkt-header-phone-alt">
                  {company.phoneAlt}
                </a>
              ) : null}
            </span>
          </div>
          <Link href={TRACKING_HREF} className="mkt-header-track-btn">
            GC Tracking
          </Link>
          <button type="button" className="mkt-menu-btn" aria-label="Open menu" onClick={() => setOpen(true)}>
            <Menu aria-hidden />
          </button>
        </div>
      </div>

      {open ? (
        <div className="mkt-mobile-nav" role="dialog" aria-modal="true" aria-label="Mobile menu">
          <button type="button" className="mkt-mobile-close" aria-label="Close menu" onClick={() => setOpen(false)}>
            <X aria-hidden />
          </button>
          <nav className="mkt-mobile-links">
            {marketingNav.map((item) =>
              item.children ? (
                <div key={item.label}>
                  <button
                    type="button"
                    className="mkt-mobile-acc"
                    onClick={() => setExpanded((v) => (v === item.label ? "" : item.label))}
                  >
                    {item.label}
                    <ChevronDown aria-hidden className={expanded === item.label ? "mkt-acc-open" : ""} />
                  </button>
                  {expanded === item.label
                    ? item.children.map((child) => (
                        <Link key={child.href} href={child.href} className="mkt-mobile-sub">
                          {child.label}
                        </Link>
                      ))
                    : null}
                </div>
              ) : (
                <Link
                  key={item.label}
                  href={item.href || "/"}
                  className={`${pathname === item.href ? "active" : ""}${item.highlight ? " mkt-mobile-track" : ""}`}
                >
                  {item.label}
                </Link>
              ),
            )}
            <a href={`tel:${company.phone.replace(/\s/g, "")}`} className="mkt-mobile-phone">
              <Phone aria-hidden /> Talk to us — {company.phone}
            </a>
            {company.phoneAlt ? (
              <a href={`tel:${company.phoneAlt.replace(/\s/g, "")}`} className="mkt-mobile-phone">
                <Phone aria-hidden /> {company.phoneAlt}
              </a>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
