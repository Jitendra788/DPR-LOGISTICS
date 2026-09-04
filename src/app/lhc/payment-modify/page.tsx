"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { DateField, ComboboxField, InputField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Flash } from "@/components/ui/Flash";
import { api, downloadCsv } from "@/lib/api-client";
import { firstOfMonthIso, isoToDisplay, todayIso } from "@/lib/dates";

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
  otherDed: number;
  remark: string;
};

type RowDraft = {
  paidAmount: number;
  otherDed: number;
  narration: string;
};

function parseCellNum(text: string) {
  const cleaned = text.replace(/,/g, "").trim();
  if (!cleaned || cleaned === ".") return 0;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
}

function cellMoneyText(value: number) {
  const num = Number(value) || 0;
  if (Number.isInteger(num)) return String(num);
  return num.toFixed(2);
}

function CellMoneyInput({
  value,
  onChange,
  width = "88px",
}: {
  value: number;
  onChange?: (n: number) => void;
  width?: string;
}) {
  const [text, setText] = useState(() => cellMoneyText(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(cellMoneyText(value));
  }, [value, focused]);

  return (
    <input
      className="form-control mr-cell-input"
      style={{ width, minWidth: width }}
      type="text"
      inputMode="decimal"
      value={text}
      onFocus={() => setFocused(true)}
      onChange={(e) => {
        setText(e.target.value);
        onChange?.(parseCellNum(e.target.value));
      }}
      onBlur={() => {
        setFocused(false);
        const num = parseCellNum(text);
        setText(cellMoneyText(num));
        onChange?.(num);
      }}
    />
  );
}

function slashDate(iso: string) {
  return isoToDisplay(iso).replaceAll("-", "/");
}

function restoreBalance(row: Lhc) {
  const freight = Number(row.lorryFreight) || 0;
  const advance = Number(row.totalAdvance) || 0;
  return Number(Math.max(0, freight - advance).toFixed(2));
}

