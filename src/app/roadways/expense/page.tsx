"use client";

import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { InputField, SelectField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { useCrud } from "@/hooks/useCrud";
import { api } from "@/lib/api-client";

type Vehicle = { vehNo: string };
type Row = { id: number; date: string; vehNo: string; expenseType: string; amount: number; billNo: string; remarks: string };

export default function ExpenseEntryPage() {
  const { rows, message, create, remove } = useCrud<Row>("expenses");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), vehNo: "", expenseType: "Diesel", amount: 0, billNo: "", remarks: "" });

  useEffect(() => {
    api<Vehicle[]>("/api/vehicles").then(setVehicles);
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const saved = await create(form);
    if (saved) setForm({ date: new Date().toISOString().slice(0, 10), vehNo: "", expenseType: "Diesel", amount: 0, billNo: "", remarks: "" });
  }

  return (
    <>
      <PageHeader title="Expense Entry" subtitle="Roadways vehicle expenses" crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Expense Entry" }]} />
      <Flash message={message} />
      <form onSubmit={onSubmit}>
        <FormCard>
          <TwoCol>
            <div>
              <InputField label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              <SelectField label="Vehicle No" value={form.vehNo} onChange={(e) => setForm({ ...form, vehNo: e.target.value })} options={vehicles.map((v) => v.vehNo)} />
              <SelectField label="Expense Type" value={form.expenseType} onChange={(e) => setForm({ ...form, expenseType: e.target.value })} options={["Diesel", "Toll", "RTO", "Repair", "Other"]} />
            </div>
            <div>
              <InputField label="Amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) || 0 })} />
              <InputField label="Bill No" value={form.billNo} onChange={(e) => setForm({ ...form, billNo: e.target.value })} />
              <InputField label="Remarks" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
            </div>
          </TwoCol>
          <Button type="submit">Save Expense</Button>
        </FormCard>
      </form>
      <DataTable
        rows={rows}
        columns={[
          { key: "delete", header: "Delete", render: (row) => <Button type="button" size="sm" variant="danger" onClick={() => remove(row.id)}>Delete</Button> },
          { key: "date", header: "Date" },
          { key: "vehNo", header: "Veh No" },
          { key: "expenseType", header: "Type" },
          { key: "amount", header: "Amount" },
          { key: "billNo", header: "Bill No" },
          { key: "remarks", header: "Remarks" },
        ]}
      />
    </>
  );
}
