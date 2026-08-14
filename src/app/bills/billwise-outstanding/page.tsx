"use client";

import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard } from "@/components/ui/FormCard";
import { SelectField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { api, downloadCsv } from "@/lib/api-client";

type Party = { name: string };
type Bill = { billNo: string; partyName: string; fromDate: string; toDate: string; amount: number };
type Receipt = { partyName: string; amount: number };

export default function BillwiseOutstandingPage() {
  const [parties, setParties] = useState<Party[]>([]);
  const [partyName, setPartyName] = useState("");
  const [rows, setRows] = useState<Record<string, string | number>[] | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    api<Party[]>("/api/parties").then((p) => {
      setParties(p);
      setPartyName((n) => n || p[0]?.name || "");
    });
  }, []);

  async function show(e?: FormEvent) {
    e?.preventDefault();
    const [bills, receipts] = await Promise.all([api<Bill[]>("/api/bills"), api<Receipt[]>("/api/receipts")]);
    const receivedByParty: Record<string, number> = {};
    receipts.forEach((r) => {
      receivedByParty[r.partyName] = (receivedByParty[r.partyName] || 0) + r.amount;
    });
    const data = bills
      .filter((b) => !partyName || b.partyName === partyName)
      .map((b) => ({
        billNo: b.billNo,
        partyName: b.partyName,
        fromDate: b.fromDate,
        toDate: b.toDate,
        amount: b.amount,
        received: receivedByParty[b.partyName] || 0,
        outstanding: Math.max(0, b.amount - (receivedByParty[b.partyName] || 0)),
      }));
    setRows(data);
    setMessage({ type: "ok", text: `Found ${data.length} bill(s)` });
    return data;
  }

  async function generateExcel() {
    const data = rows ?? (await show());
    if (!data?.length) {
      setMessage({ type: "err", text: "No data to export" });
      return;
    }
    downloadCsv("billwise-outstanding.csv", data);
    setMessage({ type: "ok", text: "Excel file downloaded" });
  }

  return (
    <>
      <PageHeader
        title="Billwise Outstanding Report"
        subtitle="Select and fill data for the payment"
        crumbs={[{ label: "Home", href: "/" }, { label: "Outstanding Report" }]}
      />
      <Flash message={message} />
      <form onSubmit={show}>
        <FormCard>
          <div className="mb-3">
            <Button type="submit" variant="teal">
              Show All
            </Button>
          </div>
          <SelectField label="Party Name" value={partyName} onChange={(e) => setPartyName(e.target.value)} options={parties.map((p) => p.name)} placeholder="" />
        </FormCard>
      </form>
      <FormCard>
        <Button type="button" variant="teal" onClick={generateExcel}>
          Generate Excel
        </Button>
      </FormCard>
      {rows ? (
        <DataTable
          rows={rows}
          columns={[
            { key: "billNo", header: "Bill No" },
            { key: "partyName", header: "Party Name" },
            { key: "amount", header: "Bill Amount" },
            { key: "received", header: "Received" },
            { key: "outstanding", header: "Outstanding Rs." },
          ]}
        />
      ) : null}
    </>
  );
}
