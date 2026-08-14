"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard } from "@/components/ui/FormCard";
import { SelectField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { api, downloadCsv } from "@/lib/api-client";

type Party = { name: string };
type Receipt = { receiptNo: string; date: string; partyName: string; amount: number; billNo: string; source: string };

export default function MoneyReceiptReportPage() {
  const router = useRouter();
  const [parties, setParties] = useState<Party[]>([]);
  const [partyName, setPartyName] = useState("");
  const [rows, setRows] = useState<Receipt[] | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    api<Party[]>("/api/parties").then(setParties);
  }, []);

  async function show(e?: FormEvent) {
    e?.preventDefault();
    const all = await api<Receipt[]>("/api/receipts");
    const filtered = all.filter((r) => r.source === "DPR" && (!partyName || r.partyName === partyName));
    setRows(filtered);
    setMessage({ type: "ok", text: `Found ${filtered.length} reciept(s)` });
  }

  return (
    <>
      <PageHeader
        title="Money Reciept"
        subtitle="Select and fill data for the payment"
        crumbs={[{ label: "Home", href: "/" }, { label: "Money Reciept" }]}
      />
      <Flash message={message} />
      <form onSubmit={show}>
        <FormCard>
          <div className="mb-3 flex flex-wrap gap-2">
            <Button type="submit" variant="teal">
              Show All
            </Button>
            <Button type="button" variant="teal" onClick={() => router.push("/bills/party-ledger")}>
              Go To Party Ledger
            </Button>
          </div>
          <SelectField label="Party Name" value={partyName} onChange={(e) => setPartyName(e.target.value)} options={parties.map((p) => p.name)} />
        </FormCard>
      </form>
      <FormCard>
        <Button
          type="button"
          variant="teal"
          disabled={!rows?.length}
          onClick={() => rows && downloadCsv("money-reciept.csv", rows as unknown as Record<string, unknown>[])}
        >
          Generate Excel
        </Button>
      </FormCard>
      {rows ? (
        <DataTable
          rows={rows}
          columns={[
            { key: "receiptNo", header: "Reciept No" },
            { key: "billNo", header: "Bill No" },
            { key: "date", header: "Date" },
            { key: "partyName", header: "Party" },
            { key: "amount", header: "Amount" },
          ]}
        />
      ) : null}
    </>
  );
}
