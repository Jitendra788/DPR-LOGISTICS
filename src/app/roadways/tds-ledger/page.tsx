"use client";

import { TdsLedgerReport } from "@/components/pages/TdsLedgerReport";

export default function RoadwaysTdsLedgerPage() {
  return (
    <TdsLedgerReport
      source="ROADWAYS"
      title="Roadways TDS Ledger"
      subtitle="Money receipts + booking-slip TDS — leave party blank for all parties"
      exportName="roadways-tds-ledger.csv"
    />
  );
}
