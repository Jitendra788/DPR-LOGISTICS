"use client";

import { Suspense } from "react";
import { BillEntryForm } from "@/components/pages/BillEntryForm";

export default function RoadwaysWeightwisePage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <BillEntryForm
        title="New Weight wise Bill Preparation"
        variant="weight"
        source="ROADWAYS"
        searchHref="/roadways/search-bill"
        moneyReceiptHref="/roadways/money-receipt"
        printHref="/roadways/bills/print"
        crumb="Bill Weightwise"
      />
    </Suspense>
  );
}
