"use client";

import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { InputField, ComboboxField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { AdminForm } from "@/components/ui/AdminForm";
import { api, downloadCsv } from "@/lib/api-client";

type Vehicle = { vehNo: string };
type Vendor = { name: string; type: string };
type Party = { name: string; partyType: string };
type Lhc = {
  id: number;
  challanNo: string;
  challanDate: string;
  vehNo: string;
  brokerName: string;
  lorryFreight: number;
  totalAdvance: number;
  balance: number;
  paid: boolean;
  paidDate: string;
  paidAmount: number;
};

export default function LhcPaymentPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [brokers, setBrokers] = useState<string[]>([]);
  const vehOptions = vehicles.map((v) => v.vehNo).filter(Boolean);
  const [rows, setRows] = useState<Lhc[]>([]);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [filters, setFilters] = useState({
    fromDate: "2024-08-14",
    toDate: new Date().toISOString().slice(0, 10),
    vehNo: "",
    brokerName: "",
    lhcNo: "",
  });

  useEffect(() => {
    Promise.all([
      api<Vehicle[]>("/api/vehicles"),
      api<Vendor[]>("/api/vendors"),
      api<Party[]>("/api/parties"),
    ]).then(([v, vendors, parties]) => {
      setVehicles(v);
      const fromParties = parties
        .filter((p) => (p.partyType || "").toLowerCase() === "broker")
        .map((p) => p.name);
      const fromVendors = vendors.filter((x) => x.type === "Broker").map((x) => x.name);
      setBrokers([...new Set([...fromParties, ...fromVendors])].filter(Boolean));
    });
  }, []);

  async function showDetails(e?: FormEvent) {
    e?.preventDefault();
    try {
      const qs = new URLSearchParams(filters).toString();
      const data = await api<Lhc[]>(`/api/reports/lhc-payments?${qs}`);
      setRows(data);
      setMessage({ type: "ok", text: `Found ${data.length} LHC record(s)` });
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Failed" });
    }
  }

  async function markPaid(row: Lhc) {
    const paidDate = prompt("Paid Date (YYYY-MM-DD)", new Date().toISOString().slice(0, 10));
    if (!paidDate) return;
    try {
      await api(`/api/lhc/${row.id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...row,
          paid: true,
          paidDate,
          paidAmount: row.balance,
          balance: 0,
        }),
      });
      setMessage({ type: "ok", text: `Payment saved for ${row.challanNo}` });
      await showDetails();
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Payment failed" });
    }
  }

  async function paidReport() {
    try {
      const qs = new URLSearchParams({ ...filters, paid: "true" }).toString();
      const data = await api<Lhc[]>(`/api/reports/lhc-payments?${qs}`);
      setRows(data);
      downloadCsv("lhc-wise-payment-paid-report.csv", data as unknown as Record<string, unknown>[]);
      setMessage({ type: "ok", text: `Paid report: ${data.length} rows exported` });
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Report failed" });
    }
  }

  return (
    <>
      <PageHeader title="LHC Payment Entry" subtitle="Select and fill data for the payment" crumbs={[{ label: "Home", href: "/dashboard" }, { label: "LHC Payment" }]} />
      <Flash message={message} />
      <AdminForm onSubmit={showDetails}>
        <FormCard>
          <TwoCol>
            <div>
              <InputField label="From Date" type="date" value={filters.fromDate} onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })} />
              <InputField label="To Date" type="date" value={filters.toDate} onChange={(e) => setFilters({ ...filters, toDate: e.target.value })} />
              <div className="mt-1 flex flex-wrap gap-2">
                <Button type="submit">Show Detail</Button>
                <Button type="button" variant="danger" onClick={paidReport}>
                  View LHC Wise Payment Paid Report
                </Button>
              </div>
            </div>
            <div>
              <ComboboxField
                label="Select Veh No"
                value={filters.vehNo}
                onChange={(vehNo) => setFilters({ ...filters, vehNo })}
                options={vehOptions}
                placeholder="Search or select vehicle"
              />
              <ComboboxField
                label="Select Broker Name"
                value={filters.brokerName}
                onChange={(brokerName) => setFilters({ ...filters, brokerName })}
                options={brokers}
                placeholder="Search or select broker"
              />
              <InputField label="Enter LHC No" value={filters.lhcNo} onChange={(e) => setFilters({ ...filters, lhcNo: e.target.value })} />
            </div>
          </TwoCol>
        </FormCard>
      </AdminForm>
      {rows.length ? (
        <DataTable
          rows={rows}
          columns={[
            {
              key: "pay",
              header: "Action",
              render: (row) =>
                row.paid ? (
                  <span className="text-green-700">Paid</span>
                ) : (
                  <Button type="button" size="sm" variant="teal" onClick={() => markPaid(row)}>
                    Mark Paid
                  </Button>
                ),
            },
            { key: "challanNo", header: "LHC No" },
            { key: "challanDate", header: "Date" },
            { key: "vehNo", header: "Veh No" },
            { key: "brokerName", header: "Broker" },
            { key: "lorryFreight", header: "Freight" },
            { key: "totalAdvance", header: "Advance" },
            { key: "balance", header: "Balance" },
            { key: "paidDate", header: "Paid Date" },
            { key: "paidAmount", header: "Paid Amount" },
          ]}
        />
      ) : (
        <FormCard className="min-h-16" />
      )}
    </>
  );
}
