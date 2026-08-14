"use client";

import { Suspense } from "react";
import { BillEntryForm } from "@/components/pages/BillEntryForm";

export default function WeightwiseBillPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <BillEntryForm title="New Weight wise Bill Preparation" variant="weight" />
    </Suspense>
  );
}
