import type { Metadata } from "next";
import { InnerPage } from "@/components/marketing/InnerPage";

export const metadata: Metadata = { title: "Careers" };

export default function CareersPage() {
  return (
    <InnerPage
      eyebrow="Careers"
      title="Work Culture"
      subtitle="Join a hands-on logistics team that values reliability and customer care."
      cta={{ href: "/careers/openings", label: "Current Openings" }}
    >
      <p>
        At DPR Logistics we run bookings, fleet, billing and customer support as one operation. We look for people who
        take ownership of consignments and communicate clearly with customers and vendors.
      </p>
      <p>Talent development happens on the job — branch operations, LHC coordination, POD follow-up and accounts.</p>
    </InnerPage>
  );
}
