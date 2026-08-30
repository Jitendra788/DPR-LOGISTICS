import Image from "next/image";
import { valuableCustomers } from "@/data/marketing/company";
import { ScrollReveal } from "@/components/marketing/ScrollReveal";

export function ValuableCustomersSection() {
  const logos = [...valuableCustomers, ...valuableCustomers];

  return (
    <section className="mkt-clients" aria-labelledby="valuable-customers-title">
      <div className="mkt-container">
        <ScrollReveal>
          <div className="mkt-clients-head">
            <h2 id="valuable-customers-title">Our Clients</h2>
            <span className="mkt-clients-rule" aria-hidden />
          </div>
        </ScrollReveal>
      </div>

      <div className="mkt-clients-marquee" aria-label="Valuable customer logos">
        <div className="mkt-clients-track">
          {logos.map((client, idx) => (
            <div key={`${client.id}-${idx}`} className="mkt-clients-item">
              <Image
                src={client.logo}
                alt={client.name}
                width={240}
                height={100}
                className="mkt-clients-logo"
                quality={95}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
