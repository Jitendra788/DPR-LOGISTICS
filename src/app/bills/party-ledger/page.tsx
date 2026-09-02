"use client";

import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { DateField, DatalistField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { AdminForm } from "@/components/ui/AdminForm";
import { api, downloadCsv } from "@/lib/api-client";
import { billGrandTotal } from "@/lib/bill-totals";
import { todayIso } from "@/lib/dates";

type Party = { name: string };
type Row = Record<string, string | number>;

function matchesParty(name: string, filter: string) {
  if (!filter.trim()) return true;
  return name.trim().toLowerCase().includes(filter.trim().toLowerCase());
}

export default function PartyLedgerPage() {
  const [parties, setParties] = useState<Party[]>([]);
  const partyNames = parties.map((p) => p.name).filter(Boolean);
  const [partyName, setPartyName] = useState("");
  const [fromDate, setFromDate] = useState(todayIso());
  const [toDate, setToDate] = useState(todayIso());
  const [rows, setRows] = useState<Row[]>([]);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    api<Party[]>("/api/parties").then(setParties);
  }, []);

  async function loadLedger() {
    const [bills, receipts] = await Promise.all([
      api<{ billNo: string; fromDate: string; billDate: string; amount: number; partyName: string; cgstAmt: number; sgstAmt: number; igstAmt: number }[]>("/api/bills"),
      api<{ receiptNo: string; date: string; amount: number; paidAmt: number; partyName: string; billNo: string }[]>("/api/receipts"),
    ]);
    const ledger: Row[] = [];

    bills
      .filter((b) => matchesParty(b.partyName, partyName))
      .forEach((b) => {
        const d = (b.billDate || b.fromDate || "").slice(0, 10);
        if (fromDate && d && d < fromDate) return;
        if (toDate && d && d > toDate) return;
        ledger.push({ date: d, type: "Bill", ref: b.billNo, debit: billGrandTotal(b), credit: 0 });
      });

    receipts
      .filter((r) => matchesParty(r.partyName, partyName))
      .forEach((r) => {
        const d = (r.date || "").slice(0, 10);
        if (fromDate && d && d < fromDate) return;
        if (toDate && d && d > toDate) return;
        const credit = r.paidAmt || r.amount || 0;
        ledger.push({
          date: d,
          type: "Receipt",
          ref: r.billNo || r.receiptNo || "MR",
          debit: 0,
          credit,
        });
      });

    ledger.sort((a, b) => String(a.date).localeCompare(String(b.date)));
    setRows(ledger);
    return ledger;
  }

  async function showLedger(e?: FormEvent) {
    e?.preventDefault();
    const ledger = await loadLedger();
    setMessage({ type: "ok", text: `Showing ${ledger.length} ledger entry(ies)` });
  }

  async function exportExcel(e: FormEvent) {
    e.preventDefault();
    const ledger = rows.length ? rows : await loadLedger();
    if (!ledger.length) {
      setMessage({ type: "err", text: "No data to export" });
      return;
    }
    downloadCsv("party-ledger.csv", ledger);
    setMessage({ type: "ok", text: "Excel file downloaded" });
  }

  return (
    <>
      <PageHeader title="Party Ledger" subtitle="Bills and receipts only — LHC / LR balance not shown as pending" crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Party Ledger" }]} />
      <Flash message={message} />
      <AdminForm onSubmit={showLedger}>
        <FormCard>
          <TwoCol>
            <div>
              <DateField label="From Date" value={fromDate} onChange={setFromDate} />
              <DateField label="To Date" value={toDate} onChange={setToDate} />
              <Button type="submit" variant="teal" className="mt-1">
                Show Ledger
              </Button>
            </div>
            <DatalistField
              label="Party Name"
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              options={partyNames}
              placeholder="All parties"
              listId="ledger-party"
            />
          </TwoCol>
        </FormCard>
      </AdminForm>
      <FormCard>
        <Button type="button" variant="teal" onClick={exportExcel}>
          Export as Excel
        </Button>
      </FormCard>
      {rows.length ? (
        <DataTable
          rows={rows}
          columns={[
            { key: "date", header: "Date" },
            { key: "type", header: "Type" },
            { key: "ref", header: "Ref No", render: (row) => (String(row.type) === "Bill" ? row.ref : row.ref) },
            { key: "debit", header: "Debit" },
            { key: "credit", header: "Credit" },
          ]}
        />
      ) : null}
    </>
  );
}
