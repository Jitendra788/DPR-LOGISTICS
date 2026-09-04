"use client";

import { PartyLedgerReport } from "@/components/pages/PartyLedgerReport";

export default function PartyLedgerPage() {
  return (
    <PartyLedgerReport
      source="DPR"
      title="Party Ledger"
      subtitle="Opening balance, customer bills, money receipt paid / TDS / other deduction"
      exportName="party-ledger.csv"
    />
  );
}
