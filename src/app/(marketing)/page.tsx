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
import { getLatestPosts } from "@/services/blogService";
import { company } from "@/data/marketing/company";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: company.seo.homeTitle,
  description: company.seo.homeDescription,
  path: "/",
  keywords: [
    "best transport company Kolhapur",
    "cheap part load Kolhapur",
    "goods carrier Kolhapur",
    "truck hire Kolhapur",
    "parcel cargo transport Maharashtra",
  ],
});

export const revalidate = 60;

export default async function HomePage() {
  const latestPosts = await getLatestPosts(3);

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

      <BlogPreviewSection posts={latestPosts} />

      <ValuableCustomersSection />

      <CtaSection />
    </>
  );
}