export default function LhcPaymentModifyPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [brokers, setBrokers] = useState<string[]>([]);
  const [allLhcVeh, setAllLhcVeh] = useState<string[]>([]);
  const [rows, setRows] = useState<Lhc[]>([]);
  const [drafts, setDrafts] = useState<Record<number, RowDraft>>({});
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    fromDate: firstOfMonthIso(),
    toDate: todayIso(),
    vehNo: "",
    brokerName: "",
    lhcNo: "",
  });

  const vehOptions = useMemo(
    () => [...new Set([...vehicles.map((v) => v.vehNo), ...allLhcVeh])].filter(Boolean),
    [vehicles, allLhcVeh],
  );

  useEffect(() => {
    Promise.all([
      api<Vehicle[]>("/api/vehicles"),
      api<Vendor[]>("/api/vendors"),
      api<Party[]>("/api/parties"),
      api<Lhc[]>("/api/lhc"),
    ]).then(([v, vendors, parties, lhc]) => {
      setVehicles(v);
      setAllLhcVeh(lhc.map((r) => r.vehNo).filter(Boolean));
      const fromParties = parties
        .filter((p) => (p.partyType || "").toLowerCase().includes("broker"))
        .map((p) => p.name);
      const fromVendors = vendors.filter((x) => (x.type || "").toLowerCase() === "broker").map((x) => x.name);
      const fromLhc = lhc.map((r) => r.brokerName).filter(Boolean);
      setBrokers([...new Set([...fromParties, ...fromVendors, ...fromLhc])].filter(Boolean));
    });
  }, []);

  function draftFor(row: Lhc): RowDraft {
    return (
      drafts[row.id] ?? {
        paidAmount: Number(row.paidAmount) || 0,
        otherDed: Number(row.otherDed) || 0,
        narration: row.remark || "",
      }
    );
  }

  function updateDraft(id: number, patch: Partial<RowDraft>) {
    setDrafts((prev) => {
      const row = rows.find((r) => r.id === id);
      const cur =
        prev[id] ??
        (row
          ? {
              paidAmount: Number(row.paidAmount) || 0,
              otherDed: Number(row.otherDed) || 0,
              narration: row.remark || "",
            }
          : { paidAmount: 0, otherDed: 0, narration: "" });
      return { ...prev, [id]: { ...cur, ...patch } };
    });
  }

  function seedDrafts(list: Lhc[]) {
    const next: Record<number, RowDraft> = {};
    list.forEach((r) => {
      next[r.id] = {
        paidAmount: Number(r.paidAmount) || 0,
        otherDed: Number(r.otherDed) || 0,
        narration: r.remark || "",
      };
    });
    setDrafts(next);
  }

  async function loadPaid(e?: FormEvent) {
    e?.preventDefault();
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        ...(filters.vehNo ? { vehNo: filters.vehNo } : {}),
        ...(filters.brokerName ? { brokerName: filters.brokerName } : {}),
        ...(filters.lhcNo ? { lhcNo: filters.lhcNo } : {}),
        paid: "true",
      }).toString();
      let data = await api<Lhc[]>(`/api/reports/lhc-payments?${qs}`);
      // Also include partial payments (paidAmount > 0) if API paid=true misses them
      if (!data.length && !filters.lhcNo) {
        const allQs = new URLSearchParams({
          fromDate: filters.fromDate,
          toDate: filters.toDate,
          ...(filters.vehNo ? { vehNo: filters.vehNo } : {}),
          ...(filters.brokerName ? { brokerName: filters.brokerName } : {}),
        }).toString();
        const all = await api<Lhc[]>(`/api/reports/lhc-payments?${allQs}`);
        data = all.filter((r) => r.paid || Number(r.paidAmount) > 0);
      }
      setRows(data);
      seedDrafts(data);
      setMessage({ type: "ok", text: `Found ${data.length} paid LHC payment(s)` });
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Failed to load" });
    } finally {
      setLoading(false);
    }
  }

  async function exportPaidReport() {
    try {
      const qs = new URLSearchParams({
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        ...(filters.vehNo ? { vehNo: filters.vehNo } : {}),
        ...(filters.brokerName ? { brokerName: filters.brokerName } : {}),
        ...(filters.lhcNo ? { lhcNo: filters.lhcNo } : {}),
        paid: "true",
      }).toString();
      const data = await api<Lhc[]>(`/api/reports/lhc-payments?${qs}`);
      downloadCsv(
        "lhc-wise-payment-paid-report.csv",
        data.map((r) => ({
          challanNo: r.challanNo,
          challanDate: r.challanDate,
          paidDate: r.paidDate,
          brokerName: r.brokerName,
          vehNo: r.vehNo,
          paidAmount: r.paidAmount,
          otherDed: r.otherDed,
          remark: r.remark,
        })) as unknown as Record<string, unknown>[],
      );
      setMessage({ type: "ok", text: `Paid report: ${data.length} rows exported` });
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Export failed" });
    }
  }

  async function saveRow(row: Lhc) {
    const d = draftFor(row);
    const freight = Number(row.lorryFreight) || 0;
    const advance = Number(row.totalAdvance) || 0;
    const newBalance = Number(Math.max(0, freight - advance - d.paidAmount - d.otherDed).toFixed(2));
    try {
      await api(`/api/lhc/${row.id}`, {
        method: "PUT",
        body: JSON.stringify({
          paidAmount: d.paidAmount,
          otherDed: d.otherDed,
          remark: d.narration,
          balance: newBalance,
          paid: newBalance <= 0 && d.paidAmount > 0,
          paidDate: row.paidDate || todayIso(),
        }),
      });
      setMessage({ type: "ok", text: `Updated payment for Challan ${row.challanNo}` });
      await loadPaid();
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Update failed" });
    }
  }

  async function removePayment(row: Lhc) {
    if (!confirm(`Delete payment for Challan ${row.challanNo}? It will go back to LHC Payment Entry outstanding.`)) {
      return;
    }
    try {
      await api(`/api/lhc/${row.id}`, {
        method: "PUT",
        body: JSON.stringify({
          paid: false,
          paidDate: "",
          paidAmount: 0,
          otherDed: 0,
          remark: "",
          balance: restoreBalance(row),
        }),
      });
      setMessage({ type: "ok", text: `Payment removed for ${row.challanNo}` });
      await loadPaid();
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Delete failed" });
    }
  }

  return (
    <>
      <PageHeader
        title="LHC Payment Update"
        subtitle="Select and fill data for the payment"
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "LHC Payment" }]}
      />
      <Flash message={message} />
      <form onSubmit={loadPaid}>
        <FormCard>
          <TwoCol>
            <div>
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
              <div className="mt-1 flex flex-wrap gap-2">
                <Button type="submit" variant="teal" disabled={loading}>
                  {loading ? "Loading…" : "Show Datewise"}
                </Button>
                <Button type="button" variant="danger" onClick={exportPaidReport}>
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
                placeholder="All vehicles (or select)"
              />
              <ComboboxField
                label="Select Broker Name"
                value={filters.brokerName}
                onChange={(brokerName) => setFilters({ ...filters, brokerName })}
                options={brokers}
                placeholder="All brokers (or select)"
              />
              <InputField
                label="Enter LHC No"
                value={filters.lhcNo}
                onChange={(e) => setFilters({ ...filters, lhcNo: e.target.value })}
                placeholder="Challan / LHC no"
              />
            </div>
          </TwoCol>
        </FormCard>
      </form>

      {rows.length ? (
        <div className="box overflow-x-auto">
          <div className="box-body !py-2 !px-2">
            <table className="erp-dt mr-receipt-table w-full min-w-[1000px] border-collapse text-[13px]">
              <thead>
                <tr>
                  <th>Remove</th>
                  <th>Sr No</th>
                  <th>Challan No</th>
                  <th>Challan Date</th>
                  <th>Broker</th>
                  <th>Veh No</th>
                  <th>Paid Amount</th>
                  <th>Deduction</th>
                  <th>Narration</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const d = draftFor(row);
                  return (
                    <tr key={row.id}>
                      <td>
                        <button
                          type="button"
                          className="text-[#3c8dbc] underline"
                          onClick={() => removePayment(row)}
                        >
                          Delete
                        </button>
                      </td>
                      <td>{row.id}</td>
                      <td>{row.challanNo}</td>
                      <td>{slashDate(row.challanDate || row.paidDate)}</td>
                      <td>{row.brokerName}</td>
                      <td>{row.vehNo}</td>
                      <td>
                        <CellMoneyInput
                          value={d.paidAmount}
                          onChange={(n) => updateDraft(row.id, { paidAmount: n })}
                        />
                      </td>
                      <td>
                        <CellMoneyInput
                          value={d.otherDed}
                          width="80px"
                          onChange={(n) => updateDraft(row.id, { otherDed: n })}
                        />
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <input
                            className="form-control mr-cell-input mr-narration-input"
                            value={d.narration}
                            onChange={(e) => updateDraft(row.id, { narration: e.target.value })}
                          />
                          <Button type="button" size="sm" variant="teal" onClick={() => saveRow(row)}>
                            Save
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <FormCard className="min-h-16" />
      )}
    </>
  );
}
