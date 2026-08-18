import type { Metadata } from "next";
import { MarketingFooter } from "@/components/marketing/Footer";
import { MarketingHeader } from "@/components/marketing/Header";
import { SiteChat } from "@/components/marketing/SiteChat";
import { company } from "@/data/marketing/company";
import "./marketing.css";
import "./marketing-premium.css";
import "./marketing-advanced.css";
import "./marketing-responsive.css";

export const metadata: Metadata = {
  title: {
    default: `${company.name} | Logistics & Cargo`,
    template: `%s | ${company.name}`,
  },
  description: company.description,
  openGraph: {
    title: company.name,
    description: company.description,
    type: "website",
  },
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="marketing-site mkt-quality">
      <MarketingHeader />
      <main>{children}</main>
      <MarketingFooter />
      <SiteChat />
    </div>
  );
}
