"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { DateField, InputField, MoneyField, SelectField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { api, downloadCsv } from "@/lib/api-client";
import { todayIso } from "@/lib/dates";

type Party = { name: string };
type Booking = {
  id: number;
  lrNo: string;
  lrDate: string;
  vehNo: string;
  fromStation: string;
  toStation: string;
  billingParty: string;
  chargedWeight: string;
  freight: number;
  grandTotal: number;
  source: string;
};

export default function RoadwaysLrPage() {
  const [parties, setParties] = useState<Party[]>([]);
  const [rows, setRows] = useState<Booking[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [form, setForm] = useState({
    lrNo: "",
    lrDate: todayIso(),
    billingParty: "",
    vehNo: "",
    fromStation: "",
    toStation: "",
    chargedWeight: "",
    freight: 0,
    mailId: "",
  });

  const balance = useMemo(() => form.freight, [form.freight]);

  async function load() {
    const all = await api<Booking[]>("/api/bookings");
    setRows(all.filter((r) => r.source === "ROADWAYS"));
  }

  useEffect(() => {
    api<Party[]>("/api/parties").then((p) => {
      setParties(p);
      setForm((f) => ({ ...f, billingParty: f.billingParty || p[0]?.name || "" }));
    });
    api<{ value: string }>("/api/next-no?type=lr").then((d) => setForm((f) => ({ ...f, lrNo: d.value })));
    load();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await api("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          lrNo: form.lrNo,
          lrDate: form.lrDate,
          billingParty: form.billingParty,
          vehNo: form.vehNo,
          fromStation: form.fromStation,
          toStation: form.toStation,
          chargedWeight: form.chargedWeight,
          freight: form.freight,
          source: "ROADWAYS",
          total: form.freight,
          grandTotal: form.freight,
          consignor: form.billingParty,
        }),
      });
      setMessage({ type: "ok", text: "L.R saved successfully" });
      setForm({
        lrNo: `LR-${Date.now().toString().slice(-5)}`,
        lrDate: todayIso(),
        billingParty: parties[0]?.name || "",
        vehNo: "",
        fromStation: "",
        toStation: "",
        chargedWeight: "",
        freight: 0,
        mailId: "",
      });
      await load();
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Save failed" });
    }
  }

  return (
    <>
      <PageHeader title="New L.R Creation" subtitle="Fill all the fields" crumbs={[{ label: "Home", href: "/" }, { label: "L.R" }]} />
      <Flash message={message} />
      <form onSubmit={onSubmit}>
        <FormCard>
          <TwoCol>
            <div>
              <InputField label="L.R No." value={form.lrNo} onChange={(e) => setForm({ ...form, lrNo: e.target.value })} required />
              <SelectField
                label="Enter Party Name"
                value={form.billingParty}
                onChange={(e) => setForm({ ...form, billingParty: e.target.value })}
                options={parties.map((p) => p.name)}
                placeholder=""
              />
              <InputField label="Lorry No" value={form.vehNo} onChange={(e) => setForm({ ...form, vehNo: e.target.value })} />
              <InputField label="From" value={form.fromStation} onChange={(e) => setForm({ ...form, fromStation: e.target.value })} />
              <InputField label="To" value={form.toStation} onChange={(e) => setForm({ ...form, toStation: e.target.value })} />
            </div>
            <div>
              <DateField label="L.R Date" value={form.lrDate} onChange={(lrDate) => setForm({ ...form, lrDate })} />
              <InputField label="Guarantee Weight" value={form.chargedWeight} onChange={(e) => setForm({ ...form, chargedWeight: e.target.value })} />
              <MoneyField label="Freight" value={form.freight} onChange={(freight) => setForm({ ...form, freight })} />
              <MoneyField label="Balance" value={balance} readOnly />
            </div>
          </TwoCol>
          <div className="mt-1 flex flex-wrap gap-2">
            <Button type="submit">Save Data</Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                setShowReport(true);
                setMessage({ type: "ok", text: `Showing ${rows.length} L.R(s)` });
              }}
            >
              View L.R Report
            </Button>
          </div>
          <div className="mt-4 max-w-md">
            <InputField label="Enter Mail Id" type="email" value={form.mailId} onChange={(e) => setForm({ ...form, mailId: e.target.value })} />
          </div>
        </FormCard>
      </form>
      {showReport ? (
        <>
          <FormCard>
            <Button type="button" onClick={() => downloadCsv("roadways-lr-report.csv", rows as unknown as Record<string, unknown>[])}>
              Export to Excel
            </Button>
          </FormCard>
          <DataTable
            rows={rows}
            columns={[
              { key: "lrNo", header: "L.R No" },
              { key: "lrDate", header: "Date" },
              { key: "billingParty", header: "Party" },
              { key: "vehNo", header: "Lorry No" },
              { key: "fromStation", header: "From" },
              { key: "toStation", header: "To" },
              { key: "chargedWeight", header: "G. Weight" },
              { key: "freight", header: "Freight" },
            ]}
          />
        </>
      ) : null}
    </>
  );
}
