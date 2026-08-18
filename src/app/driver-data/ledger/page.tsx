"use client";

import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { DateField, SelectField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { api, downloadCsv } from "@/lib/api-client";
import { todayIso } from "@/lib/dates";

type Driver = { name: string };
type Voucher = { voucherNo: string; date: string; driverName: string; amount: number; particulars: string; paymentType: string };

export default function DriverLedgerPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [driverName, setDriverName] = useState("");
  const [fromDate, setFromDate] = useState(todayIso());
  const [toDate, setToDate] = useState(todayIso());
  const [rows, setRows] = useState<Voucher[] | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    api<Driver[]>("/api/drivers").then(setDrivers);
  }, []);

  async function show(e?: FormEvent) {
    e?.preventDefault();
    const all = await api<Voucher[]>("/api/driver-vouchers");
    const filtered = all.filter((v) => {
      if (driverName && v.driverName !== driverName) return false;
      if (fromDate && v.date && v.date < fromDate) return false;
      if (toDate && v.date && v.date > toDate) return false;
      return true;
    });
    setRows(filtered);
    setMessage({ type: "ok", text: `${filtered.length} ledger line(s)` });
    return filtered;
  }

  async function exportExcel(e: FormEvent) {
    const data = (await show(e)) ?? [];
    if (data.length) downloadCsv("driver-ledger.csv", data as unknown as Record<string, unknown>[]);
  }

  return (
    <>
      <PageHeader title="Driver Ledger" subtitle="Select Date and View Ledger" crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Driver Ledger" }]} />
      <Flash message={message} />
      <form onSubmit={exportExcel}>
        <FormCard>
          <TwoCol>
            <div>
              <DateField label="From Date" value={fromDate} onChange={setFromDate} />
              <DateField label="To Date" value={toDate} onChange={setToDate} />
            </div>
            <SelectField label="Select Driver Name" value={driverName} onChange={(e) => setDriverName(e.target.value)} options={drivers.map((d) => d.name)} />
          </TwoCol>
        </FormCard>
        <FormCard>
          <Button type="submit" variant="teal">
            Export to Excel
          </Button>
        </FormCard>
      </form>
      {rows ? (
        <DataTable
          rows={rows}
          columns={[
            { key: "date", header: "Date" },
            { key: "driverName", header: "Driver" },
            { key: "particulars", header: "Narration" },
            { key: "amount", header: "Amount" },
            { key: "paymentType", header: "Type" },
          ]}
        />
      ) : null}
    </>
  );
}
