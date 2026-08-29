import type { Metadata } from "next";
import { ContactForm } from "@/components/marketing/ContactForm";
import { InnerPage } from "@/components/marketing/InnerPage";

import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Service Complaint",
  description: "Raise a service complaint with DPR Logistics. Share your LR number and shipment details for prompt resolution.",
  path: "/contact/complaint",
});

export default function ComplaintPage() {
  return (
    <InnerPage eyebrow="Contact Us" title="Service Complaint" subtitle="Share LR number, date and the issue. We will follow up.">
      <ContactForm />
    </InnerPage>
  );
}
