"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard } from "@/components/ui/FormCard";
import { ComboboxField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { AdminForm } from "@/components/ui/AdminForm";
import { api, downloadCsv } from "@/lib/api-client";

type Party = { name: string };
type Receipt = { receiptNo: string; date: string; partyName: string; amount: number; billNo: string; source: string };

export default function RoadwaysMoneyReceiptReportPage() {
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
    const filtered = all.filter((r) => r.source === "ROADWAYS" && (!partyName || r.partyName === partyName));
    setRows(filtered);
    setMessage({ type: "ok", text: `Found ${filtered.length} reciept(s)` });
  }

  return (
    <>
      <PageHeader
        title="Money Reciept"
        subtitle="Roadways receipts report"
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Money Reciept" }]}
      />
      <Flash message={message} />
      <AdminForm onSubmit={show}>
        <FormCard>
          <div className="mb-3 flex flex-wrap gap-2">
            <Button type="submit" variant="teal">
              Show All
            </Button>
            <Button type="button" variant="teal" onClick={() => router.push("/roadways/party-ledger")}>
              Go To Party Ledger
            </Button>
            <Button type="button" onClick={() => router.push("/roadways/money-receipt")}>
              Back
            </Button>
          </div>
          <ComboboxField
            label="Party Name"
            value={partyName}
            onChange={setPartyName}
            options={parties.map((p) => p.name)}
            placeholder="Search or select party"
          />
        </FormCard>
      </AdminForm>
      <FormCard>
        <Button
          type="button"
          variant="teal"
          disabled={!rows?.length}
          onClick={() => rows && downloadCsv("roadways-money-reciept.csv", rows as unknown as Record<string, unknown>[])}
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
