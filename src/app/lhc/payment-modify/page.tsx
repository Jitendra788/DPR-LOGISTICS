"use client";

import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { InputField, SelectField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { api } from "@/lib/api-client";

type Vehicle = { vehNo: string };
type Lhc = {
  id: number;
  challanNo: string;
  vehNo: string;
  paid: boolean;
  paidDate: string;
  paidAmount: number;
  balance: number;
  lorryFreight: number;
};

export default function LhcPaymentModifyPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [rows, setRows] = useState<Lhc[]>([]);
  const [vehNo, setVehNo] = useState("");
  const [paidDate, setPaidDate] = useState("2024-05-24");
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    api<Vehicle[]>("/api/vehicles").then(setVehicles);
  }, []);

  async function showReport(e?: FormEvent) {
    e?.preventDefault();
    try {
      const qs = new URLSearchParams({ vehNo, paid: "true" }).toString();
      const data = await api<Lhc[]>(`/api/reports/lhc-payments?${qs}`);
      setRows(data);
      setMessage({ type: "ok", text: `Loaded ${data.length} paid record(s)` });
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Failed" });
    }
  }

  async function modify(row: Lhc) {
    const amount = Number(prompt("Paid Amount", String(row.paidAmount || row.lorryFreight)) || 0);
    const date = prompt("Paid Date (YYYY-MM-DD)", paidDate || row.paidDate) || row.paidDate;
    try {
      await api(`/api/lhc/${row.id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...row,
          paid: true,
          paidDate: date,
          paidAmount: amount,
          balance: Math.max(0, row.lorryFreight - amount),
        }),
      });
      setMessage({ type: "ok", text: `Updated payment for ${row.challanNo}` });
      await showReport();
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Update failed" });
    }
  }

  return (
    <>
      <PageHeader title="LHC Payment Modify" subtitle="Select and fill data for the payment" crumbs={[{ label: "Home", href: "/" }, { label: "LHC Payment" }]} />
      <Flash message={message} />
      <form onSubmit={showReport}>
        <FormCard>
          <TwoCol>
            <div>
              <SelectField label="Select Veh No" value={vehNo} onChange={(e) => setVehNo(e.target.value)} options={vehicles.map((v) => v.vehNo)} />
              <Button type="submit" className="mt-1">
                Show Report
              </Button>
            </div>
            <div>
              <InputField label="Paid Date" type="date" value={paidDate} onChange={(e) => setPaidDate(e.target.value)} />
            </div>
          </TwoCol>
        </FormCard>
      </form>
      <DataTable
        rows={rows}
        columns={[
          { key: "edit", header: "Update", render: (row) => <Button type="button" size="sm" variant="teal" onClick={() => modify(row)}>Update</Button> },
          { key: "challanNo", header: "LHC No" },
          { key: "vehNo", header: "Veh No" },
          { key: "paidDate", header: "Paid Date" },
          { key: "paidAmount", header: "Paid Amount" },
          { key: "balance", header: "Balance" },
        ]}
      />
    </>
  );
}
