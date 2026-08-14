"use client";

import { FormEvent, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { InputField, SelectField, TextAreaField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { useCrud } from "@/hooks/useCrud";
import { formToObject } from "@/lib/api-client";

type Vendor = {
  id: number;
  name: string;
  address: string;
  contact: string;
  gst: string;
  pan: string;
  type: string;
};

export default function VendorCreationPage() {
  const { rows, message, create, update, remove, setMessage } = useCrud<Vendor>("vendors");
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Vendor>>({ type: "Other" });

  function load(row: Vendor) {
    setEditId(row.id);
    setForm(row);
    setMessage({ type: "ok", text: `Editing ${row.name}` });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = { ...form, ...formToObject(e.currentTarget) };
    const saved = editId ? await update(editId, body) : await create(body);
    if (saved) {
      setEditId(null);
      e.currentTarget.reset();
      setForm({ type: "Other" });
    }
  }

  return (
    <>
      <PageHeader title="Vendor Creation" subtitle="Fill all the fields" crumbs={[{ label: "Home", href: "/" }, { label: "Vendor Creation" }]} />
      <Flash message={message} />
      <form onSubmit={onSubmit}>
        <FormCard>
          <TwoCol>
            <div>
              <InputField label="Vendor Name" name="name" value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <TextAreaField label="Address" name="address" value={form.address ?? ""} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <InputField label="Contact No" name="contact" value={form.contact ?? ""} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
            </div>
            <div>
              <InputField label="GST No" name="gst" value={form.gst ?? ""} onChange={(e) => setForm({ ...form, gst: e.target.value })} />
              <InputField label="PAN No" name="pan" value={form.pan ?? ""} onChange={(e) => setForm({ ...form, pan: e.target.value })} />
              <SelectField label="Vendor Type" name="type" value={form.type ?? "Other"} onChange={(e) => setForm({ ...form, type: e.target.value })} options={["Fuel", "Insurance", "Workshop", "Broker", "Other"]} />
            </div>
          </TwoCol>
          <Button type="submit">{editId ? "Update Data" : "Save Data"}</Button>
        </FormCard>
      </form>
      <DataTable
        rows={rows}
        columns={[
          { key: "view", header: "Update", render: (row) => <Button type="button" size="sm" variant="teal" onClick={() => load(row)}>Update</Button> },
          { key: "delete", header: "Delete", render: (row) => <Button type="button" size="sm" variant="danger" onClick={() => remove(row.id)}>Delete</Button> },
          { key: "id", header: "Sr No" },
          { key: "name", header: "Vendor Name" },
          { key: "address", header: "Address" },
          { key: "contact", header: "Contact No" },
          { key: "gst", header: "GST No" },
          { key: "type", header: "Vendor Type" },
        ]}
      />
    </>
  );
}
