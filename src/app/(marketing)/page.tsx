import { testimonials } from "@/data/marketing/company";
import { homeServices } from "@/data/marketing/homepage";
import { HeroBannerCarousel } from "@/components/marketing/HeroBannerCarousel";
import { HomeServiceCard } from "@/components/marketing/HomeServiceCard";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { Statistics } from "@/components/marketing/Statistics";
import { ScrollReveal } from "@/components/marketing/ScrollReveal";
import { CtaSection } from "@/components/marketing/sections/CtaSection";
import { HowItWorksSection } from "@/components/marketing/sections/HowItWorksSection";
import { PopularRoutesSection } from "@/components/marketing/sections/PopularRoutesSection";
import { BlogPreviewSection } from "@/components/marketing/sections/BlogPreviewSection";
import { TrackingSection } from "@/components/marketing/sections/TrackingSection";
import { ValuableCustomersSection } from "@/components/marketing/sections/ValuableCustomersSection";
import { WhyDprSection } from "@/components/marketing/sections/WhyDprSection";
import { company } from "@/data/marketing/company";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: company.seo.homeTitle,
  description: company.seo.homeDescription,
  path: "/",
  keywords: [
    "DPR Logistics",
    "DPR",
    "dprlogistics.in",
    "DPR Logistics Kolhapur",
    "logistics company India",
    "cargo transport Kolhapur",
    "Kagal MIDC logistics",
    "part load FTL transport",
    "GC LR tracking online",
    "lorry receipt tracking",
    "pan India logistics partner",
    "warehousing Maharashtra",
  ],
});

export default function HomePage() {
  return (
    <>
      <HeroBannerCarousel />

      <Statistics />

      <section className="mkt-section mkt-section-services">
        <div className="mkt-container">
          <ScrollReveal>
            <SectionHeading
              eyebrow="Our Services"
              title="Complete Logistics. One Reliable Partner."
              subtitle="From part-load shipments to dedicated transportation, we provide end-to-end logistics solutions."
            />
          </ScrollReveal>
          <div className="mkt-grid-3 mkt-services-grid">
            {homeServices.map((service, idx) => (
              <ScrollReveal key={service.id} delay={idx * 40}>
                <HomeServiceCard service={service} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <WhyDprSection />
      <HowItWorksSection />
      <TrackingSection />
      <PopularRoutesSection />

      <section className="mkt-section mkt-section-alt">
        <div className="mkt-container">
          <ScrollReveal>
            <SectionHeading
              eyebrow="Feedback"
              title="What shippers value in a logistics partner"
              subtitle="Illustrative examples — representative of common customer priorities, not verified reviews."
              align="center"
            />
          </ScrollReveal>
          <div className="mkt-quote-grid">
            {testimonials.map((t, idx) => (
              <ScrollReveal key={t.author + idx} delay={idx * 60}>
                <blockquote className="mkt-quote-card mkt-quote-card-premium">
                  <span className="mkt-demo-label">Illustrative</span>
                  <p>{t.quote}</p>
                  <footer>
                    <strong>{t.author}</strong>
                    <span>{t.company}</span>
                  </footer>
                </blockquote>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <BlogPreviewSection />

      <ValuableCustomersSection />

      <CtaSection />
    </>
  );
}
