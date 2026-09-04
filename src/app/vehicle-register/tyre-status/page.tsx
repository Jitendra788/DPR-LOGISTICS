"use client";

import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { DateField, InputField, ComboboxField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { AdminForm } from "@/components/ui/AdminForm";
import { useCrud } from "@/hooks/useCrud";
import { api } from "@/lib/api-client";
import { todayIso } from "@/lib/dates";

type Vehicle = { vehNo: string; currentKm?: string };
type Trip = { vehNo: string; totalRunningKm?: string; closingMeter?: string; totalKm?: string };
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
  const [trips, setTrips] = useState<Trip[]>([]);
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
    Promise.all([api<Vehicle[]>("/api/fleet"), api<Trip[]>("/api/trips")]).then(([v, t]) => {
      setVehicles(v);
      setTrips(t);
    });
  }, []);

  function fillKmForVehicle(vehNo: string) {
    const fleet = vehicles.find((v) => v.vehNo === vehNo);
    const lastTrip = [...trips].reverse().find((t) => t.vehNo === vehNo);
    const running =
      lastTrip?.totalRunningKm ||
      lastTrip?.closingMeter ||
      fleet?.currentKm ||
      "";
    setForm((f) => ({
      ...f,
      vehNo,
      totalRunningOn: f.totalRunningOn || running,
      totalRunningKm: f.totalRunningKm || running,
    }));
  }

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

  function load(row: Row) {
    setEditId(row.id);
    setForm({
      vehNo: row.vehNo,
      tyreChangeAfterKm: row.tyreChangeAfterKm,
      totalRunningOn: row.totalRunningOn,
      servicingKmAfter: row.servicingKmAfter,
      totalRunningKm: row.totalRunningKm,
      tyreChangeStatus: row.tyreChangeStatus || "Yes",
      servicingStatus: row.servicingStatus || "Yes",
      entryDate: row.entryDate || todayIso(),
    });
    setMessage({ type: "ok", text: `Editing ${row.vehNo}` });
  }

  return (
    <>
      <PageHeader
        title="Tyre / Servicing Status"
        subtitle="Fill all the fields"
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Tyre/Servicing Status" }]}
      />
      <Flash message={message} />
      <AdminForm onSubmit={onSubmit}>
        <FormCard>
          <TwoCol>
            <div>
              <InputField label="Sr No." value={editId ?? rows.length + 1} readOnly />
              <ComboboxField
                label="Enter Vehicle Number"
                value={form.vehNo}
                onChange={fillKmForVehicle}
                options={vehicles.map((v) => v.vehNo)}
                placeholder="Search or select vehicle"
              />
              <InputField label="Tyre Change After KM" value={form.tyreChangeAfterKm} onChange={(e) => setForm({ ...form, tyreChangeAfterKm: e.target.value })} />
              <InputField label="Total Running On" value={form.totalRunningOn} onChange={(e) => setForm({ ...form, totalRunningOn: e.target.value })} />
              <InputField label="Servicing KM After" value={form.servicingKmAfter} onChange={(e) => setForm({ ...form, servicingKmAfter: e.target.value })} />
              <InputField label="Total Running KM" value={form.totalRunningKm} onChange={(e) => setForm({ ...form, totalRunningKm: e.target.value })} />
            </div>
            <div>
              <ComboboxField label="Tyre Change Status" value={form.tyreChangeStatus} onChange={(tyreChangeStatus) => setForm({ ...form, tyreChangeStatus })} options={["Yes", "No"]} placeholder="Select" />
              <ComboboxField label="Servicing Status" value={form.servicingStatus} onChange={(servicingStatus) => setForm({ ...form, servicingStatus })} options={["Yes", "No"]} placeholder="Select" />
              <DateField label="Entry Date" value={form.entryDate} onChange={(entryDate) => setForm({ ...form, entryDate })} />
            </div>
          </TwoCol>
          <Button type="submit" variant="teal">
            {editId ? "Update Data" : "Save Data"}
          </Button>
        </FormCard>
      </AdminForm>
      <DataTable
        rows={rows}
        columns={[
          {
            key: "view",
            header: "Update",
            render: (row) => (
              <Button type="button" size="sm" variant="teal" onClick={() => load(row)}>
                Update
              </Button>
            ),
          },
          {
            key: "delete",
            header: "Delete",
            render: (row) => (
              <Button type="button" size="sm" variant="danger" onClick={() => remove(row.id)}>
                Delete
              </Button>
            ),
          },
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
