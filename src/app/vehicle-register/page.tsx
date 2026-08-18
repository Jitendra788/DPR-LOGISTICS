"use client";

import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { DateField, InputField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { useCrud } from "@/hooks/useCrud";
import { api } from "@/lib/api-client";
import { todayIso } from "@/lib/dates";

type Row = {
  id: number;
  vehNo: string;
  make: string;
  model: string;
  engineNo: string;
  chassisNo: string;
  policyExpDate: string;
  allIndiaExpiry: string;
  statePermitExp: string;
  pollutionExp: string;
  fitnessExp: string;
  stateTaxExp: string;
  tyreChangeKmAfter: string;
  opKm: string;
  servicingAfter: string;
  olKm: string;
};

const empty = {
  vehNo: "",
  make: "",
  model: "",
  engineNo: "",
  chassisNo: "",
  policyExpDate: todayIso(),
  allIndiaExpiry: todayIso(),
  statePermitExp: todayIso(),
  pollutionExp: todayIso(),
  fitnessExp: todayIso(),
  stateTaxExp: todayIso(),
  tyreChangeKmAfter: "",
  opKm: "",
  servicingAfter: "",
  olKm: "",
};

export default function VehicleRegisterPage() {
  const { rows, message, create, update, remove, setMessage } = useCrud<Row>("fleet");
  const [editId, setEditId] = useState<number | null>(null);
  const [sr, setSr] = useState("27");
  const [form, setForm] = useState(empty);

  useEffect(() => {
    api<{ sr: number }>("/api/next-no?type=fleet").then((d) => setSr(String(d.sr)));
  }, [rows]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const saved = editId ? await update(editId, form) : await create(form);
    if (saved) {
      setEditId(null);
      setForm(empty);
    }
  }

  return (
    <>
      <PageHeader title="New Vehicle Creation" subtitle="Fill all the fields" crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Self Vehicle Creation" }]} />
      <Flash message={message} />
      <form onSubmit={onSubmit}>
        <FormCard>
          <TwoCol>
            <div>
              <InputField label="Sr No." value={editId ?? sr} readOnly />
              <InputField label="Enter Vehicle Number" value={form.vehNo} onChange={(e) => setForm({ ...form, vehNo: e.target.value })} required />
              <InputField label="Make" value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} />
              <InputField label="Model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
              <InputField label="Engine No" value={form.engineNo} onChange={(e) => setForm({ ...form, engineNo: e.target.value })} />
              <InputField label="Chassis No" value={form.chassisNo} onChange={(e) => setForm({ ...form, chassisNo: e.target.value })} />
              <DateField label="Policy Exp. Date" value={form.policyExpDate} onChange={(policyExpDate) => setForm({ ...form, policyExpDate })} />
              <DateField label="All India Expiry Date" value={form.allIndiaExpiry} onChange={(allIndiaExpiry) => setForm({ ...form, allIndiaExpiry })} />
            </div>
            <div>
              <DateField label="State Permit Exp. Date" value={form.statePermitExp} onChange={(statePermitExp) => setForm({ ...form, statePermitExp })} />
              <DateField label="Pollution Exp. Date" value={form.pollutionExp} onChange={(pollutionExp) => setForm({ ...form, pollutionExp })} />
              <DateField label="Fitness Exp. Date" value={form.fitnessExp} onChange={(fitnessExp) => setForm({ ...form, fitnessExp })} />
              <DateField label="State Tax Expiry Date" value={form.stateTaxExp} onChange={(stateTaxExp) => setForm({ ...form, stateTaxExp })} />
              <InputField label="Tyre Change KM After" value={form.tyreChangeKmAfter} onChange={(e) => setForm({ ...form, tyreChangeKmAfter: e.target.value })} />
              <InputField label="OpKM" value={form.opKm} onChange={(e) => setForm({ ...form, opKm: e.target.value })} />
              <InputField label="Servicing After" value={form.servicingAfter} onChange={(e) => setForm({ ...form, servicingAfter: e.target.value })} />
              <InputField label="OlKM" value={form.olKm} onChange={(e) => setForm({ ...form, olKm: e.target.value })} />
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
          {
            key: "view",
            header: "Update",
            render: (row) => (
              <Button
                type="button"
                size="sm"
                variant="teal"
                onClick={() => {
                  setEditId(row.id);
                  setForm(row);
                  setMessage({ type: "ok", text: `Loaded ${row.vehNo}` });
                }}
              >
                Update
              </Button>
            ),
          },
          { key: "delete", header: "Delete", render: (row) => <Button type="button" size="sm" variant="danger" onClick={() => remove(row.id)}>Delete</Button> },
          { key: "id", header: "Sr No" },
          { key: "vehNo", header: "Veh No" },
          { key: "tyreChangeKmAfter", header: "Tyre Change KM" },
          { key: "opKm", header: "OP KM" },
          { key: "servicingAfter", header: "Servicing KM" },
          { key: "olKm", header: "OP KM" },
        ]}
      />
    </>
  );
}
