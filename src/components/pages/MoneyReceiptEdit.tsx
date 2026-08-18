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

type Receipt = {
  id: number;
  billNo: string;
  date: string;
  partyName: string;
  tdsPct: number;
  tdsAmt: number;
  paidAmt: number;
  amount: number;
  otherDed: number;
  source: string;
};

function slashDate(iso: string) {
  const text = isoToDisplay(iso);
  return text.replaceAll("-", "/");
}

export function MoneyReceiptEdit({
  source = "DPR",
  backHref,
}: {
  source?: string;
  backHref: string;
}) {
  const router = useRouter();
  const [fromDate, setFromDate] = useState(firstOfMonthIso());
  const [toDate, setToDate] = useState(todayIso());
  const [rows, setRows] = useState<Receipt[] | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function showData(e?: FormEvent) {
    e?.preventDefault();
    const all = await api<Receipt[]>("/api/receipts");
    const filtered = all.filter((r) => {
      if ((r.source || "DPR") !== source) return false;
      const d = (r.date || "").slice(0, 10);
      if (fromDate && d && d < fromDate) return false;
      if (toDate && d && d > toDate) return false;
      return true;
    });
    setRows(filtered);
    setMessage({ type: "ok", text: `Showing ${filtered.length} reciept(s)` });
  }

  async function remove(id: number) {
    if (!confirm("Delete this entry?")) return;
    await api(`/api/receipts/${id}`, { method: "DELETE" });
    setMessage({ type: "ok", text: "Entry deleted" });
    await showData();
  }

  return (
    <>
      <PageHeader
        title="Money Reciept"
        subtitle="Select and fill data for the payment"
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Money Reciept" }]}
      />
      <Flash message={message} />
      <form onSubmit={showData}>
        <FormCard>
          <TwoCol>
            <div>
              <DateField label="Enter From Date" value={fromDate} onChange={setFromDate} />
              <div className="mt-1 flex flex-wrap gap-2">
                <Button type="submit">Show Data</Button>
                <Button type="button" onClick={() => router.push(backHref)}>
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
              header: "Delete This Entry",
              render: (row) => (
                <button type="button" className="text-[#3c8dbc] underline" onClick={() => remove(row.id)}>
                  Delete
                </button>
              ),
            },
            { key: "srNo", header: "Sr No" },
            { key: "billNo", header: "Bill No" },
            { key: "date", header: "MR Date", render: (row) => slashDate(row.date) },
            { key: "partyName", header: "Party Name" },
            { key: "tdsPct", header: "Tds %" },
            { key: "tdsAmt", header: "TDS Amt" },
            { key: "paidAmt", header: "Paid Amt", render: (row) => row.paidAmt || row.amount },
            { key: "otherDed", header: "Other Ded" },
          ]}
        />
      ) : (
        <FormCard className="min-h-16" />
      )}
    </>
  );
}
