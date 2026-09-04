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

type Vehicle = { vehNo: string };
type Row = {
  id: number;
  vehNo: string;
  expenseName: string;
  amount: number;
  diesel: number;
  otherExpenses: number;
  fasTag: number;
  freight: number;
  serviceDate: string;
  narration: string;
};

const emptyForm = {
  vehNo: "",
  expenseName: "",
  amount: 0,
  diesel: 0,
  otherExpenses: 0,
  fasTag: 0,
  freight: 0,
  serviceDate: todayIso(),
  narration: "",
};

function money(n: number) {
  return Number(n) || 0;
}

export default function MaintenancePage() {
  const { rows, message, create, update, remove, setMessage } = useCrud<Row>("maintenance");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    api<Vehicle[]>("/api/fleet").then(setVehicles);
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const body = {
      ...form,
      amount: money(form.amount),
      diesel: money(form.diesel),
      otherExpenses: money(form.otherExpenses),
      fasTag: money(form.fasTag),
      freight: money(form.freight),
      workType: form.expenseName,
      workshopName: form.narration,
    };
    const saved = editId ? await update(editId, body) : await create(body);
    if (saved) {
      setEditId(null);
      setForm({ ...emptyForm, serviceDate: todayIso() });
    }
  }

  return (
    <>
      <PageHeader title="New Vehicle Maintanace Entry" subtitle="Fill all the fields" crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Vehicle Maintenance" }]} />
      <Flash message={message} />
      <AdminForm onSubmit={onSubmit}>
        <FormCard>
          <TwoCol>
            <div>
              <InputField label="Sr No." value={editId ?? rows.length + 1} readOnly />
              <ComboboxField label="Enter Vehicle Number" value={form.vehNo} onChange={(vehNo) => setForm({ ...form, vehNo })} options={vehicles.map((v) => v.vehNo)} placeholder="Search or select vehicle" />
              <InputField label="Expense Name" value={form.expenseName} onChange={(e) => setForm({ ...form, expenseName: e.target.value })} />
              <InputField label="Diesel" value={form.diesel} onChange={(e) => setForm({ ...form, diesel: Number(e.target.value) || 0 })} />
              <InputField label="FasTag" value={form.fasTag} onChange={(e) => setForm({ ...form, fasTag: Number(e.target.value) || 0 })} />
            </div>
            <div>
              <InputField label="Expense Rs." value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) || 0 })} />
              <DateField label="Exp Date" value={form.serviceDate} onChange={(serviceDate) => setForm({ ...form, serviceDate })} />
              <InputField label="Narration" value={form.narration} onChange={(e) => setForm({ ...form, narration: e.target.value })} />
              <InputField label="Other Expenses" value={form.otherExpenses} onChange={(e) => setForm({ ...form, otherExpenses: Number(e.target.value) || 0 })} />
              <InputField label="Freight" value={form.freight} onChange={(e) => setForm({ ...form, freight: Number(e.target.value) || 0 })} />
            </div>
          </TwoCol>
          <Button type="submit" variant="teal">
            Save Data
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
              <Button
                type="button"
                size="sm"
                variant="teal"
                onClick={() => {
                  setEditId(row.id);
                  setForm({
                    vehNo: row.vehNo,
                    expenseName: row.expenseName,
                    amount: money(row.amount),
                    diesel: money(row.diesel),
                    otherExpenses: money(row.otherExpenses),
                    fasTag: money(row.fasTag),
                    freight: money(row.freight),
                    serviceDate: row.serviceDate,
                    narration: row.narration,
                  });
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
          { key: "expenseName", header: "Expense Name" },
          { key: "serviceDate", header: "Date" },
          { key: "narration", header: "Narration" },
          { key: "amount", header: "Amt Rs" },
          { key: "diesel", header: "Diesel" },
          { key: "otherExpenses", header: "Other Exp" },
          { key: "fasTag", header: "FasTag" },
          { key: "freight", header: "Freight" },
        ]}
      />
    </>
  );
}
