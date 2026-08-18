"use client";

import { FormEvent, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { DateField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { api, downloadCsv } from "@/lib/api-client";
import { todayIso } from "@/lib/dates";

type Slip = {
  id: number;
  partyName: string;
  lorryNo: string;
  fromStation: string;
  toStation: string;
  receiptDate: string;
  freight: number;
  advance: number;
  balance: number;
  receiptNo: string;
  paid: boolean;
};

export default function BookingSlipOutstandingPage() {
  const [rows, setRows] = useState<Slip[] | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [fromDate, setFromDate] = useState(todayIso());
  const [toDate, setToDate] = useState(todayIso());

  async function show(e?: FormEvent) {
    e?.preventDefault();
    const all = await api<Slip[]>("/api/slips");
    const filtered = all.filter((r) => {
      if (r.paid) return false;
      const d = r.receiptDate || "";
      if (fromDate && d && d < fromDate) return false;
      if (toDate && d && d > toDate) return false;
      return true;
    });
    setRows(filtered);
    setMessage({ type: "ok", text: `Found ${filtered.length} outstanding slip(s)` });
  }

  return (
    <>
      <PageHeader
        title="Booking Slip Outstanding Report"
        subtitle="Select Date and View Report"
        subtitleClass="text-red-600"
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Booking Slip Outstanding Report" }]}
      />
      <Flash message={message} />
      <form onSubmit={show}>
        <FormCard>
          <TwoCol>
            <div>
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
            <Button type="button" onClick={() => downloadCsv("booking-slip-outstanding.csv", rows as unknown as Record<string, unknown>[])}>
              Export to Excel
            </Button>
          </FormCard>
          <DataTable
            rows={rows}
            columns={[
              { key: "receiptNo", header: "Reciept No" },
              { key: "receiptDate", header: "Date" },
              { key: "partyName", header: "Party" },
              { key: "lorryNo", header: "Lorry No" },
              { key: "fromStation", header: "From" },
              { key: "toStation", header: "To" },
              { key: "freight", header: "Freight" },
              { key: "advance", header: "Advance" },
              { key: "balance", header: "Balance" },
            ]}
          />
        </>
      ) : (
        <FormCard className="min-h-16" />
      )}
    </>
  );
}
