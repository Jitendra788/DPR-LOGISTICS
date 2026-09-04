"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { DateField, ComboboxField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Flash } from "@/components/ui/Flash";
import { AdminForm } from "@/components/ui/AdminForm";
import { api, downloadCsv } from "@/lib/api-client";
import { firstOfMonthIso, todayIso } from "@/lib/dates";

type Vehicle = { vehNo: string };
type Trip = {
  id: number;
  vehNo: string;
  fromStation: string;
  toStation: string;
  lhcDate: string;
  tripDate: string;
  lhcFreight: number;
  freight: number;
  totalKm: string;
  lhcNo: string;
};
type Maint = {
  vehNo: string;
  amount: number;
  diesel?: number;
  otherExpenses?: number;
  fasTag?: number;
  freight?: number;
  serviceDate: string;
};

type MarginRow = {
  srNo: number;
  vehNo: string;
  lhcNo: string;
  date: string;
  fromStation: string;
  toStation: string;
  totalKm: string;
  freight: number;
  expense: number;
  margin: number;
};

function money(n: number) {
  return Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function MonthwiseReportPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehNo, setVehNo] = useState("");
  const [fromDate, setFromDate] = useState(firstOfMonthIso());
  const [toDate, setToDate] = useState(todayIso());
  const [rows, setRows] = useState<MarginRow[] | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api<Vehicle[]>("/api/fleet").then((list) => {
      setVehicles(list);
      setVehNo((n) => n || list[0]?.vehNo || "");
    });
  }, []);

  const totals = useMemo(() => {
    const list = rows ?? [];
    return {
      freight: list.reduce((s, r) => s + r.freight, 0),
      expense: list.reduce((s, r) => s + r.expense, 0),
      margin: list.reduce((s, r) => s + r.margin, 0),
    };
  }, [rows]);

  async function show(e?: FormEvent, onlySelected = false) {
    e?.preventDefault();
    setLoading(true);
    try {
      const [trips, maint] = await Promise.all([
        api<Trip[]>("/api/trips"),
        api<Maint[]>("/api/maintenance"),
      ]);

      const expenseByVehDate: Record<string, number> = {};
      for (const m of maint) {
        const d = (m.serviceDate || "").slice(0, 10);
        if (fromDate && d && d < fromDate) continue;
        if (toDate && d && d > toDate) continue;
        if (onlySelected && vehNo && m.vehNo !== vehNo) continue;
        const key = m.vehNo;
        const total =
          (Number(m.amount) || 0) +
          (Number(m.diesel) || 0) +
          (Number(m.otherExpenses) || 0) +
          (Number(m.fasTag) || 0) +
          (Number(m.freight) || 0);
        expenseByVehDate[key] = (expenseByVehDate[key] || 0) + total;
      }

      // Allocate vehicle maintenance across trips in period (pro-rata by freight, else equal)
      const filteredTrips = trips
        .filter((r) => {
          const d = (r.lhcDate || r.tripDate || "").slice(0, 10);
          if (fromDate && d && d < fromDate) return false;
          if (toDate && d && d > toDate) return false;
          if (onlySelected && vehNo && r.vehNo !== vehNo) return false;
          return true;
        })
        .sort((a, b) => (a.lhcDate || a.tripDate || "").localeCompare(b.lhcDate || b.tripDate || ""));

      const tripsByVeh: Record<string, Trip[]> = {};
      for (const t of filteredTrips) {
        (tripsByVeh[t.vehNo] ??= []).push(t);
      }

      const mapped: MarginRow[] = [];
      let sr = 1;
      for (const [vehicle, list] of Object.entries(tripsByVeh)) {
        const totalExp = expenseByVehDate[vehicle] || 0;
        const freightSum = list.reduce((s, t) => s + (Number(t.lhcFreight) || Number(t.freight) || 0), 0);
        let allocated = 0;
        list.forEach((t, idx) => {
          const freight = Number(t.lhcFreight) || Number(t.freight) || 0;
          let expense = 0;
          if (totalExp > 0) {
            if (idx === list.length - 1) {
              expense = Number((totalExp - allocated).toFixed(2));
            } else if (freightSum > 0) {
              expense = Number(((totalExp * freight) / freightSum).toFixed(2));
              allocated += expense;
            } else {
              expense = Number((totalExp / list.length).toFixed(2));
              allocated += expense;
            }
          }
          mapped.push({
            srNo: sr++,
            vehNo: t.vehNo,
            lhcNo: t.lhcNo,
            date: t.lhcDate || t.tripDate,
            fromStation: t.fromStation,
            toStation: t.toStation,
            totalKm: t.totalKm,
            freight,
            expense,
            margin: Number((freight - expense).toFixed(2)),
          });
        });
      }

      // Vehicles with expense but no trips in range
      for (const [vehicle, exp] of Object.entries(expenseByVehDate)) {
        if (tripsByVeh[vehicle]) continue;
        mapped.push({
          srNo: sr++,
          vehNo: vehicle,
          lhcNo: "",
          date: "",
          fromStation: "",
          toStation: "",
          totalKm: "",
          freight: 0,
          expense: exp,
          margin: Number((-exp).toFixed(2)),
        });
      }

      setRows(mapped);
      setMessage({ type: "ok", text: `Loaded ${mapped.length} margin line(s)` });
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Could not load report" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Monthwise Margin Report"
        subtitle="Freight − maintenance expense by vehicle (old site work flow)"
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Monthwise Margin Report" }]}
      />
      <Flash message={message} />
      <AdminForm onSubmit={(e) => show(e, false)}>
        <FormCard>
          <TwoCol>
            <div>
              <DateField label="From Date" value={fromDate} onChange={setFromDate} />
              <DateField label="To Date" value={toDate} onChange={setToDate} />
              <Button type="submit" variant="teal" className="mt-1" disabled={loading}>
                {loading ? "Loading…" : "View Report"}
              </Button>
            </div>
            <div>
              <ComboboxField
                label="Vehicle No"
                value={vehNo}
                onChange={setVehNo}
                options={vehicles.map((v) => v.vehNo)}
                placeholder="Search or select vehicle"
              />
              <Button type="button" variant="teal" className="mt-1" disabled={loading || !vehNo} onClick={() => void show(undefined, true)}>
                Show Selected Vehicle Ledger
              </Button>
            </div>
          </TwoCol>
        </FormCard>
      </AdminForm>

      {rows ? (
        <FormCard>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold">
              Freight: ₹{money(totals.freight)} &nbsp;|&nbsp; Expense: ₹{money(totals.expense)} &nbsp;|&nbsp; Margin: ₹
              {money(totals.margin)}
            </p>
            <Button
              type="button"
              variant="teal"
              size="sm"
              disabled={!rows.length}
              onClick={() => {
                downloadCsv("monthwise-margin.csv", rows as unknown as Record<string, unknown>[]);
                setMessage({ type: "ok", text: "Excel file downloaded" });
              }}
            >
              Export as Excel
            </Button>
          </div>
          <div className="table-scroll -mx-1">
            <table className="erp-gst-summary erp-dt w-full min-w-[900px] border-collapse text-[13px]">
              <thead>
                <tr>
                  <th>Sr No</th>
                  <th>Veh No</th>
                  <th>LHC No</th>
                  <th>Date</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Total KM</th>
                  <th className="text-right">Freight</th>
                  <th className="text-right">Expense</th>
                  <th className="text-right">Margin</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="erp-dt-empty">
                      No records found
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={`${row.vehNo}-${row.lhcNo}-${row.srNo}`}>
                      <td>{row.srNo}</td>
                      <td>{row.vehNo}</td>
                      <td>{row.lhcNo}</td>
                      <td>{row.date}</td>
                      <td>{row.fromStation}</td>
                      <td>{row.toStation}</td>
                      <td>{row.totalKm}</td>
                      <td className="text-right tabular-nums">{money(row.freight)}</td>
                      <td className="text-right tabular-nums">{money(row.expense)}</td>
                      <td className="text-right tabular-nums font-semibold">{money(row.margin)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </FormCard>
      ) : null}
    </>
  );
}
