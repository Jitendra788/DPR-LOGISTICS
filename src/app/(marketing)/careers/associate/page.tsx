import type { Metadata } from "next";
import { InnerPage } from "@/components/marketing/InnerPage";

export const metadata: Metadata = { title: "Business Associate" };

export default function AssociatePage() {
  return (
    <InnerPage
      eyebrow="Partner Center"
      title="Business Associate"
      subtitle="Work with DPR Logistics as a booking or delivery associate."
      cta={{ href: "/contact", label: "Contact Details" }}
    >
      <p>
        Associates help with local booking, delivery and customer coordination. Tell us your city, vehicle access and
        expected volume — our team will review and get back.
      </p>
    </InnerPage>
  );
}
