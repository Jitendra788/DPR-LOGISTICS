"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard } from "@/components/ui/FormCard";
import { DateField, ComboboxField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Flash } from "@/components/ui/Flash";
import { api } from "@/lib/api-client";
import { firstOfMonthIso, isoToDisplay, todayIso } from "@/lib/dates";

type Party = { name: string };
type Slip = {
  id: number;
  partyName: string;
  lorryNo: string;
  receiptDate: string;
  receiptNo: string;
  freight: number;
  advance: number;
  balance: number;
  paid: boolean;
  paidDate: string;
  paidAmount: number;
  tdsPct?: number;
  tdsAmt?: number;
  otherDed?: number;
  remark: string;
};

type RowDraft = {
  tdsPct: number;
  tdsAmt: number;
  paidAmt: number;
  otherDed: number;
  balance: number;
  narration: string;
};

function parseCellNum(text: string) {
  const cleaned = text.replace(/,/g, "").trim();
  if (!cleaned || cleaned === ".") return 0;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
}

function cellNumText(value: number) {
  const num = Number(value) || 0;
  return num === 0 ? "" : String(num);
}

function cellMoneyText(value: number) {
  const num = Number(value) || 0;
  if (Number.isInteger(num)) return String(num);
  return num.toFixed(2);
}

function CellNumInput({
  value,
  onChange,
  readOnly,
  width = "68px",
}: {
  value: number;
  onChange?: (n: number) => void;
  readOnly?: boolean;
  width?: string;
}) {
  const [text, setText] = useState(() => cellNumText(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(cellNumText(value));
  }, [value, focused]);

  return (
    <input
      className="form-control mr-cell-input"
      style={{ width, minWidth: width }}
      type="text"
      inputMode="decimal"
      readOnly={readOnly}
      value={text}
      onFocus={() => {
        if (!readOnly) setFocused(true);
      }}
      onChange={(e) => {
        if (readOnly) return;
        const raw = e.target.value;
        setText(raw);
        onChange?.(parseCellNum(raw));
      }}
      onBlur={() => {
        if (readOnly) return;
        setFocused(false);
        const num = parseCellNum(text);
        setText(cellNumText(num));
        onChange?.(num);
      }}
    />
  );
}

function CellMoneyInput({
  value,
  onChange,
  readOnly,
  width = "68px",
}: {
  value: number;
  onChange?: (n: number) => void;
  readOnly?: boolean;
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
      readOnly={readOnly}
      value={text}
      onFocus={() => {
        if (!readOnly) setFocused(true);
      }}
      onChange={(e) => {
        if (readOnly) return;
        const raw = e.target.value;
        setText(raw);
        onChange?.(parseCellNum(raw));
      }}
      onBlur={() => {
        if (readOnly) return;
        setFocused(false);
        const num = parseCellNum(text);
        setText(cellMoneyText(num));
        onChange?.(num);
      }}
    />
  );
}

function slipOutstanding(row: Slip) {
  const bal = Number(row.balance);
  if (Number.isFinite(bal) && bal > 0) return Number(bal.toFixed(2));
  const freight = Number(row.freight) || 0;
  const advance = Number(row.advance) || 0;
  const paid = Number(row.paidAmount) || 0;
  const tds = Number(row.tdsAmt) || 0;
  const other = Number(row.otherDed) || 0;
  return Number(Math.max(0, freight - advance - paid - tds - other).toFixed(2));
}

