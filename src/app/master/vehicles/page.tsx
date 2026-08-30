"use client";

import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { FileField, InputField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { AdminForm } from "@/components/ui/AdminForm";
import { useCrud } from "@/hooks/useCrud";
import { api, formToObject } from "@/lib/api-client";

type Vehicle = {
  id: number;
  vehNo: string;
  ownerName: string;
  ownerMob: string;
  ownerAadhar: string;
  ownerPan: string;
  ownerLicence: string;
  ownerLicenceExpiry: string;
  engineNo: string;
  chassisNo: string;
  insuranceCompany: string;
  policyNo: string;
  policyExpDate: string;
  allIndiaPermitNo: string;
  allIndiaExpiry: string;
  statePermitNo: string;
  statePermitExp: string;
  pollutionExp: string;
  fitnessExp: string;
  stateTaxExp: string;
  guarantorName: string;
  guarantorMob: string;
  altMob: string;
  aadhar: string;
  pan: string;
  licenceNo: string;
  licenceExpiry: string;
};

const empty: Partial<Vehicle> = {};

export default function VehicleCreationPage() {
  const { rows, message, create, update, remove, setMessage } = useCrud<Vehicle>("vehicles");
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Vehicle>>(empty);
  const [nextSr, setNextSr] = useState(1);

  useEffect(() => {
    api<{ sr: number }>("/api/next-no?type=vehicle").then((d) => setNextSr(d.sr)).catch(() => undefined);
  }, [rows.length]);

  function set(key: keyof Vehicle, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function load(row: Vehicle) {
    setEditId(row.id);
    setForm(row);
    setMessage({ type: "ok", text: `Editing ${row.vehNo}` });
  }

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("vehNo");
    if (!q || !rows.length) return;
    const found = rows.find((r) => r.vehNo.toLowerCase() === q.toLowerCase());
    if (found) load(found);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = { ...form, ...formToObject(e.currentTarget) };
    const saved = editId ? await update(editId, body) : await create(body);
    if (saved) {
      setEditId(null);
      e.currentTarget.reset();
      setForm(empty);
    }
  }

  return (
    <>
      <PageHeader title="New Vehicle Creation" subtitle="Fill all the fields" crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Vehicle Creation" }]} />
      <Flash message={message} />
      <AdminForm onSubmit={onSubmit}>
        <FormCard>
          <TwoCol>
            <div>
              <InputField label="Sr No." value={editId ?? nextSr} readOnly />
              <InputField label="Enter Vehicle Number" name="vehNo" value={form.vehNo ?? ""} onChange={(e) => set("vehNo", e.target.value)} required />
              <InputField label="Owner Name" name="ownerName" value={form.ownerName ?? ""} onChange={(e) => set("ownerName", e.target.value)} />
              <InputField label="Owner Mob No." name="ownerMob" value={form.ownerMob ?? ""} onChange={(e) => set("ownerMob", e.target.value)} />
              <InputField label="Owner Adhar Card" name="ownerAadhar" value={form.ownerAadhar ?? ""} onChange={(e) => set("ownerAadhar", e.target.value)} />
              <InputField label="Owner Pan Card" name="ownerPan" value={form.ownerPan ?? ""} onChange={(e) => set("ownerPan", e.target.value)} />
              <InputField label="Owner Licence No." name="ownerLicence" value={form.ownerLicence ?? ""} onChange={(e) => set("ownerLicence", e.target.value)} />
              <InputField label="Expiry Date" type="date" name="ownerLicenceExpiry" value={form.ownerLicenceExpiry ?? ""} onChange={(e) => set("ownerLicenceExpiry", e.target.value)} />
              <InputField label="Engine No" name="engineNo" value={form.engineNo ?? ""} onChange={(e) => set("engineNo", e.target.value)} />
              <InputField label="Chassis No" name="chassisNo" value={form.chassisNo ?? ""} onChange={(e) => set("chassisNo", e.target.value)} />
              <InputField label="Insurance Company Name" name="insuranceCompany" value={form.insuranceCompany ?? ""} onChange={(e) => set("insuranceCompany", e.target.value)} />
            </div>
            <div>
              <InputField label="Policy No." name="policyNo" value={form.policyNo ?? ""} onChange={(e) => set("policyNo", e.target.value)} />
              <InputField label="Policy Exp. Date" type="date" name="policyExpDate" value={form.policyExpDate ?? ""} onChange={(e) => set("policyExpDate", e.target.value)} />
              <InputField label="All India Permit No." name="allIndiaPermitNo" value={form.allIndiaPermitNo ?? ""} onChange={(e) => set("allIndiaPermitNo", e.target.value)} />
              <InputField label="All India Expiry Date" type="date" name="allIndiaExpiry" value={form.allIndiaExpiry ?? ""} onChange={(e) => set("allIndiaExpiry", e.target.value)} />
              <InputField label="State Permit No." name="statePermitNo" value={form.statePermitNo ?? ""} onChange={(e) => set("statePermitNo", e.target.value)} />
              <InputField label="State Permit Exp. Date" type="date" name="statePermitExp" value={form.statePermitExp ?? ""} onChange={(e) => set("statePermitExp", e.target.value)} />
              <InputField label="Pollution Exp. Date" type="date" name="pollutionExp" value={form.pollutionExp ?? ""} onChange={(e) => set("pollutionExp", e.target.value)} />
              <InputField label="Fitness Exp. Date" type="date" name="fitnessExp" value={form.fitnessExp ?? ""} onChange={(e) => set("fitnessExp", e.target.value)} />
              <InputField label="State Tax Expiry Date" type="date" name="stateTaxExp" value={form.stateTaxExp ?? ""} onChange={(e) => set("stateTaxExp", e.target.value)} />
              <InputField label="Guarantor Name" name="guarantorName" value={form.guarantorName ?? ""} onChange={(e) => set("guarantorName", e.target.value)} />
              <InputField label="Guarantor Mob No." name="guarantorMob" value={form.guarantorMob ?? ""} onChange={(e) => set("guarantorMob", e.target.value)} />
              <InputField label="Alternate Mob No." name="altMob" value={form.altMob ?? ""} onChange={(e) => set("altMob", e.target.value)} />
              <InputField label="Adhar No." name="aadhar" value={form.aadhar ?? ""} onChange={(e) => set("aadhar", e.target.value)} />
              <InputField label="Pan No." name="pan" value={form.pan ?? ""} onChange={(e) => set("pan", e.target.value)} />
              <InputField label="Licence No." name="licenceNo" value={form.licenceNo ?? ""} onChange={(e) => set("licenceNo", e.target.value)} />
              <InputField label="Expiry Date" type="date" name="licenceExpiry" value={form.licenceExpiry ?? ""} onChange={(e) => set("licenceExpiry", e.target.value)} />
              <FileField label="Upload Documents" />
            </div>
          </TwoCol>
          <Button type="submit">{editId ? "Update Data" : "Save Data"}</Button>
        </FormCard>
      </AdminForm>
      <DataTable
        rows={rows}
        searchKeys={["vehNo", "ownerName"]}
        columns={[
          { key: "view", header: "Update", render: (row) => <Button type="button" size="sm" variant="teal" onClick={() => load(row)}>Update</Button> },
          { key: "delete", header: "Delete", render: (row) => <Button type="button" size="sm" variant="danger" onClick={() => remove(row.id)}>Delete</Button> },
          { key: "id", header: "Sr No" },
          { key: "vehNo", header: "Veh No" },
          { key: "ownerName", header: "Owner Name" },
          { key: "ownerMob", header: "Owner Mob" },
          { key: "ownerAadhar", header: "Adhar Card" },
          { key: "ownerPan", header: "PAN Card" },
          { key: "ownerLicence", header: "Licence No." },
        ]}
      />
    </>
  );
}
