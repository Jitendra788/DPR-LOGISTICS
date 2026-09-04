"use client";

import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { DateField, ComboboxField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { AdminForm } from "@/components/ui/AdminForm";
import { api, downloadCsv } from "@/lib/api-client";
import { billGrandTotal } from "@/lib/bill-totals";
import { firstOfMonthIso, todayIso } from "@/lib/dates";

type Party = { name: string; opBalance?: string; opDate?: string };
type Row = {
  date: string;
  particulars: string;
  ref: string;
  debit: number;
  credit: number;
  tds: number;
  balance: number;
};

function matchesParty(name: string, filter: string) {
  if (!filter.trim()) return true;
  return name.trim().toLowerCase() === filter.trim().toLowerCase();
}

function money(n: number) {
  return Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

export default function PartyLedgerPage() {
  const [parties, setParties] = useState<Party[]>([]);
  const partyNames = parties.map((p) => p.name).filter(Boolean);
  const [partyName, setPartyName] = useState("");
  const [fromDate, setFromDate] = useState(firstOfMonthIso());
  const [toDate, setToDate] = useState(todayIso());
  const [rows, setRows] = useState<Row[]>([]);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    api<Party[]>("/api/parties").then(setParties);
  }, []);

  async function loadLedger() {
    if (!partyName.trim()) {
      setMessage({ type: "err", text: "Select party name" });
      setRows([]);
      return [];
    }

    const [bills, receipts] = await Promise.all([
      api<
        {
          billNo: string;
          fromDate: string;
          billDate: string;
          amount: number;
          partyName: string;
          cgstAmt: number;
          sgstAmt: number;
          igstAmt: number;
        }[]
      >("/api/bills"),
      api<
        {
          receiptNo: string;
          date: string;
          amount: number;
          paidAmt: number;
          tdsAmt: number;
          otherDed: number;
          partyName: string;
          billNo: string;
        }[]
      >("/api/receipts"),
    ]);

    const party = parties.find((p) => matchesParty(p.name, partyName));
    const ledger: Omit<Row, "balance">[] = [];

    const opBal = Number(String(party?.opBalance ?? "").replace(/,/g, "")) || 0;
    let opening = opBal;

    // Bills / receipts before From Date roll into opening so outstanding stays correct
    bills
      .filter((b) => matchesParty(b.partyName, partyName))
      .forEach((b) => {
        const d = (b.billDate || b.fromDate || "").slice(0, 10);
        if (fromDate && d && d < fromDate) opening += billGrandTotal(b);
      });
    receipts
      .filter((r) => matchesParty(r.partyName, partyName))
      .forEach((r) => {
        const d = (r.date || "").slice(0, 10);
        if (fromDate && d && d < fromDate) {
          opening -= Number(r.paidAmt || r.amount || 0);
          opening -= Number(r.tdsAmt || 0);
          opening -= Number(r.otherDed || 0);
        }
      });
    opening = Number(opening.toFixed(2));

    if (opening) {
      ledger.push({
        date: fromDate || "",
        particulars: "Op Balance",
        ref: "",
        debit: opening > 0 ? opening : 0,
        credit: opening < 0 ? Math.abs(opening) : 0,
        tds: 0,
      });
    }

    bills
      .filter((b) => matchesParty(b.partyName, partyName))
      .forEach((b) => {
        const d = (b.billDate || b.fromDate || "").slice(0, 10);
        if (fromDate && d && d < fromDate) return;
        if (toDate && d && d > toDate) return;
        ledger.push({
          date: d,
          particulars: "Customer Bill",
          ref: b.billNo,
          debit: billGrandTotal(b),
          credit: 0,
          tds: 0,
        });
      });

    receipts
      .filter((r) => matchesParty(r.partyName, partyName))
      .forEach((r) => {
        const d = (r.date || "").slice(0, 10);
        if (fromDate && d && d < fromDate) return;
        if (toDate && d && d > toDate) return;
        const paid = Number(r.paidAmt || r.amount || 0);
        const tds = Number(r.tdsAmt || 0);
        const other = Number(r.otherDed || 0);
        // One row: paid in Credit, TDS in separate column (not a second Cr row)
        ledger.push({
          date: d,
          particulars: "Money Reciept Paid",
          ref: r.receiptNo ? `MR No ${r.receiptNo}` : r.billNo || "MR",
          debit: 0,
          credit: paid,
          tds,
        });
        if (other > 0) {
          ledger.push({
            date: d,
            particulars: "Other Deduction",
            ref: r.receiptNo ? `MR No ${r.receiptNo}` : r.billNo || "MR",
            debit: 0,
            credit: other,
            tds: 0,
          });
        }
      });

    ledger.sort((a, b) => {
      const byDate = String(a.date).localeCompare(String(b.date));
      if (byDate) return byDate;
      const order = (p: string) =>
        p === "Op Balance" ? 0 : p === "Customer Bill" ? 1 : p === "Money Reciept Paid" ? 2 : 3;
      return order(a.particulars) - order(b.particulars);
    });

    let running = 0;
    const withBalance: Row[] = ledger.map((row) => {
      // Debit increases receivable; Credit + TDS reduce receivable
      running = Number((running + row.debit - row.credit - row.tds).toFixed(2));
      return { ...row, balance: running };
    });

    setRows(withBalance);
    return withBalance;
  }

  async function showLedger(e?: FormEvent) {
    e?.preventDefault();
    const ledger = await loadLedger();
    if (!partyName.trim()) return;
    setMessage({ type: "ok", text: `Showing ${ledger.length} ledger entry(ies)` });
  }

  async function exportExcel(e: FormEvent) {
    e.preventDefault();
    const ledger = rows.length ? rows : await loadLedger();
    if (!ledger.length) {
      setMessage({ type: "err", text: "No data to export" });
      return;
    }
    downloadCsv(
      "party-ledger.csv",
      ledger.map((r) => ({
        Date: r.date,
        Particulars: r.particulars,
        "Bill / MR No": r.ref,
        "Dr.Amt": r.debit,
        "Cr.Amt": r.credit,
        TDS: r.tds,
        Balance: r.balance,
      })),
    );
    setMessage({ type: "ok", text: "Excel file downloaded" });
  }

  const totals = rows.reduce(
    (acc, r) => ({
      debit: acc.debit + r.debit,
      credit: acc.credit + r.credit,
      tds: acc.tds + r.tds,
    }),
    { debit: 0, credit: 0, tds: 0 },
  );
  const closing = rows.length ? rows[rows.length - 1]!.balance : 0;

  return (
    <>
      <PageHeader
        title="Party Ledger"
        subtitle="Bills (Debit), Money Receipt (Credit) and TDS in separate column"
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Party Ledger" }]}
      />
      <Flash message={message} />
      <AdminForm onSubmit={showLedger}>
        <FormCard>
          <TwoCol>
            <div>
              <DateField label="From Date" value={fromDate} onChange={setFromDate} />
              <DateField label="To Date" value={toDate} onChange={setToDate} />
              <Button type="submit" variant="teal" className="mt-1">
                Show Ledger
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
      <FormCard>
        <Button type="button" variant="teal" onClick={exportExcel}>
          Export as Excel
        </Button>
      </FormCard>
      {rows.length ? (
        <>
          <DataTable
            rows={rows}
            columns={[
              { key: "date", header: "Date" },
              { key: "ref", header: "Bill / MR No" },
              { key: "particulars", header: "Particulars" },
              { key: "debit", header: "Dr.Amt", render: (row) => (row.debit ? money(Number(row.debit)) : "") },
              { key: "credit", header: "Cr.Amt", render: (row) => (row.credit ? money(Number(row.credit)) : "") },
              { key: "tds", header: "TDS", render: (row) => (row.tds ? money(Number(row.tds)) : "") },
              { key: "balance", header: "Balance", render: (row) => money(Number(row.balance)) },
            ]}
          />
          <FormCard>
            <div className="overflow-x-auto">
              <table className="erp-dt w-full min-w-[640px] border-collapse text-[13px]">
                <tbody>
                  <tr>
                    <td className="font-semibold">Total</td>
                    <td className="text-right font-semibold">Dr.Amt: ₹{money(totals.debit)}</td>
                    <td className="text-right font-semibold">Cr.Amt: ₹{money(totals.credit)}</td>
                    <td className="text-right font-semibold">TDS: ₹{money(totals.tds)}</td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="pt-2 text-right text-[15px] font-bold text-[#0f766e]">
                      Total Outstanding: ₹{money(closing)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </FormCard>
        </>
      ) : null}
    </>
  );
}
