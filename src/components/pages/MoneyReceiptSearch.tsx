"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard } from "@/components/ui/FormCard";
import { DateField, InputField, SelectField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { api } from "@/lib/api-client";
import { todayIso } from "@/lib/dates";

type Party = { name: string };
type Receipt = { id: number; receiptNo: string; date: string; partyName: string; amount: number; billNo: string; source: string };
type Bill = { billNo: string; partyName: string; amount: number; billDate: string };

export function MoneyReceiptSearch({
  source = "DPR",
  reportHref,
}: {
  source?: string;
  reportHref: string;
}) {
  const router = useRouter();
  const [parties, setParties] = useState<Party[]>([]);
  const [billNo, setBillNo] = useState("");
  const [partyName, setPartyName] = useState("");
  const [billDate, setBillDate] = useState(todayIso());
  const [rows, setRows] = useState<Receipt[] | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    api<Party[]>("/api/parties").then(setParties);
  }, []);

  async function search(e?: FormEvent) {
    e?.preventDefault();
    const [receipts, bills] = await Promise.all([
      api<Receipt[]>("/api/receipts"),
      api<Bill[]>("/api/bills"),
    ]);
    let matched = receipts.filter((r) => r.source === source);
    if (billNo.trim()) {
      matched = matched.filter((r) => r.billNo.toLowerCase() === billNo.trim().toLowerCase());
      const bill = bills.find((b) => b.billNo.toLowerCase() === billNo.trim().toLowerCase());
      if (bill && !partyName) setPartyName(bill.partyName);
    }
    if (partyName) matched = matched.filter((r) => r.partyName === partyName);
    setRows(matched);
    setMessage({ type: "ok", text: matched.length ? `Found ${matched.length} reciept(s)` : "No reciept found" });
  }

  async function remove(id: number) {
    await api(`/api/receipts/${id}`, { method: "DELETE" });
    setMessage({ type: "ok", text: "Money reciept deleted" });
    await search();
  }

  return (
    <>
      <PageHeader
        title="Money Reciept"
        subtitle="Select and fill data for the payment"
        crumbs={[{ label: "Home", href: "/" }, { label: "Money Reciept" }]}
      />
      <Flash message={message} />
      <form onSubmit={search}>
        <FormCard>
          <div className="mb-3">
            <Button type="submit" variant="teal">
              Edit/Delete Money Reciept
            </Button>
            <Button type="button" className="ml-2" onClick={() => router.push(reportHref)}>
              View Report
            </Button>
          </div>
          <InputField label="Enter Bill No For Search" value={billNo} onChange={(e) => setBillNo(e.target.value)} />
          <SelectField label="Party Name" value={partyName} onChange={(e) => setPartyName(e.target.value)} options={parties.map((p) => p.name)} />
          <DateField label="Bill Date" value={billDate} onChange={setBillDate} />
        </FormCard>
      </form>
      {rows ? (
        <DataTable
          rows={rows}
          columns={[
            { key: "delete", header: "Delete", render: (row) => <Button type="button" size="sm" variant="danger" onClick={() => remove(row.id)}>Delete</Button> },
            { key: "receiptNo", header: "Reciept No" },
            { key: "billNo", header: "Bill No" },
            { key: "date", header: "Date" },
            { key: "partyName", header: "Party" },
            { key: "amount", header: "Amount" },
          ]}
        />
      ) : (
        <FormCard className="min-h-24" />
      )}
    </>
  );
}
