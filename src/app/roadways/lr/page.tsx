"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { DateField, ComboboxField, DropdownField, InputField, ManualNumberField } from "@/components/ui/FormField";
import { LR_TYPES, normalizeLrType } from "@/lib/lr-type";
import { Button } from "@/components/ui/Button";
import { Flash } from "@/components/ui/Flash";
import { AdminForm } from "@/components/ui/AdminForm";
import { useCrud } from "@/hooks/useCrud";
import { api, formToObject } from "@/lib/api-client";
import { todayIso } from "@/lib/dates";
import { lrNoEquals } from "@/lib/lr-no";
import { autoLrFreight } from "@/lib/lr-totals";

type Party = { name: string };
type Booking = {
  id: number;
  bookingFrom: string;
  lrNo: string;
  lrDate: string;
  fromStation: string;
  toStation: string;
  vehNo: string;
  deliveryAt: string;
  billingParty: string;
  consignor: string;
  consignee: string;
  articles: string;
  particulars: string;
  invNoDate: string;
  actWeight: string;
  chargedWeight: string;
  rate: string;
  billAs: string;
  totalMeter: string;
  freight: number;
  serviceTax: number;
  haltage: number;
  insurance: number;
  stCharges: number;
  doorCollection: number;
  barrier: number;
  other: number;
  hamali: number;
  total: number;
  gst: number;
  cgstAmt: number;
  sgstAmt: number;
  igstAmt: number;
  grandTotal: number;
  gstPaidBy: string;
  ewayBill: string;
  validDate: string;
  lrType: string;
  valueRs: string;
  source: string;
};

const chargeKeys = ["freight", "serviceTax", "haltage", "insurance", "stCharges", "doorCollection", "barrier", "other", "hamali"] as const;

const chargeLabels: Record<(typeof chargeKeys)[number], string> = {
  freight: "Freight",
  serviceTax: "Service Tax",
  haltage: "Halting",
  insurance: "Insurance",
  stCharges: "St.Charges",
  doorCollection: "Door Collection",
  barrier: "Barrier",
  other: "Other",
  hamali: "Hamali",
};

function blankForm(lrNo = "") {
  return {
    bookingFrom: "",
    lrNo,
    lrDate: todayIso(),
    fromStation: "",
    toStation: "",
    vehNo: "",
    deliveryAt: "DOOR",
    billingParty: "",
    consignor: "",
    consignee: "",
    articles: "",
    particulars: "",
    invNoDate: "",
    actWeight: "",
    chargedWeight: "",
    rate: "",
    billAs: "Weight",
    totalMeter: "",
    freight: 0,
    serviceTax: 0,
    haltage: 0,
    insurance: 0,
    stCharges: 0,
    doorCollection: 0,
    barrier: 0,
    other: 0,
    hamali: 0,
    gst: 0,
    cgstAmt: 0,
    sgstAmt: 0,
    igstAmt: 0,
    gstPaidBy: "Consigner",
    ewayBill: "",
    validDate: todayIso(),
    lrType: "TBB",
    valueRs: "",
  };
}

