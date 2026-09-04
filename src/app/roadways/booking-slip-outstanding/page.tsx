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

type Party = { name: string };
type Slip = {
  id: number;
  partyName: string;
  lorryNo: string;
  receiptDate: string;
  freight: number;
  advance: number;
  balance: number;
  receiptNo: string;
  remark?: string;
  paid: boolean;
  paidAmount: number;
  tdsAmt?: number;
  otherDed?: number;
};

type ReportRow = {
  srNo: number;
  billNo: string;
  billingParty: string;
  date: string;
  lorryNo: string;
  outstanding: number;
  remark: string;
};

function slipOutstanding(row: Slip) {
  if (row.paid) return 0;
  const bal = Number(row.balance);
  if (Number.isFinite(bal) && bal >= 0) return Number(bal.toFixed(2));
  const freight = Number(row.freight) || 0;
  const advance = Number(row.advance) || 0;
  const paid = Number(row.paidAmount) || 0;
  const tds = Number(row.tdsAmt) || 0;
  const other = Number(row.otherDed) || 0;
  return Number(Math.max(0, freight - advance - paid - tds - other).toFixed(2));
}

function showDate(value: string) {
  const raw = (value || "").slice(0, 10);
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return isoToDisplay(raw).replace(/-/g, "/");
  return raw;
}

function money(n: number) {
  return Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function toRows(list: Slip[]): ReportRow[] {
  return list
    .filter((r) => slipOutstanding(r) > 0)
    .sort((a, b) => a.id - b.id)
    .map((r) => ({
      srNo: r.id,
      billNo: r.receiptNo || String(r.id),
      billingParty: r.partyName,
      date: showDate(r.receiptDate),
      lorryNo: r.lorryNo,
      outstanding: slipOutstanding(r),
      remark: r.remark || "",
    }));
}

export default function BookingSlipOutstandingPage() {
  const [parties, setParties] = useState<Party[]>([]);
  const [partyName, setPartyName] = useState("");
  const [allRows, setAllRows] = useState<ReportRow[] | null>(null);
  const [filterByParty, setFilterByParty] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api<Party[]>("/api/parties")
      .then((list) => {
        setParties(list);
        if (list[0]?.name) setPartyName(list[0].name);
      })
      .catch(() => setParties([]));
  }, []);

  const rows = useMemo(() => {
    if (!allRows) return null;
    if (!filterByParty || !partyName.trim()) return allRows;
    const key = partyName.trim().toLowerCase();
    return allRows.filter((r) => r.billingParty.trim().toLowerCase() === key);
  }, [allRows, partyName, filterByParty]);

  const totalOutstanding = useMemo(
    () => (rows ?? []).reduce((s, r) => s + r.outstanding, 0),
    [rows],
  );

  async function showAll(e?: FormEvent) {
    e?.preventDefault();
    setLoading(true);
    try {
      const slips = await api<Slip[]>("/api/slips");
      const mapped = toRows(slips);
      setAllRows(mapped);
      setFilterByParty(false);
      setMessage({ type: "ok", text: `Showing ${mapped.length} outstanding slip(s)` });
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Could not load report" });
    } finally {
      setLoading(false);
    }
  }

  function exportExcel() {
    if (!rows?.length) {
      setMessage({ type: "err", text: "No data to export" });
      return;
    }
    downloadCsv(
      "booking-slip-outstanding.csv",
      rows.map((r) => ({
        "Sr No": r.srNo,
        "Bill No": r.billNo,
        "Billing Party": r.billingParty,
        Date: r.date,
        "Lorry No": r.lorryNo,
        Outstanding: r.outstanding,
        Remark: r.remark,
      })),
    );
    setMessage({ type: "ok", text: "Excel file downloaded" });
  }

  return (
    <>
      <PageHeader
        title="Booking Slip Outstanding Report"
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Booking Slip Outstanding Report" }]}
      />
      <Flash message={message} />

      <AdminForm onSubmit={showAll}>
        <FormCard>
          <div className="max-w-xl">
            <Button type="submit" variant="teal" disabled={loading}>
              {loading ? "Loading…" : "Show All"}
            </Button>
            <div className="mt-3">
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
          </div>
        </FormCard>
      </AdminForm>

      {rows ? (
        <FormCard>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold">Total Outstanding: ₹{money(totalOutstanding)}</p>
            <Button type="button" variant="teal" size="sm" onClick={exportExcel}>
              Export as Excel
            </Button>
          </div>
          <div className="table-scroll -mx-1">
            <table className="erp-gst-summary erp-dt w-full min-w-[900px] border-collapse text-[13px]">
              <thead>
                <tr>
                  <th>Sr No</th>
                  <th>Bill No</th>
                  <th>Billing Party</th>
                  <th>Date</th>
                  <th>Lorry No</th>
                  <th className="text-right">Outstanding</th>
                  <th>Remark</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="erp-dt-empty">
                      No outstanding slips found
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={`${row.srNo}-${row.billNo}`}>
                      <td>{row.srNo}</td>
                      <td>{row.billNo}</td>
                      <td>{row.billingParty}</td>
                      <td>{row.date}</td>
                      <td>{row.lorryNo}</td>
                      <td className="text-right tabular-nums">{money(row.outstanding)}</td>
                      <td>{row.remark}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </FormCard>
      ) : null}
    </>
  );
}
