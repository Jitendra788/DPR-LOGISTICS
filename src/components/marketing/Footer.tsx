import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { company } from "@/data/marketing/company";

export function MarketingFooter() {
  return (
    <footer className="mkt-footer mkt-footer-premium">
      <div className="mkt-container">
        <div className="mkt-footer-grid mkt-footer-grid-wire">
          <div className="mkt-footer-brand-col">
            <BrandLogo variant="header" width={180} height={70} className="mkt-footer-logo" />
            <p className="mkt-footer-brand-name">{company.name}</p>
            <p className="mkt-footer-tagline">Moving India Forward.</p>
            <p className="mkt-footer-text">{company.shortDescription}</p>
            <div className="mkt-footer-social">
              <a href={company.social.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
              <a href={company.social.instagram} target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
              <a href={company.social.facebook} target="_blank" rel="noopener noreferrer">
                Facebook
              </a>
            </div>
          </div>

          <div>
            <h3>Company</h3>
            <ul>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/about/management">Management</Link></li>
              <li><Link href="/about/milestone">Milestones</Link></li>
              <li><Link href="/careers">Careers</Link></li>
            </ul>
          </div>

          <div>
            <h3>Services</h3>
            <ul>
              <li><Link href="/services/part-load">Part Load</Link></li>
              <li><Link href="/services/ftl">FTL</Link></li>
              <li><Link href="/services/trailers">Trailers</Link></li>
              <li><Link href="/services/containers">Containers</Link></li>
              <li><Link href="/services/warehousing">Warehousing</Link></li>
            </ul>
          </div>

          <div>
            <h3>Quick Access</h3>
            <ul>
              <li><Link href="/tracking">Track Shipment</Link></li>
              <li><Link href="/quote">Get Quote</Link></li>
              <li><Link href="/quote">Pickup Request</Link></li>
              <li><Link href="/network">Network</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3>Contact</h3>
            <ul className="mkt-footer-contact-list">
              <li>
                <a href={`tel:${company.phone.replace(/\s/g, "")}`}>
                  <Phone aria-hidden /> {company.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${company.email}`}>
                  <Mail aria-hidden /> {company.email}
                </a>
              </li>
              <li>
                <span>
                  <MapPin aria-hidden /> {company.address}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mkt-footer-bottom-bar">
        <div className="mkt-container mkt-footer-bottom">
          <p suppressHydrationWarning>
            © {new Date().getFullYear()} {company.name}. All rights reserved.
          </p>
          <div className="mkt-footer-legal">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms &amp; Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
