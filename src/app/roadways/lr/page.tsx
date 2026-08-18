"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { DateField, FieldWrap, InputField, ManualNumberField, SelectField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Flash } from "@/components/ui/Flash";
import { useCrud } from "@/hooks/useCrud";
import { api, formToObject } from "@/lib/api-client";
import { todayIso } from "@/lib/dates";

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
  const [searchLr, setSearchLr] = useState("");
  const [printOpts, setPrintOpts] = useState({ consignor: true, lorry: false, consignee: false });
  const [email, setEmail] = useState("");

  useEffect(() => {
    Promise.all([api<Party[]>("/api/parties"), api<{ value: string }>("/api/next-no?type=lr")]).then(([p, next]) => {
      setParties(p);
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
  const grandTotal = total + (form.gst || 0);

  function load(row: Booking) {
    setEditId(row.id);
    setForm({
      ...blankForm(),
      ...row,
      lrDate: row.lrDate || todayIso(),
      validDate: row.validDate || todayIso(),
    });
    setMessage({ type: "ok", text: `Loaded LR ${row.lrNo}` });
  }

  function search() {
    const found = rows.find(
      (r) => r.lrNo.toLowerCase() === searchLr.trim().toLowerCase() && (r.source || "DPR") === "ROADWAYS",
    );
    if (!found) {
      setMessage({ type: "err", text: "LR not found" });
      return;
    }
    load(found);
  }

  async function resetAfterSave() {
    setEditId(null);
    const next = await api<{ value: string }>("/api/next-no?type=lr");
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
      gst: form.gst || 0,
      total,
      grandTotal,
      source: "ROADWAYS",
    };
    const saved = await create(body);
    if (saved) await resetAfterSave();
  }

  async function modifyLr() {
    if (!editId) return;
    const saved = await update(editId, { ...form, total, grandTotal, source: "ROADWAYS" });
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
    window.open(`/booking/lr/print?lrNo=${encodeURIComponent(form.lrNo)}&copies=${copies}`, "_blank");
  }

  function emailLr() {
    if (!email || !form.lrNo) return;
    const subject = encodeURIComponent(`LR ${form.lrNo}`);
    const body = encodeURIComponent(
      `LR No: ${form.lrNo}\nFrom: ${form.fromStation}\nTo: ${form.toStation}\nParty: ${form.billingParty}\nGrand Total: ${grandTotal}`,
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  }

  return (
    <>
      <PageHeader
        title="LR Booking"
        subtitle="Fill all the fields"
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "LR Booking" }]}
      />
      <Flash message={message} />
      <form onSubmit={onSubmit}>
        <FormCard>
          <TwoCol>
            <div>
              <InputField label="Booking From" name="bookingFrom" value={form.bookingFrom} onChange={(e) => setForm({ ...form, bookingFrom: e.target.value })} />
              <InputField label="LR No" name="lrNo" value={form.lrNo} onChange={(e) => setForm({ ...form, lrNo: e.target.value })} required />
              <DateField label="LR Date" value={form.lrDate} onChange={(lrDate) => setForm({ ...form, lrDate })} />
              <InputField label="From Station" name="fromStation" value={form.fromStation} onChange={(e) => setForm({ ...form, fromStation: e.target.value })} />
              <InputField label="To Station" name="toStation" value={form.toStation} onChange={(e) => setForm({ ...form, toStation: e.target.value })} />
              <InputField label="Veh.No" name="vehNo" value={form.vehNo} onChange={(e) => setForm({ ...form, vehNo: e.target.value })} />
              <SelectField label="Delivery At" name="deliveryAt" value={form.deliveryAt} onChange={(e) => setForm({ ...form, deliveryAt: e.target.value })} options={["DOOR", "GODOWN"]} placeholder="" />
              <SelectField label="Billing Party" name="billingParty" value={form.billingParty} onChange={(e) => setForm({ ...form, billingParty: e.target.value })} options={parties.map((p) => p.name)} />
              <SelectField label="Consignor" name="consignor" value={form.consignor} onChange={(e) => setForm({ ...form, consignor: e.target.value })} options={parties.map((p) => p.name)} />
            </div>
            <div>
              <InputField label="Consignee" name="consignee" value={form.consignee} onChange={(e) => setForm({ ...form, consignee: e.target.value })} />
              <InputField label="No Of Articles" name="articles" value={form.articles} onChange={(e) => setForm({ ...form, articles: e.target.value })} />
              <InputField label="particulars" name="particulars" value={form.particulars} onChange={(e) => setForm({ ...form, particulars: e.target.value })} />
              <InputField label="Inv.No.& Date" name="invNoDate" value={form.invNoDate} onChange={(e) => setForm({ ...form, invNoDate: e.target.value })} />
              <InputField label="Act.Weight" name="actWeight" value={form.actWeight} onChange={(e) => setForm({ ...form, actWeight: e.target.value })} />
              <InputField label="Charged Weight" name="chargedWeight" value={form.chargedWeight} onChange={(e) => setForm({ ...form, chargedWeight: e.target.value })} />
              <InputField label="Rate" name="rate" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} />
              <SelectField label="Bill As" name="billAs" value={form.billAs} onChange={(e) => setForm({ ...form, billAs: e.target.value })} options={["Weight", "Mtr", "Package"]} placeholder="" />
              <InputField label="Total Meter" name="totalMeter" value={form.totalMeter} onChange={(e) => setForm({ ...form, totalMeter: e.target.value })} />
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
                  onChange={(n) => setForm({ ...form, [key]: n })}
                />
              ))}
            </div>
            <div>
              <ManualNumberField label="Total" value={total} readOnly />
              <ManualNumberField label="GST" value={form.gst} onChange={(gst) => setForm({ ...form, gst })} />
              <ManualNumberField label="Grand Total" value={grandTotal} readOnly />
              <SelectField label="GST Paid By" name="gstPaidBy" value={form.gstPaidBy} onChange={(e) => setForm({ ...form, gstPaidBy: e.target.value })} options={["Consigner", "Consignee", "Company", "Broker"]} placeholder="" />
              <InputField label="E-Way Bill No" name="ewayBill" value={form.ewayBill} onChange={(e) => setForm({ ...form, ewayBill: e.target.value })} />
              <DateField label="Valid Date" value={form.validDate} onChange={(validDate) => setForm({ ...form, validDate })} />
              <SelectField label="LR Type" name="lrType" value={form.lrType} onChange={(e) => setForm({ ...form, lrType: e.target.value })} options={["TBB", "ToPay", "Paid"]} placeholder="" />
              <InputField label="Value Rs." name="valueRs" value={form.valueRs} onChange={(e) => setForm({ ...form, valueRs: e.target.value })} />
            </div>
          </TwoCol>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button type="submit" disabled={!!editId}>
              Save LR
            </Button>
            <Button type="button" variant="teal" disabled={!editId} onClick={modifyLr}>
              Modify LR
            </Button>
            <Button type="button" variant="danger" disabled={!editId} onClick={deleteLr}>
              Delete LR
            </Button>
          </div>
        </FormCard>

        <FormCard>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <FieldWrap label="Enter Lr No for Find">
                <input className="form-control" value={searchLr} onChange={(e) => setSearchLr(e.target.value)} />
              </FieldWrap>
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
                <Button type="button" onClick={emailLr}>
                  Email
                </Button>
              </div>
            </div>
          </div>
        </FormCard>
      </form>
    </>
  );
}
