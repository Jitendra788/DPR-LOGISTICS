"use client";

import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard } from "@/components/ui/FormCard";
import { DateField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Flash } from "@/components/ui/Flash";
import { AdminForm } from "@/components/ui/AdminForm";
import { api, downloadCsv } from "@/lib/api-client";
import { firstOfMonthIso, isoToDisplay, todayIso } from "@/lib/dates";

type Row = {
  srNo: number;
  billNo: string;
  billDate: string;
  partyName: string;
  gstNo: string;
  beforeTax: number;
  cgstPct: number;
  cgstAmt: number;
  sgstPct: number;
  sgstAmt: number;
  igstPct: number;
  igstAmt: number;
  afterTax: number;
};

function money(n: number) {
  return Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function pct(n: number) {
  const v = Number(n) || 0;
  return Number.isInteger(v) ? String(v) : v.toFixed(2);
}

function showDate(iso: string) {
  if (!iso) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return isoToDisplay(iso);
  return iso;
}

export default function GstSummaryPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [fromDate, setFromDate] = useState(firstOfMonthIso());
  const [toDate, setToDate] = useState(todayIso());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function loadReport(e?: FormEvent) {
    e?.preventDefault();
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        source: "DPR",
        ...(fromDate ? { fromDate } : {}),
        ...(toDate ? { toDate } : {}),
      }).toString();
      const data = await api<Row[]>(`/api/reports/gst-summary?${qs}`);
      setRows(data);
      setMessage({ type: "ok", text: `Showing ${data.length} bill(s)` });
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Could not load report" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function exportExcel() {
    if (!rows.length) {
      setMessage({ type: "err", text: "No data to export" });
      return;
    }
    downloadCsv(
      "gst-summary.csv",
      rows.map((r) => ({
        "Sr No": r.srNo,
        "Bill No": r.billNo,
        "Bill Date": showDate(r.billDate),
        "Party Name": r.partyName,
        "GST No.": r.gstNo,
        "Before Tax": r.beforeTax,
        "CGST %": r.cgstPct,
        "CGST Amt": r.cgstAmt,
        "SGST %": r.sgstPct,
        "SGST Amt": r.sgstAmt,
        "IGST %": r.igstPct,
        "IGST Amt": r.igstAmt,
        "After Tax": r.afterTax,
      })),
    );
    setMessage({ type: "ok", text: "Excel file downloaded" });
  }

  return (
    <>
      <PageHeader
        title="GST Summary Report"
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "GST Summary Report" }]}
      />
      <Flash message={message} />

      <AdminForm onSubmit={loadReport}>
        <FormCard>
          <div className="max-w-sm">
            <DateField label="From Date" value={fromDate} onChange={setFromDate} />
            <DateField label="To Date" value={toDate} onChange={setToDate} />
            <Button type="submit" variant="teal" className="mt-1" disabled={loading}>
              {loading ? "Searching…" : "Search"}
            </Button>
          </div>
        </FormCard>
      </AdminForm>

      <FormCard>
        <div className="table-scroll -mx-1">
          <table className="erp-gst-summary erp-dt w-full min-w-[1100px] border-collapse text-[13px]">
            <thead>
              <tr>
                <th>Sr No</th>
                <th>Bill No</th>
                <th>Bill Date</th>
                <th>Party Name</th>
                <th>GST No.</th>
                <th className="text-right">Before Tax</th>
                <th className="text-right">CGST %</th>
                <th className="text-right">CGST Amt</th>
                <th className="text-right">SGST %</th>
                <th className="text-right">SGST Amt</th>
                <th className="text-right">IGST %</th>
                <th className="text-right">IGST Amt</th>
                <th className="text-right">After Tax</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={13} className="erp-dt-empty">
                    No bills found for selected dates
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={`${row.billNo}-${row.srNo}`}>
                    <td>{row.srNo}</td>
                    <td>{row.billNo}</td>
                    <td>{showDate(row.billDate)}</td>
                    <td>{row.partyName}</td>
                    <td>{row.gstNo}</td>
                    <td className="text-right tabular-nums">{money(row.beforeTax)}</td>
                    <td className="text-right tabular-nums">{pct(row.cgstPct)}</td>
                    <td className="text-right tabular-nums">{money(row.cgstAmt)}</td>
                    <td className="text-right tabular-nums">{pct(row.sgstPct)}</td>
                    <td className="text-right tabular-nums">{money(row.sgstAmt)}</td>
                    <td className="text-right tabular-nums">{pct(row.igstPct)}</td>
                    <td className="text-right tabular-nums">{money(row.igstAmt)}</td>
                    <td className="text-right tabular-nums font-semibold">{money(row.afterTax)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Button type="button" variant="teal" className="mt-3" onClick={exportExcel}>
          Export as Excel
        </Button>
      </FormCard>
    </>
  );
}
