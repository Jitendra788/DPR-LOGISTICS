"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { DateField, ComboboxField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Flash } from "@/components/ui/Flash";
import { api } from "@/lib/api-client";
import { isoToDisplay, todayIso } from "@/lib/dates";

type Vehicle = { vehNo: string };
type Lhc = {
  id: number;
  challanNo: string;
  challanDate: string;
  vehNo: string;
  fromStation: string;
  toStation: string;
  lrNos: string;
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
  paidAmt: number;
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
  width = "80px",
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

function lhcOutstanding(row: Lhc) {
  if (row.paid) return 0;
  const bal = Number(row.balance);
  if (Number.isFinite(bal) && bal > 0) return Number(bal.toFixed(2));
  const freight = Number(row.lorryFreight) || 0;
  const advance = Number(row.totalAdvance) || 0;
  const paid = Number(row.paidAmount) || 0;
  const ded = Number(row.otherDed) || 0;
  return Number(Math.max(0, freight - advance - paid - ded).toFixed(2));
}

function slashDate(iso: string) {
  return isoToDisplay(iso).replaceAll("-", "/");
}

export default function LhcPaymentPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehNo, setVehNo] = useState("");
  const [paidDate, setPaidDate] = useState(todayIso());
  const [rows, setRows] = useState<Lhc[]>([]);
  const [drafts, setDrafts] = useState<Record<number, RowDraft>>({});
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [allLhcVeh, setAllLhcVeh] = useState<string[]>([]);

  const vehOptions = useMemo(() => {
    return [...new Set([...vehicles.map((v) => v.vehNo), ...allLhcVeh])].filter(Boolean);
  }, [vehicles, allLhcVeh]);

  useEffect(() => {
    Promise.all([api<Vehicle[]>("/api/vehicles"), api<Lhc[]>("/api/lhc")]).then(([v, lhc]) => {
      setVehicles(v);
      setAllLhcVeh(lhc.map((r) => r.vehNo).filter(Boolean));
      if (!vehNo && (v[0]?.vehNo || lhc[0]?.vehNo)) {
        setVehNo(v[0]?.vehNo || lhc[0]?.vehNo || "");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function draftFor(row: Lhc): RowDraft {
    return drafts[row.id] ?? { paidAmt: 0, otherDed: 0, narration: "" };
  }

  function updateDraft(id: number, patch: Partial<RowDraft>) {
    setDrafts((prev) => {
      const cur = prev[id] ?? { paidAmt: 0, otherDed: 0, narration: "" };
      return { ...prev, [id]: { ...cur, ...patch } };
    });
  }

  async function showReport(e?: FormEvent) {
    e?.preventDefault();
    if (!vehNo.trim()) {
      setMessage({ type: "err", text: "Select Veh No first" });
      return;
    }
    setLoading(true);
    try {
      const qs = new URLSearchParams({ vehNo: vehNo.trim(), paid: "false" }).toString();
      const data = await api<Lhc[]>(`/api/reports/lhc-payments?${qs}`);
      const open = data.filter((r) => lhcOutstanding(r) > 0);
      setRows(open);
      const next: Record<number, RowDraft> = {};
      open.forEach((r) => {
        next[r.id] = { paidAmt: 0, otherDed: 0, narration: "" };
      });
      setDrafts(next);
      setMessage({
        type: "ok",
        text: open.length
          ? `Found ${open.length} outstanding LHC for ${vehNo}`
          : `No outstanding LHC for ${vehNo}`,
      });
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Failed to load" });
    } finally {
      setLoading(false);
    }
  }

  async function savePayment(row: Lhc) {
    const d = draftFor(row);
    if (!d.paidAmt && !d.otherDed) {
      setMessage({ type: "err", text: "Enter Paid Amount or Other Deduction" });
      return;
    }
    if (!paidDate) {
      setMessage({ type: "err", text: "Select Paid Date" });
      return;
    }
    const outstanding = lhcOutstanding(row);
    const newBalance = Number(Math.max(0, outstanding - d.paidAmt - d.otherDed).toFixed(2));
    const newPaidAmount = Number(((Number(row.paidAmount) || 0) + d.paidAmt).toFixed(2));
    const newOtherDed = Number(((Number(row.otherDed) || 0) + d.otherDed).toFixed(2));
    try {
      // Only payment fields — avoid full-row PUT (can break on schema/client mismatch)
      await api(`/api/lhc/${row.id}`, {
        method: "PUT",
        body: JSON.stringify({
          paidAmount: newPaidAmount,
          otherDed: newOtherDed,
          balance: newBalance,
          paid: newBalance <= 0,
          paidDate,
          remark: d.narration || row.remark || "",
        }),
      });
      setMessage({
        type: "ok",
        text:
          newBalance <= 0
            ? `Payment saved — Challan ${row.challanNo} fully paid`
            : `Payment saved for Challan ${row.challanNo}. Remaining ₹${newBalance.toFixed(2)}`,
      });
      await showReport();
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Save failed" });
    }
  }

  const totalOutstanding = useMemo(
    () => rows.reduce((s, r) => s + lhcOutstanding(r), 0),
    [rows],
  );

  return (
    <>
      <PageHeader
        title="LHC Payment Entry"
        subtitle="Select and fill data for the lhc payment"
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "LHC Payment" }]}
      />
      <Flash message={message} />
      <form onSubmit={showReport}>
        <FormCard>
          <TwoCol>
            <div>
              <ComboboxField
                label="Select Veh No"
                value={vehNo}
                onChange={setVehNo}
                options={vehOptions}
                placeholder="Search or select vehicle"
              />
              <Button type="submit" variant="teal" className="mt-1" disabled={loading}>
                {loading ? "Loading…" : "Show Report"}
              </Button>
            </div>
            <div>
              <DateField label="Paid Date" value={paidDate} onChange={setPaidDate} />
            </div>
          </TwoCol>
        </FormCard>
      </form>

      {rows.length ? (
        <div className="box overflow-x-auto">
          <div className="box-body !py-2 !px-2">
            <table className="erp-dt mr-receipt-table w-full min-w-[1100px] border-collapse text-[13px]">
              <thead>
                <tr>
                  <th>Sr No</th>
                  <th>Challan No</th>
                  <th>Vehicle No.</th>
                  <th>From</th>
                  <th>To</th>
                  <th>LR Nos</th>
                  <th>Date</th>
                  <th>Broker</th>
                  <th>Outstanding</th>
                  <th>Paid Amount</th>
                  <th>Other Ded.</th>
                  <th>Narration</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const outstanding = lhcOutstanding(row);
                  const d = draftFor(row);
                  return (
                    <tr key={row.id}>
                      <td>{row.id}</td>
                      <td>{row.challanNo}</td>
                      <td>{row.vehNo}</td>
                      <td>{row.fromStation}</td>
                      <td>{row.toStation}</td>
                      <td>{row.lrNos}</td>
                      <td>{slashDate(row.challanDate)}</td>
                      <td>{row.brokerName}</td>
                      <td className="text-right">{cellMoneyText(outstanding)}</td>
                      <td>
                        <CellMoneyInput
                          value={d.paidAmt}
                          width="88px"
                          onChange={(n) => updateDraft(row.id, { paidAmt: n })}
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
                          <Button type="button" size="sm" variant="teal" onClick={() => savePayment(row)}>
                            Save
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="mt-3 text-sm font-semibold">
              Total Outstanding: ₹{totalOutstanding.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      ) : (
        <FormCard className="min-h-16" />
      )}
    </>
  );
}
