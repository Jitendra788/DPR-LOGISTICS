import type { Metadata } from "next";
import { company } from "@/data/marketing/company";
import { InnerPage } from "@/components/marketing/InnerPage";

export const metadata: Metadata = { title: "Customer Care" };

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
