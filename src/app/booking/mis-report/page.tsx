"use client";

import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { InputField, SelectField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { api, downloadCsv } from "@/lib/api-client";

type Party = { name: string };
type Station = { name: string };
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
};

export default function BookingMisReportPage() {
  const [parties, setParties] = useState<Party[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [rows, setRows] = useState<Booking[]>([]);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [filters, setFilters] = useState({
    fromDate: new Date().toISOString().slice(0, 10),
    toDate: new Date().toISOString().slice(0, 10),
    billingParty: "",
    fromStation: "",
    toStation: "",
  });

  useEffect(() => {
    Promise.all([api<Party[]>("/api/parties"), api<Station[]>("/api/stations")]).then(([p, s]) => {
      setParties(p);
      setStations(s);
    });
    const showAll = new URLSearchParams(window.location.search).get("all") === "1";
    if (showAll) {
      setFilters((f) => ({ ...f, fromDate: "", toDate: "" }));
      api<Booking[]>("/api/reports/bookings")
        .then((data) => {
          setRows(data);
          setMessage({ type: "ok", text: `Found ${data.length} booking(s)` });
        })
        .catch((err) => setMessage({ type: "err", text: err instanceof Error ? err.message : "Report failed" }));
    }
  }, []);

  async function loadReport(e?: FormEvent) {
    e?.preventDefault();
    try {
      const qs = new URLSearchParams(filters).toString();
      const data = await api<Booking[]>(`/api/reports/bookings?${qs}`);
      setRows(data);
      setMessage({ type: "ok", text: `Found ${data.length} booking(s)` });
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Report failed" });
    }
  }

  function exportExcel() {
    try {
      downloadCsv(`booking-mis-${filters.fromDate}-to-${filters.toDate}.csv`, rows as unknown as Record<string, unknown>[]);
      setMessage({ type: "ok", text: "Excel/CSV downloaded" });
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Export failed" });
    }
  }

  return (
    <>
      <PageHeader title="Booking MIS Report" subtitle="Select Date and View Report" crumbs={[{ label: "Home", href: "/" }, { label: "Booking MIS Report" }]} />
      <Flash message={message} />
      <form onSubmit={loadReport}>
        <FormCard>
          <TwoCol>
            <div>
              <InputField label="From Date" type="date" value={filters.fromDate} onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })} />
              <InputField label="To Date" type="date" value={filters.toDate} onChange={(e) => setFilters({ ...filters, toDate: e.target.value })} />
              <Button type="submit">Show Datewise Report</Button>
            </div>
            <div>
              <SelectField label="Billing Party Name" value={filters.billingParty} onChange={(e) => setFilters({ ...filters, billingParty: e.target.value })} options={parties.map((p) => p.name)} />
              <SelectField label="From Station" value={filters.fromStation} onChange={(e) => setFilters({ ...filters, fromStation: e.target.value })} options={stations.map((s) => s.name)} />
              <SelectField label="To Station" value={filters.toStation} onChange={(e) => setFilters({ ...filters, toStation: e.target.value })} options={stations.map((s) => s.name)} />
            </div>
          </TwoCol>
        </FormCard>
      </form>
      <FormCard>
        <Button type="button" onClick={exportExcel} disabled={!rows.length}>
          Export to Excel
        </Button>
      </FormCard>
      <DataTable
        rows={rows}
        columns={[
          { key: "lrNo", header: "LR No" },
          { key: "lrDate", header: "LR Date" },
          { key: "fromStation", header: "From" },
          { key: "toStation", header: "To" },
          { key: "vehNo", header: "Veh No" },
          { key: "billingParty", header: "Billing Party" },
          { key: "particulars", header: "Particulars" },
          { key: "chargedWeight", header: "Weight" },
          { key: "freight", header: "Freight" },
          { key: "gst", header: "GST" },
          { key: "grandTotal", header: "Grand Total" },
        ]}
      />
    </>
  );
}
