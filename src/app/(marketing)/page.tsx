import { homeServices } from "@/data/marketing/homepage";
import { Hero } from "@/components/marketing/Hero";
import { HomeServiceCard } from "@/components/marketing/HomeServiceCard";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { Statistics } from "@/components/marketing/Statistics";
import { ScrollReveal } from "@/components/marketing/ScrollReveal";
import { BusinessSolutionsSection } from "@/components/marketing/sections/BusinessSolutionsSection";
import { CtaSection } from "@/components/marketing/sections/CtaSection";
import { HowItWorksSection } from "@/components/marketing/sections/HowItWorksSection";
import { NetworkSection } from "@/components/marketing/sections/NetworkSection";
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
    "part load FTL transport",
    "GC LR tracking online",
    "pan India logistics partner",
  ],
});

export default function HomePage() {
  return (
    <>
      <Hero />

      <Statistics />

      <section className="mkt-section mkt-section-services">
        <div className="mkt-container">
          <ScrollReveal>
            <SectionHeading
              eyebrow="Our Services"
              title="Complete Logistics. One Reliable Partner."
              subtitle="Part load, full truck load, trailers, containers and warehousing — with tracking and customer care."
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
      <NetworkSection />
      <BusinessSolutionsSection />
      <CtaSection />
    </>
  );
}
