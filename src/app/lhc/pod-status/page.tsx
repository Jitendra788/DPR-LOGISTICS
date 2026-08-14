"use client";

import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { InputField, SelectField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { api } from "@/lib/api-client";

type Vehicle = { vehNo: string };
type Booking = {
  id: number;
  lrNo: string;
  lrDate: string;
  vehNo: string;
  fromStation: string;
  toStation: string;
  billingParty: string;
  consignee: string;
  particulars: string;
  chargedWeight: string;
  podStatus: string;
  lhcNo: string;
};

export default function PodStatusPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [rows, setRows] = useState<Booking[] | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [filters, setFilters] = useState({
    podStatus: "Received",
    fromDate: "2024-08-14",
    toDate: "2024-08-14",
    vehNo: "",
    lhcNo: "",
  });

  useEffect(() => {
    api<Vehicle[]>("/api/vehicles").then(setVehicles);
  }, []);

  async function showAll(e?: FormEvent) {
    e?.preventDefault();
    try {
      const all = await api<Booking[]>("/api/bookings");
      const filtered = all.filter((row) => {
        if (filters.podStatus && row.podStatus.toLowerCase() !== filters.podStatus.toLowerCase()) return false;
        if (filters.vehNo && row.vehNo !== filters.vehNo) return false;
        if (filters.lhcNo && row.lhcNo !== filters.lhcNo) return false;
        if (filters.fromDate && row.lrDate && row.lrDate < filters.fromDate) return false;
        if (filters.toDate && row.lrDate && row.lrDate > filters.toDate) return false;
        return true;
      });
      setRows(filtered);
      setMessage({ type: "ok", text: `Showing ${filtered.length} record(s)` });
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Failed" });
    }
  }

  async function updateStatus(row: Booking, status: string) {
    try {
      await api(`/api/bookings/${row.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...row, podStatus: status }),
      });
      setMessage({ type: "ok", text: `POD updated for ${row.lrNo}` });
      await showAll();
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Update failed" });
    }
  }

  return (
    <>
      <PageHeader
        title="POD Status"
        subtitle="Select Data and View Report"
        subtitleClass="text-red-600"
        crumbs={[{ label: "Home", href: "/" }, { label: "Booking MIS Report" }]}
      />
      <Flash message={message} />
      <form onSubmit={showAll}>
        <FormCard>
          <TwoCol>
            <div>
              <SelectField
                label="Show Report From"
                value={filters.podStatus}
                onChange={(e) => setFilters({ ...filters, podStatus: e.target.value })}
                options={["Received", "Pending"]}
                placeholder=""
              />
              <InputField label="From Date" type="date" value={filters.fromDate} onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })} />
              <InputField label="To Date" type="date" value={filters.toDate} onChange={(e) => setFilters({ ...filters, toDate: e.target.value })} />
              <Button type="submit">Show All</Button>
            </div>
            <div>
              <SelectField
                label="Select Veh No"
                value={filters.vehNo}
                onChange={(e) => setFilters({ ...filters, vehNo: e.target.value })}
                options={vehicles.map((v) => v.vehNo)}
              />
              <InputField label="Enter LHC No" value={filters.lhcNo} onChange={(e) => setFilters({ ...filters, lhcNo: e.target.value })} />
            </div>
          </TwoCol>
        </FormCard>
      </form>
      {rows ? (
        <DataTable
          rows={rows}
          columns={[
            { key: "lrNo", header: "LR No" },
            { key: "lrDate", header: "LR Date" },
            { key: "vehNo", header: "Veh No" },
            { key: "lhcNo", header: "LHC No" },
            { key: "fromStation", header: "From" },
            { key: "toStation", header: "To" },
            { key: "billingParty", header: "Billing Party" },
            { key: "consignee", header: "Consignee" },
            { key: "particulars", header: "Particulars" },
            { key: "chargedWeight", header: "Weight" },
            { key: "podStatus", header: "POD Status" },
            {
              key: "actions",
              header: "Update",
              render: (row) => (
                <select className="border px-1 py-0.5" value={row.podStatus} onChange={(e) => updateStatus(row, e.target.value)}>
                  {["Pending", "Received"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              ),
            },
          ]}
        />
      ) : (
        <FormCard className="min-h-16" />
      )}
    </>
  );
}
