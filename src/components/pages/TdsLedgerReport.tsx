"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { DateField, ComboboxField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Flash } from "@/components/ui/Flash";
import { AdminForm } from "@/components/ui/AdminForm";
import { api, downloadCsv } from "@/lib/api-client";
import { displayToIso, firstOfMonthIso, isoToDisplay, todayIso } from "@/lib/dates";

type DocSource = "DPR" | "ROADWAYS";

type Party = { name: string };

type Receipt = {
  receiptNo: string;
  date: string;
  partyName: string;
  billNo: string;
  amount: number;
  paidAmt: number;
  tdsPct: number;
  tdsAmt: number;
  otherDed: number;
  mode: string;
  source?: string;
};

type Row = {
  srNo: number;
  date: string;
  partyName: string;
  billNo: string;
  receiptNo: string;
  paidAmt: number;
  tdsPct: number;
  tdsAmt: number;
  mode: string;
};

function normalizeDate(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const fromDisplay = displayToIso(trimmed);
  if (/^\d{4}-\d{2}-\d{2}$/.test(fromDisplay)) return fromDisplay;
  return trimmed.slice(0, 10);
}

function matchesSource(source: string | undefined, module: DocSource) {
  const s = (source || "DPR").toUpperCase();
  if (module === "ROADWAYS") return s === "ROADWAYS";
  return s !== "ROADWAYS";
}

