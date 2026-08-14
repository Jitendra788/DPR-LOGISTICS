"use client";

import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { InputField, SelectField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { useCrud } from "@/hooks/useCrud";
import { api, formToObject } from "@/lib/api-client";

type Vehicle = { vehNo: string };
type Row = { id: number; date: string; driverName: string; vehNo: string; startKm: string; endKm: string; remarks: string };

export default function DriverRegisterPage() {
  const { rows, message, create, remove } = useCrud<Row>("driver-register");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), driverName: "", vehNo: "", startKm: "", endKm: "", remarks: "" });

  useEffect(() => {
    api<Vehicle[]>("/api/vehicles").then(setVehicles);
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const saved = await create({ ...form, ...formToObject(e.currentTarget) });
    if (saved) setForm({ date: new Date().toISOString().slice(0, 10), driverName: "", vehNo: "", startKm: "", endKm: "", remarks: "" });
  }

  return (
    <>
      <PageHeader title="Driver Register" subtitle="Daily driver attendance / trip register" crumbs={[{ label: "Home", href: "/" }, { label: "Driver Register" }]} />
      <Flash message={message} />
      <form onSubmit={onSubmit}>
        <FormCard>
          <TwoCol>
            <div>
              <InputField label="Date" type="date" name="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              <InputField label="Driver Name" name="driverName" value={form.driverName} onChange={(e) => setForm({ ...form, driverName: e.target.value })} required />
              <SelectField label="Vehicle No" name="vehNo" value={form.vehNo} onChange={(e) => setForm({ ...form, vehNo: e.target.value })} options={vehicles.map((v) => v.vehNo)} />
            </div>
            <div>
              <InputField label="Start KM" name="startKm" value={form.startKm} onChange={(e) => setForm({ ...form, startKm: e.target.value })} />
              <InputField label="End KM" name="endKm" value={form.endKm} onChange={(e) => setForm({ ...form, endKm: e.target.value })} />
              <InputField label="Remarks" name="remarks" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
            </div>
          </TwoCol>
          <Button type="submit">Save Data</Button>
        </FormCard>
      </form>
      <DataTable
        rows={rows}
        columns={[
          { key: "delete", header: "Delete", render: (row) => <Button type="button" size="sm" variant="danger" onClick={() => remove(row.id)}>Delete</Button> },
          { key: "date", header: "Date" },
          { key: "driverName", header: "Driver" },
          { key: "vehNo", header: "Veh No" },
          { key: "startKm", header: "Start KM" },
          { key: "endKm", header: "End KM" },
          { key: "remarks", header: "Remarks" },
        ]}
      />
    </>
  );
}
