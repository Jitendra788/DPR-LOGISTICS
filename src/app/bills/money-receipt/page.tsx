"use client";

import { Suspense } from "react";
import { MoneyReceiptSearch } from "@/components/pages/MoneyReceiptSearch";

export default function MoneyReceiptPage() {
  return (
    <Suspense fallback={<p className="p-4">Loading…</p>}>
      <MoneyReceiptSearch
        source="DPR"
        editHref="/bills/money-receipt/edit"
        reportHref="/bills/money-receipt/report"
      />
    </Suspense>
  );
}