export default function RoadwaysLrPage() {
  const { rows, message, create, update, remove, setMessage, reload } = useCrud<Booking>("bookings");
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(blankForm());
  const [parties, setParties] = useState<Party[]>([]);
  const [vehicles, setVehicles] = useState<{ vehNo: string }[]>([]);
  const [stations, setStations] = useState<{ name: string }[]>([]);
  const [searchLr, setSearchLr] = useState("");
  const [printOpts, setPrintOpts] = useState({ consignor: true, lorry: false, consignee: false });
  const [email, setEmail] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const lrOptions = useMemo(
    () => rows.filter((r) => (r.source || "DPR") === "ROADWAYS").map((r) => r.lrNo).filter(Boolean),
    [rows],
  );

  function patchForm(patch: Partial<ReturnType<typeof blankForm>>) {
    setForm((prev) => {
      const next = { ...prev, ...patch };
      const freight = autoLrFreight({
        billAs: next.billAs,
        rate: next.rate,
        totalMeter: next.totalMeter,
        chargedWeight: next.chargedWeight,
      });
      if (freight != null && ("rate" in patch || "totalMeter" in patch || "chargedWeight" in patch || "billAs" in patch)) {
        next.freight = freight;
      }
      if ("cgstAmt" in patch || "sgstAmt" in patch || "igstAmt" in patch) {
        next.gst = Number(((Number(next.cgstAmt) || 0) + (Number(next.sgstAmt) || 0) + (Number(next.igstAmt) || 0)).toFixed(2));
      }
      return next;
    });
  }

  useEffect(() => {
    Promise.all([
      api<Party[]>("/api/parties"),
      api<{ value: string }>("/api/next-no?type=lr&source=ROADWAYS"),
      api<{ vehNo: string }[]>("/api/vehicles"),
      api<{ name: string }[]>("/api/stations"),
    ]).then(([p, next, veh, st]) => {
      setParties(p);
      setVehicles(veh);
      setStations(st);
      setForm((f) => ({ ...f, lrNo: f.lrNo || next.value }));
    });
  }, []);

  const total = useMemo(
    () =>
      (form.freight || 0) +
      (form.serviceTax || 0) +
      (form.haltage || 0) +
      (form.insurance || 0) +
      (form.stCharges || 0) +
      (form.doorCollection || 0) +
      (form.barrier || 0) +
      (form.other || 0) +
      (form.hamali || 0),
    [form],
  );
  const gstTotal = useMemo(
    () => Number(((Number(form.cgstAmt) || 0) + (Number(form.sgstAmt) || 0) + (Number(form.igstAmt) || 0)).toFixed(2)),
    [form.cgstAmt, form.sgstAmt, form.igstAmt],
  );
  const grandTotal = total + gstTotal;

  function load(row: Booking) {
    setEditId(row.id);
    const cgst = Number(row.cgstAmt) || 0;
    const sgst = Number(row.sgstAmt) || 0;
    const igst = Number(row.igstAmt) || 0;
    const gstSplit = cgst + sgst + igst;
    setForm({
      ...blankForm(),
      ...row,
      lrDate: row.lrDate || todayIso(),
      validDate: row.validDate || todayIso(),
      cgstAmt: gstSplit > 0 ? cgst : Number(row.gst) || 0,
      sgstAmt: gstSplit > 0 ? sgst : 0,
      igstAmt: gstSplit > 0 ? igst : 0,
      gst: gstSplit > 0 ? gstSplit : Number(row.gst) || 0,
    });
    setMessage({ type: "ok", text: `Loaded LR ${row.lrNo}` });
  }

  function search() {
    const found = rows.find(
      (r) => lrNoEquals(r.lrNo, searchLr.trim()) && (r.source || "DPR") === "ROADWAYS",
    );
    if (!found) {
      setMessage({ type: "err", text: "LR not found" });
      return;
    }
    load(found);
  }

  async function resetAfterSave() {
    setEditId(null);
    const next = await api<{ value: string }>("/api/next-no?type=lr&source=ROADWAYS");
    setForm(blankForm(next.value));
    await reload();
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (editId) return;
    const body = {
      ...form,
      ...formToObject(e.currentTarget),
      freight: form.freight || 0,
      serviceTax: form.serviceTax || 0,
      haltage: form.haltage || 0,
      insurance: form.insurance || 0,
      stCharges: form.stCharges || 0,
      doorCollection: form.doorCollection || 0,
      barrier: form.barrier || 0,
      other: form.other || 0,
      hamali: form.hamali || 0,
      gst: gstTotal,
      cgstAmt: Number(form.cgstAmt) || 0,
      sgstAmt: Number(form.sgstAmt) || 0,
      igstAmt: Number(form.igstAmt) || 0,
      total,
      grandTotal,
      source: "ROADWAYS",
      lrType: normalizeLrType(form.lrType),
      billingParty: String(form.billingParty ?? "").trim(),
      consignor: String(form.consignor ?? "").trim(),
      consignee: String(form.consignee ?? "").trim(),
    };
    const saved = await create(body);
    if (saved) await resetAfterSave();
  }

  async function modifyLr() {
    if (!editId) return;
    const saved = await update(editId, {
      ...form,
      gst: gstTotal,
      cgstAmt: Number(form.cgstAmt) || 0,
      sgstAmt: Number(form.sgstAmt) || 0,
      igstAmt: Number(form.igstAmt) || 0,
      total,
      grandTotal,
      source: "ROADWAYS",
      lrType: normalizeLrType(form.lrType),
      billingParty: String(form.billingParty ?? "").trim(),
      consignor: String(form.consignor ?? "").trim(),
      consignee: String(form.consignee ?? "").trim(),
    });
    if (saved) await resetAfterSave();
  }

  async function deleteLr() {
    if (!editId) return;
    const ok = await remove(editId);
    if (ok) await resetAfterSave();
  }

  function printLr() {
    if (!form.lrNo) return;
    const copies = [printOpts.consignor ? "Consignor" : "", printOpts.lorry ? "Lorry" : "", printOpts.consignee ? "Consignee" : ""]
      .filter(Boolean)
      .join(",");
    window.open(`/roadways/lr/print?lrNo=${encodeURIComponent(form.lrNo)}&copies=${copies}`, "_blank");
  }

  async function emailLr() {
    if (!email.trim() || !form.lrNo) {
      setMessage({ type: "err", text: "Enter receiver email and load/save LR first" });
      return;
    }
    const copies = [printOpts.consignor ? "Consignor" : "", printOpts.lorry ? "Lorry" : "", printOpts.consignee ? "Consignee" : ""]
      .filter(Boolean)
      .join(",");
    setEmailSending(true);
    try {
      const res = await api<{ message: string }>("/api/bookings/email", {
        method: "POST",
        body: JSON.stringify({ lrNo: form.lrNo, to: email.trim(), copies }),
      });
      setMessage({ type: "ok", text: res.message || `LR emailed to ${email}` });
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Email failed" });
    } finally {
      setEmailSending(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Roadways LR Booking"
        subtitle="Delhi Punjab Roadways — same work flow as old site"
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "DPR Roadways" }, { label: "L.R" }]}
      />
      <Flash message={message} />
      <AdminForm onSubmit={onSubmit}>
        <FormCard>
          <TwoCol>
            <div>
              <InputField label="Booking From" name="bookingFrom" value={form.bookingFrom} onChange={(e) => setForm({ ...form, bookingFrom: e.target.value })} />
              <InputField label="LR No" name="lrNo" value={form.lrNo} onChange={(e) => setForm({ ...form, lrNo: e.target.value })} required />
              <DateField label="LR Date" value={form.lrDate} onChange={(lrDate) => setForm({ ...form, lrDate })} />
              <ComboboxField
                label="From Station"
                name="fromStation"
                value={form.fromStation}
                onChange={(fromStation) => setForm({ ...form, fromStation })}
                options={stations.map((s) => s.name)}
                placeholder="Search or select station"
              />
              <ComboboxField
                label="To Station"
                name="toStation"
                value={form.toStation}
                onChange={(toStation) => setForm({ ...form, toStation })}
                options={stations.map((s) => s.name)}
                placeholder="Search or select station"
              />
              <ComboboxField
                label="Veh.No"
                name="vehNo"
                value={form.vehNo}
                onChange={(vehNo) => setForm({ ...form, vehNo })}
                options={vehicles.map((v) => v.vehNo)}
                placeholder="Search or select vehicle"
              />
              <ComboboxField label="Delivery At" name="deliveryAt" value={form.deliveryAt} onChange={(deliveryAt) => setForm({ ...form, deliveryAt })} options={["DOOR", "GODOWN"]} placeholder="Select delivery" />
              <ComboboxField label="Billing Party" name="billingParty" value={form.billingParty} onChange={(billingParty) => setForm({ ...form, billingParty })} options={parties.map((p) => p.name)} placeholder="Search or select party" />
              <ComboboxField label="Consignor" name="consignor" value={form.consignor} onChange={(consignor) => setForm({ ...form, consignor })} options={parties.map((p) => p.name)} placeholder="Search or select consignor" />
            </div>
            <div>
              <ComboboxField label="Consignee" name="consignee" value={form.consignee} onChange={(consignee) => setForm({ ...form, consignee })} options={parties.map((p) => p.name)} placeholder="Search or select consignee" />
              <InputField label="No Of Articles" name="articles" value={form.articles} onChange={(e) => setForm({ ...form, articles: e.target.value })} />
              <InputField label="particulars" name="particulars" value={form.particulars} onChange={(e) => setForm({ ...form, particulars: e.target.value })} />
              <InputField label="Inv.No.& Date" name="invNoDate" value={form.invNoDate} onChange={(e) => setForm({ ...form, invNoDate: e.target.value })} />
              <InputField label="Act.Weight" name="actWeight" value={form.actWeight} onChange={(e) => setForm({ ...form, actWeight: e.target.value })} />
              <InputField label="Charged Weight" name="chargedWeight" value={form.chargedWeight} onChange={(e) => patchForm({ chargedWeight: e.target.value })} />
              <InputField label="Rate" name="rate" value={form.rate} onChange={(e) => patchForm({ rate: e.target.value })} />
              <ComboboxField label="Bill As" name="billAs" value={form.billAs} onChange={(billAs) => patchForm({ billAs })} options={["Weight", "Mtr", "Package"]} placeholder="Select" />
              <InputField label="Total Meter" name="totalMeter" value={form.totalMeter} onChange={(e) => patchForm({ totalMeter: e.target.value })} />
            </div>
          </TwoCol>
        </FormCard>

        <FormCard>
          <TwoCol>
            <div>
              {chargeKeys.map((key) => (
                <ManualNumberField
                  key={key}
                  label={chargeLabels[key]}
                  value={form[key]}
                  onChange={(n) => patchForm({ [key]: n })}
                  readOnly={key === "freight"}
                />
              ))}
            </div>
            <div>
              <ManualNumberField label="Total" value={total} readOnly />
              <ManualNumberField label="CGST" value={form.cgstAmt} onChange={(cgstAmt) => patchForm({ cgstAmt })} />
              <ManualNumberField label="SGST" value={form.sgstAmt} onChange={(sgstAmt) => patchForm({ sgstAmt })} />
              <ManualNumberField label="IGST" value={form.igstAmt} onChange={(igstAmt) => patchForm({ igstAmt })} />
              <ManualNumberField label="GST Total" value={gstTotal} readOnly />
              <ManualNumberField label="Grand Total" value={grandTotal} readOnly />
              <ComboboxField label="GST Paid By" name="gstPaidBy" value={form.gstPaidBy} onChange={(gstPaidBy) => patchForm({ gstPaidBy })} options={["Consigner", "Consignee", "Company", "Broker"]} placeholder="Select" />
              <InputField label="E-Way Bill No" name="ewayBill" value={form.ewayBill} onChange={(e) => patchForm({ ewayBill: e.target.value })} />
              <DateField label="Valid Date" value={form.validDate} onChange={(validDate) => patchForm({ validDate })} />
              <DropdownField label="LR Type" name="lrType" value={form.lrType} onChange={(e) => patchForm({ lrType: e.target.value })} options={[...LR_TYPES]} />
              <InputField label="Value Rs." name="valueRs" value={form.valueRs} onChange={(e) => patchForm({ valueRs: e.target.value })} />
            </div>
          </TwoCol>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button type="submit" disabled={!!editId}>
              Save LR
            </Button>
            <Button type="button" variant="teal" disabled={!editId} onClick={modifyLr}>
              Update LR
            </Button>
            <Button type="button" variant="danger" disabled={!editId} onClick={deleteLr}>
              Delete LR
            </Button>
          </div>
        </FormCard>

        <FormCard>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <ComboboxField
                label="Select LR No for Find"
                value={searchLr}
                onChange={setSearchLr}
                options={lrOptions}
                placeholder="Search or select LR"
              />
              <Button type="button" onClick={search}>
                Search LR
              </Button>
              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={printOpts.consignor} onChange={(e) => setPrintOpts({ ...printOpts, consignor: e.target.checked })} /> Consigner Copy
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={printOpts.lorry} onChange={(e) => setPrintOpts({ ...printOpts, lorry: e.target.checked })} /> Lorry Copy
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={printOpts.consignee} onChange={(e) => setPrintOpts({ ...printOpts, consignee: e.target.checked })} /> Consignee Copy
                </label>
              </div>
            </div>
            <div>
              <InputField label="Enter Receiver Email ID" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={printLr}>
                  Print LR
                </Button>
                <Button type="button" onClick={emailLr} disabled={emailSending}>
                  {emailSending ? "Sending…" : "Email"}
                </Button>
              </div>
            </div>
          </div>
        </FormCard>
      </AdminForm>
    </>
  );
}
