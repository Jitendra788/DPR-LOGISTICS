import { Building2, Factory, Package, ShoppingBag, Truck, Warehouse } from "lucide-react";
import { businessSolutions } from "@/data/marketing/businessSolutions";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { ScrollReveal } from "@/components/marketing/ScrollReveal";
import Link from "next/link";

const icons = [Building2, ShoppingBag, Package, Factory, Warehouse, Truck];

export function BusinessSolutionsSection() {
  return (
    <section className="mkt-section mkt-solutions-dark">
      <div className="mkt-container">
        <ScrollReveal>
          <SectionHeading
            eyebrow="Business Solutions"
            title="Logistics Solutions Built Around Your Business"
            subtitle="Tailored transport and distribution programmes for every industry segment."
            align="center"
          />
        </ScrollReveal>
        <div className="mkt-solutions-dark-grid">
          {businessSolutions.map((item, idx) => {
            const Icon = icons[idx] ?? Building2;
            return (
              <ScrollReveal key={item.id} delay={idx * 50}>
                <Link href="/business-solutions" className="mkt-solution-dark-card">
                  <span className="mkt-solution-dark-icon">
                    <Icon aria-hidden />
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
