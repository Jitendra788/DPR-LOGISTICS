"use client";

import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { InputField, ComboboxField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { AdminForm } from "@/components/ui/AdminForm";
import { useCrud } from "@/hooks/useCrud";
import { api } from "@/lib/api-client";

type Vehicle = { vehNo: string };
type Row = { id: number; date: string; driverName: string; vehNo: string; amount: number; mode: string; remarks: string };

export default function DriverAdvancePage() {
  const { rows, message, create, remove } = useCrud<Row>("driver-advance");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), driverName: "", vehNo: "", amount: 0, mode: "Cash", remarks: "" });

  useEffect(() => {
    api<Vehicle[]>("/api/vehicles").then(setVehicles);
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const saved = await create(form);
    if (saved) setForm({ date: new Date().toISOString().slice(0, 10), driverName: "", vehNo: "", amount: 0, mode: "Cash", remarks: "" });
  }

  return (
    <>
      <PageHeader title="Driver Advance" subtitle="Record driver cash / diesel advance" crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Driver Advance" }]} />
      <Flash message={message} />
      <AdminForm onSubmit={onSubmit}>
        <FormCard>
          <TwoCol>
            <div>
              <InputField label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              <InputField label="Driver Name" value={form.driverName} onChange={(e) => setForm({ ...form, driverName: e.target.value })} required />
              <ComboboxField label="Vehicle No" value={form.vehNo} onChange={(vehNo) => setForm({ ...form, vehNo })} options={vehicles.map((v) => v.vehNo)} placeholder="Search or select vehicle" />
            </div>
            <div>
              <InputField label="Advance Amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) || 0 })} />
              <ComboboxField label="Mode" value={form.mode} onChange={(mode) => setForm({ ...form, mode })} options={["Cash", "Bank", "Diesel"]} placeholder="Select mode" />
              <InputField label="Remarks" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
            </div>
          </TwoCol>
          <Button type="submit">Save Advance</Button>
        </FormCard>
      </AdminForm>
      <DataTable
        rows={rows}
        columns={[
          { key: "delete", header: "Delete", render: (row) => <Button type="button" size="sm" variant="danger" onClick={() => remove(row.id)}>Delete</Button> },
          { key: "date", header: "Date" },
          { key: "driverName", header: "Driver" },
          { key: "vehNo", header: "Veh No" },
          { key: "amount", header: "Amount" },
          { key: "mode", header: "Mode" },
          { key: "remarks", header: "Remarks" },
        ]}
      />
    </>
  );
}
