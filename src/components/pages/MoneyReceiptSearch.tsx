"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard } from "@/components/ui/FormCard";
import { DateField, DatalistField, InputField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Flash } from "@/components/ui/Flash";
import { api } from "@/lib/api-client";
import { firstOfMonthIso, isoToDisplay, todayIso } from "@/lib/dates";

type Party = { name: string };
type BillRow = {
  srNo: number;
  billNo: string;
  partyName: string;
  date: string;
  beforeTax: number;
  outstanding: number;
  billAmount: number;
  paid: number;
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

function cellMoneyText(value: number) {
  const num = Number(value) || 0;
  if (Number.isInteger(num)) return String(num);
  return num.toFixed(2);
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

export function MoneyReceiptSearch({
  source = "DPR",
  reportHref,
  editHref,
}: {
  source?: string;
  reportHref: string;
  editHref: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [parties, setParties] = useState<Party[]>([]);
  const partyNames = parties.map((p) => p.name).filter(Boolean);
  const [partyName, setPartyName] = useState("");
  const [billNoFilter, setBillNoFilter] = useState("");
  const [fromDate, setFromDate] = useState(firstOfMonthIso());
  const [toDate, setToDate] = useState(todayIso());
  const [rows, setRows] = useState<BillRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, RowDraft>>({});
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api<Party[]>("/api/parties").then(setParties);
  }, []);

  useEffect(() => {
    const qParty = searchParams.get("partyName") ?? "";
    const qBill = searchParams.get("billNo") ?? "";
    if (!qParty && !qBill) return;
    if (qParty) setPartyName(qParty);
    if (qBill) setBillNoFilter(qBill);
    searchBills(undefined, { partyName: qParty, billNo: qBill });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function draftFor(row: BillRow): RowDraft {
    return (
      drafts[row.billNo] ?? {
        tdsPct: 0,
        tdsAmt: 0,
        paidAmt: row.outstanding,
        otherDed: 0,
        balance: row.outstanding,
        narration: "",
      }
    );
  }

  function updateDraft(billNo: string, patch: Partial<RowDraft>, row: BillRow) {
    setDrafts((prev) => {
      const cur = prev[billNo] ?? {
        tdsPct: 0,
        tdsAmt: 0,
        paidAmt: row.outstanding,
        otherDed: 0,
        balance: row.outstanding,
        narration: "",
      };
      const next = { ...cur, ...patch };
      if ("tdsPct" in patch || "paidAmt" in patch || "otherDed" in patch) {
        if (next.tdsPct > 0) {
          next.tdsAmt = Number(((row.beforeTax * next.tdsPct) / 100).toFixed(2));
        }
      }
      next.balance = Number(
        Math.max(0, row.outstanding - next.paidAmt - next.otherDed - next.tdsAmt).toFixed(2),
      );
      return { ...prev, [billNo]: next };
    });
  }

  async function searchBills(e?: FormEvent, overrides?: { partyName?: string; billNo?: string }) {
    e?.preventDefault();
    setLoading(true);
    const party = (overrides?.partyName ?? partyName).trim();
    const billNo = (overrides?.billNo ?? billNoFilter).trim();
    try {
      const qs = new URLSearchParams({
        ...(party ? { partyName: party } : {}),
        ...(billNo ? { billNo } : {}),
        ...(fromDate ? { fromDate } : {}),
        ...(toDate ? { toDate } : {}),
      }).toString();
      const data = await api<BillRow[]>(`/api/reports/money-receipt-outstanding${qs ? `?${qs}` : ""}`);
      setRows(data);
      const nextDrafts: Record<string, RowDraft> = {};
      data.forEach((row) => {
        nextDrafts[row.billNo] = {
          tdsPct: 0,
          tdsAmt: 0,
          paidAmt: row.outstanding,
          otherDed: 0,
          balance: row.outstanding,
          narration: "",
        };
      });
      setDrafts(nextDrafts);
      setMessage({
        type: "ok",
        text: data.length
          ? `Found ${data.length} pending bill(s) for ${party || "all parties"}`
          : `No pending bills for ${party || "all parties"}`,
      });
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Search failed" });
    } finally {
      setLoading(false);
    }
  }

  async function saveReceipt(row: BillRow) {
    const d = draftFor(row);
    if (!d.paidAmt && !d.otherDed && !d.tdsAmt) {
      setMessage({ type: "err", text: "Enter paid amount for this bill" });
      return;
    }
    try {
      await api("/api/receipts", {
        method: "POST",
        body: JSON.stringify({
          billNo: row.billNo,
          partyName: row.partyName,
          date: row.date || todayIso(),
          tdsPct: d.tdsPct,
          tdsAmt: d.tdsAmt,
          paidAmt: d.paidAmt,
          otherDed: d.otherDed,
          amount: d.paidAmt,
          remarks: d.narration,
          source,
        }),
      });
      setMessage({ type: "ok", text: `Receipt saved for bill ${row.billNo}` });
      await searchBills();
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Save failed" });
    }
  }

  const totalOutstanding = useMemo(() => rows.reduce((s, r) => s + r.outstanding, 0), [rows]);

  return (
    <>
      <PageHeader
        title="Money Reciept"
        subtitle="Search by party name and date — record payment against pending bills"
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Money Reciept" }]}
      />
      <Flash message={message} />
      <form onSubmit={searchBills}>
        <FormCard>
          <div className="mb-2 flex flex-wrap gap-2">
            <Button type="button" variant="teal" size="sm" onClick={() => router.push(editHref)}>
              Edit/Delete Money Reciept
            </Button>
            <Button type="button" size="sm" onClick={() => router.push(reportHref)}>
              View Report
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-4">
            <DatalistField
              label="Party Name"
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              options={partyNames}
              placeholder="Type party name"
              listId="mr-party"
            />
            <InputField
              label="Bill No (optional)"
              value={billNoFilter}
              onChange={(e) => setBillNoFilter(e.target.value)}
            />
            <DateField label="From Date" value={fromDate} onChange={setFromDate} />
            <DateField label="To Date" value={toDate} onChange={setToDate} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Button type="submit" variant="teal" size="sm" disabled={loading}>
              {loading ? "Searching…" : "Search Bills"}
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
            <table className="erp-dt mr-receipt-table w-full min-w-[960px] border-collapse text-[13px]">
              <thead>
                <tr>
                  <th>Sr</th>
                  <th>Bill No</th>
                  <th>Party</th>
                  <th>Date</th>
                  <th>Before Tax</th>
                  <th>Outstanding</th>
                  <th>TDS %</th>
                  <th>TDS Amt</th>
                  <th>Paid</th>
                  <th>Deduction</th>
                  <th>Balance</th>
                  <th>Narration</th>
                  <th>Save</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const d = draftFor(row);
                  return (
                    <tr key={row.billNo}>
                      <td>{row.srNo}</td>
                      <td>{row.billNo}</td>
                      <td>{row.partyName}</td>
                      <td>{isoToDisplay(row.date)}</td>
                      <td className="text-right">{cellMoneyText(row.beforeTax)}</td>
                      <td className="text-right">{cellMoneyText(row.outstanding)}</td>
                      <td>
                        <CellNumInput
                          value={d.tdsPct}
                          width="52px"
                          onChange={(n) => updateDraft(row.billNo, { tdsPct: n }, row)}
                        />
                      </td>
                      <td>
                        <CellMoneyInput value={d.tdsAmt} readOnly width="72px" />
                      </td>
                      <td>
                        <CellMoneyInput
                          value={d.paidAmt}
                          width="80px"
                          onChange={(n) => updateDraft(row.billNo, { paidAmt: n }, row)}
                        />
                      </td>
                      <td>
                        <CellNumInput
                          value={d.otherDed}
                          width="72px"
                          onChange={(n) => updateDraft(row.billNo, { otherDed: n }, row)}
                        />
                      </td>
                      <td>
                        <CellMoneyInput value={d.balance} readOnly width="72px" />
                      </td>
                      <td>
                        <input
                          className="form-control mr-cell-input mr-narration-input"
                          value={d.narration}
                          onChange={(e) => updateDraft(row.billNo, { narration: e.target.value }, row)}
                        />
                      </td>
                      <td>
                        <Button type="button" size="sm" variant="teal" onClick={() => saveReceipt(row)}>
                          Save
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </>
  );
}
