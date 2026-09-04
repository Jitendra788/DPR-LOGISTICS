"use client";

import { Suspense } from "react";
import { MoneyReceiptSearch } from "@/components/pages/MoneyReceiptSearch";

export default function RoadwaysMoneyReceiptPage() {
  return (
    <Suspense fallback={<p className="p-4">Loading…</p>}>
      <MoneyReceiptSearch
        source="ROADWAYS"
        editHref="/roadways/money-receipt/edit"
        reportHref="/roadways/money-receipt/report"
      />
    </Suspense>
  );
}
