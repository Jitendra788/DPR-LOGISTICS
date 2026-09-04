"use client";

import { BillwiseOutstandingReport } from "@/components/pages/BillwiseOutstandingReport";

export default function BillwiseOutstandingPage() {
  return <BillwiseOutstandingReport source="DPR" exportName="billwise-outstanding.csv" />;
}
