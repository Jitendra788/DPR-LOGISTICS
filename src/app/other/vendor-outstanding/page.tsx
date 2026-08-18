"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard } from "@/components/ui/FormCard";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { api, downloadCsv } from "@/lib/api-client";

type Row = { billNo: number; vendorName: string; outstanding: number };

export default function VendorOutstandingPage() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    Promise.all([
      api<{ name: string }[]>("/api/vendors"),
      api<{ vendorName: string; amount: number; paymentType: string }[]>("/api/vendor-vouchers"),
    ]).then(([vendors, vouchers]) => {
      const map: Record<string, number> = {};
      vendors.forEach((v) => {
        map[v.name] = 0;
      });
      vouchers.forEach((v) => {
        map[v.vendorName] = (map[v.vendorName] || 0) + (v.paymentType === "Dr" ? -v.amount : v.amount);
      });
      setRows(Object.entries(map).map(([vendorName, outstanding], i) => ({ billNo: i + 1, vendorName, outstanding })));
    });
  }, []);

  return (
    <>
      <PageHeader title="Vendor Outstanding" subtitle="View Vendor Outstanding" crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Vendor Outstanding" }]} />
      <DataTable
        rows={rows}
        columns={[
          { key: "billNo", header: "Bill No" },
          { key: "vendorName", header: "Vendor Name" },
          { key: "outstanding", header: "Outstanding Rs." },
        ]}
      />
      <FormCard>
        <Button type="button" variant="teal" onClick={() => downloadCsv("vendor-outstanding.csv", rows as unknown as Record<string, unknown>[])}>
          Export as Excel
        </Button>
      </FormCard>
    </>
  );
}
