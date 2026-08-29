"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { company } from "@/data/marketing/company";
import { marketingMobileNav, marketingNav, type NavItem } from "@/data/marketing/nav";

function isActive(pathname: string, item: NavItem) {
  if (item.href && pathname === item.href) return true;
  return item.children?.some((c) => pathname === c.href || pathname.startsWith(`${c.href}/`)) ?? false;
}

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
          {marketingNav.map((item) =>
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
          <Link href="/tracking" className="mkt-header-track-btn">
            Track Shipment
          </Link>
          <Link href="/quote" className="mkt-header-quote-btn">
            Get Quote
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
            {marketingMobileNav.map((item) =>
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
          </nav>
        </div>
      ) : null}
    </header>
  );
}
