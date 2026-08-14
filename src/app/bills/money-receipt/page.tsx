"use client";

import { MoneyReceiptSearch } from "@/components/pages/MoneyReceiptSearch";

export default function MoneyReceiptPage() {
  return <MoneyReceiptSearch reportHref="/bills/money-receipt/report" source="DPR" />;
}
