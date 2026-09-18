"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { IndianRupee, Percent, Receipt, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard } from "@/components/ui/FormCard";
import { DateField, ComboboxField, DropdownField, InputField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Flash } from "@/components/ui/Flash";
import { AdminForm } from "@/components/ui/AdminForm";
import { api, downloadCsv } from "@/lib/api-client";
import { displayToIso, firstOfMonthIso, isoToDisplay, todayIso } from "@/lib/dates";

type DocSource = "DPR" | "ROADWAYS";
type ViewMode = "detail" | "party";
type SortKey = "date" | "party" | "tdsAmt" | "paidAmt";

type Party = { name: string };

type Receipt = {
  receiptNo: string;
  date: string;
  partyName: string;
  billNo: string;
  amount: number;
  paidAmt: number;
  tdsPct: number;
  tdsAmt: number;
  otherDed: number;
  mode: string;
  source?: string;
};

type Row = {
  srNo: number;
  date: string;
  partyName: string;
  billNo: string;
  receiptNo: string;
  paidAmt: number;
  tdsPct: number;
  tdsAmt: number;
  mode: string;
};

type PartySummary = {
  partyName: string;
  entries: number;
  paidAmt: number;
  tdsAmt: number;
  avgPct: number;
};

function normalizeDate(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const fromDisplay = displayToIso(trimmed);
  if (/^\d{4}-\d{2}-\d{2}$/.test(fromDisplay)) return fromDisplay;
  return trimmed.slice(0, 10);
}

function matchesSource(source: string | undefined, module: DocSource) {
  const s = (source || "DPR").toUpperCase();
  if (module === "ROADWAYS") return s === "ROADWAYS";
  return s !== "ROADWAYS";
}

