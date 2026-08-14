"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard } from "@/components/ui/FormCard";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { api, downloadCsv } from "@/lib/api-client";

type Row = { sillNo: number; driverName: string; outstanding: number };

export default function DriverOutstandingPage() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    Promise.all([
      api<{ name: string }[]>("/api/drivers"),
      api<{ driverName: string; amount: number; paymentType: string }[]>("/api/driver-vouchers"),
    ]).then(([drivers, vouchers]) => {
      const map: Record<string, number> = {};
      drivers.forEach((d) => {
        map[d.name] = 0;
      });
      vouchers.forEach((v) => {
        map[v.driverName] = (map[v.driverName] || 0) + (v.paymentType === "Dr" ? -v.amount : v.amount);
      });
      setRows(Object.entries(map).map(([driverName, outstanding], i) => ({ sillNo: i + 1, driverName, outstanding })));
    });
  }, []);

  return (
    <>
      <PageHeader title="Driver Outstanding" subtitle="Non Driver Outstanding" crumbs={[{ label: "Home", href: "/" }, { label: "Driver Outstanding" }]} />
      <DataTable
        rows={rows}
        columns={[
          { key: "sillNo", header: "Sill No" },
          { key: "driverName", header: "Driver Name" },
          { key: "outstanding", header: "Outstanding Rs." },
        ]}
      />
      <FormCard>
        <Button type="button" variant="teal" onClick={() => downloadCsv("driver-outstanding.csv", rows as unknown as Record<string, unknown>[])}>
          Export to Excel
        </Button>
      </FormCard>
    </>
  );
}
