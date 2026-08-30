import type { Metadata } from "next";
import { Clock3, Mail, MapPin, Phone, MessageSquare } from "lucide-react";
import { company } from "@/data/marketing/company";
import { ContactForm } from "@/components/marketing/ContactForm";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Contact Us",
  description: `Contact ${company.name} for cargo booking, FTL/part load enquiries, tracking support and business partnerships. Call ${company.phone} or visit Kolhapur head office.`,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <section className="mkt-page-hero mkt-page-hero-premium">
        <div className="mkt-container">
          <span className="mkt-eyebrow">Contact Us</span>
          <h1>Talk to DPR Logistics</h1>
          <p>
            Booking desk, customer care and business enquiries — we respond quickly on phone, WhatsApp and email.
          </p>
        </div>
      </section>

      <section className="mkt-section mkt-lead-section">
        <div className="mkt-container mkt-lead-grid">
          <aside className="mkt-lead-aside">
            <div className="mkt-lead-card">
              <h2>Head Office</h2>
              <ul className="mkt-lead-list">
                <li>
                  <MapPin aria-hidden />
                  <span>{company.address}</span>
                </li>
                <li>
                  <Phone aria-hidden />
                  <a href={`tel:${company.phone.replace(/\s/g, "")}`}>{company.phone}</a>
                </li>
                {company.phoneAlt ? (
                  <li>
                    <Phone aria-hidden />
                    <a href={`tel:${company.phoneAlt.replace(/\s/g, "")}`}>{company.phoneAlt}</a>
                  </li>
                ) : null}
                <li>
                  <Mail aria-hidden />
                  <a href={`mailto:${company.email}`}>{company.email}</a>
                </li>
                <li>
                  <Clock3 aria-hidden />
                  <span>{company.workingHours}</span>
                </li>
              </ul>
            </div>

            <div className="mkt-lead-card mkt-lead-card-soft">
              <h3>
                <MessageSquare aria-hidden size={18} /> Quick help
              </h3>
              <p>For LR / GC tracking, billing or POD follow-up, call customer care or email us with your LR number.</p>
              <div className="mkt-lead-actions">
                <a className="mkt-btn mkt-btn-primary" href={`tel:${company.phone.replace(/\s/g, "")}`}>
                  Call Now
                </a>
                {company.phoneAlt ? (
                  <a className="mkt-btn mkt-btn-outline" href={`tel:${company.phoneAlt.replace(/\s/g, "")}`}>
                    {company.phoneAlt}
                  </a>
                ) : null}
                <a className="mkt-btn mkt-btn-outline" href={`mailto:${company.email}`}>
                  Email Us
                </a>
              </div>
            </div>
          </aside>

          <div className="mkt-lead-form-wrap">
            <div className="mkt-lead-form-head">
              <h2>Send a message</h2>
              <p>Your message goes directly to <strong>{company.email}</strong>.</p>
            </div>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
