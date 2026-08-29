import type { Metadata } from "next";
import { company } from "@/data/marketing/company";
import { InnerPage } from "@/components/marketing/InnerPage";

import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Customer Care",
  description: "DPR Logistics customer care — booking support, GC/LR tracking help, POD follow-up and billing assistance. Call +91 93562 59949.",
  path: "/contact/care",
});

export default function CarePage() {
  return (
    <InnerPage eyebrow="Contact Us" title="Customer Care" subtitle="Booking help, tracking and POD follow-up.">
      <p>Phone: {company.supportPhone}</p>
      <p>Email: {company.email}</p>
      <p>{company.workingHours}</p>
      <p>Keep your LR / GC number ready when you call.</p>
    </InnerPage>
  );
}
