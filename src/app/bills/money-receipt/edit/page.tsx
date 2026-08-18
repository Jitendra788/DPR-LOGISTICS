"use client";

import { Suspense } from "react";
import { MoneyReceiptEdit } from "@/components/pages/MoneyReceiptEdit";

export default function MoneyReceiptEditPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <MoneyReceiptEdit source="DPR" backHref="/bills/money-receipt" />
    </Suspense>
  );
}
