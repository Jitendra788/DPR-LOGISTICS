"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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
  adBlue: number;
  maintenanceCost: number;
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
  adBlue: 0,
  maintenanceCost: 0,
  serviceDate: todayIso(),
  narration: "",
};

function money(n: number) {
  return Number(n) || 0;
}

/** Balance = Freight − Diesel − FasTag − Other Expenses − AdBlue − Maintenance */
function calcBalance(
  freight: number,
  diesel: number,
  fasTag: number,
  otherExpenses = 0,
  adBlue = 0,
  maintenanceCost = 0,
) {
  return Number(
    (
      money(freight) -
      money(diesel) -
      money(fasTag) -
      money(otherExpenses) -
      money(adBlue) -
      money(maintenanceCost)
    ).toFixed(2),
  );
}

export default function MaintenancePage() {
  const { rows, message, create, update, remove, setMessage } = useCrud<Row>("maintenance");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const balance = useMemo(
    () =>
      calcBalance(
        form.freight,
        form.diesel,
        form.fasTag,
        form.otherExpenses,
        form.adBlue,
        form.maintenanceCost,
      ),
    [form.freight, form.diesel, form.fasTag, form.otherExpenses, form.adBlue, form.maintenanceCost],
  );

  useEffect(() => {
    api<Vehicle[]>("/api/fleet").then(setVehicles);
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const diesel = money(form.diesel);
    const otherExpenses = money(form.otherExpenses);
    const fasTag = money(form.fasTag);
    const freight = money(form.freight);
    const adBlue = money(form.adBlue);
    const maintenanceCost = money(form.maintenanceCost);
    const amount = calcBalance(freight, diesel, fasTag, otherExpenses, adBlue, maintenanceCost);
    const body = {
      ...form,
      amount,
      diesel,
      otherExpenses,
      fasTag,
      freight,
      adBlue,
      maintenanceCost,
      expenseName: form.expenseName || "Maintenance",
      workType: form.expenseName || "Maintenance",
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
              <ComboboxField
                label="Enter Vehicle Number"
                value={form.vehNo}
                onChange={(vehNo) => setForm({ ...form, vehNo })}
                options={vehicles.map((v) => v.vehNo)}
                placeholder="Search or select vehicle"
              />
              <InputField
                label="Freight"
                value={form.freight}
                onChange={(e) => setForm({ ...form, freight: Number(e.target.value) || 0 })}
              />
              <InputField
                label="Diesel"
                value={form.diesel}
                onChange={(e) => setForm({ ...form, diesel: Number(e.target.value) || 0 })}
              />
              <InputField
                label="FasTag"
                value={form.fasTag}
                onChange={(e) => setForm({ ...form, fasTag: Number(e.target.value) || 0 })}
              />
            </div>
            <div>
              <DateField label="Exp Date" value={form.serviceDate} onChange={(serviceDate) => setForm({ ...form, serviceDate })} />
              <InputField
                label="Other Expenses"
                value={form.otherExpenses}
                onChange={(e) => setForm({ ...form, otherExpenses: Number(e.target.value) || 0 })}
              />
              <InputField
                label="Narration"
                value={form.narration}
                onChange={(e) => setForm({ ...form, narration: e.target.value })}
              />
              <InputField
                label="AdBlue"
                value={form.adBlue}
                onChange={(e) => setForm({ ...form, adBlue: Number(e.target.value) || 0 })}
              />
              <InputField
                label="Maintenance"
                value={form.maintenanceCost}
                onChange={(e) => setForm({ ...form, maintenanceCost: Number(e.target.value) || 0 })}
              />
              <InputField label="Balance" value={balance} readOnly />
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
                    adBlue: money(row.adBlue),
                    maintenanceCost: money(row.maintenanceCost),
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
          { key: "serviceDate", header: "Exp Date" },
          { key: "freight", header: "Freight" },
          { key: "diesel", header: "Diesel" },
          { key: "fasTag", header: "FasTag" },
          { key: "otherExpenses", header: "Other Exp" },
          { key: "adBlue", header: "AdBlue" },
          { key: "maintenanceCost", header: "Maintenance" },
          { key: "narration", header: "Narration" },
          {
            key: "balance",
            header: "Balance",
            render: (row) =>
              calcBalance(
                row.freight,
                row.diesel,
                row.fasTag,
                row.otherExpenses,
                row.adBlue,
                row.maintenanceCost,
              ),
          },
        ]}
      />
    </>
  );
}
