import type { Metadata } from "next";
import { InnerPage } from "@/components/marketing/InnerPage";

import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Media Center",
  description: "DPR Logistics media center — gallery, press updates and company news from India's trusted cargo transport partner.",
  path: "/media",
});

export default function MediaPage() {
  return (
    <InnerPage eyebrow="Media Center" title="Gallery" subtitle="Operations snapshots from our Kolhapur base and network.">
      <p>Fleet, godown and branch visuals will be published here. For media queries use Contact Us.</p>
    </InnerPage>
  );
}
