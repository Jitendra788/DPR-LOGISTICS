"use client";

import { Suspense } from "react";
import { BillEntryForm } from "@/components/pages/BillEntryForm";

export default function RoadwaysMeterwisePage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <BillEntryForm
        title="New Meter wise Bill Preparation"
        variant="meter"
        source="ROADWAYS"
        searchHref="/roadways/search-bill"
        crumb="Bill Meterwise"
      />
    </Suspense>
  );
}
