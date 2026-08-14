"use client";

import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { DateField, InputField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { api, downloadCsv } from "@/lib/api-client";
import { todayIso } from "@/lib/dates";

type Row = { billNo: string; partyName: string; outstanding: number };

export default function PartyOutstandingPage() {
  const [allRows, setAllRows] = useState<Row[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [billNo, setBillNo] = useState("");
  const [billDate, setBillDate] = useState(todayIso());
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function load() {
    const [parties, bills, receipts] = await Promise.all([
      api<{ name: string }[]>("/api/parties"),
      api<{ billNo: string; partyName: string; amount: number; billDate: string; fromDate: string }[]>("/api/bills"),
      api<{ partyName: string; amount: number; billNo: string }[]>("/api/receipts"),
    ]);

    const receivedByParty: Record<string, number> = {};
    receipts.forEach((r) => {
      receivedByParty[r.partyName] = (receivedByParty[r.partyName] || 0) + r.amount;
    });

    const billedByParty: Record<string, number> = {};
    bills.forEach((b) => {
      billedByParty[b.partyName] = (billedByParty[b.partyName] || 0) + b.amount;
    });

    const partyRows: Row[] = parties.map((p, i) => ({
      billNo: String(i + 1),
      partyName: p.name,
      outstanding: Number(((billedByParty[p.name] || 0) - (receivedByParty[p.name] || 0)).toFixed(2)),
    }));

    const billRows: Row[] = bills.map((b) => ({
      billNo: b.billNo,
      partyName: b.partyName,
      outstanding: Number((b.amount - (receivedByParty[b.partyName] || 0)).toFixed(2)),
    }));

    const data = billRows.length ? billRows : partyRows;
    setAllRows(data);
    setRows(data);
    return data;
  }

  useEffect(() => {
    load();
  }, []);

  function search(e?: FormEvent) {
    e?.preventDefault();
    const filtered = allRows.filter((r) => {
      if (billNo.trim() && !String(r.billNo).toLowerCase().includes(billNo.trim().toLowerCase()) && !r.partyName.toLowerCase().includes(billNo.trim().toLowerCase())) {
        return false;
      }
      return true;
    });
    setRows(filtered);
    setMessage({ type: "ok", text: `Found ${filtered.length} record(s)` });
  }

  function exportExcel() {
    if (!rows.length) {
      setMessage({ type: "err", text: "No data to export" });
      return;
    }
    downloadCsv("party-outstanding.csv", rows as unknown as Record<string, unknown>[]);
    setMessage({ type: "ok", text: "Excel file downloaded" });
  }

  return (
    <>
      <PageHeader
        title="Party Outstanding"
        subtitle="View Party Outstanding"
        crumbs={[{ label: "Home", href: "/" }, { label: "Party Outstanding" }]}
      />
      <Flash message={message} />
      <form onSubmit={search}>
        <FormCard>
          <TwoCol>
            <InputField label="Bill No" value={billNo} onChange={(e) => setBillNo(e.target.value)} />
            <DateField label="Bill Date" value={billDate} onChange={setBillDate} />
          </TwoCol>
          <Button type="submit" variant="teal">
            Search
          </Button>
        </FormCard>
      </form>
      <FormCard>
        <Button type="button" variant="teal" onClick={exportExcel}>
          Export to Excel
        </Button>
      </FormCard>
      <DataTable
        rows={rows}
        columns={[
          { key: "billNo", header: "Bill No" },
          { key: "partyName", header: "Party Name" },
          { key: "outstanding", header: "Outstanding Rs." },
        ]}
      />
    </>
  );
}
