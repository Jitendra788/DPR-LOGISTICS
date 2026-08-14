"use client";

import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { DateField, InputField, SelectField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { api } from "@/lib/api-client";
import { todayIso } from "@/lib/dates";

type Party = { name: string };
type Slip = {
  id: number;
  partyName: string;
  lorryNo: string;
  receiptDate: string;
  receiptNo: string;
  freight: number;
  advance: number;
  balance: number;
  paid: boolean;
  paidDate: string;
  paidAmount: number;
};

export default function BookingSlipPaymentPage() {
  const [parties, setParties] = useState<Party[]>([]);
  const [rows, setRows] = useState<Slip[] | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [filters, setFilters] = useState({
    partyName: "",
    lorryNo: "",
    fromDate: todayIso(),
    toDate: todayIso(),
  });

  useEffect(() => {
    api<Party[]>("/api/parties").then((p) => {
      setParties(p);
      setFilters((f) => ({ ...f, partyName: f.partyName || p[0]?.name || "" }));
    });
  }, []);

  async function show(e?: FormEvent) {
    e?.preventDefault();
    const all = await api<Slip[]>("/api/slips");
    const filtered = all.filter((r) => {
      if (filters.partyName && r.partyName !== filters.partyName) return false;
      if (filters.lorryNo && r.lorryNo !== filters.lorryNo) return false;
      const d = r.receiptDate || "";
      if (filters.fromDate && d && d < filters.fromDate) return false;
      if (filters.toDate && d && d > filters.toDate) return false;
      return !r.paid;
    });
    setRows(filtered);
    setMessage({ type: "ok", text: `Found ${filtered.length} unpaid slip(s)` });
  }

  async function pay(row: Slip) {
    await api(`/api/slips/${row.id}`, {
      method: "PUT",
      body: JSON.stringify({
        ...row,
        paid: true,
        paidDate: todayIso(),
        paidAmount: row.balance || row.freight,
        balance: 0,
      }),
    });
    setMessage({ type: "ok", text: `Payment saved for Reciept ${row.receiptNo}` });
    await show();
  }

  return (
    <>
      <PageHeader
        title="Booking Slip Payment"
        subtitle="Select and fill data for the payment"
        crumbs={[{ label: "Home", href: "/" }, { label: "Booking Slip Payment" }]}
      />
      <Flash message={message} />
      <form onSubmit={show}>
        <FormCard>
          <TwoCol>
            <div>
              <SelectField
                label="Enter Party Name"
                value={filters.partyName}
                onChange={(e) => setFilters({ ...filters, partyName: e.target.value })}
                options={parties.map((p) => p.name)}
                placeholder=""
              />
              <DateField label="From Date" value={filters.fromDate} onChange={(fromDate) => setFilters({ ...filters, fromDate })} />
              <Button type="submit">Show Detail</Button>
            </div>
            <div>
              <InputField label="Lorry No" value={filters.lorryNo} onChange={(e) => setFilters({ ...filters, lorryNo: e.target.value })} />
              <DateField label="To Date" value={filters.toDate} onChange={(toDate) => setFilters({ ...filters, toDate })} />
            </div>
          </TwoCol>
        </FormCard>
      </form>
      {rows ? (
        <DataTable
          rows={rows}
          columns={[
            { key: "pay", header: "Action", render: (row) => <Button type="button" size="sm" variant="teal" onClick={() => pay(row)}>Pay Balance</Button> },
            { key: "receiptNo", header: "Reciept No" },
            { key: "receiptDate", header: "Date" },
            { key: "partyName", header: "Party" },
            { key: "lorryNo", header: "Lorry No" },
            { key: "freight", header: "Freight" },
            { key: "advance", header: "Advance" },
            { key: "balance", header: "Balance" },
          ]}
        />
      ) : (
        <FormCard className="min-h-16" />
      )}
    </>
  );
}
