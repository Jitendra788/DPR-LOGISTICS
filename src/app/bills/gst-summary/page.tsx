"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard } from "@/components/ui/FormCard";
import { DateField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { api, downloadCsv } from "@/lib/api-client";
import { firstOfMonthIso, todayIso } from "@/lib/dates";

type Row = {
  lrNo: string;
  lrDate: string;
  billingParty: string;
  freight: number;
  gst: number;
  grandTotal: number;
  gstPaidBy: string;
  billNo: string;
};

export default function GstSummaryPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [fromDate, setFromDate] = useState(firstOfMonthIso());
  const [toDate, setToDate] = useState(todayIso());
  const [loading, setLoading] = useState(false);

  async function loadReport(e?: FormEvent) {
    e?.preventDefault();
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        ...(fromDate ? { fromDate } : {}),
        ...(toDate ? { toDate } : {}),
      }).toString();
      const data = await api<Row[]>(`/api/reports/gst-summary${qs ? `?${qs}` : ""}`);
      setRows(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalGst = useMemo(() => rows.reduce((s, r) => s + (Number(r.gst) || 0), 0), [rows]);

  return (
    <>
      <PageHeader
        title="GST Summary Report"
        subtitle="Select Date and View Report"
        subtitleClass="text-red-600"
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "GST Summary Report" }]}
      />
      <form onSubmit={loadReport}>
        <FormCard>
          <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            <DateField label="From Date" value={fromDate} onChange={setFromDate} />
            <DateField label="To Date" value={toDate} onChange={setToDate} />
            <div className="flex items-end">
              <Button type="submit" variant="teal" disabled={loading}>
                {loading ? "Loading…" : "View Report"}
              </Button>
            </div>
          </div>
          <p className="mb-3 text-sm font-semibold">Total GST: ₹ {totalGst.toFixed(2)}</p>
          <Button
            type="button"
            onClick={() => downloadCsv("gst-summary.csv", rows as unknown as Record<string, unknown>[])}
          >
            Export to Excel
          </Button>
        </FormCard>
      </form>
      <DataTable
        rows={rows}
        columns={[
          { key: "lrNo", header: "LR No" },
          { key: "lrDate", header: "Date" },
          { key: "billingParty", header: "Party" },
          { key: "freight", header: "Freight" },
          { key: "gst", header: "GST" },
          { key: "grandTotal", header: "Grand Total" },
          { key: "gstPaidBy", header: "GST Paid By" },
        ]}
      />
    </>
  );
}
