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
type Row = { partyName: string; freight: number; received: number; outstanding: number };

export default function RoadwaysOutstandingPage() {
  const [parties, setParties] = useState<Party[]>([]);
  const [partyName, setPartyName] = useState("");
  const [fromDate, setFromDate] = useState(todayIso());
  const [toDate, setToDate] = useState(todayIso());
  const [rows, setRows] = useState<Row[] | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    api<Party[]>("/api/parties").then((p) => {
      setParties(p);
      setPartyName((name) => name || p[0]?.name || "");
    });
  }, []);

  async function show(e?: FormEvent) {
    e?.preventDefault();
    const [bookings, receipts] = await Promise.all([
      api<{ billingParty: string; grandTotal: number; lrDate: string; source: string }[]>("/api/bookings"),
      api<{ partyName: string; amount: number; source: string }[]>("/api/receipts"),
    ]);
    const rwBookings = bookings.filter((b) => b.source === "ROADWAYS");
    const rwReceipts = receipts.filter((r) => r.source === "ROADWAYS");
    const names = partyName ? [partyName] : [...new Set(rwBookings.map((b) => b.billingParty))];
    const data = names.map((name) => {
      const freight = rwBookings.filter((b) => b.billingParty === name).reduce((s, b) => s + b.grandTotal, 0);
      const received = rwReceipts.filter((r) => r.partyName === name).reduce((s, r) => s + r.amount, 0);
      return { partyName: name, freight, received, outstanding: Math.max(0, freight - received) };
    });
    setRows(data);
    setMessage({ type: "ok", text: `Loaded ${data.length} party record(s)` });
  }

  return (
    <>
      <PageHeader
        title="Roadways Outstanding Report"
        subtitle="Select Date and View Report"
        subtitleClass="text-red-600"
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Roadways Outstanding Report" }]}
      />
      <Flash message={message} />
      <form onSubmit={show}>
        <FormCard>
          <TwoCol>
            <div>
              <SelectField
                label="Enter Party Name"
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
                options={parties.map((p) => p.name)}
                placeholder=""
              />
              <DateField label="From Date" value={fromDate} onChange={setFromDate} />
              <Button type="submit">Show All</Button>
            </div>
            <DateField label="To Date" value={toDate} onChange={setToDate} />
          </TwoCol>
        </FormCard>
      </form>
      {rows ? (
        <>
          <FormCard>
            <Button type="button" onClick={() => downloadCsv("roadways-outstanding.csv", rows as unknown as Record<string, unknown>[])}>
              Export to Excel
            </Button>
          </FormCard>
          <DataTable
            rows={rows}
            columns={[
              { key: "partyName", header: "Party" },
              { key: "freight", header: "Freight" },
              { key: "received", header: "Received" },
              { key: "outstanding", header: "Outstanding" },
            ]}
          />
        </>
      ) : (
        <FormCard className="min-h-16" />
      )}
    </>
  );
}
