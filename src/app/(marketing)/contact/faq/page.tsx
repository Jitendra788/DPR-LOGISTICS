import type { Metadata } from "next";
import { faqs } from "@/data/marketing/statistics";
import { InnerPage } from "@/components/marketing/InnerPage";

export const metadata: Metadata = { title: "FAQs" };

export default function FaqPage() {
  return (
    <InnerPage eyebrow="Contact Us" title="FAQs" subtitle="Common questions about booking, tracking and billing.">
      {faqs.map((f) => (
        <p key={f.q}>
          <strong>{f.q}</strong>
          <br />
          {f.a}
        </p>
      ))}
    </InnerPage>
  );
}
