"use client";

import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { DateField, InputField, SelectField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { useCrud } from "@/hooks/useCrud";
import { api } from "@/lib/api-client";
import { todayIso } from "@/lib/dates";

type Vehicle = { vehNo: string };
type Row = {
  id: number;
  vehNo: string;
  tyreChangeAfterKm: string;
  totalRunningOn: string;
  servicingKmAfter: string;
  totalRunningKm: string;
  tyreChangeStatus: string;
  servicingStatus: string;
  entryDate: string;
};

export default function TyreStatusPage() {
  const { rows, message, create, update, remove, setMessage } = useCrud<Row>("tyres");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    vehNo: "",
    tyreChangeAfterKm: "",
    totalRunningOn: "",
    servicingKmAfter: "",
    totalRunningKm: "",
    tyreChangeStatus: "Yes",
    servicingStatus: "Yes",
    entryDate: todayIso(),
  });

  useEffect(() => {
    api<Vehicle[]>("/api/fleet").then(setVehicles);
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const body = { ...form, fitDate: form.entryDate, status: form.tyreChangeStatus };
    const saved = editId ? await update(editId, body) : await create(body);
    if (saved) {
      setEditId(null);
      setForm({
        vehNo: "",
        tyreChangeAfterKm: "",
        totalRunningOn: "",
        servicingKmAfter: "",
        totalRunningKm: "",
        tyreChangeStatus: "Yes",
        servicingStatus: "Yes",
        entryDate: todayIso(),
      });
    }
  }

  return (
    <>
      <PageHeader title="Vehicle LHC Booking" subtitle="Fill all the fields" crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Self Vehicle Data Entry" }]} />
      <Flash message={message} />
      <form onSubmit={onSubmit}>
        <FormCard>
          <TwoCol>
            <div>
              <InputField label="Sr No." value={editId ?? rows.length + 1} readOnly />
              <SelectField label="Enter Vehicle Number" value={form.vehNo} onChange={(e) => setForm({ ...form, vehNo: e.target.value })} options={vehicles.map((v) => v.vehNo)} />
              <InputField label="Tyre Change After KM" value={form.tyreChangeAfterKm} onChange={(e) => setForm({ ...form, tyreChangeAfterKm: e.target.value })} />
              <InputField label="Total Running On" value={form.totalRunningOn} onChange={(e) => setForm({ ...form, totalRunningOn: e.target.value })} />
              <InputField label="Servicing KM After" value={form.servicingKmAfter} onChange={(e) => setForm({ ...form, servicingKmAfter: e.target.value })} />
              <InputField label="Total Running KM" value={form.totalRunningKm} onChange={(e) => setForm({ ...form, totalRunningKm: e.target.value })} />
            </div>
            <div>
              <SelectField label="Tyre Change Status" value={form.tyreChangeStatus} onChange={(e) => setForm({ ...form, tyreChangeStatus: e.target.value })} options={["Yes", "No"]} placeholder="" />
              <SelectField label="Servicing Status" value={form.servicingStatus} onChange={(e) => setForm({ ...form, servicingStatus: e.target.value })} options={["Yes", "No"]} placeholder="" />
              <DateField label="Entry Date" value={form.entryDate} onChange={(entryDate) => setForm({ ...form, entryDate })} />
            </div>
          </TwoCol>
          <Button type="submit" variant="teal">
            Save Data
          </Button>
        </FormCard>
      </form>
      <DataTable
        rows={rows}
        columns={[
          { key: "id", header: "Sr No" },
          { key: "vehNo", header: "Veh No" },
          { key: "tyreChangeAfterKm", header: "Tyre Change KM" },
          { key: "tyreChangeStatus", header: "Status" },
          { key: "servicingKmAfter", header: "Servicing KM" },
          { key: "servicingStatus", header: "Status" },
          { key: "entryDate", header: "Date" },
        ]}
      />
    </>
  );
}