function money(n: number) {
  return Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function showDate(iso: string) {
  if (!iso) return "";
  const d = normalizeDate(iso);
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return isoToDisplay(d).replace(/-/g, "/");
  return iso;
}

export function TdsLedgerReport({
  source = "DPR",
  title = "TDS Ledger",
  subtitle = "All parties TDS deducted on money receipts",
  exportName = "tds-ledger.csv",
}: {
  source?: DocSource;
  title?: string;
  subtitle?: string;
  exportName?: string;
}) {
  const [parties, setParties] = useState<Party[]>([]);
  const [partyName, setPartyName] = useState("");
  const [fromDate, setFromDate] = useState(firstOfMonthIso());
  const [toDate, setToDate] = useState(todayIso());
  const [rows, setRows] = useState<Row[]>([]);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api<Party[]>("/api/parties").then(setParties).catch(() => setParties([]));
  }, []);

  const totalTds = useMemo(() => rows.reduce((s, r) => s + (r.tdsAmt || 0), 0), [rows]);
  const totalPaid = useMemo(() => rows.reduce((s, r) => s + (r.paidAmt || 0), 0), [rows]);

  async function load(e?: FormEvent) {
    e?.preventDefault();
    setLoading(true);
    try {
      const list = await api<Receipt[]>("/api/receipts");
      const from = normalizeDate(fromDate);
      const to = normalizeDate(toDate);
      const party = partyName.trim().toLowerCase();

      const filtered = list
        .filter((r) => matchesSource(r.source, source))
        .filter((r) => (Number(r.tdsAmt) || 0) > 0)
        .filter((r) => {
          if (!party) return true;
          return (r.partyName || "").trim().toLowerCase() === party;
        })
        .filter((r) => {
          const d = normalizeDate(r.date);
          if (!d) return true;
          if (from && d < from) return false;
          if (to && d > to) return false;
          return true;
        })
        .sort((a, b) => {
          const da = normalizeDate(a.date);
          const db = normalizeDate(b.date);
          if (da !== db) return da.localeCompare(db);
          return String(a.receiptNo).localeCompare(String(b.receiptNo));
        })
        .map((r, i) => ({
          srNo: i + 1,
          date: r.date,
          partyName: r.partyName || "",
          billNo: r.billNo || "",
          receiptNo: r.receiptNo || "",
          paidAmt: Number(r.paidAmt) || Number(r.amount) || 0,
          tdsPct: Number(r.tdsPct) || 0,
          tdsAmt: Number(r.tdsAmt) || 0,
          mode: r.mode || "",
        }));

      setRows(filtered);
      setMessage({
        type: "ok",
        text: filtered.length
          ? `Found ${filtered.length} TDS entr${filtered.length === 1 ? "y" : "ies"}`
          : "No TDS entries in this range",
      });
    } catch (err) {
      setRows([]);
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Could not load TDS ledger" });
    } finally {
      setLoading(false);
    }
  }

  function exportExcel() {
    if (!rows.length) {
      setMessage({ type: "err", text: "No data to export" });
      return;
    }
    downloadCsv(
      exportName,
      rows.map((r) => ({
        Sr: r.srNo,
        Date: showDate(r.date),
        Party: r.partyName,
        "Bill No": r.billNo,
        "Receipt No": r.receiptNo,
        "Paid Amt": r.paidAmt,
        "TDS %": r.tdsPct,
        "TDS Amt": r.tdsAmt,
        Mode: r.mode,
      })),
    );
  }

  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: title }]}
      />
      <Flash message={message} />
      <AdminForm onSubmit={load}>
        <FormCard title="Filters" subtitle="Party optional — leave blank for all parties">
          <TwoCol>
            <div>
              <DateField label="From Date" value={fromDate} onChange={setFromDate} />
              <DateField label="To Date" value={toDate} onChange={setToDate} />
            </div>
            <div>
              <ComboboxField
                label="Party Name"
                value={partyName}
                onChange={setPartyName}
                options={parties.map((p) => p.name)}
                placeholder="All parties (or select one)"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <Button type="submit" variant="teal" disabled={loading}>
                  {loading ? "Loading…" : "Show TDS Ledger"}
                </Button>
                <Button type="button" variant="secondary" onClick={exportExcel} disabled={!rows.length}>
                  Export as Excel
                </Button>
              </div>
            </div>
          </TwoCol>
        </FormCard>
      </AdminForm>

      <FormCard
        title={
          partyName.trim()
            ? `TDS Ledger — ${partyName.trim()}`
            : "TDS Ledger — All Parties"
        }
        subtitle={`${fromDate || "…"} to ${toDate || "…"} · Total TDS ₹${money(totalTds)}`}
        className="mt-3"
      >
        <div className="table-scroll overflow-x-auto">
          <table className="erp-dt w-full min-w-[720px]">
            <thead>
              <tr>
                <th>Sr</th>
                <th>Date</th>
                <th>Party</th>
                <th>Bill No</th>
                <th>Receipt No</th>
                <th className="text-right">Paid Amt</th>
                <th className="text-right">TDS %</th>
                <th className="text-right">TDS Amt</th>
                <th>Mode</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((r) => (
                  <tr key={`${r.receiptNo}-${r.billNo}-${r.srNo}`}>
                    <td>{r.srNo}</td>
                    <td>{showDate(r.date)}</td>
                    <td>{r.partyName}</td>
                    <td>{r.billNo}</td>
                    <td>{r.receiptNo}</td>
                    <td className="text-right">{money(r.paidAmt)}</td>
                    <td className="text-right">{r.tdsPct ? Number(r.tdsPct).toFixed(2) : ""}</td>
                    <td className="text-right">{money(r.tdsAmt)}</td>
                    <td>{r.mode}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-slate-500">
                    {loading ? "Loading…" : "No TDS rows yet — set filters and click Show TDS Ledger"}
                  </td>
                </tr>
              )}
            </tbody>
            {rows.length ? (
              <tfoot>
                <tr>
                  <td colSpan={5} className="font-semibold">
                    Total
                  </td>
                  <td className="text-right font-semibold">{money(totalPaid)}</td>
                  <td />
                  <td className="text-right font-semibold">{money(totalTds)}</td>
                  <td />
                </tr>
              </tfoot>
            ) : null}
          </table>
        </div>
      </FormCard>
    </>
  );
}
