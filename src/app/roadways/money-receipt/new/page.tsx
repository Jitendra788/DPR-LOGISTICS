"use client";

import { MoneyReceiptSearch } from "@/components/pages/MoneyReceiptSearch";

export default function RoadwaysMoneyReceiptNewPage() {
  return (
    <MoneyReceiptSearch
      source="ROADWAYS"
      editHref="/roadways/money-receipt"
      reportHref="/roadways/outstanding"
    />
  );
}
