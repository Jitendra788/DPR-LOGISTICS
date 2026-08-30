import Link from "next/link";
import { company } from "@/data/marketing/company";

export function ContactStripSection() {
  return (
    <section className="mkt-contact-strip" aria-labelledby="contact-strip-title">
      <div className="mkt-container mkt-contact-strip-inner">
        <p className="mkt-contact-strip-kicker">We&apos;d love to hear from you!</p>
        <h2 id="contact-strip-title" className="mkt-contact-strip-title">
          Contact us:
        </h2>
        <p className="mkt-contact-strip-brand">{company.name.toUpperCase()}</p>
        <address className="mkt-contact-strip-address">
          {company.addressLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </address>
        <p className="mkt-contact-strip-phones">
          Mobile No.{" "}
          <a href={`tel:${company.phone.replace(/\s/g, "")}`}>{company.phone.replace("+91 ", "")}</a>
          {company.phoneAlt ? (
            <>
              , <a href={`tel:${company.phoneAlt.replace(/\s/g, "")}`}>{company.phoneAlt.replace("+91 ", "")}</a>
            </>
          ) : null}
        </p>
        <div className="mkt-contact-strip-actions">
          <Link href="/quote">Pickup Request</Link>
          <Link href="/contact">Contact Page</Link>
          <Link href="/tracking">Track Shipment</Link>
        </div>
      </div>
    </section>
  );
}
