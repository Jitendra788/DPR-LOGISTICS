"use client";

import { MoneyReceiptSearch } from "@/components/pages/MoneyReceiptSearch";

export default function MoneyReceiptPage() {
  return (
    <MoneyReceiptSearch
      source="DPR"
      editHref="/bills/money-receipt/edit"
      reportHref="/bills/money-receipt/report"
    />
  );
}
