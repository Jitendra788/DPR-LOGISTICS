import type { Metadata } from "next";
import { JsonLd } from "@/components/marketing/JsonLd";
import { absoluteUrl, createPageMetadata, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "DPR Login | Admin Portal & Staff Sign In",
  description:
    "DPR Logistics login — sign in to the DPR admin portal at dprlogistics.in. Staff access for bookings, fleet, drivers, billing, POD and operations. DPR Logistics Kolhapur (SP Group).",
  path: "/login",
  keywords: [
    "DPR",
    "DPR login",
    "DPR Logistics login",
    "dprlogistics login",
    "dprlogistics.in login",
    "DPR Logistics admin",
    "DPR admin login",
    "DPR admin portal",
    "DPR Logistics staff login",
    "DPR ERP login",
    "DPR transport login",
    "DPR Logistics Kolhapur login",
    "DPR Logistics Kagal login",
    "SP Group DPR login",
    "DPR Logistics sign in",
    "DPR dashboard login",
    "transport management system login",
    "logistics ERP login India",
  ],
});

const loginJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "DPR Logistics Login | Admin Portal",
  description:
    "Official DPR Logistics staff login page for admin portal access at dprlogistics.in.",
  url: absoluteUrl("/login"),
  isPartOf: {
    "@type": "WebSite",
    name: SITE_NAME,
    url: absoluteUrl("/"),
  },
  about: {
    "@type": "Organization",
    name: SITE_NAME,
    alternateName: ["DPR", "DPR Logistics Kolhapur", "dprlogistics.in"],
    url: absoluteUrl("/"),
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={loginJsonLd} />
      {children}
    </>
  );
}
