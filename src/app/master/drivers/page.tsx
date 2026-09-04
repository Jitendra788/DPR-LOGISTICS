"use client";

import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { DateField, FileField, InputField, ComboboxField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { AdminForm } from "@/components/ui/AdminForm";
import { useCrud } from "@/hooks/useCrud";
import { api } from "@/lib/api-client";
import { todayIso } from "@/lib/dates";

type Driver = {
  id: number;
  name: string;
  mobile: string;
  licenceNo: string;
  licenceExpiry: string;
  aadhar: string;
  pan: string;
  bankName: string;
  accountNo: string;
  ifsc: string;
  alternateNo: string;
  homeContact: string;
  accountHolder: string;
  guarantorName: string;
  guarantorMob: string;
  category: string;
};

const empty: Omit<Driver, "id"> = {
  name: "",
  mobile: "",
  licenceNo: "",
  licenceExpiry: todayIso(),
  aadhar: "",
  pan: "",
  bankName: "",
  accountNo: "",
  ifsc: "",
  alternateNo: "",
  homeContact: "",
  accountHolder: "",
  guarantorName: "",
  guarantorMob: "",
  category: "Driver",
};

export default function DriverStaffPage() {
  const { rows, message, create, update, remove, setMessage } = useCrud<Driver>("drivers");
  const [editId, setEditId] = useState<number | null>(null);
  const [sr, setSr] = useState("37");
  const [form, setForm] = useState(empty);

  useEffect(() => {
    api<{ sr: number }>("/api/next-no?type=driver").then((d) => setSr(String(d.sr)));
  }, [rows]);

  function load(row: Driver) {
    setEditId(row.id);
    setForm({
      name: row.name,
      mobile: row.mobile,
      licenceNo: row.licenceNo,
      licenceExpiry: row.licenceExpiry || todayIso(),
      aadhar: row.aadhar,
      pan: row.pan,
      bankName: row.bankName,
      accountNo: row.accountNo,
      ifsc: row.ifsc,
      alternateNo: row.alternateNo,
      homeContact: row.homeContact,
      accountHolder: row.accountHolder,
      guarantorName: row.guarantorName,
      guarantorMob: row.guarantorMob,
      category: row.category || "Driver",
    });
    setMessage({ type: "ok", text: `Loaded ${row.name}` });
  }

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("name");
    if (!q || !rows.length) return;
    const found = rows.find((r) => r.name.toLowerCase() === q.toLowerCase());
    if (found) load(found);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <PageHeader title="New Driver Creation" subtitle="Fill all the fields" crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Driver Creation" }]} />
      <Flash message={message} />
      <AdminForm onSubmit={onSubmit}>
        <FormCard>
          <TwoCol>
            <div>
              <InputField label="Sr No." value={editId ?? sr} readOnly />
              <InputField label="Enter Driver Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <InputField label="Licence No" value={form.licenceNo} onChange={(e) => setForm({ ...form, licenceNo: e.target.value })} />
              <DateField label="Licence Validity" value={form.licenceExpiry} onChange={(licenceExpiry) => setForm({ ...form, licenceExpiry })} />
              <InputField label="Adhar Card" value={form.aadhar} onChange={(e) => setForm({ ...form, aadhar: e.target.value })} />
              <InputField label="Pan Card" value={form.pan} onChange={(e) => setForm({ ...form, pan: e.target.value })} />
              <InputField label="Contact No" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
              <InputField label="Alternate No" value={form.alternateNo} onChange={(e) => setForm({ ...form, alternateNo: e.target.value })} />
              <InputField label="Home Contact No" value={form.homeContact} onChange={(e) => setForm({ ...form, homeContact: e.target.value })} />
              <InputField label="Account No" value={form.accountNo} onChange={(e) => setForm({ ...form, accountNo: e.target.value })} />
              <InputField label="Account Holder Name" value={form.accountHolder} onChange={(e) => setForm({ ...form, accountHolder: e.target.value })} />
            </div>
            <div>
              <InputField label="Bank Name" value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} />
              <InputField label="IFSC Code" value={form.ifsc} onChange={(e) => setForm({ ...form, ifsc: e.target.value })} />
              <InputField label="Guarantor Name" value={form.guarantorName} onChange={(e) => setForm({ ...form, guarantorName: e.target.value })} />
              <InputField label="Mob No." value={form.guarantorMob} onChange={(e) => setForm({ ...form, guarantorMob: e.target.value })} />
              <InputField label="Licence No." value={form.licenceNo} onChange={(e) => setForm({ ...form, licenceNo: e.target.value })} />
              <InputField label="Adhar No." value={form.aadhar} onChange={(e) => setForm({ ...form, aadhar: e.target.value })} />
              <InputField label="PAN No." value={form.pan} onChange={(e) => setForm({ ...form, pan: e.target.value })} />
              <FileField label="Driver photo" />
              <FileField label="Driver document pdf" />
              <ComboboxField label="Category" value={form.category} onChange={(category) => setForm({ ...form, category })} options={["Driver", "Staff", "Cleaner"]} placeholder="Select category" />
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
          { key: "view", header: "Update", render: (row) => <Button type="button" size="sm" variant="teal" onClick={() => load(row)}>Update</Button> },
          { key: "delete", header: "Delete", render: (row) => <Button type="button" size="sm" variant="danger" onClick={() => remove(row.id)}>Delete</Button> },
          { key: "id", header: "Sr No" },
          { key: "name", header: "Driver Name" },
          { key: "licenceNo", header: "Licence No" },
          { key: "licenceExpiry", header: "Licence Validity" },
          { key: "aadhar", header: "Adhar Card" },
          { key: "pan", header: "PAN Card" },
          { key: "mobile", header: "Contact No" },
        ]}
      />
    </>
  );
}
