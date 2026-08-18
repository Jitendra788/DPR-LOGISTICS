"use client";

import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { DateField, SelectField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { api, downloadCsv } from "@/lib/api-client";
import { todayIso } from "@/lib/dates";

type Party = { name: string };
type Row = Record<string, string | number>;

export default function PartyLedgerPage() {
  const [parties, setParties] = useState<Party[]>([]);
  const [partyName, setPartyName] = useState("");
  const [fromDate, setFromDate] = useState(todayIso());
  const [toDate, setToDate] = useState(todayIso());
  const [rows, setRows] = useState<Row[]>([]);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    api<Party[]>("/api/parties").then(setParties);
  }, []);

  async function loadLedger() {
    const [bookings, bills, receipts] = await Promise.all([
      api<{ lrNo: string; lrDate: string; grandTotal: number; billingParty: string }[]>("/api/bookings"),
      api<{ billNo: string; fromDate: string; amount: number; partyName: string }[]>("/api/bills"),
      api<{ receiptNo: string; date: string; amount: number; partyName: string }[]>("/api/receipts"),
    ]);
    const ledger: Row[] = [];
    bookings.filter((b) => !partyName || b.billingParty === partyName).forEach((b) => {
      if (fromDate && b.lrDate && b.lrDate < fromDate) return;
      if (toDate && b.lrDate && b.lrDate > toDate) return;
      ledger.push({ date: b.lrDate, type: "LR", ref: b.lrNo, debit: b.grandTotal, credit: 0 });
    });
    bills.filter((b) => !partyName || b.partyName === partyName).forEach((b) => {
      if (fromDate && b.fromDate && b.fromDate < fromDate) return;
      if (toDate && b.fromDate && b.fromDate > toDate) return;
      ledger.push({ date: b.fromDate, type: "Bill", ref: b.billNo, debit: b.amount, credit: 0 });
    });
    receipts.filter((r) => !partyName || r.partyName === partyName).forEach((r) => {
      if (fromDate && r.date && r.date < fromDate) return;
      if (toDate && r.date && r.date > toDate) return;
      ledger.push({ date: r.date, type: "Receipt", ref: r.receiptNo, debit: 0, credit: r.amount });
    });
    ledger.sort((a, b) => String(a.date).localeCompare(String(b.date)));
    setRows(ledger);
    return ledger;
  }

  async function exportExcel(e: FormEvent) {
    e.preventDefault();
    const ledger = await loadLedger();
    if (!ledger.length) {
      setMessage({ type: "err", text: "No data to export" });
      return;
    }
    downloadCsv("party-ledger.csv", ledger);
    setMessage({ type: "ok", text: "Excel file downloaded" });
  }

  return (
    <>
      <PageHeader title="Party Ledger" subtitle="Select Date and View Ledger" crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Party Ledger" }]} />
      <Flash message={message} />
      <form onSubmit={exportExcel}>
        <FormCard>
          <TwoCol>
            <div>
              <DateField label="From Date" value={fromDate} onChange={setFromDate} />
              <DateField label="To Date" value={toDate} onChange={setToDate} />
            </div>
            <SelectField label="Party Name" value={partyName} onChange={(e) => setPartyName(e.target.value)} options={parties.map((p) => p.name)} />
          </TwoCol>
        </FormCard>
        <FormCard>
          <Button type="submit" variant="teal">
            Export as Excel
          </Button>
        </FormCard>
      </form>
      {rows.length ? (
        <DataTable rows={rows} columns={[{ key: "date", header: "Date" }, { key: "type", header: "Type" }, { key: "ref", header: "Ref No" }, { key: "debit", header: "Debit" }, { key: "credit", header: "Credit" }]} />
      ) : null}
    </>
  );
}
