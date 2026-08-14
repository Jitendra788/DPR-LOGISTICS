"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { InputField, SelectField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { useCrud } from "@/hooks/useCrud";
import { api } from "@/lib/api-client";

type Station = { name: string };
type Vendor = { name: string; type: string };
type Vehicle = {
  vehNo: string;
  ownerName: string;
  ownerMob: string;
  ownerPan: string;
  ownerAadhar: string;
  engineNo: string;
  chassisNo: string;
  insuranceCompany: string;
  policyNo: string;
  policyExpDate: string;
  allIndiaPermitNo: string;
  allIndiaExpiry: string;
  fitnessExp: string;
  licenceNo: string;
};
type Booking = {
  id: number;
  lrNo: string;
  lrDate: string;
  vehNo: string;
  fromStation: string;
  toStation: string;
  billingParty: string;
  particulars: string;
  chargedWeight: string;
  lhcNo: string;
};
type Lhc = {
  id: number;
  challanNo: string;
  challanDate: string;
  vehNo: string;
  fromStation: string;
  toStation: string;
  ownerName: string;
  ownerMob: string;
  ownerPan: string;
  ownerAadhar: string;
  driverName: string;
  driverMob: string;
  driverPan: string;
  driverAadhar: string;
  licenceNo: string;
  engineNo: string;
  chassisNo: string;
  insCompany: string;
  policyNo: string;
  policyExp: string;
  allPermitNo: string;
  allPermitExp: string;
  fitnessExp: string;
  brokerName: string;
  brokerPan: string;
  lorryFreight: number;
  transfer: number;
  cash: number;
  dieselLtr: number;
  fuel: number;
  fuelVendor: string;
  totalAdvance: number;
  balance: number;
  lrNos: string;
  paid?: boolean;
};

