"use client";

import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { DateField, ComboboxField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Flash } from "@/components/ui/Flash";
import { AdminForm } from "@/components/ui/AdminForm";
import { api, downloadCsv } from "@/lib/api-client";
import { firstOfMonthIso, isoToDisplay, todayIso } from "@/lib/dates";

type Vendor = { name: string };
type Voucher = {
  voucherNo: string;
  date: string;
  vendorName: string;
  amount: number;
  particulars: string;
  paymentType: string;
};

type LedgerLine = {
  billNo: string;
  billDate: string;
  particulars: string;
  crAmt: number;
  drAmt: number;
  kind: "op" | "row" | "total" | "outstanding";
};

function money(n: number) {
  if (!n) return "";
  return Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function moneyPlain(n: number) {
  if (!Number.isFinite(n)) return "";
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(2);
}

function showDate(iso: string) {
  if (!iso) return "";
  const d = iso.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return isoToDisplay(d).replace(/-/g, "/");
  return iso;
}

function isCredit(paymentType: string) {
  const t = (paymentType || "Cr").trim().toLowerCase();
  return t === "cr" || t === "credit" || t === "c";
}

export default function VendorLedgerPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorName, setVendorName] = useState("");
  const [fromDate, setFromDate] = useState(firstOfMonthIso());
  const [toDate, setToDate] = useState(todayIso());
  const [lines, setLines] = useState<LedgerLine[] | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api<Vendor[]>("/api/vendors").then((list) => {
      setVendors(list);
      setVendorName((n) => n || list[0]?.name || "");
    });
  }, []);

  async function buildLedger(): Promise<LedgerLine[]> {
    if (!vendorName.trim()) throw new Error("Select a vendor name");

    const all = await api<Voucher[]>("/api/vendor-vouchers");
    const forVendor = all.filter((v) => v.vendorName.trim().toLowerCase() === vendorName.trim().toLowerCase());

    let opCr = 0;
    let opDr = 0;
    for (const v of forVendor) {
      const d = (v.date || "").slice(0, 10);
      if (fromDate && d && d < fromDate) {
        const amt = Number(v.amount) || 0;
        if (isCredit(v.paymentType)) opCr += amt;
        else opDr += amt;
      }
    }

    const rows: LedgerLine[] = [];
    const opNet = Number((opCr - opDr).toFixed(2));
    rows.push({
      billNo: "Op.Bal",
      billDate: showDate(fromDate),
      particulars: "",
      crAmt: opNet > 0 ? opNet : 0,
      drAmt: opNet < 0 ? Math.abs(opNet) : 0,
      kind: "op",
    });

    const period = forVendor
      .filter((v) => {
        const d = (v.date || "").slice(0, 10);
        if (fromDate && d && d < fromDate) return false;
        if (toDate && d && d > toDate) return false;
        return true;
      })
      .sort((a, b) => (a.date || "").localeCompare(b.date || "") || String(a.voucherNo).localeCompare(String(b.voucherNo)));

    for (const v of period) {
      const amt = Number(v.amount) || 0;
      const credit = isCredit(v.paymentType);
      rows.push({
        billNo: v.voucherNo || "",
        billDate: showDate(v.date),
        particulars: v.particulars || (credit ? "Credit" : "Debit"),
        crAmt: credit ? amt : 0,
        drAmt: credit ? 0 : amt,
        kind: "row",
      });
    }

    const cr = rows.reduce((s, r) => s + r.crAmt, 0);
    const dr = rows.reduce((s, r) => s + r.drAmt, 0);
    const out = Number((cr - dr).toFixed(2));

    rows.push({
      billNo: "",
      billDate: "",
      particulars: "Total",
      crAmt: Number(cr.toFixed(2)),
      drAmt: Number(dr.toFixed(2)),
      kind: "total",
    });
    rows.push({
      billNo: "",
      billDate: "",
      particulars: "Outstanding",
      crAmt: out >= 0 ? out : 0,
      drAmt: out < 0 ? Math.abs(out) : 0,
      kind: "outstanding",
    });

    return rows;
  }

  async function show(e?: FormEvent) {
    e?.preventDefault();
    setLoading(true);
    try {
      const ledger = await buildLedger();
      setLines(ledger);
      setMessage({ type: "ok", text: `Ledger ready for ${vendorName}` });
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
      "vendor-ledger.csv",
      lines.map((r) => ({
        "Bill No": r.billNo,
        "Bill Date": r.billDate,
        Particulars: r.particulars,
        "Cr.Amt.": r.crAmt || "",
        "Dr.Amt.": r.drAmt || "",
      })),
    );
    setMessage({ type: "ok", text: "Excel file downloaded" });
  }

  return (
    <>
      <PageHeader
        title="Vendor Ledger"
        subtitle="Select date and vendor to view ledger"
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Vendor Ledger" }]}
      />
      <Flash message={message} />
      <AdminForm onSubmit={show}>
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
              label="Vendor Name"
              value={vendorName}
              onChange={setVendorName}
              options={vendors.map((v) => v.name)}
              placeholder="Search or select vendor"
            />
          </TwoCol>
        </FormCard>
      </AdminForm>

      {lines ? (
        <FormCard>
          <div className="table-scroll -mx-1">
            <table className="erp-party-ledger erp-dt w-full min-w-[720px] border-collapse text-[13px]">
              <thead>
                <tr>
                  <th>Bill No</th>
                  <th>Bill Date</th>
                  <th>Particulars</th>
                  <th className="text-right">Cr.Amt.</th>
                  <th className="text-right">Dr.Amt.</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((row, idx) => {
                  const isFoot = row.kind === "total" || row.kind === "outstanding";
                  return (
                    <tr key={`${row.kind}-${row.billNo}-${idx}`} className={isFoot ? "is-foot" : undefined}>
                      <td>{row.billNo}</td>
                      <td>{row.billDate}</td>
                      <td className={isFoot ? "font-bold" : undefined}>{row.particulars}</td>
                      <td className="text-right tabular-nums">
                        {isFoot ? moneyPlain(row.crAmt) : money(row.crAmt)}
                      </td>
                      <td className="text-right tabular-nums">
                        {row.kind === "outstanding" && !row.drAmt
                          ? ""
                          : isFoot
                            ? moneyPlain(row.drAmt)
                            : money(row.drAmt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Button type="button" variant="teal" className="mt-3" onClick={exportExcel}>
            Export as Excel
          </Button>
        </FormCard>
      ) : null}
    </>
  );
}
