import type { Metadata } from "next";
import { ContactForm } from "@/components/marketing/ContactForm";
import { InnerPage } from "@/components/marketing/InnerPage";

export const metadata: Metadata = { title: "Service Complaint" };

export default function ComplaintPage() {
  return (
    <InnerPage eyebrow="Contact Us" title="Service Complaint" subtitle="Share LR number, date and the issue. We will follow up.">
      <ContactForm />
    </InnerPage>
  );
}
