import type { Metadata } from "next";
import { MarketingFooter } from "@/components/marketing/Footer";
import { GstinBar } from "@/components/marketing/GstinBar";
import { MarketingHeader } from "@/components/marketing/Header";
import { GoogleAnalytics } from "@/components/marketing/GoogleAnalytics";
import { JsonLd } from "@/components/marketing/JsonLd";
import { company } from "@/data/marketing/company";
import { BRAND_LOGO } from "@/lib/brand";
import { localBusinessJsonLd, organizationJsonLd, SITE_URL, websiteJsonLd } from "@/lib/seo";
import "./marketing.css";
import "./marketing-premium.css";
import "./marketing-advanced.css";
import "./marketing-responsive.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${company.name} | ${company.seo.homeTitle}`,
    template: `%s | ${company.name}`,
  },
  description: company.seo.homeDescription,
  keywords: [
    "DPR Logistics",
    "dprlogistics.in",
    "DPR Logistics Kolhapur",
    "logistics company Kolhapur",
    "Kagal MIDC transport",
    "cargo transport India",
    "part load transport Maharashtra",
    "FTL transport India",
    "trailer container logistics",
    "GC LR tracking",
    "lorry receipt tracking",
    "warehousing Kolhapur",
  ],
  authors: [{ name: company.name }],
  creator: company.name,
  publisher: company.name,
  formatDetection: { telephone: true, email: true },
  openGraph: {
    title: `${company.name} | Logistics & Cargo Transport India`,
    description: company.seo.homeDescription,
    type: "website",
    locale: "en_IN",
    siteName: company.name,
    url: SITE_URL,
    images: [{ url: "/dpr-logo-header.png", alt: `${company.name} — SP Group` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${company.name} | Logistics & Cargo Transport India`,
    description: company.seo.homeDescription,
    images: ["/dpr-logo-header.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  verification: {
    google: "L0nGHhK4YuuEZF9W77Ao_qlpmENIrrLyATFVYrwNldI",
  },
  icons: {
    icon: [
      { url: BRAND_LOGO, type: "image/jpeg" },
      { url: "/dpr-logo-header.png", type: "image/png" },
    ],
    apple: BRAND_LOGO,
    shortcut: BRAND_LOGO,
  },
  applicationName: company.name,
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="marketing-site mkt-quality">
      <GoogleAnalytics />
      <JsonLd data={[organizationJsonLd(), localBusinessJsonLd(), websiteJsonLd()]} />
      <MarketingHeader />
      <main>{children}</main>
      <GstinBar />
      <MarketingFooter />
    </div>
  );
}
