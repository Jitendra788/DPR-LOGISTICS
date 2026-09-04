"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard } from "@/components/ui/FormCard";
import { ComboboxField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Flash } from "@/components/ui/Flash";
import { AdminForm } from "@/components/ui/AdminForm";
import { api, downloadCsv } from "@/lib/api-client";
import { isoToDisplay } from "@/lib/dates";

type DocSource = "DPR" | "ROADWAYS";

type Party = { name: string };
type ApiRow = {
  srNo: number;
  billNo: string;
  partyName: string;
  date: string;
  outstanding: number;
  billAmount: number;
  paid: number;
};

type ViewRow = {
  srNo: number;
  billNo: string;
  billingParty: string;
  date: string;
  outstanding: number;
};

function money(n: number) {
  return Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function showDate(iso: string) {
  if (!iso) return "";
  const d = iso.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return isoToDisplay(d).replace(/-/g, "/");
  return iso;
}

export function BillwiseOutstandingReport({
  source = "DPR",
  title = "Billwise Outstanding Report",
  exportName = "billwise-outstanding.csv",
}: {
  source?: DocSource;
  title?: string;
  exportName?: string;
}) {
  const [parties, setParties] = useState<Party[]>([]);
  const [partyName, setPartyName] = useState("");
  const [allRows, setAllRows] = useState<ViewRow[] | null>(null);
  const [filterByParty, setFilterByParty] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api<Party[]>("/api/parties").then((p) => {
      setParties(p);
      setPartyName((n) => n || p[0]?.name || "");
    });
  }, []);

  const rows = useMemo(() => {
    if (!allRows) return null;
    if (!filterByParty || !partyName.trim()) return allRows;
    const key = partyName.trim().toLowerCase();
    return allRows.filter((r) => r.billingParty.trim().toLowerCase() === key);
  }, [allRows, partyName, filterByParty]);

  const totalOutstanding = useMemo(
    () => (rows ?? []).reduce((s, r) => s + (Number(r.outstanding) || 0), 0),
    [rows],
  );

  async function load() {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ source }).toString();
      const data = await api<ApiRow[]>(`/api/reports/money-receipt-outstanding?${qs}`);
      const mapped: ViewRow[] = data.map((r, i) => ({
        srNo: r.srNo || i + 1,
        billNo: r.billNo,
        billingParty: r.partyName,
        date: showDate(r.date),
        outstanding: Number(r.outstanding) || 0,
      }));
      setAllRows(mapped);
      setFilterByParty(false);
      setMessage({ type: "ok", text: `Showing ${mapped.length} outstanding bill(s)` });
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Could not load report" });
    } finally {
      setLoading(false);
    }
  }

  async function showAll(e?: FormEvent) {
    e?.preventDefault();
    await load();
  }

  function generateExcel() {
    if (!rows?.length) {
      setMessage({ type: "err", text: "No data to export" });
      return;
    }
    downloadCsv(
      exportName,
      rows.map((r) => ({
        "Sr No": r.srNo,
        "Bill No": r.billNo,
        "Billing Party": r.billingParty,
        Date: r.date,
        Outstanding: r.outstanding,
      })),
    );
    setMessage({ type: "ok", text: "Excel file downloaded" });
  }

  return (
    <>
      <PageHeader
        title={title}
        subtitle="Select and fill data for the payment"
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Outstanding Report" }]}
      />
      <Flash message={message} />
      <AdminForm onSubmit={showAll}>
        <FormCard>
          <div className="mb-3">
            <Button type="submit" variant="teal" disabled={loading}>
              {loading ? "Loading…" : "Show All"}
            </Button>
          </div>
          <div className="max-w-xl">
            <ComboboxField
              label="Party Name"
              value={partyName}
              onChange={(name) => {
                setPartyName(name);
                if (allRows) setFilterByParty(Boolean(name.trim()));
              }}
              options={parties.map((p) => p.name)}
              placeholder="Search or select party"
            />
          </div>
        </FormCard>
      </AdminForm>

      {rows ? (
        <FormCard>
          <div className="table-scroll -mx-1">
            <table className="erp-gst-summary erp-dt w-full min-w-[720px] border-collapse text-[13px]">
              <thead>
                <tr>
                  <th>Sr No</th>
                  <th>Bill No</th>
                  <th>Billing Party</th>
                  <th>Date</th>
                  <th className="text-right">Outstanding</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="erp-dt-empty">
                      No outstanding bills found
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={`${row.billNo}-${row.srNo}`}>
                      <td>{row.srNo}</td>
                      <td>{row.billNo}</td>
                      <td>{row.billingParty}</td>
                      <td>{row.date}</td>
                      <td className="text-right tabular-nums">{money(row.outstanding)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <Button type="button" variant="teal" onClick={generateExcel}>
              Generate Excel
            </Button>
            <p className="text-sm font-semibold">Total Outstanding: ₹{money(totalOutstanding)}</p>
          </div>
        </FormCard>
      ) : null}
    </>
  );
}
