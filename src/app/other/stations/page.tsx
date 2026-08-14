"use client";

import { FormEvent, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { InputField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { useCrud } from "@/hooks/useCrud";
import { formToObject } from "@/lib/api-client";

type Station = { id: number; name: string; code: string };

export default function StationMasterPage() {
  const { rows, message, create, update, remove, setMessage } = useCrud<Station>("stations");
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Station>>({});

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = { ...form, ...formToObject(e.currentTarget) };
    const saved = editId ? await update(editId, body) : await create(body);
    if (saved) {
      setEditId(null);
      setForm({});
      e.currentTarget.reset();
    }
  }

  return (
    <>
      <PageHeader title="Station Master" subtitle="Add source and destination stations" crumbs={[{ label: "Home", href: "/" }, { label: "Station Master" }]} />
      <Flash message={message} />
      <form onSubmit={onSubmit}>
        <FormCard>
          <TwoCol>
            <InputField label="Station Name" name="name" value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <InputField label="Station Code" name="code" value={form.code ?? ""} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          </TwoCol>
          <Button type="submit">{editId ? "Update" : "Save Data"}</Button>
        </FormCard>
      </form>
      <DataTable
        rows={rows}
        columns={[
          { key: "edit", header: "Update", render: (row) => <Button type="button" size="sm" variant="teal" onClick={() => { setEditId(row.id); setForm(row); setMessage({ type: "ok", text: `Editing ${row.name}` }); }}>Update</Button> },
          { key: "delete", header: "Delete", render: (row) => <Button type="button" size="sm" variant="danger" onClick={() => remove(row.id)}>Delete</Button> },
          { key: "id", header: "Sr No" },
          { key: "name", header: "Station Name" },
          { key: "code", header: "Station Code" },
        ]}
      />
    </>
  );
}
