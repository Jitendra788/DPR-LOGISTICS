"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard } from "@/components/ui/FormCard";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { api, downloadCsv } from "@/lib/api-client";

type Row = { lrNo: string; lrDate: string; billingParty: string; freight: number; gst: number; grandTotal: number; gstPaidBy: string };

export default function GstSummaryPage() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    api<Row[]>("/api/bookings").then(setRows);
  }, []);

  const totalGst = rows.reduce((s, r) => s + (Number(r.gst) || 0), 0);

  return (
    <>
      <PageHeader title="GST Summary Report" subtitle="Select Date and View Report" subtitleClass="text-red-600" crumbs={[{ label: "Home", href: "/" }, { label: "GST Summary Report" }]} />
      <FormCard>
        <p className="mb-3 text-sm font-semibold">Total GST: ₹ {totalGst.toFixed(2)}</p>
        <Button type="button" onClick={() => downloadCsv("gst-summary.csv", rows as unknown as Record<string, unknown>[])}>Export to Excel</Button>
      </FormCard>
      <DataTable rows={rows} columns={[{ key: "lrNo", header: "LR No" }, { key: "lrDate", header: "Date" }, { key: "billingParty", header: "Party" }, { key: "freight", header: "Freight" }, { key: "gst", header: "GST" }, { key: "grandTotal", header: "Grand Total" }, { key: "gstPaidBy", header: "GST Paid By" }]} />
    </>
  );
}