export default function LorryHireContractPage() {
  const { rows, message, create, update, remove, setMessage, reload } = useCrud<Lhc>("lhc");
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Lhc>>({
    challanDate: new Date().toISOString().slice(0, 10),
    lorryFreight: 0,
    transfer: 0,
    cash: 0,
    dieselLtr: 0,
    fuel: 0,
  });
  const [stations, setStations] = useState<Station[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedLrs, setSelectedLrs] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      api<Station[]>("/api/stations"),
      api<Vendor[]>("/api/vendors"),
      api<Vehicle[]>("/api/vehicles"),
      api<Booking[]>("/api/bookings"),
      api<{ value: string }>("/api/next-no?type=lhc"),
    ]).then(([s, v, veh, b, next]) => {
      setStations(s);
      setVendors(v);
      setVehicles(veh);
      setBookings(b);
      setForm((f) => ({ ...f, challanNo: f.challanNo || next.value }));
    });
  }, []);

  const brokers = vendors.filter((v) => v.type === "Broker").map((v) => v.name);
  const fuelVendors = vendors.filter((v) => v.type === "Fuel" || v.type === "Other").map((v) => v.name);
  const pendingLrs = bookings.filter((b) => !b.lhcNo || (editId && form.lrNos?.includes(b.lrNo)));

  const totalAdvance = useMemo(() => (form.transfer || 0) + (form.cash || 0) + (form.fuel || 0), [form]);
  const balance = (form.lorryFreight || 0) - totalAdvance;

  async function onVehicleChange(vehNo: string) {
    const vehicle = vehicles.find((v) => v.vehNo === vehNo);
    setForm((f) => ({
      ...f,
      vehNo,
      ownerName: vehicle?.ownerName || f.ownerName,
      ownerMob: vehicle?.ownerMob || f.ownerMob,
      ownerPan: vehicle?.ownerPan || f.ownerPan,
      ownerAadhar: vehicle?.ownerAadhar || f.ownerAadhar,
      engineNo: vehicle?.engineNo || f.engineNo,
      chassisNo: vehicle?.chassisNo || f.chassisNo,
      insCompany: vehicle?.insuranceCompany || f.insCompany,
      policyNo: vehicle?.policyNo || f.policyNo,
      policyExp: vehicle?.policyExpDate || f.policyExp,
      allPermitNo: vehicle?.allIndiaPermitNo || f.allPermitNo,
      allPermitExp: vehicle?.allIndiaExpiry || f.allPermitExp,
      fitnessExp: vehicle?.fitnessExp || f.fitnessExp,
      licenceNo: vehicle?.licenceNo || f.licenceNo,
    }));
  }

  function load(row: Lhc) {
    setEditId(row.id);
    setForm(row);
    setSelectedLrs(row.lrNos ? row.lrNos.split(",").map((x) => x.trim()).filter(Boolean) : []);
    setMessage({ type: "ok", text: `Loaded challan ${row.challanNo}` });
  }

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("challanNo");
    if (!q || !rows.length) return;
    const found = rows.find((r) => r.challanNo.toLowerCase() === q.toLowerCase());
    if (found) load(found);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  async function saveChallan(e?: FormEvent) {
    e?.preventDefault();
    const body = {
      ...form,
      totalAdvance,
      balance,
      lrNos: selectedLrs.join(", "),
    };
    const saved = editId ? await update(editId, body) : await create(body);
    if (!saved) return;

    // Link selected LRs to this LHC
    await Promise.all(
      selectedLrs.map(async (lrNo) => {
        const booking = bookings.find((b) => b.lrNo === lrNo);
        if (booking) {
          await api(`/api/bookings/${booking.id}`, {
            method: "PUT",
            body: JSON.stringify({ ...booking, lhcNo: saved.challanNo }),
          });
        }
      }),
    );

    setEditId(null);
    setSelectedLrs([]);
    const next = await api<{ value: string }>("/api/next-no?type=lhc");
    setForm({
      challanNo: next.value,
      challanDate: new Date().toISOString().slice(0, 10),
      lorryFreight: 0,
      transfer: 0,
      cash: 0,
      dieselLtr: 0,
      fuel: 0,
    });
    setBookings(await api<Booking[]>("/api/bookings"));
    await reload();
  }

  async function deleteChallan() {
    if (!editId || !form.challanNo) return;
    const linked = bookings.filter((b) => b.lhcNo === form.challanNo);
    const ok = await remove(editId);
    if (!ok) return;
    await Promise.all(
      linked.map((b) =>
        api(`/api/bookings/${b.id}`, {
          method: "PUT",
          body: JSON.stringify({ ...b, lhcNo: "" }),
        }),
      ),
    );
    setEditId(null);
    setBookings(await api<Booking[]>("/api/bookings"));
  }

  function printChallan() {
    if (!form.challanNo) return;
    window.open(`/lhc/contract/print?challanNo=${encodeURIComponent(form.challanNo)}`, "_blank");
  }

  return (
    <>
      <PageHeader title="New Lorry Hire Contract" subtitle="Fill all the fields" crumbs={[{ label: "Home", href: "/" }, { label: "LHC" }]} />
      <Flash message={message} />
      <form onSubmit={saveChallan}>
        <FormCard>
          <TwoCol>
            <div>
              <InputField label="Challan No." name="challanNo" value={form.challanNo ?? ""} onChange={(e) => setForm({ ...form, challanNo: e.target.value })} />
              <InputField label="Challan Date" type="date" name="challanDate" value={form.challanDate ?? ""} onChange={(e) => setForm({ ...form, challanDate: e.target.value })} />
              <SelectField label="Vehicle No." name="vehNo" value={form.vehNo ?? ""} onChange={(e) => onVehicleChange(e.target.value)} options={vehicles.map((v) => v.vehNo)} />
              <SelectField label="From Station" name="fromStation" value={form.fromStation ?? ""} onChange={(e) => setForm({ ...form, fromStation: e.target.value })} options={stations.map((s) => s.name)} />
              <SelectField label="To Station" name="toStation" value={form.toStation ?? ""} onChange={(e) => setForm({ ...form, toStation: e.target.value })} options={stations.map((s) => s.name)} />
              <InputField label="Owner Name" name="ownerName" value={form.ownerName ?? ""} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} />
              <InputField label="Owner Mob No." name="ownerMob" value={form.ownerMob ?? ""} onChange={(e) => setForm({ ...form, ownerMob: e.target.value })} />
              <InputField label="Owner PAN No." name="ownerPan" value={form.ownerPan ?? ""} onChange={(e) => setForm({ ...form, ownerPan: e.target.value })} />
              <InputField label="Owner Adhar No." name="ownerAadhar" value={form.ownerAadhar ?? ""} onChange={(e) => setForm({ ...form, ownerAadhar: e.target.value })} />
              <InputField label="Driver Name" name="driverName" value={form.driverName ?? ""} onChange={(e) => setForm({ ...form, driverName: e.target.value })} />
              <InputField label="Driver Mob No." name="driverMob" value={form.driverMob ?? ""} onChange={(e) => setForm({ ...form, driverMob: e.target.value })} />
              <InputField label="Driver Pan No." name="driverPan" value={form.driverPan ?? ""} onChange={(e) => setForm({ ...form, driverPan: e.target.value })} />
            </div>
            <div>
              <InputField label="Driver Adhar No." name="driverAadhar" value={form.driverAadhar ?? ""} onChange={(e) => setForm({ ...form, driverAadhar: e.target.value })} />
              <InputField label="Licence No." name="licenceNo" value={form.licenceNo ?? ""} onChange={(e) => setForm({ ...form, licenceNo: e.target.value })} />
              <InputField label="Engine No." name="engineNo" value={form.engineNo ?? ""} onChange={(e) => setForm({ ...form, engineNo: e.target.value })} />
              <InputField label="Chassis No." name="chassisNo" value={form.chassisNo ?? ""} onChange={(e) => setForm({ ...form, chassisNo: e.target.value })} />
              <InputField label="Ins. Company Name" name="insCompany" value={form.insCompany ?? ""} onChange={(e) => setForm({ ...form, insCompany: e.target.value })} />
              <InputField label="Policy No" name="policyNo" value={form.policyNo ?? ""} onChange={(e) => setForm({ ...form, policyNo: e.target.value })} />
              <InputField label="Policy Exp. Date" type="date" name="policyExp" value={form.policyExp ?? ""} onChange={(e) => setForm({ ...form, policyExp: e.target.value })} />
              <InputField label="All P. Permit No" name="allPermitNo" value={form.allPermitNo ?? ""} onChange={(e) => setForm({ ...form, allPermitNo: e.target.value })} />
              <InputField label="All P. Exp. Date" type="date" name="allPermitExp" value={form.allPermitExp ?? ""} onChange={(e) => setForm({ ...form, allPermitExp: e.target.value })} />
              <InputField label="Fitness/Tax Exp. Date" type="date" name="fitnessExp" value={form.fitnessExp ?? ""} onChange={(e) => setForm({ ...form, fitnessExp: e.target.value })} />
              <SelectField label="Broker Name" name="brokerName" value={form.brokerName ?? ""} onChange={(e) => setForm({ ...form, brokerName: e.target.value })} options={brokers.length ? brokers : vendors.map((v) => v.name)} />
              <InputField label="Broker Pan No" name="brokerPan" value={form.brokerPan ?? ""} onChange={(e) => setForm({ ...form, brokerPan: e.target.value })} />
            </div>
          </TwoCol>
        </FormCard>

        <FormCard>
          <TwoCol>
            <div>
              <InputField label="Lorry Freight" type="number" value={form.lorryFreight ?? 0} onChange={(e) => setForm({ ...form, lorryFreight: Number(e.target.value) || 0 })} />
              <InputField label="Transfer" type="number" value={form.transfer ?? 0} onChange={(e) => setForm({ ...form, transfer: Number(e.target.value) || 0 })} />
              <InputField label="Cash" type="number" value={form.cash ?? 0} onChange={(e) => setForm({ ...form, cash: Number(e.target.value) || 0 })} />
              <InputField label="Diesel Ltr" type="number" value={form.dieselLtr ?? 0} onChange={(e) => setForm({ ...form, dieselLtr: Number(e.target.value) || 0 })} />
            </div>
            <div>
              <InputField label="Fuel / Diesel" type="number" value={form.fuel ?? 0} onChange={(e) => setForm({ ...form, fuel: Number(e.target.value) || 0 })} />
              <SelectField label="Fuel / Diesel Vendor Name" name="fuelVendor" value={form.fuelVendor ?? ""} onChange={(e) => setForm({ ...form, fuelVendor: e.target.value })} options={fuelVendors.length ? fuelVendors : vendors.map((v) => v.name)} />
              <InputField label="Total Advance" value={totalAdvance} readOnly />
              <InputField label="Balance" value={balance} readOnly />
            </div>
          </TwoCol>
        </FormCard>
      </form>

      <DataTable
        rows={pendingLrs.map((r, i) => ({ ...r, srNo: i + 1 }))}
        columns={[
          {
            key: "select",
            header: "Select",
            render: (row) => (
              <input
                type="checkbox"
                checked={selectedLrs.includes(row.lrNo)}
                onChange={(e) =>
                  setSelectedLrs((prev) => (e.target.checked ? [...prev, row.lrNo] : prev.filter((x) => x !== row.lrNo)))
                }
              />
            ),
          },
          { key: "lrNo", header: "Lr No" },
          { key: "lrDate", header: "Lr Date" },
          { key: "vehNo", header: "Veh No" },
          { key: "fromStation", header: "From" },
          { key: "toStation", header: "To" },
          { key: "billingParty", header: "Billing Party" },
          { key: "particulars", header: "Particulars" },
          { key: "chargedWeight", header: "Weight" },
          { key: "srNo", header: "Sr No" },
        ]}
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant={editId ? "teal" : "primary"} onClick={() => saveChallan()}>
          {editId ? "Update Challan" : "Save Challan"}
        </Button>
        <Button type="button" variant="danger" disabled={!editId} onClick={deleteChallan}>
          Delete Challan
        </Button>
        <Button type="button" variant="teal" onClick={printChallan}>
          Search & Print Challan
        </Button>
      </div>

      <div className="mt-4">
        <h3 className="mb-2 font-semibold">Saved Challans</h3>
        <DataTable
          rows={rows}
          columns={[
            { key: "view", header: "Update", render: (row) => <Button type="button" size="sm" variant="teal" onClick={() => load(row)}>Update</Button> },
            { key: "challanNo", header: "Challan No" },
            { key: "challanDate", header: "Date" },
            { key: "vehNo", header: "Veh No" },
            { key: "brokerName", header: "Broker" },
            { key: "lorryFreight", header: "Freight" },
            { key: "balance", header: "Balance" },
            { key: "paid", header: "Paid", render: (row) => (row.paid ? "Yes" : "No") },
          ]}
        />
      </div>
    </>
  );
}
