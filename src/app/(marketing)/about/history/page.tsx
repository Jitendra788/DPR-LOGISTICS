import type { Metadata } from "next";
import { company } from "@/data/marketing/company";
import { InnerPage } from "@/components/marketing/InnerPage";

export const metadata: Metadata = { title: "History" };

export default function HistoryPage() {
  return (
    <InnerPage eyebrow="About Us" title="Our History" subtitle={`Since ${company.foundedYear}.`}>
      <p>{company.history}</p>
      <p>{company.mdMessage}</p>
    </InnerPage>
  );
}
