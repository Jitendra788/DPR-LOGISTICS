"use client";

import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { FileField, InputField, SelectField, TextAreaField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { useCrud } from "@/hooks/useCrud";
import { formToObject } from "@/lib/api-client";
import { api } from "@/lib/api-client";

type Party = {
  id: number;
  name: string;
  address: string;
  contact: string;
  gst: string;
  opBalance: string;
  opDate: string;
  partyType: string;
  partyCode: string;
  pan: string;
};

export default function PartyCreationPage() {
  const { rows, message, create, update, remove, setMessage } = useCrud<Party>("parties");
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Party>>({ partyType: "Consigner/Consignee", gst: "" });
  const [nextSr, setNextSr] = useState(1);

  useEffect(() => {
    api<{ sr: number; partyCode: string }>("/api/next-no?type=party")
      .then((d) => {
        setNextSr(d.sr);
        setForm((f) => ({ ...f, partyCode: f.partyCode || d.partyCode }));
      })
      .catch(() => undefined);
  }, [rows.length]);

  function load(row: Party) {
    setEditId(row.id);
    setForm(row);
    setMessage({ type: "ok", text: `Editing ${row.name}` });
  }

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("name");
    if (!q || !rows.length) return;
    const found = rows.find((r) => r.name.toLowerCase() === q.toLowerCase());
    if (found) load(found);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const raw = { ...form, ...formToObject(e.currentTarget) };
    const body = { ...raw, gst: String(raw.gst ?? "").trim() };
    const saved = editId ? await update(editId, body) : await create(body);
    if (saved) {
      setEditId(null);
      e.currentTarget.reset();
      setForm({ partyType: "Consigner/Consignee", gst: "" });
    }
  }

  return (
    <>
      <PageHeader
        title="New Supplier Party Creation"
        subtitle="Fill all the fields"
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Supplier Party Creation" }]}
      />
      <Flash message={message} />
      <form onSubmit={onSubmit}>
        <FormCard>
          <TwoCol>
            <div>
              <InputField label="Sr No." value={editId ?? nextSr} readOnly />
              <InputField label="Enter Party Name" name="name" value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <TextAreaField label="Address" name="address" value={form.address ?? ""} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <InputField label="Contact No" name="contact" value={form.contact ?? ""} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
              <SelectField
                label="Party Type"
                name="partyType"
                value={form.partyType ?? "Consigner/Consignee"}
                onChange={(e) => setForm({ ...form, partyType: e.target.value })}
                options={["Consigner/Consignee", "Broker", "Transporter"]}
              />
            </div>
            <div>
              <InputField label="GST No" name="gst" value={form.gst ?? ""} onChange={(e) => setForm({ ...form, gst: e.target.value })} />
              <InputField label="OP.Balance" name="opBalance" value={form.opBalance ?? ""} onChange={(e) => setForm({ ...form, opBalance: e.target.value })} />
              <InputField label="OP.Date" type="date" name="opDate" value={form.opDate ?? ""} onChange={(e) => setForm({ ...form, opDate: e.target.value })} />
              <InputField label="Party Code" name="partyCode" value={form.partyCode ?? ""} onChange={(e) => setForm({ ...form, partyCode: e.target.value })} />
              <InputField label="Pan No" name="pan" value={form.pan ?? ""} onChange={(e) => setForm({ ...form, pan: e.target.value })} />
              <FileField label="Upload Document" />
            </div>
          </TwoCol>
          <div className="flex flex-wrap gap-2">
            <Button type="submit">{editId ? "Update Data" : "Save Data"}</Button>
            {editId ? (
              <Button type="button" variant="muted" onClick={() => { setEditId(null); setForm({ partyType: "Consigner/Consignee", gst: "" }); }}>
                Cancel
              </Button>
            ) : null}
          </div>
        </FormCard>
      </form>
      <DataTable
        rows={rows}
        searchKeys={["name", "gst", "partyCode"]}
        columns={[
          { key: "view", header: "Update", render: (row) => <Button type="button" size="sm" variant="teal" onClick={() => load(row)}>Update</Button> },
          { key: "delete", header: "Delete", render: (row) => <Button type="button" size="sm" variant="danger" onClick={() => remove(row.id)}>Delete</Button> },
          { key: "id", header: "Sr No" },
          { key: "name", header: "Party Name" },
          { key: "address", header: "Address" },
          { key: "contact", header: "Contact No" },
          { key: "gst", header: "GST No." },
          { key: "opBalance", header: "Op.Balance" },
          { key: "opDate", header: "Op.Date" },
          { key: "partyType", header: "Party Type" },
          { key: "partyCode", header: "Party Code" },
          { key: "pan", header: "PAN No." },
        ]}
      />
    </>
  );
}
