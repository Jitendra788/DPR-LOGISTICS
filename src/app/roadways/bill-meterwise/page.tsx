"use client";

import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { DateField, SelectField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { api } from "@/lib/api-client";
import { todayIso } from "@/lib/dates";

type Party = { name: string };
type Bill = { billNo: string; partyName: string; fromDate: string; toDate: string; amount: number; lrCount: number; source?: string };

export default function RoadwaysMeterwisePage() {
  const [parties, setParties] = useState<Party[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [form, setForm] = useState({
    partyName: "",
    fromDate: todayIso(),
    toDate: todayIso(),
  });

  useEffect(() => {
    api<Party[]>("/api/parties").then((p) => {
      setParties(p);
      setForm((f) => ({ ...f, partyName: f.partyName || p[0]?.name || "" }));
    });
    api<Bill[]>("/api/bills").then((all) => setBills(all.filter((b) => b.source === "ROADWAYS")));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const result = await api<{ bill: Bill; lrCount: number }>("/api/bills/generate", {
        method: "POST",
        body: JSON.stringify({ ...form, billAs: "Fixed", source: "ROADWAYS" }),
      });
      setMessage({ type: "ok", text: `Bill ${result.bill.billNo} generated` });
      setShowReport(true);
      setBills((await api<Bill[]>("/api/bills")).filter((b) => b.source === "ROADWAYS"));
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Bill failed" });
    }
  }

  return (
    <>
      <PageHeader title="Bill Meterwise" subtitle="Fill all the fields" crumbs={[{ label: "Home", href: "/" }, { label: "Bill Meterwise" }]} />
      <Flash message={message} />
      <form onSubmit={onSubmit}>
        <FormCard>
          <TwoCol>
            <div>
              <SelectField
                label="Enter Party Name"
                value={form.partyName}
                onChange={(e) => setForm({ ...form, partyName: e.target.value })}
                options={parties.map((p) => p.name)}
                placeholder=""
              />
              <DateField label="From Date" value={form.fromDate} onChange={(fromDate) => setForm({ ...form, fromDate })} />
              <Button type="submit">Save Data</Button>
            </div>
            <div>
              <DateField label="To Date" value={form.toDate} onChange={(toDate) => setForm({ ...form, toDate })} />
            </div>
          </TwoCol>
        </FormCard>
      </form>
      {showReport ? (
        <DataTable
          rows={bills}
          columns={[
            { key: "billNo", header: "Bill No" },
            { key: "partyName", header: "Party" },
            { key: "fromDate", header: "From" },
            { key: "toDate", header: "To" },
            { key: "lrCount", header: "L.R Count" },
            { key: "amount", header: "Amount" },
          ]}
        />
      ) : (
        <FormCard className="min-h-16" />
      )}
    </>
  );
}
