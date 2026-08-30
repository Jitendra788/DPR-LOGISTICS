import type { Metadata } from "next";
import { company } from "@/data/marketing/company";
import { InnerPage } from "@/components/marketing/InnerPage";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Terms & Conditions",
  description: `Terms and conditions for using ${company.name} cargo transport, tracking and booking services at dprlogistics.in.`,
  path: "/terms",
});

export default function TermsPage() {
  return (
    <InnerPage
      eyebrow="Legal"
      title="Terms & Conditions"
      subtitle={`By using the ${company.name} website and services, you agree to these terms for informational pages, quote requests and tracking.`}
    >
      <h2>Service scope</h2>
      <p>Quotes and tracking results shown on this website may use sample or mock data until connected to production logistics systems.</p>
      <h2>Customer responsibilities</h2>
      <p>Customers must provide accurate shipment details, lawful cargo descriptions and valid contact information for bookings and enquiries.</p>
      <h2>Liability</h2>
      <p>Final service terms, transit timelines and liability limits will be governed by signed agreements and applicable transport regulations.</p>
      <h2>Changes</h2>
      <p>{company.name} may update these terms periodically. Continued use of the website constitutes acceptance of the updated terms.</p>
    </InnerPage>
  );
}
