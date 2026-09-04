"use client";

import { BillwiseOutstandingReport } from "@/components/pages/BillwiseOutstandingReport";

export default function RoadwaysOutstandingPage() {
  return (
    <BillwiseOutstandingReport
      source="ROADWAYS"
      title="Billwise Outstanding Report"
      exportName="roadways-billwise-outstanding.csv"
    />
  );
}
