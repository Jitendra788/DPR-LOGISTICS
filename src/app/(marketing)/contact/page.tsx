import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
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
      <section className="mkt-page-hero">
        <div className="mkt-container">
          <span className="mkt-eyebrow">Contact</span>
          <h1>We&apos;re here to help</h1>
          <p>Reach our team for booking support, business enquiries or partnership discussions.</p>
        </div>
      </section>

      <section className="mkt-section">
        <div className="mkt-container mkt-contact-grid">
          <div className="mkt-contact-card">
            <h3>Head Office</h3>
            <p><MapPin aria-hidden style={{ display: "inline", width: 16, marginRight: 6 }} /> {company.address}</p>
            <a href={`tel:${company.phone.replace(/\s/g, "")}`}>
              <Phone aria-hidden style={{ display: "inline", width: 16, marginRight: 6 }} /> {company.phone}
            </a>
            <a href={`tel:${company.supportPhone.replace(/\s/g, "")}`}>
              Support: {company.supportPhone}
            </a>
            <a href={`mailto:${company.email}`}>
              <Mail aria-hidden style={{ display: "inline", width: 16, marginRight: 6 }} /> {company.email}
            </a>
            <p>{company.workingHours}</p>
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
