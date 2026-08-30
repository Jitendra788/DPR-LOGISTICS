"use client";

import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { InputField, SelectField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { AdminForm } from "@/components/ui/AdminForm";
import { api, downloadCsv } from "@/lib/api-client";

type Party = { name: string };
type Bill = {
  id: number;
  billNo: string;
  partyName: string;
  fromDate: string;
  toDate: string;
  amount: number;
  lrCount: number;
};

export default function BillReportPage() {
  const [parties, setParties] = useState<Party[]>([]);
  const [rows, setRows] = useState<Bill[]>([]);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [filters, setFilters] = useState({
    fromDate: "2024-08-14",
    toDate: new Date().toISOString().slice(0, 10),
    partyName: "",
  });

  useEffect(() => {
    api<Party[]>("/api/parties").then(setParties);
  }, []);

  async function showReport(e?: FormEvent) {
    e?.preventDefault();
    try {
      const all = await api<Bill[]>("/api/bills");
      const filtered = all.filter((b) => {
        if (filters.partyName && b.partyName !== filters.partyName) return false;
        if (filters.fromDate && b.fromDate && b.fromDate < filters.fromDate) return false;
        if (filters.toDate && b.toDate && b.toDate > filters.toDate) return false;
        return true;
      });
      setRows(filtered);
      setMessage({ type: "ok", text: `Found ${filtered.length} bill(s)` });
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Failed" });
    }
  }

  return (
    <>
      <PageHeader title="Bill Report" subtitle="Select date and view bills" crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Bill Report" }]} />
      <Flash message={message} />
      <AdminForm onSubmit={showReport}>
        <FormCard>
          <TwoCol>
            <div>
              <InputField label="From Date" type="date" value={filters.fromDate} onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })} />
              <InputField label="To Date" type="date" value={filters.toDate} onChange={(e) => setFilters({ ...filters, toDate: e.target.value })} />
              <Button type="submit">Show Report</Button>
            </div>
            <div>
              <SelectField label="Billing Party" value={filters.partyName} onChange={(e) => setFilters({ ...filters, partyName: e.target.value })} options={parties.map((p) => p.name)} />
            </div>
          </TwoCol>
        </FormCard>
      </AdminForm>
      <FormCard>
        <Button type="button" onClick={() => downloadCsv("bill-report.csv", rows as unknown as Record<string, unknown>[])} disabled={!rows.length}>
          Export to Excel
        </Button>
      </FormCard>
      <DataTable
        rows={rows}
        columns={[
          { key: "billNo", header: "Bill No" },
          { key: "partyName", header: "Party" },
          { key: "fromDate", header: "From" },
          { key: "toDate", header: "To" },
          { key: "lrCount", header: "LR Count" },
          { key: "amount", header: "Amount" },
        ]}
      />
    </>
  );
}
