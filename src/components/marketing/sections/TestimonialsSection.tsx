import { Quote, ShieldCheck } from "lucide-react";
import { testimonials } from "@/data/marketing/company";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { ScrollReveal } from "@/components/marketing/ScrollReveal";

export function TestimonialsSection() {
  return (
    <section className="mkt-section mkt-section-alt mkt-testimonials-section">
      <div className="mkt-container">
        <ScrollReveal>
          <SectionHeading
            eyebrow="Clients"
            title="Verified client feedback"
            subtitle="Real shippers on reliability, booking support and lane performance."
            align="center"
          />
        </ScrollReveal>
        <div className="mkt-testimonials-grid">
          {testimonials.map((item, idx) => (
            <ScrollReveal key={`${item.author}-${idx}`} delay={idx * 50}>
              <blockquote className="mkt-testimonial">
                <div className="mkt-testimonial-badge">
                  <ShieldCheck aria-hidden /> Verified client
                </div>
                <Quote aria-hidden className="mkt-testimonial-quote-icon" />
                <p>{item.quote}</p>
                <footer>
                  <strong>{item.author}</strong>
                  <span>{item.company}</span>
                </footer>
              </blockquote>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
