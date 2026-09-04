"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { DateField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { api } from "@/lib/api-client";
import { firstOfMonthIso, isoToDisplay, todayIso } from "@/lib/dates";

type Slip = {
  id: number;
  receiptNo: string;
  receiptDate: string;
  partyName: string;
  lorryNo: string;
  freight: number;
  advance: number;
  balance: number;
  paid: boolean;
  paidDate: string;
  paidAmount: number;
  tdsAmt?: number;
  otherDed?: number;
  remark: string;
};

function slashDate(iso: string) {
  return isoToDisplay(iso).replaceAll("-", "/");
}

export default function BookingSlipPaymentEditPage() {
  const router = useRouter();
  const [fromDate, setFromDate] = useState(firstOfMonthIso());
  const [toDate, setToDate] = useState(todayIso());
  const [rows, setRows] = useState<Slip[] | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function showData(e?: FormEvent) {
    e?.preventDefault();
    const all = await api<Slip[]>("/api/slips");
    const filtered = all.filter((r) => {
      if (!r.paid && !(Number(r.paidAmount) > 0)) return false;
      const d = (r.paidDate || r.receiptDate || "").slice(0, 10);
      if (fromDate && d && d < fromDate) return false;
      if (toDate && d && d > toDate) return false;
      return true;
    });
    setRows(filtered);
    setMessage({ type: "ok", text: `Showing ${filtered.length} payment(s)` });
  }

  async function undoPayment(row: Slip) {
    if (!confirm(`Undo payment for Reciept ${row.receiptNo}? Slip will go back to outstanding.`)) return;
    const freight = Number(row.freight) || 0;
    const advance = Number(row.advance) || 0;
    await api(`/api/slips/${row.id}`, {
      method: "PUT",
      body: JSON.stringify({
        ...row,
        paid: false,
        paidDate: "",
        paidAmount: 0,
        tdsPct: 0,
        tdsAmt: 0,
        otherDed: 0,
        balance: Number(Math.max(0, freight - advance).toFixed(2)),
      }),
    });
    setMessage({ type: "ok", text: `Payment undone for ${row.receiptNo}` });
    await showData();
  }

  return (
    <>
      <PageHeader
        title="Booking Slip Payment"
        subtitle="Select and fill data for the payment"
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Booking Slip Payment" }]}
      />
      <Flash message={message} />
      <form onSubmit={showData}>
        <FormCard>
          <TwoCol>
            <div>
              <DateField label="Enter From Date" value={fromDate} onChange={setFromDate} />
              <div className="mt-1 flex flex-wrap gap-2">
                <Button type="submit">Show Data</Button>
                <Button type="button" onClick={() => router.push("/roadways/booking-slip-payment")}>
                  Back
                </Button>
              </div>
            </div>
            <div>
              <DateField label="To Date" value={toDate} onChange={setToDate} />
            </div>
          </TwoCol>
        </FormCard>
      </form>
      {rows ? (
        <DataTable
          rows={rows.map((r) => ({ ...r, srNo: r.id }))}
          columns={[
            {
              key: "del",
              header: "Undo Payment",
              render: (row) => (
                <button type="button" className="text-[#3c8dbc] underline" onClick={() => undoPayment(row)}>
                  Undo
                </button>
              ),
            },
            { key: "srNo", header: "Sr No" },
            { key: "receiptNo", header: "Reciept No" },
            { key: "paidDate", header: "Paid Date", render: (row) => slashDate(row.paidDate || row.receiptDate) },
            { key: "partyName", header: "Party Name" },
            { key: "lorryNo", header: "Lorry No" },
            { key: "paidAmount", header: "Paid Amt" },
            { key: "tdsAmt", header: "TDS" },
            { key: "otherDed", header: "Other Ded" },
            { key: "balance", header: "Balance" },
            { key: "remark", header: "Narration" },
          ]}
        />
      ) : (
        <FormCard className="min-h-16" />
      )}
    </>
  );
}
