"use client";

import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { InputField, ComboboxField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Flash } from "@/components/ui/Flash";
import { AdminForm } from "@/components/ui/AdminForm";
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
  createdAt: string;
};

export default function BillGenerationPage() {
  const [parties, setParties] = useState<Party[]>([]);
  const partyNames = parties.map((p) => p.name).filter(Boolean);
  const [stations, setStations] = useState<string[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string; at?: number } | null>(null);
  const [form, setForm] = useState({
    partyName: "",
    fromDate: new Date().toISOString().slice(0, 10),
    toDate: new Date().toISOString().slice(0, 10),
    fromStation: "",
    toStation: "",
    source: "DPR",
  });

  async function loadBills() {
    const all = await api<(Bill & { source?: string })[]>("/api/bills");
    setBills(all.filter((b) => (b.source || "DPR") !== "ROADWAYS"));
  }

  useEffect(() => {
    Promise.all([
      api<Party[]>("/api/parties"),
      api<(Bill & { source?: string })[]>("/api/bills"),
      api<{ name: string }[]>("/api/stations"),
    ]).then(([p, b, st]) => {
      setParties(p);
      setBills(b.filter((row) => (row.source || "DPR") !== "ROADWAYS"));
      setStations(st.map((s) => s.name).filter(Boolean));
    });
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const result = await api<{ bill: Bill; lrCount: number }>("/api/bills/generate", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setMessage({ type: "ok", text: `Bill ${result.bill.billNo} generated for ${result.lrCount} LR(s)`, at: Date.now() });
      setForm({
        partyName: "",
        fromDate: new Date().toISOString().slice(0, 10),
        toDate: new Date().toISOString().slice(0, 10),
        fromStation: "",
        toStation: "",
        source: "DPR",
      });
      await loadBills();
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Bill failed", at: Date.now() });
    }
  }

  function printBill(bill: Bill) {
    window.open(`/bills/print?billNo=${encodeURIComponent(bill.billNo)}`, "_blank");
  }

  return (
    <>
      <PageHeader title="Bill Generation" subtitle="Prepare party bills" crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Bill Generation" }]} />
      <Flash message={message} />
      <AdminForm onSubmit={onSubmit}>
        <FormCard>
          <TwoCol>
            <div>
              <ComboboxField label="Billing Party" value={form.partyName} onChange={(partyName) => setForm({ ...form, partyName })} options={partyNames} placeholder="Search or select party" />
              <InputField label="From Date" type="date" value={form.fromDate} onChange={(e) => setForm({ ...form, fromDate: e.target.value })} />
              <InputField label="To Date" type="date" value={form.toDate} onChange={(e) => setForm({ ...form, toDate: e.target.value })} />
            </div>
            <div>
              <ComboboxField
                label="From Station"
                value={form.fromStation}
                onChange={(fromStation) => setForm({ ...form, fromStation })}
                options={stations}
                placeholder="Search or select station"
              />
              <ComboboxField
                label="To Station"
                value={form.toStation}
                onChange={(toStation) => setForm({ ...form, toStation })}
                options={stations}
                placeholder="Search or select station"
              />
            </div>
          </TwoCol>
          <div className="flex gap-2">
            <Button type="submit">Generate Bill</Button>
          </div>
        </FormCard>
      </AdminForm>
      <DataTable
        rows={bills}
        columns={[
          { key: "print", header: "Print", render: (row) => <Button type="button" size="sm" variant="teal" onClick={() => printBill(row)}>Print</Button> },
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