export default function BookingSlipPaymentPage() {
  const router = useRouter();
  const [parties, setParties] = useState<Party[]>([]);
  const [allSlips, setAllSlips] = useState<Slip[]>([]);
  const [partyName, setPartyName] = useState("");
  const [receiptNoFilter, setReceiptNoFilter] = useState("");
  const [fromDate, setFromDate] = useState(firstOfMonthIso());
  const [toDate, setToDate] = useState(todayIso());
  const [rows, setRows] = useState<Slip[]>([]);
  const [drafts, setDrafts] = useState<Record<number, RowDraft>>({});
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const partyNames = useMemo(() => parties.map((p) => p.name).filter(Boolean), [parties]);
  const receiptOptions = useMemo(() => {
    return allSlips
      .filter((s) => !s.paid && (!partyName.trim() || s.partyName === partyName.trim()))
      .map((s) => s.receiptNo)
      .filter(Boolean);
  }, [allSlips, partyName]);

  useEffect(() => {
    Promise.all([api<Party[]>("/api/parties"), api<Slip[]>("/api/slips")]).then(([p, slips]) => {
      setParties(p);
      setAllSlips(slips);
      if (!partyName && p[0]?.name) setPartyName(p[0].name);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function draftFor(row: Slip): RowDraft {
    return (
      drafts[row.id] ?? {
        tdsPct: 0,
        tdsAmt: 0,
        paidAmt: 0,
        otherDed: 0,
        balance: 0,
        narration: "",
      }
    );
  }

  function calcBalance(outstanding: number, draft: Pick<RowDraft, "paidAmt" | "otherDed" | "tdsAmt">) {
    if (!draft.paidAmt && !draft.otherDed && !draft.tdsAmt) return 0;
    return Number(Math.max(0, outstanding - draft.paidAmt - draft.otherDed - draft.tdsAmt).toFixed(2));
  }

  function updateDraft(id: number, patch: Partial<RowDraft>, outstanding: number, _freight?: number) {
    setDrafts((prev) => {
      const cur = prev[id] ?? {
        tdsPct: 0,
        tdsAmt: 0,
        paidAmt: 0,
        otherDed: 0,
        balance: 0,
        narration: "",
      };
      const next = { ...cur, ...patch };
      if ("tdsPct" in patch || "paidAmt" in patch || "otherDed" in patch) {
        if (next.tdsPct > 0) {
          next.tdsAmt = Number(((outstanding * next.tdsPct) / 100).toFixed(2));
        } else if ("tdsPct" in patch) {
          next.tdsAmt = 0;
        }
      }
      next.balance = calcBalance(outstanding, next);
      return { ...prev, [id]: next };
    });
  }

  async function searchSlips(e?: FormEvent) {
    e?.preventDefault();
    setLoading(true);
    try {
      const all = await api<Slip[]>("/api/slips");
      setAllSlips(all);
      const filtered = all.filter((r) => {
        if (r.paid) return false;
        if (slipOutstanding(r) <= 0) return false;
        if (partyName.trim() && r.partyName !== partyName.trim()) return false;
        if (receiptNoFilter.trim() && !r.receiptNo.toLowerCase().includes(receiptNoFilter.trim().toLowerCase())) {
          return false;
        }
        const d = (r.receiptDate || "").slice(0, 10);
        if (fromDate && d && d < fromDate) return false;
        if (toDate && d && d > toDate) return false;
        return true;
      });
      setRows(filtered);
      const nextDrafts: Record<number, RowDraft> = {};
      filtered.forEach((row) => {
        nextDrafts[row.id] = {
          tdsPct: 0,
          tdsAmt: 0,
          paidAmt: 0,
          otherDed: 0,
          balance: 0,
          narration: "",
        };
      });
      setDrafts(nextDrafts);
      setMessage({
        type: "ok",
        text: filtered.length
          ? `Found ${filtered.length} outstanding slip(s) for ${partyName || "all parties"}`
          : `No outstanding slips for ${partyName || "all parties"}`,
      });
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Search failed" });
    } finally {
      setLoading(false);
    }
  }

  async function savePayment(row: Slip) {
    const d = draftFor(row);
    if (!d.paidAmt && !d.otherDed && !d.tdsAmt) {
      setMessage({ type: "err", text: "Enter paid amount for this slip" });
      return;
    }
    const outstanding = slipOutstanding(row);
    const newBalance = calcBalance(outstanding, d);
    const newPaidAmount = Number(((Number(row.paidAmount) || 0) + d.paidAmt).toFixed(2));
    const newTdsAmt = Number(((Number(row.tdsAmt) || 0) + d.tdsAmt).toFixed(2));
    const newOtherDed = Number(((Number(row.otherDed) || 0) + d.otherDed).toFixed(2));
    try {
      await api(`/api/slips/${row.id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...row,
          paidAmount: newPaidAmount,
          tdsPct: d.tdsPct || row.tdsPct || 0,
          tdsAmt: newTdsAmt,
          otherDed: newOtherDed,
          balance: newBalance,
          paid: newBalance <= 0,
          paidDate: todayIso(),
          remark: d.narration || row.remark || "",
        }),
      });
      setMessage({
        type: "ok",
        text: newBalance <= 0
          ? `Payment saved — Reciept ${row.receiptNo} fully paid (shows cleared in Outstanding)`
          : `Payment saved for Reciept ${row.receiptNo}. Remaining ₹${newBalance.toFixed(2)}`,
      });
      await searchSlips();
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Save failed" });
    }
  }

  const totalOutstanding = useMemo(
    () => rows.reduce((s, r) => s + slipOutstanding(r), 0),
    [rows],
  );

  return (
    <>
      <PageHeader
        title="Booking Slip Payment"
        subtitle="Select and fill data for the payment"
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Booking Slip Payment" }]}
      />
      <Flash message={message} />
      <form onSubmit={searchSlips}>
        <FormCard>
          <div className="mb-2 flex flex-wrap gap-2">
            <Button type="button" variant="teal" size="sm" onClick={() => router.push("/roadways/booking-slip-payment/edit")}>
              Edit/Delete Payment
            </Button>
            <Button type="button" size="sm" onClick={() => router.push("/roadways/booking-slip-outstanding")}>
              Outstanding Report
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-4">
            <ComboboxField
              label="Party Name"
              value={partyName}
              onChange={(value) => {
                setPartyName(value);
                setReceiptNoFilter("");
              }}
              options={partyNames}
              placeholder="Search or select party"
            />
            <ComboboxField
              label="Reciept No (optional)"
              value={receiptNoFilter}
              onChange={setReceiptNoFilter}
              options={receiptOptions}
              placeholder="Search or select reciept"
            />
            <DateField label="From Date" value={fromDate} onChange={setFromDate} />
            <DateField label="To Date" value={toDate} onChange={setToDate} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Button type="submit" variant="teal" size="sm" disabled={loading}>
              {loading ? "Searching…" : "Show Data"}
            </Button>
            {rows.length ? (
              <span className="text-sm font-semibold text-[#333]">
                Total outstanding: ₹{totalOutstanding.toLocaleString("en-IN")}
              </span>
            ) : null}
          </div>
        </FormCard>
      </form>

      {rows.length ? (
        <div className="box overflow-x-auto">
          <div className="box-body !py-2 !px-2">
            <table className="erp-dt mr-receipt-table w-full min-w-[980px] border-collapse text-[13px]">
              <thead>
                <tr>
                  <th>Sr</th>
                  <th>Reciept No</th>
                  <th>Billing Party</th>
                  <th>Date</th>
                  <th>Lorry No</th>
                  <th>Outstanding</th>
                  <th>TDS %</th>
                  <th>TDS Amt</th>
                  <th>Paid Amount</th>
                  <th>Deduction</th>
                  <th>Balance</th>
                  <th>Narration</th>
                  <th>Save</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const outstanding = slipOutstanding(row);
                  const d = draftFor(row);
                  return (
                    <tr key={row.id}>
                      <td>{i + 1}</td>
                      <td>{row.receiptNo}</td>
                      <td>{row.partyName}</td>
                      <td>{isoToDisplay(row.receiptDate)}</td>
                      <td>{row.lorryNo}</td>
                      <td className="text-right">{cellMoneyText(outstanding)}</td>
                      <td>
                        <CellNumInput
                          value={d.tdsPct}
                          width="52px"
                          onChange={(n) => updateDraft(row.id, { tdsPct: n }, outstanding, row.freight)}
                        />
                      </td>
                      <td>
                        <CellMoneyInput value={d.tdsAmt} readOnly width="72px" />
                      </td>
                      <td>
                        <CellMoneyInput
                          value={d.paidAmt}
                          width="80px"
                          onChange={(n) => updateDraft(row.id, { paidAmt: n }, outstanding, row.freight)}
                        />
                      </td>
                      <td>
                        <CellNumInput
                          value={d.otherDed}
                          width="72px"
                          onChange={(n) => updateDraft(row.id, { otherDed: n }, outstanding, row.freight)}
                        />
                      </td>
                      <td>
                        <CellMoneyInput value={d.balance} readOnly width="72px" />
                      </td>
                      <td>
                        <input
                          className="form-control mr-cell-input mr-narration-input"
                          value={d.narration}
                          onChange={(e) => updateDraft(row.id, { narration: e.target.value }, outstanding, row.freight)}
                        />
                      </td>
                      <td>
                        <Button type="button" size="sm" variant="teal" onClick={() => savePayment(row)}>
                          Save
                        </Button>
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
      ) : null}
    </>
  );
}
