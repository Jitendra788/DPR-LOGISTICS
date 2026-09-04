"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { DateField, ComboboxField, InputField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { AdminForm } from "@/components/ui/AdminForm";
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

function normalizePodStatus(value?: string) {
  const s = (value || "Pending").trim().toLowerCase();
  if (s === "received" || s === "recieved") return "Received";
  return "Pending";
}

function inDateRange(lrDate: string, fromDate: string, toDate: string) {
  const d = (lrDate || "").slice(0, 10);
  if (!d) return true;
  if (fromDate && d < fromDate) return false;
  if (toDate && d > toDate) return false;
  return true;
}

function SelectDocCell({
  lrNo,
  onMessage,
  onUploaded,
}: {
  lrNo: string;
  onMessage: (type: "ok" | "err", text: string) => void;
  onUploaded: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [fileName, setFileName] = useState("");

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
      setFileName("");
      onMessage("ok", `Document uploaded for LR ${lrNo}`);
      onUploaded();
    } catch (err) {
      onMessage("err", err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 py-1">
      <input
        ref={inputRef}
        type="file"
        className="max-w-[220px] text-[12px]"
        disabled={busy}
        onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
      />
      <Button type="button" size="sm" variant="secondary" disabled={busy} onClick={upload}>
        {busy ? "Uploading…" : "Upload"}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        onClick={() => router.push(`/lhc/pod-status/docs?lrNo=${encodeURIComponent(lrNo)}`)}
      >
        View Documents
      </Button>
      {fileName ? <span className="text-[11px] text-[#64748b]">{fileName}</span> : null}
    </div>
  );
}

export default function PodStatusPage() {
  const today = todayIso();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookingVeh, setBookingVeh] = useState<string[]>([]);
  const [rows, setRows] = useState<Booking[] | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [filters, setFilters] = useState({
    podStatus: "Pending",
    fromDate: today,
    toDate: today,
    vehNo: "",
    lhcNo: "",
  });

  const vehOptions = useMemo(
    () => [...new Set([...vehicles.map((v) => v.vehNo), ...bookingVeh])].filter(Boolean),
    [vehicles, bookingVeh],
  );

  useEffect(() => {
    Promise.all([api<Vehicle[]>("/api/vehicles"), api<Booking[]>("/api/bookings")])
      .then(([v, bookings]) => {
        setVehicles(v);
        setBookingVeh(bookings.map((b) => b.vehNo).filter(Boolean));
        if (!filters.vehNo && (v[0]?.vehNo || bookings[0]?.vehNo)) {
          setFilters((f) => ({ ...f, vehNo: v[0]?.vehNo || bookings[0]?.vehNo || "" }));
        }
      })
      .catch(() => {
        setVehicles([]);
        setBookingVeh([]);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function showAll(e?: FormEvent) {
    e?.preventDefault();
    try {
      const all = await api<Booking[]>("/api/bookings");
      setBookingVeh(all.map((b) => b.vehNo).filter(Boolean));
      const want = normalizePodStatus(filters.podStatus);
      const filtered = all.filter((row) => {
        if (normalizePodStatus(row.podStatus) !== want) return false;
        if (filters.vehNo.trim() && row.vehNo !== filters.vehNo.trim()) return false;
        if (
          filters.lhcNo.trim() &&
          !(row.lhcNo || "").toLowerCase().includes(filters.lhcNo.trim().toLowerCase())
        ) {
          return false;
        }
        if (!inDateRange(row.lrDate, filters.fromDate, filters.toDate)) return false;
        return true;
      });
      setRows(filtered);
      setMessage({ type: "ok", text: `Showing ${filtered.length} ${want} record(s)` });
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Failed" });
    }
  }

  return (
    <>
      <PageHeader
        title="POD Status"
        subtitle="Select Data and View Report"
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "POD Status" }]}
      />
      <Flash message={message} />
      <AdminForm onSubmit={showAll}>
        <FormCard>
          <TwoCol>
            <div>
              <ComboboxField
                label="Show Report From"
                value={filters.podStatus}
                onChange={(podStatus) => setFilters({ ...filters, podStatus })}
                options={["Pending", "Received"]}
                placeholder="Select status"
              />
              <DateField
                label="From Date"
                value={filters.fromDate}
                onChange={(fromDate) => setFilters({ ...filters, fromDate })}
              />
              <DateField
                label="To Date"
                value={filters.toDate}
                onChange={(toDate) => setFilters({ ...filters, toDate })}
              />
              <Button type="submit" variant="teal" className="mt-1">
                Show All
              </Button>
            </div>
            <div>
              <ComboboxField
                label="Select Veh No"
                value={filters.vehNo}
                onChange={(vehNo) => setFilters({ ...filters, vehNo })}
                options={vehOptions}
                placeholder="Search or select vehicle"
              />
              <InputField
                label="Enter LHC No."
                value={filters.lhcNo}
                onChange={(e) => setFilters({ ...filters, lhcNo: e.target.value })}
                placeholder="LHC / challan no"
              />
            </div>
          </TwoCol>
        </FormCard>
      </AdminForm>
      {rows ? (
        <DataTable
          rows={rows.map((r) => ({ ...r, srNo: r.id, type: r.lrType || "TBB" }))}
          columns={[
            { key: "srNo", header: "Sr No" },
            { key: "lrNo", header: "LR No" },
            { key: "billingParty", header: "Billing Party" },
            { key: "type", header: "Type" },
            {
              key: "selectDoc",
              header: "Select Doc",
              render: (row) => (
                <SelectDocCell
                  lrNo={row.lrNo}
                  onMessage={(type, text) => setMessage({ type, text })}
                  onUploaded={() => {
                    void showAll();
                  }}
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
