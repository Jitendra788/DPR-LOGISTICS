import type { Metadata } from "next";
import { InnerPage } from "@/components/marketing/InnerPage";

export const metadata: Metadata = { title: "Media Center" };

export default function MediaPage() {
  return (
    <InnerPage eyebrow="Media Center" title="Gallery" subtitle="Operations snapshots from our Kolhapur base and network.">
      <p>Fleet, godown and branch visuals will be published here. For media queries use Contact Us.</p>
    </InnerPage>
  );
}
