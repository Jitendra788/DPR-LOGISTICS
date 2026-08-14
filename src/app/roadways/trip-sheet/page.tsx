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

type Station = { name: string };
type Vehicle = { vehNo: string };
type Row = { id: number; tripDate: string; vehNo: string; driverName: string; fromStation: string; toStation: string; freight: number };

export default function TripSheetPage() {
  const { rows, message, create, remove } = useCrud<Row>("trips");
  const [stations, setStations] = useState<Station[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [form, setForm] = useState({ tripDate: new Date().toISOString().slice(0, 10), vehNo: "", driverName: "", fromStation: "", toStation: "", freight: 0 });

  useEffect(() => {
    Promise.all([api<Station[]>("/api/stations"), api<Vehicle[]>("/api/vehicles")]).then(([s, v]) => {
      setStations(s);
      setVehicles(v);
    });
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const saved = await create(form);
    if (saved) setForm({ tripDate: new Date().toISOString().slice(0, 10), vehNo: "", driverName: "", fromStation: "", toStation: "", freight: 0 });
  }

  return (
    <>
      <PageHeader title="Trip Sheet" subtitle="DPR Roadways trip entry" crumbs={[{ label: "Home", href: "/" }, { label: "Trip Sheet" }]} />
      <Flash message={message} />
      <form onSubmit={onSubmit}>
        <FormCard>
          <TwoCol>
            <div>
              <InputField label="Trip Date" type="date" value={form.tripDate} onChange={(e) => setForm({ ...form, tripDate: e.target.value })} />
              <SelectField label="Vehicle No" value={form.vehNo} onChange={(e) => setForm({ ...form, vehNo: e.target.value })} options={vehicles.map((v) => v.vehNo)} />
              <InputField label="Driver Name" value={form.driverName} onChange={(e) => setForm({ ...form, driverName: e.target.value })} />
            </div>
            <div>
              <SelectField label="From Station" value={form.fromStation} onChange={(e) => setForm({ ...form, fromStation: e.target.value })} options={stations.map((s) => s.name)} />
              <SelectField label="To Station" value={form.toStation} onChange={(e) => setForm({ ...form, toStation: e.target.value })} options={stations.map((s) => s.name)} />
              <InputField label="Freight" type="number" value={form.freight} onChange={(e) => setForm({ ...form, freight: Number(e.target.value) || 0 })} />
            </div>
          </TwoCol>
          <Button type="submit">Save Trip Sheet</Button>
        </FormCard>
      </form>
      <DataTable
        rows={rows}
        columns={[
          { key: "delete", header: "Delete", render: (row) => <Button type="button" size="sm" variant="danger" onClick={() => remove(row.id)}>Delete</Button> },
          { key: "tripDate", header: "Date" },
          { key: "vehNo", header: "Veh No" },
          { key: "driverName", header: "Driver" },
          { key: "fromStation", header: "From" },
          { key: "toStation", header: "To" },
          { key: "freight", header: "Freight" },
        ]}
      />
    </>
  );
}
