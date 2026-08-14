"use client";

import { Suspense } from "react";
import { BillEntryForm } from "@/components/pages/BillEntryForm";

export default function MeterwiseBillPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <BillEntryForm title="New Meter wise Bill Preparation" variant="meter" />
    </Suspense>
  );
}
