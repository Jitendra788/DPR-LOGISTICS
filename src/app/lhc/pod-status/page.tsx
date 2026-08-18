"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { DateField, InputField, SelectField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { api } from "@/lib/api-client";
import { todayIso } from "@/lib/dates";

type Vehicle = { vehNo: string };
type Booking = {
  id: number;
  lrNo: string;
  lrDate: string;
  vehNo: string;
  billingParty: string;
  lrType: string;
  podStatus: string;
  lhcNo: string;
};

function inDateRange(lrDate: string, fromDate: string, toDate: string) {
  const d = lrDate.slice(0, 10);
  if (!d) return true;
  if (fromDate && d < fromDate) return false;
  if (toDate && d > toDate) return false;
  return true;
}

function SelectDocCell({ lrNo, onMessage }: { lrNo: string; onMessage: (type: "ok" | "err", text: string) => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function upload() {
    const file = inputRef.current?.files?.[0];
    if (!file) {
      onMessage("err", "Select a file first");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("lrNo", lrNo);
      fd.append("file", file);
      const res = await fetch("/api/pod-docs", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Upload failed");
      if (inputRef.current) inputRef.current.value = "";
      onMessage("ok", `Document uploaded for ${lrNo}`);
    } catch (err) {
      onMessage("err", err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input ref={inputRef} type="file" className="max-w-[220px] text-[13px]" />
      <Button type="button" size="sm" disabled={busy} onClick={upload}>
        {busy ? "Uploading..." : "Upload"}
      </Button>
      <Button type="button" size="sm" variant="teal" onClick={() => router.push(`/lhc/pod-status/docs?lrNo=${encodeURIComponent(lrNo)}`)}>
        View Documents
      </Button>
    </div>
  );
}

export default function PodStatusPage() {
  const today = todayIso();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [rows, setRows] = useState<Booking[] | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [filters, setFilters] = useState({
    podStatus: "Received",
    fromDate: today,
    toDate: today,
    vehNo: "",
    lhcNo: "",
  });
  useEffect(() => {
    api<Vehicle[]>("/api/vehicles").then(setVehicles).catch(() => setVehicles([]));
  }, []);

  async function showAll(e?: FormEvent) {
    e?.preventDefault();
    try {
      const all = await api<Booking[]>("/api/bookings");
      const filtered = all.filter((row) => {
        if (filters.podStatus && (row.podStatus || "").toLowerCase() !== filters.podStatus.toLowerCase()) return false;
        if (filters.vehNo && row.vehNo !== filters.vehNo) return false;
        if (filters.lhcNo && row.lhcNo !== filters.lhcNo) return false;
        if (!inDateRange(row.lrDate, filters.fromDate, filters.toDate)) return false;
        return true;
      });
      setRows(filtered);
      setMessage({ type: "ok", text: `Showing ${filtered.length} record(s)` });
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Failed" });
    }
  }

  return (
    <>
      <PageHeader
        title="POD Status"
        subtitle="Select Data and View Report"
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "POD Documents" }]}
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
              <DateField label="From Date" value={filters.fromDate} onChange={(fromDate) => setFilters({ ...filters, fromDate })} />
              <DateField label="To Date" value={filters.toDate} onChange={(toDate) => setFilters({ ...filters, toDate })} />
              <Button type="submit">Show All</Button>
            </div>
            <div>
              <SelectField
                label="Select Veh No"
                value={filters.vehNo}
                onChange={(e) => setFilters({ ...filters, vehNo: e.target.value })}
                options={vehicles.map((v) => v.vehNo)}
              />
              <InputField label="Enter LHC No." value={filters.lhcNo} onChange={(e) => setFilters({ ...filters, lhcNo: e.target.value })} />
            </div>
          </TwoCol>
        </FormCard>
      </form>
      {rows ? (
        <DataTable
          rows={rows.map((r, i) => ({ ...r, srNo: i + 1 }))}
          columns={[
            { key: "srNo", header: "Sr No." },
            { key: "lrNo", header: "LR No" },
            { key: "billingParty", header: "Billing Party" },
            { key: "lrType", header: "Type" },
            {
              key: "selectDoc",
              header: "Select Doc",
              render: (row) => (
                <SelectDocCell
                  lrNo={row.lrNo}
                  onMessage={(type, text) => setMessage({ type, text })}
                />
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
