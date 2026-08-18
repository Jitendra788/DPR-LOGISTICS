import type { Metadata } from "next";
import { InnerPage } from "@/components/marketing/InnerPage";

export const metadata: Metadata = { title: "Awards & Recognitions" };

export default function AwardsPage() {
  return (
    <InnerPage eyebrow="Media Center" title="Awards & Recognitions" subtitle="Recognition for dependable transport service.">
      <p>DPR Logistics is built on on-time movement and customer follow-up. Formal awards and press notes will appear on this page.</p>
    </InnerPage>
  );
}
