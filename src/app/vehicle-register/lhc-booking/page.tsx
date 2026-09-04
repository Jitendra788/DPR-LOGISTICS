"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { DateField, InputField, ComboboxField, DatalistField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { AdminForm } from "@/components/ui/AdminForm";
import { useCrud } from "@/hooks/useCrud";
import { api } from "@/lib/api-client";
import { todayIso } from "@/lib/dates";

type Vehicle = { vehNo: string };
type Lhc = {
  challanNo: string;
  challanDate: string;
  vehNo: string;
  fromStation: string;
  toStation: string;
  lorryFreight: number;
};
type Row = {
  id: number;
  vehNo: string;
  fromStation: string;
  toStation: string;
  openingMeter: string;
  closingMeter: string;
  totalKm: string;
  lhcDate: string;
  lhcNo: string;
  lhcFreight: number;
  tyreChangeAfterKm: string;
  totalRunningKm: string;
  servicingKmAfter: string;
  tripDate: string;
  freight: number;
};

export default function LhcWiseBookingPage() {
  const { rows, message, create, update, remove, setMessage } = useCrud<Row>("trips");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [contracts, setContracts] = useState<Lhc[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    vehNo: "",
    fromStation: "",
    toStation: "",
    openingMeter: "",
    closingMeter: "",
    lhcDate: todayIso(),
    lhcNo: "",
    lhcFreight: 0,
    tyreChangeAfterKm: "",
    servicingKmAfter: "",
  });

  const totalKm = useMemo(() => {
    const open = Number(form.openingMeter) || 0;
    const close = Number(form.closingMeter) || 0;
    const diff = close - open;
    return diff > 0 ? String(diff) : "";
  }, [form.openingMeter, form.closingMeter]);

  const totalRunning = useMemo(() => {
    const tyre = Number(form.tyreChangeAfterKm) || 0;
    const km = Number(totalKm) || 0;
    return String(tyre + km || "");
  }, [form.tyreChangeAfterKm, totalKm]);

  useEffect(() => {
    Promise.all([api<Vehicle[]>("/api/fleet"), api<Lhc[]>("/api/lhc")]).then(([v, l]) => {
      setVehicles(v);
      setContracts(l);
    });
  }, []);

  function applyLhc(lhcNo: string) {
    const c = contracts.find((x) => x.challanNo === lhcNo);
    if (!c) {
      setForm((f) => ({ ...f, lhcNo }));
      return;
    }
    setForm((f) => ({
      ...f,
      lhcNo: c.challanNo,
      lhcDate: c.challanDate || f.lhcDate || todayIso(),
      vehNo: c.vehNo || f.vehNo,
      fromStation: c.fromStation || f.fromStation,
      toStation: c.toStation || f.toStation,
      lhcFreight: Number(c.lorryFreight) || f.lhcFreight,
    }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const body = {
      ...form,
      totalKm,
      totalRunningKm: totalRunning,
      tripDate: form.lhcDate,
      freight: form.lhcFreight,
    };
    const saved = editId ? await update(editId, body) : await create(body);
    if (saved) {
      setEditId(null);
      setForm({
        vehNo: "",
        fromStation: "",
        toStation: "",
        openingMeter: "",
        closingMeter: "",
        lhcDate: todayIso(),
        lhcNo: "",
        lhcFreight: 0,
        tyreChangeAfterKm: "",
        servicingKmAfter: "",
      });
    }
  }

  return (
    <>
      <PageHeader
        title="LHC Wise Booking Entry"
        subtitle="Link self-vehicle trip with LHC contract (old site work flow)"
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "LHC Wise Booking Entry" }]}
      />
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
              <InputField label="From" value={form.fromStation} onChange={(e) => setForm({ ...form, fromStation: e.target.value })} />
              <InputField label="To" value={form.toStation} onChange={(e) => setForm({ ...form, toStation: e.target.value })} />
              <InputField label="Opening Meter" value={form.openingMeter} onChange={(e) => setForm({ ...form, openingMeter: e.target.value })} />
              <InputField label="Closing Meter" value={form.closingMeter} onChange={(e) => setForm({ ...form, closingMeter: e.target.value })} />
              <InputField label="Total KM" value={totalKm} readOnly />
              <DateField label="LHC Date" value={form.lhcDate} onChange={(lhcDate) => setForm({ ...form, lhcDate })} />
              <DatalistField
                label="LHC No"
                value={form.lhcNo}
                onChange={(e) => applyLhc(e.target.value)}
                options={contracts.map((c) => c.challanNo)}
                placeholder="Type or pick LHC / challan"
              />
              <InputField label="LHC Freight" value={form.lhcFreight} onChange={(e) => setForm({ ...form, lhcFreight: Number(e.target.value) || 0 })} />
            </div>
            <div>
              <InputField label="Tyre Change After KM" value={form.tyreChangeAfterKm} onChange={(e) => setForm({ ...form, tyreChangeAfterKm: e.target.value })} />
              <InputField label="Total Running Km" value={totalRunning} readOnly />
              <InputField label="Servicing KM After" value={form.servicingKmAfter} onChange={(e) => setForm({ ...form, servicingKmAfter: e.target.value })} />
              <InputField label="Total Running KM" value={totalRunning} readOnly />
            </div>
          </TwoCol>
          <Button type="submit" variant="teal">
            {editId ? "Update Data" : "Save Data"}
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
                    fromStation: row.fromStation,
                    toStation: row.toStation,
                    openingMeter: row.openingMeter,
                    closingMeter: row.closingMeter,
                    lhcDate: row.lhcDate || row.tripDate,
                    lhcNo: row.lhcNo,
                    lhcFreight: row.lhcFreight || row.freight,
                    tyreChangeAfterKm: row.tyreChangeAfterKm,
                    servicingKmAfter: row.servicingKmAfter,
                  });
                  setMessage({ type: "ok", text: `Loaded ${row.vehNo}` });
                }}
              >
                Update
              </Button>
            ),
          },
          {
            key: "delete",
            header: "Delete",
            render: (row) => (
              <Button type="button" size="sm" variant="danger" onClick={() => remove(row.id)}>
                Delete
              </Button>
            ),
          },
          { key: "id", header: "Sr No" },
          { key: "vehNo", header: "Veh No" },
          { key: "totalKm", header: "Total KM" },
          { key: "lhcNo", header: "LHC No" },
          { key: "lhcDate", header: "LHC Date" },
          { key: "lhcFreight", header: "Freight" },
        ]}
      />
    </>
  );
}
