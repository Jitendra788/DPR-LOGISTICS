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

type Station = { name: string };
type Rate = { id: number; fromStation: string; toStation: string; ratePerTon: number; effectiveDate: string };

export default function RateMasterPage() {
  const { rows, message, create, update, remove, setMessage } = useCrud<Rate>("rates");
  const [stations, setStations] = useState<Station[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Rate>>({ effectiveDate: new Date().toISOString().slice(0, 10), ratePerTon: 0 });

  useEffect(() => {
    api<Station[]>("/api/stations").then(setStations);
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = { ...form, ...formToObject(e.currentTarget), ratePerTon: Number(form.ratePerTon) || 0 };
    const saved = editId ? await update(editId, body) : await create(body);
    if (saved) {
      setEditId(null);
      setForm({ effectiveDate: new Date().toISOString().slice(0, 10), ratePerTon: 0 });
    }
  }

  return (
    <>
      <PageHeader title="Rate Master" subtitle="Maintain freight rates" crumbs={[{ label: "Home", href: "/" }, { label: "Rate Master" }]} />
      <Flash message={message} />
      <form onSubmit={onSubmit}>
        <FormCard>
          <TwoCol>
            <div>
              <SelectField label="From Station" name="fromStation" value={form.fromStation ?? ""} onChange={(e) => setForm({ ...form, fromStation: e.target.value })} options={stations.map((s) => s.name)} />
              <SelectField label="To Station" name="toStation" value={form.toStation ?? ""} onChange={(e) => setForm({ ...form, toStation: e.target.value })} options={stations.map((s) => s.name)} />
            </div>
            <div>
              <InputField label="Rate / Ton" type="number" name="ratePerTon" value={form.ratePerTon ?? 0} onChange={(e) => setForm({ ...form, ratePerTon: Number(e.target.value) || 0 })} />
              <InputField label="Effective Date" type="date" name="effectiveDate" value={form.effectiveDate ?? ""} onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })} />
            </div>
          </TwoCol>
          <Button type="submit">{editId ? "Update Rate" : "Save Rate"}</Button>
        </FormCard>
      </form>
      <DataTable
        rows={rows}
        columns={[
          { key: "edit", header: "Update", render: (row) => <Button type="button" size="sm" variant="teal" onClick={() => { setEditId(row.id); setForm(row); setMessage({ type: "ok", text: "Editing rate" }); }}>Update</Button> },
          { key: "delete", header: "Delete", render: (row) => <Button type="button" size="sm" variant="danger" onClick={() => remove(row.id)}>Delete</Button> },
          { key: "fromStation", header: "From" },
          { key: "toStation", header: "To" },
          { key: "ratePerTon", header: "Rate/Ton" },
          { key: "effectiveDate", header: "Effective Date" },
        ]}
      />
    </>
  );
}