function money(n: number) {
  return Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function showDate(iso: string) {
  if (!iso) return "";
  const d = normalizeDate(iso);
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return isoToDisplay(d).replace(/-/g, "/");
  return iso;
}

const MODE_OPTIONS = ["All", "Cash", "Cheque", "NEFT", "RTGS", "UPI", "Bank", "Other"];

export function TdsLedgerReport({
  source = "DPR",
  title = "TDS Ledger",
  subtitle = "All parties TDS deducted on money receipts",
  exportName = "tds-ledger.csv",
}: {
  source?: DocSource;
  title?: string;
  subtitle?: string;
  exportName?: string;
}) {
  const [parties, setParties] = useState<Party[]>([]);
  const [partyName, setPartyName] = useState("");
  const [fromDate, setFromDate] = useState(firstOfMonthIso());
  const [toDate, setToDate] = useState(todayIso());
  const [billNo, setBillNo] = useState("");
  const [receiptNo, setReceiptNo] = useState("");
  const [mode, setMode] = useState("All");
  const [quickSearch, setQuickSearch] = useState("");
  const [view, setView] = useState<ViewMode>("detail");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [rows, setRows] = useState<Row[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api<Party[]>("/api/parties").then(setParties).catch(() => setParties([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const list = await api<Receipt[]>("/api/receipts");
        if (cancelled) return;
        const from = normalizeDate(firstOfMonthIso());
        const to = normalizeDate(todayIso());
        const filtered = list
          .filter((r) => matchesSource(r.source, source))
          .filter((r) => (Number(r.tdsAmt) || 0) > 0)
          .filter((r) => {
            const d = normalizeDate(r.date);
            if (!d) return true;
            if (from && d < from) return false;
            if (to && d > to) return false;
            return true;
          })
          .sort((a, b) => normalizeDate(a.date).localeCompare(normalizeDate(b.date)))
          .map((r, i) => ({
            srNo: i + 1,
            date: r.date,
            partyName: r.partyName || "",
            billNo: r.billNo || "",
            receiptNo: r.receiptNo || "",
            paidAmt: Number(r.paidAmt) || Number(r.amount) || 0,
            tdsPct: Number(r.tdsPct) || 0,
            tdsAmt: Number(r.tdsAmt) || 0,
            mode: r.mode || "",
          }));
        setRows(filtered);
        setLoaded(true);
      } catch {
        if (!cancelled) {
          setRows([]);
          setLoaded(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [source]);

  const filteredRows = useMemo(() => {
    const q = quickSearch.trim().toLowerCase();
    let list = rows;
    if (q) {
      list = list.filter(
        (r) =>
          r.partyName.toLowerCase().includes(q) ||
          r.billNo.toLowerCase().includes(q) ||
          r.receiptNo.toLowerCase().includes(q) ||
          r.mode.toLowerCase().includes(q),
      );
    }
    const dir = sortDir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      if (sortKey === "date") {
        return dir * normalizeDate(a.date).localeCompare(normalizeDate(b.date));
      }
      if (sortKey === "party") return dir * a.partyName.localeCompare(b.partyName);
      if (sortKey === "paidAmt") return dir * (a.paidAmt - b.paidAmt);
      return dir * (a.tdsAmt - b.tdsAmt);
    });
  }, [rows, quickSearch, sortKey, sortDir]);

  const partySummary = useMemo(() => {
    const map = new Map<string, PartySummary>();
    for (const r of filteredRows) {
      const key = r.partyName || "(No party)";
      const cur = map.get(key) || { partyName: key, entries: 0, paidAmt: 0, tdsAmt: 0, avgPct: 0 };
      cur.entries += 1;
      cur.paidAmt += r.paidAmt;
      cur.tdsAmt += r.tdsAmt;
      map.set(key, cur);
    }
    return [...map.values()]
      .map((p) => ({
        ...p,
        paidAmt: Number(p.paidAmt.toFixed(2)),
        tdsAmt: Number(p.tdsAmt.toFixed(2)),
        avgPct: p.paidAmt > 0 ? Number(((p.tdsAmt / p.paidAmt) * 100).toFixed(2)) : 0,
      }))
      .sort((a, b) => b.tdsAmt - a.tdsAmt);
  }, [filteredRows]);

  const totalTds = useMemo(() => filteredRows.reduce((s, r) => s + (r.tdsAmt || 0), 0), [filteredRows]);
  const totalPaid = useMemo(() => filteredRows.reduce((s, r) => s + (r.paidAmt || 0), 0), [filteredRows]);
  const partyCount = useMemo(() => new Set(filteredRows.map((r) => r.partyName)).size, [filteredRows]);
  const avgPct = totalPaid > 0 ? Number(((totalTds / totalPaid) * 100).toFixed(2)) : 0;

  async function load(e?: FormEvent) {
    e?.preventDefault();
    setLoading(true);
    try {
      const list = await api<Receipt[]>("/api/receipts");
      const from = normalizeDate(fromDate);
      const to = normalizeDate(toDate);
      const party = partyName.trim().toLowerCase();
      const bill = billNo.trim().toLowerCase();
      const receipt = receiptNo.trim().toLowerCase();
      const modeFilter = mode === "All" ? "" : mode.toLowerCase();

      const filtered = list
        .filter((r) => matchesSource(r.source, source))
        .filter((r) => (Number(r.tdsAmt) || 0) > 0)
        .filter((r) => {
          if (!party) return true;
          return (r.partyName || "").trim().toLowerCase() === party;
        })
        .filter((r) => {
          if (!bill) return true;
          return (r.billNo || "").toLowerCase().includes(bill);
        })
        .filter((r) => {
          if (!receipt) return true;
          return (r.receiptNo || "").toLowerCase().includes(receipt);
        })
        .filter((r) => {
          if (!modeFilter) return true;
          return (r.mode || "").toLowerCase().includes(modeFilter);
        })
        .filter((r) => {
          const d = normalizeDate(r.date);
          if (!d) return true;
          if (from && d < from) return false;
          if (to && d > to) return false;
          return true;
        })
        .sort((a, b) => {
          const da = normalizeDate(a.date);
          const db = normalizeDate(b.date);
          if (da !== db) return da.localeCompare(db);
          return String(a.receiptNo).localeCompare(String(b.receiptNo));
        })
        .map((r, i) => ({
          srNo: i + 1,
          date: r.date,
          partyName: r.partyName || "",
          billNo: r.billNo || "",
          receiptNo: r.receiptNo || "",
          paidAmt: Number(r.paidAmt) || Number(r.amount) || 0,
          tdsPct: Number(r.tdsPct) || 0,
          tdsAmt: Number(r.tdsAmt) || 0,
          mode: r.mode || "",
        }));

      setRows(filtered);
      setLoaded(true);
      setMessage({
        type: "ok",
        text: filtered.length
          ? `Found ${filtered.length} TDS entr${filtered.length === 1 ? "y" : "ies"} · ₹${money(filtered.reduce((s, r) => s + r.tdsAmt, 0))} TDS`
          : "No TDS entries in this range",
      });
    } catch (err) {
      setRows([]);
      setLoaded(true);
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Could not load TDS ledger" });
    } finally {
      setLoading(false);
    }
  }

  function exportExcel() {
    if (!filteredRows.length) {
      setMessage({ type: "err", text: "No data to export" });
      return;
    }
    if (view === "party") {
      downloadCsv(
        exportName.replace(".csv", "-by-party.csv"),
        partySummary.map((p, i) => ({
          Sr: i + 1,
          Party: p.partyName,
          Entries: p.entries,
          "Paid Amt": p.paidAmt,
          "TDS Amt": p.tdsAmt,
          "Avg TDS %": p.avgPct,
        })),
      );
      return;
    }
    downloadCsv(
      exportName,
      filteredRows.map((r, i) => ({
        Sr: i + 1,
        Date: showDate(r.date),
        Party: r.partyName,
        "Bill No": r.billNo,
        "Receipt No": r.receiptNo,
        "Paid Amt": r.paidAmt,
        "TDS %": r.tdsPct,
        "TDS Amt": r.tdsAmt,
        Mode: r.mode,
      })),
    );
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "tdsAmt" || key === "paidAmt" ? "desc" : "asc");
    }
  }

  function sortMark(key: SortKey) {
    if (sortKey !== key) return "";
    return sortDir === "asc" ? " ↑" : " ↓";
  }

  function thisMonth() {
    setFromDate(firstOfMonthIso());
    setToDate(todayIso());
  }

  function clearParty() {
    setPartyName("");
  }

  return (
    <div className="tds-ledger">
      <PageHeader
        title={title}
        subtitle={subtitle}
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: title }]}
      />
      <Flash message={message} />

      <section className="tds-stat-grid" aria-label="TDS summary">
        <div className="tds-stat">
          <span className="tds-stat-ico">
            <IndianRupee className="h-4 w-4" />
          </span>
          <div>
            <p className="tds-stat-label">Total TDS</p>
            <p className="tds-stat-value">₹{money(totalTds)}</p>
          </div>
        </div>
        <div className="tds-stat tone-paid">
          <span className="tds-stat-ico">
            <Receipt className="h-4 w-4" />
          </span>
          <div>
            <p className="tds-stat-label">Paid Amount</p>
            <p className="tds-stat-value">₹{money(totalPaid)}</p>
          </div>
        </div>
        <div className="tds-stat tone-pct">
          <span className="tds-stat-ico">
            <Percent className="h-4 w-4" />
          </span>
          <div>
            <p className="tds-stat-label">Avg TDS %</p>
            <p className="tds-stat-value">{avgPct.toFixed(2)}%</p>
          </div>
        </div>
        <div className="tds-stat tone-party">
          <span className="tds-stat-ico">
            <Users className="h-4 w-4" />
          </span>
          <div>
            <p className="tds-stat-label">Parties / Entries</p>
            <p className="tds-stat-value">
              {partyCount}
              <small> / {filteredRows.length}</small>
            </p>
          </div>
        </div>
      </section>

      <AdminForm onSubmit={load}>
        <FormCard title="Filters" subtitle="Blank party = all parties · bill / receipt / mode optional">
          <div className="tds-filter-grid">
            <DateField label="From Date" value={fromDate} onChange={setFromDate} />
            <DateField label="To Date" value={toDate} onChange={setToDate} />
            <div className="tds-party-wrap">
              <ComboboxField
                label="Party Name"
                value={partyName}
                onChange={setPartyName}
                options={parties.map((p) => p.name)}
                placeholder="All parties (or select one)"
              />
              {partyName ? (
                <button type="button" className="tds-clear-party" onClick={clearParty}>
                  Clear party
                </button>
              ) : null}
            </div>
            <DropdownField label="Payment Mode" value={mode} onChange={(e) => setMode(e.target.value)} options={MODE_OPTIONS} />
            <InputField
              label="Bill No"
              value={billNo}
              onChange={(e) => setBillNo(e.target.value)}
              placeholder="Optional"
            />
            <InputField
              label="Receipt No"
              value={receiptNo}
              onChange={(e) => setReceiptNo(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div className="tds-actions">
            <Button type="submit" variant="teal" disabled={loading}>
              {loading ? "Loading…" : "Show TDS Ledger"}
            </Button>
            <Button type="button" variant="secondary" onClick={thisMonth}>
              This month
            </Button>
            <Button type="button" variant="secondary" onClick={exportExcel} disabled={!filteredRows.length}>
              Export Excel
            </Button>
            <Button type="button" variant="secondary" onClick={() => window.print()} disabled={!filteredRows.length}>
              Print
            </Button>
          </div>
        </FormCard>
      </AdminForm>

      <FormCard
        title={partyName.trim() ? `TDS Ledger — ${partyName.trim()}` : "TDS Ledger — All Parties"}
        subtitle={`${fromDate || "…"} → ${toDate || "…"}`}
        className="mt-3 tds-result-card"
      >
        <div className="tds-toolbar">
          <div className="tds-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              className={`tds-tab ${view === "detail" ? "is-on" : ""}`}
              aria-selected={view === "detail"}
              onClick={() => setView("detail")}
            >
              Detail rows
            </button>
            <button
              type="button"
              role="tab"
              className={`tds-tab ${view === "party" ? "is-on" : ""}`}
              aria-selected={view === "party"}
              onClick={() => setView("party")}
            >
              By party
            </button>
          </div>
          <input
            className="form-control tds-search"
            value={quickSearch}
            onChange={(e) => setQuickSearch(e.target.value)}
            placeholder="Search party / bill / MR / mode…"
            aria-label="Search TDS rows"
          />
        </div>

        <div className="table-scroll overflow-x-auto">
          {view === "detail" ? (
            <table className="erp-dt w-full min-w-[780px]">
              <thead>
                <tr>
                  <th>Sr</th>
                  <th>
                    <button type="button" className="tds-sort" onClick={() => toggleSort("date")}>
                      Date{sortMark("date")}
                    </button>
                  </th>
                  <th>
                    <button type="button" className="tds-sort" onClick={() => toggleSort("party")}>
                      Party{sortMark("party")}
                    </button>
                  </th>
                  <th>Bill No</th>
                  <th>Receipt No</th>
                  <th className="text-right">
                    <button type="button" className="tds-sort" onClick={() => toggleSort("paidAmt")}>
                      Paid Amt{sortMark("paidAmt")}
                    </button>
                  </th>
                  <th className="text-right">TDS %</th>
                  <th className="text-right">
                    <button type="button" className="tds-sort" onClick={() => toggleSort("tdsAmt")}>
                      TDS Amt{sortMark("tdsAmt")}
                    </button>
                  </th>
                  <th>Mode</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length ? (
                  filteredRows.map((r, i) => (
                    <tr key={`${r.receiptNo}-${r.billNo}-${r.srNo}`}>
                      <td>{i + 1}</td>
                      <td>{showDate(r.date)}</td>
                      <td>
                        <button type="button" className="tds-party-link" onClick={() => setPartyName(r.partyName)}>
                          {r.partyName}
                        </button>
                      </td>
                      <td>{r.billNo}</td>
                      <td>{r.receiptNo}</td>
                      <td className="text-right">{money(r.paidAmt)}</td>
                      <td className="text-right">{r.tdsPct ? Number(r.tdsPct).toFixed(2) : ""}</td>
                      <td className="text-right tds-amt">{money(r.tdsAmt)}</td>
                      <td>
                        <span className="tds-mode">{r.mode || "—"}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-6 text-center text-slate-500">
                      {loading
                        ? "Loading…"
                        : loaded
                          ? "No TDS rows for these filters"
                          : "Set filters and click Show TDS Ledger"}
                    </td>
                  </tr>
                )}
              </tbody>
              {filteredRows.length ? (
                <tfoot>
                  <tr>
                    <td colSpan={5} className="font-semibold">
                      Total ({filteredRows.length})
                    </td>
                    <td className="text-right font-semibold">{money(totalPaid)}</td>
                    <td />
                    <td className="text-right font-semibold tds-amt">{money(totalTds)}</td>
                    <td />
                  </tr>
                </tfoot>
              ) : null}
            </table>
          ) : (
            <table className="erp-dt w-full min-w-[640px]">
              <thead>
                <tr>
                  <th>Sr</th>
                  <th>Party</th>
                  <th className="text-right">Entries</th>
                  <th className="text-right">Paid Amt</th>
                  <th className="text-right">TDS Amt</th>
                  <th className="text-right">Avg %</th>
                </tr>
              </thead>
              <tbody>
                {partySummary.length ? (
                  partySummary.map((p, i) => (
                    <tr key={p.partyName}>
                      <td>{i + 1}</td>
                      <td>
                        <button
                          type="button"
                          className="tds-party-link"
                          onClick={() => {
                            setPartyName(p.partyName === "(No party)" ? "" : p.partyName);
                            setView("detail");
                          }}
                        >
                          {p.partyName}
                        </button>
                      </td>
                      <td className="text-right">{p.entries}</td>
                      <td className="text-right">{money(p.paidAmt)}</td>
                      <td className="text-right tds-amt">{money(p.tdsAmt)}</td>
                      <td className="text-right">{p.avgPct.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500">
                      {loading ? "Loading…" : "No party TDS summary"}
                    </td>
                  </tr>
                )}
              </tbody>
              {partySummary.length ? (
                <tfoot>
                  <tr>
                    <td colSpan={2} className="font-semibold">
                      Total
                    </td>
                    <td className="text-right font-semibold">{filteredRows.length}</td>
                    <td className="text-right font-semibold">{money(totalPaid)}</td>
                    <td className="text-right font-semibold tds-amt">{money(totalTds)}</td>
                    <td className="text-right font-semibold">{avgPct.toFixed(2)}</td>
                  </tr>
                </tfoot>
              ) : null}
            </table>
          )}
        </div>
      </FormCard>
    </div>
  );
}
