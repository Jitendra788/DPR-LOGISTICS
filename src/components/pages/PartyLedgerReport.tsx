"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { DateField, ComboboxField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Flash } from "@/components/ui/Flash";
import { AdminForm } from "@/components/ui/AdminForm";
import { api, downloadCsv } from "@/lib/api-client";
import { billGrandTotal } from "@/lib/bill-totals";
import { firstOfMonthIso, isoToDisplay, todayIso } from "@/lib/dates";

type DocSource = "DPR" | "ROADWAYS";

type Party = { name: string; opBalance?: string; opDate?: string };

type Bill = {
  billNo: string;
  fromDate: string;
  billDate: string;
  amount: number;
  partyName: string;
  cgstAmt: number;
  sgstAmt: number;
  igstAmt: number;
  source?: string;
};

type Receipt = {
  receiptNo: string;
  date: string;
  amount: number;
  paidAmt: number;
  tdsAmt?: number;
  otherDed?: number;
  partyName: string;
  billNo: string;
  source?: string;
};

export type LedgerLine = {
  billNo: string;
  date: string;
  particulars: string;
  crAmt: number;
  drAmt: number;
  kind: "op" | "bill" | "mr" | "tds" | "other" | "total" | "outstanding";
};

function matchesParty(name: string, filter: string) {
  if (!filter.trim()) return true;
  return name.trim().toLowerCase() === filter.trim().toLowerCase();
}

function matchesSource(source: string | undefined, module: DocSource) {
  const s = (source || "DPR").toUpperCase();
  if (module === "ROADWAYS") return s === "ROADWAYS";
  return s !== "ROADWAYS";
}

