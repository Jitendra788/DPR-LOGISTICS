"use client";

import { MoneyReceiptEdit } from "@/components/pages/MoneyReceiptEdit";

export default function RoadwaysMoneyReceiptPage() {
  return <MoneyReceiptEdit source="ROADWAYS" backHref="/roadways/money-receipt/new" />;
}
