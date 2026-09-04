"use client";

import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { DateField, ComboboxField, InputField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { AdminForm } from "@/components/ui/AdminForm";
import { api, downloadCsv } from "@/lib/api-client";
import { stripLrPrefix } from "@/lib/lr-no";
import { firstOfMonthIso, todayIso } from "@/lib/dates";

type Party = { name: string };
type Booking = {
  id: number;
  lrNo: string;
  lrDate: string;
  fromStation: string;
  toStation: string;
  vehNo: string;
  billingParty: string;
  particulars: string;
  chargedWeight: string;
  freight: number;
  gst: number;
  grandTotal: number;
  billed: boolean;
  billNo: string;
  lrType?: string;
};

export default function BookingMisReportPage() {
  const [parties, setParties] = useState<Party[]>([]);
  const [partyNames, setPartyNames] = useState<string[]>([]);
  const [rows, setRows] = useState<Booking[]>([]);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [filters, setFilters] = useState({
    fromDate: firstOfMonthIso(),
    toDate: todayIso(),
    billingParty: "",
    fromStation: "",
    toStation: "",
  });

  async function loadReport(e?: FormEvent, override?: Partial<typeof filters>) {
    e?.preventDefault();
    const active = { ...filters, ...override };
    try {
      const qs = new URLSearchParams(
        Object.fromEntries(Object.entries(active).filter(([, v]) => v.trim() !== "")),
      ).toString();
      const data = await api<Booking[]>(`/api/reports/bookings${qs ? `?${qs}` : ""}`);
      setRows(data);
      setMessage({ type: "ok", text: `Found ${data.length} booking(s)` });
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Report failed" });
    }
  }

  useEffect(() => {
    api<Party[]>("/api/parties").then((p) => {
      setParties(p);
      setPartyNames(p.map((x) => x.name).filter(Boolean));
    });
    const showAll = new URLSearchParams(window.location.search).get("all") === "1";
    if (showAll) {
      setFilters((f) => ({ ...f, fromDate: "", toDate: "" }));
      void loadReport(undefined, { fromDate: "", toDate: "" });
      return;
    }
    void loadReport(undefined, { fromDate: firstOfMonthIso(), toDate: todayIso() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function exportExcel() {
    try {
      const exportRows = rows.map((row) => ({
        ...row,
        lrNo: stripLrPrefix(row.lrNo),
      }));
      downloadCsv(`booking-mis-${filters.fromDate || "all"}-to-${filters.toDate || "all"}.csv`, exportRows as unknown as Record<string, unknown>[]);
      setMessage({ type: "ok", text: "Excel/CSV downloaded" });
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Export failed" });
    }
  }

  return (
    <>
      <PageHeader title="Booking MIS Report" subtitle="Select Date and View Report" crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Booking MIS Report" }]} />
      <Flash message={message} />
      <AdminForm onSubmit={loadReport}>
        <FormCard>
          <TwoCol>
            <div>
              <DateField label="From Date" value={filters.fromDate} onChange={(iso) => setFilters({ ...filters, fromDate: iso })} />
              <DateField label="To Date" value={filters.toDate} onChange={(iso) => setFilters({ ...filters, toDate: iso })} />
              <Button type="submit">Show Datewise Report</Button>
            </div>
            <div>
              <ComboboxField label="Billing Party Name" value={filters.billingParty} onChange={(billingParty) => setFilters({ ...filters, billingParty })} options={partyNames} placeholder="Search or select party" />
              <InputField label="From Station" value={filters.fromStation} onChange={(e) => setFilters({ ...filters, fromStation: e.target.value })} placeholder="Type station" />
              <InputField label="To Station" value={filters.toStation} onChange={(e) => setFilters({ ...filters, toStation: e.target.value })} placeholder="Type station" />
            </div>
          </TwoCol>
        </FormCard>
      </AdminForm>
      <FormCard>
        <Button type="button" onClick={exportExcel} disabled={!rows.length}>
          Export to Excel
        </Button>
      </FormCard>
      <DataTable
        rows={rows}
        columns={[
          { key: "lrNo", header: "LR No", render: (row) => stripLrPrefix(row.lrNo) },
          { key: "lrDate", header: "LR Date" },
          { key: "fromStation", header: "From" },
          { key: "toStation", header: "To" },
          { key: "vehNo", header: "Veh No" },
          { key: "billingParty", header: "Billing Party" },
          { key: "particulars", header: "Particulars" },
          { key: "chargedWeight", header: "Weight" },
          { key: "freight", header: "Freight" },
          { key: "lrType", header: "Type", render: (row) => row.lrType || "TBB" },
          { key: "gst", header: "GST" },
          { key: "grandTotal", header: "Grand Total" },
          {
            key: "billNo",
            header: "Bill No",
            render: (row) => {
              if (row.billNo) return row.billNo;
              if ((row.lrType || "TBB") === "TBB") return row.billed ? "Billed" : "—";
              return row.lrType || "TBB";
            },
          },
        ]}
      />
    </>
  );
}
