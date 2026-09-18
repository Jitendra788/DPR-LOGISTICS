"use client";

import { TdsLedgerReport } from "@/components/pages/TdsLedgerReport";

export default function TdsLedgerPage() {
  return (
    <TdsLedgerReport
      source="DPR"
      title="TDS Ledger"
      subtitle="All parties TDS deducted on money receipts — leave party blank for everyone"
      exportName="tds-ledger.csv"
    />
  );
}
