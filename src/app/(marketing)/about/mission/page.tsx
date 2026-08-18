import type { Metadata } from "next";
import { company } from "@/data/marketing/company";
import { InnerPage } from "@/components/marketing/InnerPage";

export const metadata: Metadata = { title: "Mission, Vision & Value" };

export default function MissionPage() {
  return (
    <InnerPage eyebrow="About Us" title="Mission, Vision & Value" subtitle={`What ${company.name} stands for.`}>
      <h2>Mission</h2>
      <p>{company.mission}</p>
      <h2>Vision</h2>
      <p>{company.vision}</p>
      <h2>Values</h2>
      {company.values.map((v) => (
        <p key={v.title}>
          <strong>{v.title}.</strong> {v.description}
        </p>
      ))}
    </InnerPage>
  );
}
