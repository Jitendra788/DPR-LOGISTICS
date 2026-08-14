"use client";

import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { InputField, SelectField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Flash } from "@/components/ui/Flash";
import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api-client";

type Party = { name: string };
type Station = { name: string };
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
  const [stations, setStations] = useState<Station[]>([]);
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
    Promise.all([api<Party[]>("/api/parties"), api<Station[]>("/api/stations"), api<Bill[]>("/api/bills")]).then(
      ([p, s, b]) => {
        setParties(p);
        setStations(s);
        setBills(b);
      },
    );
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const result = await api<{ bill: Bill; lrCount: number }>("/api/bills/generate", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setMessage({ type: "ok", text: `Bill ${result.bill.billNo} generated for ${result.lrCount} LR(s)` });
      await loadBills();
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Bill failed" });
    }
  }

  function printBill(bill: Bill) {
    window.open(`/bills/print?billNo=${encodeURIComponent(bill.billNo)}`, "_blank");
  }

  return (
    <>
      <PageHeader title="Bill Generation" subtitle="Prepare party bills" crumbs={[{ label: "Home", href: "/" }, { label: "Bill Generation" }]} />
      <Flash message={message} />
      <form onSubmit={onSubmit}>
        <FormCard>
          <TwoCol>
            <div>
              <SelectField label="Billing Party" value={form.partyName} onChange={(e) => setForm({ ...form, partyName: e.target.value })} options={parties.map((p) => p.name)} />
              <InputField label="From Date" type="date" value={form.fromDate} onChange={(e) => setForm({ ...form, fromDate: e.target.value })} />
              <InputField label="To Date" type="date" value={form.toDate} onChange={(e) => setForm({ ...form, toDate: e.target.value })} />
            </div>
            <div>
              <SelectField label="From Station" value={form.fromStation} onChange={(e) => setForm({ ...form, fromStation: e.target.value })} options={stations.map((s) => s.name)} />
              <SelectField label="To Station" value={form.toStation} onChange={(e) => setForm({ ...form, toStation: e.target.value })} options={stations.map((s) => s.name)} />
            </div>
          </TwoCol>
          <div className="flex gap-2">
            <Button type="submit">Generate Bill</Button>
          </div>
        </FormCard>
      </form>
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
