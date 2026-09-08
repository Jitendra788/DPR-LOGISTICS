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

function inr(value: number) {
  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
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
  const [savingId, setSavingId] = useState<number | null>(null);
  const [allLhcVeh, setAllLhcVeh] = useState<string[]>([]);
  const [searched, setSearched] = useState(false);

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
    setSearched(true);
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
    setSavingId(row.id);
    try {
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
            : `Payment saved for Challan ${row.challanNo}. Remaining ₹${inr(newBalance)}`,
      });
      await showReport();
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Save failed" });
    } finally {
      setSavingId(null);
    }
  }

  const totalOutstanding = useMemo(
    () => rows.reduce((s, r) => s + lhcOutstanding(r), 0),
    [rows],
  );

  const totalPaying = useMemo(
    () =>
      rows.reduce((s, r) => {
        const d = draftFor(r);
        return s + (Number(d.paidAmt) || 0) + (Number(d.otherDed) || 0);
      }, 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows, drafts],
  );

  return (
    <>
      <PageHeader
        title="LHC Payment Entry"
        subtitle="Vehicle select karke outstanding LHC pe payment / deduction save karein"
        crumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "LHC", href: "/lhc/contract" },
          { label: "Payment Entry" },
        ]}
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
            </div>
            <div>
              <DateField label="Paid Date" value={paidDate} onChange={setPaidDate} />
            </div>
          </TwoCol>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button type="submit" variant="teal" disabled={loading || !vehNo.trim()}>
              {loading ? "Loading…" : "Show Outstanding"}
            </Button>
            {rows.length > 0 ? (
              <span className="text-sm text-[var(--muted,#64748b)]">
                {rows.length} challan · Outstanding ₹{inr(totalOutstanding)}
              </span>
            ) : null}
          </div>
        </FormCard>
      </form>

      {rows.length ? (
        <div className="box overflow-x-auto">
          <div className="box-header flex flex-wrap items-center justify-between gap-2 !py-2.5">
            <strong className="text-[14px]">Outstanding LHC — {vehNo}</strong>
            <span className="text-[13px] font-semibold text-[#0f766e]">
              Paying / Deducting now: ₹{inr(totalPaying)}
            </span>
          </div>
          <div className="box-body !py-2 !px-2">
            <table className="erp-dt mr-receipt-table lhc-pay-table w-full min-w-[1180px] border-collapse text-[13px]">
              <thead>
                <tr>
                  <th>Sr</th>
                  <th>Challan</th>
                  <th>Date</th>
                  <th>Route</th>
                  <th>LR Nos</th>
                  <th>Broker</th>
                  <th className="text-right">Outstanding</th>
                  <th>Paid Amt</th>
                  <th>Other Ded.</th>
                  <th className="text-right">After Pay</th>
                  <th>Narration / Save</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const outstanding = lhcOutstanding(row);
                  const d = draftFor(row);
                  const afterPay = Number(
                    Math.max(0, outstanding - (d.paidAmt || 0) - (d.otherDed || 0)).toFixed(2),
                  );
                  const busy = savingId === row.id;
                  return (
                    <tr key={row.id}>
                      <td>{i + 1}</td>
                      <td>
                        <div className="font-semibold">{row.challanNo}</div>
                        <div className="text-[11px] text-[var(--muted,#64748b)]">{row.vehNo}</div>
                      </td>
                      <td>{slashDate(row.challanDate)}</td>
                      <td>
                        <div>{row.fromStation || "—"}</div>
                        <div className="text-[11px] text-[var(--muted,#64748b)]">→ {row.toStation || "—"}</div>
                      </td>
                      <td className="max-w-[140px] break-words">{row.lrNos || "—"}</td>
                      <td>{row.brokerName || "—"}</td>
                      <td className="text-right font-semibold whitespace-nowrap">₹{inr(outstanding)}</td>
                      <td>
                        <div className="flex flex-col gap-1">
                          <CellMoneyInput
                            value={d.paidAmt}
                            width="92px"
                            onChange={(n) => updateDraft(row.id, { paidAmt: n })}
                          />
                          <button
                            type="button"
                            className="text-left text-[11px] text-[#0f766e] underline"
                            onClick={() =>
                              updateDraft(row.id, {
                                paidAmt: outstanding,
                                otherDed: 0,
                              })
                            }
                          >
                            Pay full
                          </button>
                        </div>
                      </td>
                      <td>
                        <CellMoneyInput
                          value={d.otherDed}
                          width="84px"
                          onChange={(n) => updateDraft(row.id, { otherDed: n })}
                        />
                      </td>
                      <td
                        className={`text-right whitespace-nowrap font-semibold ${
                          afterPay <= 0 ? "text-[#15803d]" : ""
                        }`}
                      >
                        ₹{inr(afterPay)}
                      </td>
                      <td>
                        <div className="flex min-w-[220px] items-center gap-1.5">
                          <input
                            className="form-control mr-cell-input mr-narration-input flex-1"
                            placeholder="Narration"
                            value={d.narration}
                            onChange={(e) => updateDraft(row.id, { narration: e.target.value })}
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="teal"
                            disabled={busy || (!d.paidAmt && !d.otherDed)}
                            onClick={() => savePayment(row)}
                          >
                            {busy ? "…" : "Save"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="erp-dt-foot mt-3 flex flex-col gap-2 border-t border-[var(--border,#e2e8f0)] pt-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <span className="font-semibold">
                Total Outstanding: ₹{inr(totalOutstanding)}
              </span>
              <span className="text-[var(--muted,#64748b)]">
                Paid Date applied on save: {slashDate(paidDate)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <FormCard>
          <p className="m-0 py-6 text-center text-sm text-[var(--muted,#64748b)]">
            {loading
              ? "Loading outstanding LHC…"
              : searched
                ? `No outstanding payment for vehicle ${vehNo || "—"}.`
                : "Vehicle select karke Show Outstanding dabayein."}
          </p>
        </FormCard>
      )}
    </>
  );
}