function money(n: number) {
  if (!n) return "";
  return Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function moneyOrBlank(n: number) {
  if (!n) return "";
  return Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function showDate(iso: string) {
  if (!iso) return "";
  const d = iso.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return isoToDisplay(d).replace(/-/g, "/");
  return iso;
}

function parseOpBalance(value?: string) {
  const n = Number(String(value ?? "").replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}

export function PartyLedgerReport({
  source = "DPR",
  title = "Party Ledger",
  subtitle = "Select party and date range",
  exportName = "party-ledger.csv",
}: {
  source?: DocSource;
  title?: string;
  subtitle?: string;
  exportName?: string;
}) {
  const [parties, setParties] = useState<Party[]>([]);
  const partyNames = parties.map((p) => p.name).filter(Boolean);
  const [partyName, setPartyName] = useState("");
  const [fromDate, setFromDate] = useState(firstOfMonthIso());
  const [toDate, setToDate] = useState(todayIso());
  const [lines, setLines] = useState<LedgerLine[] | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api<Party[]>("/api/parties").then((list) => {
      setParties(list);
      setPartyName((n) => n || list[0]?.name || "");
    });
  }, []);

  const bodyLines = useMemo(() => (lines ?? []).filter((r) => r.kind !== "total" && r.kind !== "outstanding"), [lines]);
  const totalCr = useMemo(() => bodyLines.reduce((s, r) => s + (r.crAmt || 0), 0), [bodyLines]);
  const totalDr = useMemo(() => bodyLines.reduce((s, r) => s + (r.drAmt || 0), 0), [bodyLines]);
  const outstanding = useMemo(() => Number((totalDr - totalCr).toFixed(2)), [totalCr, totalDr]);

  async function buildLedger(): Promise<LedgerLine[]> {
    if (!partyName.trim()) {
      throw new Error("Select a party name");
    }

    const [bills, receipts] = await Promise.all([api<Bill[]>("/api/bills"), api<Receipt[]>("/api/receipts")]);
    const party = parties.find((p) => matchesParty(p.name, partyName));
    const rows: LedgerLine[] = [];

    const opAmt = parseOpBalance(party?.opBalance);
    rows.push({
      billNo: "Op Balance",
      date: showDate(party?.opDate || fromDate),
      particulars: "",
      crAmt: opAmt < 0 ? Math.abs(opAmt) : 0,
      drAmt: opAmt > 0 ? opAmt : 0,
      kind: "op",
    });

    const billRows = bills
      .filter((b) => matchesSource(b.source, source) && matchesParty(b.partyName, partyName))
      .map((b) => {
        const d = (b.billDate || b.fromDate || "").slice(0, 10);
        return { bill: b, date: d, amount: billGrandTotal(b) };
      })
      .filter((x) => {
        if (fromDate && x.date && x.date < fromDate) return false;
        if (toDate && x.date && x.date > toDate) return false;
        return x.amount > 0;
      });

    const receiptRows = receipts
      .filter((r) => matchesSource(r.source, source) && matchesParty(r.partyName, partyName))
      .map((r) => ({ receipt: r, date: (r.date || "").slice(0, 10) }))
      .filter((x) => {
        if (fromDate && x.date && x.date < fromDate) return false;
        if (toDate && x.date && x.date > toDate) return false;
        return true;
      });

    type Timed =
      | { sortDate: string; sortKey: string; type: "bill"; bill: (typeof billRows)[number] }
      | { sortDate: string; sortKey: string; type: "receipt"; receipt: (typeof receiptRows)[number] };

    const timed: Timed[] = [
      ...billRows.map((b) => ({
        sortDate: b.date || "9999",
        sortKey: `B-${b.bill.billNo}`,
        type: "bill" as const,
        bill: b,
      })),
      ...receiptRows.map((r) => ({
        sortDate: r.date || "9999",
        sortKey: `R-${r.receipt.receiptNo || r.receipt.billNo}`,
        type: "receipt" as const,
        receipt: r,
      })),
    ].sort((a, b) => a.sortDate.localeCompare(b.sortDate) || a.sortKey.localeCompare(b.sortKey));

    for (const item of timed) {
      if (item.type === "bill") {
        const x = item.bill;
        rows.push({
          billNo: x.bill.billNo,
          date: showDate(x.date),
          particulars: "Customer Bill",
          crAmt: 0,
          drAmt: x.amount,
          kind: "bill",
        });
        continue;
      }

      const r = item.receipt.receipt;
      const mrLabel = `MR No ${r.receiptNo || r.billNo || ""}`.trim();
      const paid = Number(r.paidAmt) || Number(r.amount) || 0;
      const tds = Number(r.tdsAmt) || 0;
      const other = Number(r.otherDed) || 0;
      const date = showDate(item.receipt.date);

      if (paid > 0) {
        rows.push({
          billNo: mrLabel,
          date,
          particulars: "Money Reciept Paid",
          crAmt: paid,
          drAmt: 0,
          kind: "mr",
        });
      }
      if (tds > 0) {
        rows.push({
          billNo: mrLabel,
          date: "",
          particulars: "TDS Deduction",
          crAmt: tds,
          drAmt: 0,
          kind: "tds",
        });
      }
      if (other > 0) {
        rows.push({
          billNo: mrLabel,
          date: "",
          particulars: "Other Deduction",
          crAmt: other,
          drAmt: 0,
          kind: "other",
        });
      }
    }

    const cr = rows.reduce((s, r) => s + r.crAmt, 0);
    const dr = rows.reduce((s, r) => s + r.drAmt, 0);
    const out = Number((dr - cr).toFixed(2));
    rows.push({
      billNo: "Total",
      date: "",
      particulars: "",
      crAmt: Number(cr.toFixed(2)),
      drAmt: Number(dr.toFixed(2)),
      kind: "total",
    });
    rows.push({
      billNo: "Outstanding",
      date: "",
      particulars: "",
      crAmt: out < 0 ? Math.abs(out) : 0,
      drAmt: out >= 0 ? out : 0,
      kind: "outstanding",
    });

    return rows;
  }

  async function showLedger(e?: FormEvent) {
    e?.preventDefault();
    setLoading(true);
    try {
      const ledger = await buildLedger();
      setLines(ledger);
      setMessage({ type: "ok", text: `Ledger ready for ${partyName}` });
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Could not load ledger" });
    } finally {
      setLoading(false);
    }
  }

  function exportExcel() {
    if (!lines?.length) {
      setMessage({ type: "err", text: "No data to export" });
      return;
    }
    downloadCsv(
      exportName,
      lines.map((r) => ({
        "Bill No": r.billNo,
        Date: r.date,
        Particulars: r.particulars,
        "Cr.Amt": r.crAmt || "",
        "Dr.Amt": r.drAmt || "",
      })),
    );
    setMessage({ type: "ok", text: "Excel file downloaded" });
  }

  const reportTitle =
    partyName && fromDate && toDate
      ? `Ledger Report of ${partyName} From ${fromDate} To ${toDate}`
      : title;

  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: title }]}
      />
      <Flash message={message} />
      <AdminForm onSubmit={showLedger}>
        <FormCard>
          <TwoCol>
            <div>
              <DateField label="From Date" value={fromDate} onChange={setFromDate} />
              <DateField label="To Date" value={toDate} onChange={setToDate} />
              <Button type="submit" variant="teal" className="mt-1" disabled={loading}>
                {loading ? "Loading…" : "Show Ledger"}
              </Button>
            </div>
            <ComboboxField
              label="Party Name"
              value={partyName}
              onChange={setPartyName}
              options={partyNames}
              placeholder="Search or select party"
            />
          </TwoCol>
        </FormCard>
      </AdminForm>

      {lines ? (
        <FormCard>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-[#0f172a]">{reportTitle}</p>
            <Button type="button" variant="teal" size="sm" onClick={exportExcel}>
              Export as Excel
            </Button>
          </div>
          <div className="table-scroll -mx-1">
            <table className="erp-party-ledger erp-dt w-full min-w-[720px] border-collapse text-[13px]">
              <thead>
                <tr>
                  <th>Bill No</th>
                  <th>Date</th>
                  <th>Particulars</th>
                  <th className="text-right">Cr.Amt</th>
                  <th className="text-right">Dr.Amt</th>
                </tr>
              </thead>
              <tbody>
                {bodyLines.length === 0 && lines.every((r) => r.kind === "total" || r.kind === "outstanding") ? (
                  <tr>
                    <td colSpan={5} className="erp-dt-empty">
                      No ledger entries for selected party / dates
                    </td>
                  </tr>
                ) : null}
                {lines.map((row, idx) => {
                  const isFoot = row.kind === "total" || row.kind === "outstanding";
                  return (
                    <tr key={`${row.kind}-${row.billNo}-${idx}`} className={isFoot ? "is-foot" : undefined}>
                      <td className={isFoot ? "font-bold" : undefined}>{row.billNo}</td>
                      <td>{row.date}</td>
                      <td>{row.particulars}</td>
                      <td className="text-right tabular-nums">
                        {row.kind === "outstanding" ? "" : row.kind === "total" ? money(row.crAmt) : moneyOrBlank(row.crAmt)}
                      </td>
                      <td className="text-right tabular-nums font-medium">
                        {row.kind === "total" || row.kind === "outstanding" || row.kind === "op"
                          ? money(row.drAmt)
                          : moneyOrBlank(row.drAmt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-sm font-semibold">
            Outstanding: ₹{Number(outstanding).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </FormCard>
      ) : null}
    </>
  );
}
