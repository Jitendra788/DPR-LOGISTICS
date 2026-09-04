"use client";

import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { InputField, ComboboxField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Flash } from "@/components/ui/Flash";
import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api-client";

type Party = { name: string };
type Bill = {
  id: number;
  billNo: string;
  partyName: string;
  fromDate: string;
  toDate: string;
  amount: number;
  lrCount: number;
};

export function BillGenerateForm({
  title,
  billAs,
  source,
}: {
  title: string;
  billAs?: string;
  source?: string;
}) {
  const [parties, setParties] = useState<Party[]>([]);
  const partyNames = parties.map((p) => p.name).filter(Boolean);
  const [bills, setBills] = useState<Bill[]>([]);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [form, setForm] = useState({
    partyName: "",
    fromDate: new Date().toISOString().slice(0, 10),
    toDate: new Date().toISOString().slice(0, 10),
    fromStation: "",
    toStation: "",
  });

  async function loadBills() {
    setBills(await api<Bill[]>("/api/bills"));
  }

  useEffect(() => {
    Promise.all([api<Party[]>("/api/parties"), api<Bill[]>("/api/bills")]).then(
      ([p, b]) => {
        setParties(p);
        setBills(b);
      },
    );
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const result = await api<{ bill: Bill; lrCount: number }>("/api/bills/generate", {
        method: "POST",
        body: JSON.stringify({ ...form, billAs, source }),
      });
      setMessage({ type: "ok", text: `Bill ${result.bill.billNo} generated for ${result.lrCount} LR(s)` });
      await loadBills();
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Bill failed" });
    }
  }

  return (
    <>
      <PageHeader title={title} subtitle="Select and fill data" crumbs={[{ label: "Home", href: "/dashboard" }, { label: title }]} />
      <Flash message={message} />
      <form onSubmit={onSubmit}>
        <FormCard>
          <TwoCol>
            <div>
              <ComboboxField label="Billing Party" value={form.partyName} onChange={(partyName) => setForm({ ...form, partyName })} options={partyNames} placeholder="Search or select party" />
              <InputField label="From Date" type="date" value={form.fromDate} onChange={(e) => setForm({ ...form, fromDate: e.target.value })} />
              <InputField label="To Date" type="date" value={form.toDate} onChange={(e) => setForm({ ...form, toDate: e.target.value })} />
            </div>
            <div>
              <InputField label="From Station" value={form.fromStation} onChange={(e) => setForm({ ...form, fromStation: e.target.value })} placeholder="Type station" />
              <InputField label="To Station" value={form.toStation} onChange={(e) => setForm({ ...form, toStation: e.target.value })} placeholder="Type station" />
            </div>
          </TwoCol>
          <Button type="submit">Generate Bill</Button>
        </FormCard>
      </form>
      <DataTable
        rows={bills}
        columns={[
          { key: "print", header: "Print", render: (row) => <Button type="button" size="sm" variant="teal" onClick={() => window.open(`/bills/print?billNo=${encodeURIComponent(row.billNo)}`, "_blank")}>Print</Button> },
          { key: "billNo", header: "Bill No" },
          { key: "partyName", header: "Party" },
          { key: "fromDate", header: "From" },
          { key: "toDate", header: "To" },
          { key: "lrCount", header: "LR Count" },
          { key: "amount", header: "Amount" },
        ]}
      />
    </>
  );
}
