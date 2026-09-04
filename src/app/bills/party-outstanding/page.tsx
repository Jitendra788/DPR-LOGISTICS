"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { DateField, ComboboxField, InputField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { AdminForm } from "@/components/ui/AdminForm";
import { api, downloadCsv } from "@/lib/api-client";
import { firstOfMonthIso, todayIso } from "@/lib/dates";

type Party = { name: string };
type ApiRow = {
  billNo: string;
  partyName: string;
  date: string;
  outstanding: number;
};
type Row = { srNo: number; partyName: string; outstanding: number };

function money(n: number) {
  return Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Old Partyoutstanding.aspx — party-wise pending (DPR bills only, correct GST + MR/TDS math). */
export default function PartyOutstandingPage() {
  const [parties, setParties] = useState<Party[]>([]);
  const [partyName, setPartyName] = useState("");
  const [billNo, setBillNo] = useState("");
  const [fromDate, setFromDate] = useState(firstOfMonthIso());
  const [toDate, setToDate] = useState(todayIso());
  const [rows, setRows] = useState<Row[]>([]);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api<Party[]>("/api/parties").then((p) => setParties(p));
  }, []);

  const total = useMemo(() => rows.reduce((s, r) => s + r.outstanding, 0), [rows]);

  async function load(e?: FormEvent) {
    e?.preventDefault();
    setLoading(true);
    try {
      const qs = new URLSearchParams({ source: "DPR" });
      // Empty party = all parties (old Partyoutstanding.aspx)
      if (partyName.trim()) qs.set("partyName", partyName.trim());
      if (billNo.trim()) qs.set("billNo", billNo.trim());
      if (fromDate) qs.set("fromDate", fromDate);
      if (toDate) qs.set("toDate", toDate);
      const data = await api<ApiRow[]>(`/api/reports/money-receipt-outstanding?${qs}`);
      const byParty: Record<string, number> = {};
      data.forEach((r) => {
        if ((Number(r.outstanding) || 0) <= 0) return;
        byParty[r.partyName] = (byParty[r.partyName] || 0) + (Number(r.outstanding) || 0);
      });
      const mapped = Object.entries(byParty)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([name, outstanding], i) => ({
          srNo: i + 1,
          partyName: name,
          outstanding: Number(outstanding.toFixed(2)),
        }));
      setRows(mapped);
      setMessage({ type: "ok", text: `Found ${mapped.length} party outstanding` });
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Could not load outstanding" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Party Outstanding"
        subtitle="View Party Outstanding"
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Party Outstanding" }]}
      />
      <Flash message={message} />
      <AdminForm onSubmit={load}>
        <FormCard>
          <TwoCol>
            <div>
              <ComboboxField
                label="Party Name"
                value={partyName}
                onChange={setPartyName}
                options={parties.map((p) => p.name)}
                placeholder="All parties (or select one)"
              />
              <InputField label="Bill No" value={billNo} onChange={(e) => setBillNo(e.target.value)} placeholder="Optional filter" />
              <Button type="submit" variant="teal" disabled={loading}>
                {loading ? "Loading…" : "Search"}
              </Button>
            </div>
            <div>
              <DateField label="From Bill Date" value={fromDate} onChange={setFromDate} />
              <DateField label="To Bill Date" value={toDate} onChange={setToDate} />
            </div>
          </TwoCol>
        </FormCard>
      </AdminForm>
      <FormCard>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold">Total Outstanding: ₹{money(total)}</p>
          <Button
            type="button"
            variant="teal"
            disabled={!rows.length}
            onClick={() => {
              downloadCsv("party-outstanding.csv", rows as unknown as Record<string, unknown>[]);
              setMessage({ type: "ok", text: "Excel file downloaded" });
            }}
          >
            Export to Excel
          </Button>
        </div>
        <DataTable
          rows={rows}
          columns={[
            { key: "srNo", header: "Sr No" },
            { key: "partyName", header: "Party Name" },
            { key: "outstanding", header: "Outstanding Rs.", render: (row) => money(row.outstanding) },
          ]}
        />
      </FormCard>
    </>
  );
}
