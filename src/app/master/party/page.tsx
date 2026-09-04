"use client";

import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { FileField, InputField, ComboboxField, TextAreaField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { AdminForm } from "@/components/ui/AdminForm";
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

const emptyForm = (): Partial<Party> => ({ partyType: "Consigner/Consignee", gst: "" });

export default function PartyCreationPage() {
  const { rows, message, create, update, remove, setMessage, saving } = useCrud<Party>("parties");
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Party>>(emptyForm());
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
    if (saving) return;

    const formEl = e.currentTarget;
    const raw = { ...form, ...formToObject(formEl) };
    const body = { ...raw, gst: String(raw.gst ?? "").trim() };
    const name = String(body.name ?? "").trim();
    if (!name) {
      setMessage({ type: "err", text: "Party name is required" });
      return;
    }

    if (editId) {
      const saved = await update(editId, body);
      if (saved) {
        setEditId(null);
        setForm(emptyForm());
        formEl.reset();
      }
      return;
    }

    // Clear immediately so a second click cannot re-post the same filled form
    setForm(emptyForm());
    formEl.reset();

    const saved = await create(body);
    if (!saved) {
      // Restore so user can fix and retry on real errors
      setForm({
        name: String(body.name ?? ""),
        address: String(body.address ?? ""),
        contact: String(body.contact ?? ""),
        gst: String(body.gst ?? ""),
        opBalance: String(body.opBalance ?? ""),
        opDate: String(body.opDate ?? ""),
        partyType: String(body.partyType ?? "Consigner/Consignee"),
        partyCode: String(body.partyCode ?? ""),
        pan: String(body.pan ?? ""),
      });
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
      <AdminForm onSubmit={onSubmit}>
        <FormCard>
          <TwoCol>
            <div>
              <InputField label="Sr No." value={editId ?? nextSr} readOnly />
              <InputField label="Enter Party Name" name="name" value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <TextAreaField label="Address" name="address" value={form.address ?? ""} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <InputField label="Contact No" name="contact" value={form.contact ?? ""} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
              <ComboboxField
                label="Party Type"
                name="partyType"
                value={form.partyType ?? "Consigner/Consignee"}
                onChange={(partyType) => setForm({ ...form, partyType })}
                options={["Consigner/Consignee", "Broker", "Transporter"]}
                placeholder="Select party type"
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
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : editId ? "Update Data" : "Save Data"}
            </Button>
            {editId ? (
              <Button
                type="button"
                variant="secondary"
                disabled={saving}
                onClick={() => {
                  setEditId(null);
                  setForm(emptyForm());
                }}
              >
                Cancel
              </Button>
            ) : null}
          </div>
        </FormCard>
      </AdminForm>
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
