"use client";

import { Suspense } from "react";
import { MoneyReceiptEdit } from "@/components/pages/MoneyReceiptEdit";

export default function RoadwaysMoneyReceiptEditPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <MoneyReceiptEdit source="ROADWAYS" backHref="/roadways/money-receipt" />
    </Suspense>
  );
}
