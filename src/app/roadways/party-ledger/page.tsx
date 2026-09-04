"use client";

import { PartyLedgerReport } from "@/components/pages/PartyLedgerReport";

export default function RoadwaysPartyLedgerPage() {
  return (
    <PartyLedgerReport
      source="ROADWAYS"
      title="Roadways Party Ledger"
      subtitle="Roadways bills & money receipts — same ledger format as DPR"
      exportName="roadways-party-ledger.csv"
    />
  );
}
