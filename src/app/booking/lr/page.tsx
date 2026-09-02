"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { DateField, DatalistField, FieldWrap, InputField, MoneyField, SelectField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Flash } from "@/components/ui/Flash";
import { AdminForm } from "@/components/ui/AdminForm";
import { useCrud } from "@/hooks/useCrud";
import { api, formToObject } from "@/lib/api-client";
import { lrNoEquals } from "@/lib/lr-no";

type Party = { id: number; name: string };
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
};

const chargeKeys = ["freight", "serviceTax", "haltage", "insurance", "stCharges", "doorCollection", "barrier", "other", "hamali"] as const;

const chargeLabels: Record<(typeof chargeKeys)[number], string> = {
  freight: "Freight",
  serviceTax: "Service Tax",
  haltage: "Halting",
  insurance: "Insurance",
  stCharges: "St. Charges",
  doorCollection: "Door Collection",
  barrier: "Barrier",
  other: "Other",
  hamali: "Hamali",
};

function LrBookingInner() {
  const searchParams = useSearchParams();
  const { rows, message, create, update, remove, setMessage, reload } = useCrud<Booking>("bookings");
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Booking>>({
    deliveryAt: "DOOR",
    billAs: "Weight",
    gstPaidBy: "Consigner",
    lrType: "TBB",
    lrDate: new Date().toISOString().slice(0, 10),
    validDate: new Date().toISOString().slice(0, 10),
  });
  const [parties, setParties] = useState<Party[]>([]);
  const partyNames = useMemo(() => parties.map((p) => p.name).filter(Boolean), [parties]);
  const [searchLr, setSearchLr] = useState("");
  const [printOpts, setPrintOpts] = useState({ consignor: true, lorry: false, consignee: false });
  const [email, setEmail] = useState("");
  const [lastShare, setLastShare] = useState<{ lrNo: string; url: string } | null>(null);

  useEffect(() => {
    Promise.all([api<Party[]>("/api/parties"), api<{ value: string }>("/api/next-no?type=lr")]).then(([p, next]) => {
      setParties(p);
      setForm((f) => ({ ...f, lrNo: f.lrNo || next.value }));
    });
  }, []);

  useEffect(() => {
    const q = searchParams.get("lrNo");
    if (!q || !rows.length) return;
    setSearchLr(q);
    const found = rows.find((r) => lrNoEquals(r.lrNo, q));
    if (found) load(found);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, rows]);

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
    setForm(row);
    setMessage({ type: "ok", text: `Loaded LR ${row.lrNo}` });
  }

  function search() {
    const found = rows.find((r) => lrNoEquals(r.lrNo, searchLr.trim()));
    if (!found) {
      setMessage({ type: "err", text: "LR not found" });
      return;
    }
    load(found);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
    };
    const saved = editId ? await update(editId, body) : await create(body);
    if (saved) {
      const token = String((saved as { trackToken?: string }).trackToken ?? "");
      if (token) {
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        setLastShare({ lrNo: String((saved as { lrNo?: string }).lrNo || body.lrNo || ""), url: `${origin}/track/${token}` });
      }
      setEditId(null);
      const next = await api<{ value: string }>("/api/next-no?type=lr");
      setForm({
        deliveryAt: "DOOR",
        billAs: "Weight",
        gstPaidBy: "Consigner",
        lrType: "TBB",
        lrDate: new Date().toISOString().slice(0, 10),
        validDate: new Date().toISOString().slice(0, 10),
        lrNo: next.value,
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
      });
      await reload();
    }
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
      <PageHeader title="LR Booking" subtitle="Fill all the fields" crumbs={[{ label: "Home", href: "/dashboard" }, { label: "LR Booking" }]} />
      <Flash message={message} />
      {lastShare ? (
        <FormCard title="Customer track link" subtitle="Share this secret link on WhatsApp / SMS — full details without guessing LR numbers">
          <p style={{ marginBottom: 12, wordBreak: "break-all" }}>
            LR {lastShare.lrNo}: <a href={lastShare.url}>{lastShare.url}</a>
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() =>
                window.open(
                  `https://wa.me/?text=${encodeURIComponent(`Track your DPR Logistics shipment ${lastShare.lrNo}: ${lastShare.url}`)}`,
                  "_blank",
                )
              }
            >
              WhatsApp
            </Button>
            <Button
              type="button"
              variant="teal"
              onClick={() => {
                window.location.href = `sms:?body=${encodeURIComponent(`Track your DPR Logistics shipment ${lastShare.lrNo}: ${lastShare.url}`)}`;
              }}
            >
              SMS
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(lastShare.url);
                  setMessage({ type: "ok", text: "Track link copied" });
                } catch {
                  setMessage({ type: "err", text: lastShare.url });
                }
              }}
            >
              Copy link
            </Button>
          </div>
        </FormCard>
      ) : null}
      <AdminForm onSubmit={onSubmit}>
        <FormCard>
          <TwoCol>
            <div>
              <InputField label="Booking From" name="bookingFrom" value={form.bookingFrom ?? ""} onChange={(e) => setForm({ ...form, bookingFrom: e.target.value })} />
              <InputField label="LR No" name="lrNo" value={form.lrNo ?? ""} onChange={(e) => setForm({ ...form, lrNo: e.target.value })} required />
              <InputField label="LR Date" type="date" name="lrDate" value={form.lrDate ?? ""} onChange={(e) => setForm({ ...form, lrDate: e.target.value })} />
              <InputField label="From Station" name="fromStation" value={form.fromStation ?? ""} onChange={(e) => setForm({ ...form, fromStation: e.target.value })} placeholder="Type station name" />
              <InputField label="To Station" name="toStation" value={form.toStation ?? ""} onChange={(e) => setForm({ ...form, toStation: e.target.value })} placeholder="Type station name" />
              <InputField label="Veh No" name="vehNo" value={form.vehNo ?? ""} onChange={(e) => setForm({ ...form, vehNo: e.target.value })} placeholder="e.g. MH-15-GH-4455" />
              <SelectField label="Delivery At" name="deliveryAt" value={form.deliveryAt ?? "DOOR"} onChange={(e) => setForm({ ...form, deliveryAt: e.target.value })} options={["DOOR", "GODOWN"]} />
              <DatalistField label="Billing Party" name="billingParty" value={form.billingParty ?? ""} onChange={(e) => setForm({ ...form, billingParty: e.target.value })} options={partyNames} placeholder="Type or pick party" listId="lr-party-billing" />
              <DatalistField label="Consignor" name="consignor" value={form.consignor ?? ""} onChange={(e) => setForm({ ...form, consignor: e.target.value })} options={partyNames} placeholder="Type or pick party" listId="lr-party-consignor" />
            </div>
            <div>
              <DatalistField label="Consignee" name="consignee" value={form.consignee ?? ""} onChange={(e) => setForm({ ...form, consignee: e.target.value })} options={partyNames} placeholder="Type or pick party" listId="lr-party-consignee" />
              <InputField label="No. of Articles" name="articles" value={form.articles ?? ""} onChange={(e) => setForm({ ...form, articles: e.target.value })} />
              <InputField label="Particulars" name="particulars" value={form.particulars ?? ""} onChange={(e) => setForm({ ...form, particulars: e.target.value })} />
              <InputField label="Inv.No. & Date" name="invNoDate" value={form.invNoDate ?? ""} onChange={(e) => setForm({ ...form, invNoDate: e.target.value })} />
              <InputField label="Act. Weight" name="actWeight" value={form.actWeight ?? ""} onChange={(e) => setForm({ ...form, actWeight: e.target.value })} />
              <InputField label="Charged Weight" name="chargedWeight" value={form.chargedWeight ?? ""} onChange={(e) => setForm({ ...form, chargedWeight: e.target.value })} />
              <InputField label="Rate" name="rate" value={form.rate ?? ""} onChange={(e) => setForm({ ...form, rate: e.target.value })} />
              <SelectField label="Bill As" name="billAs" value={form.billAs ?? "Weight"} onChange={(e) => setForm({ ...form, billAs: e.target.value })} options={["Weight", "Mtr", "Package"]} />
              <InputField label="Total Meter" name="totalMeter" value={form.totalMeter ?? ""} onChange={(e) => setForm({ ...form, totalMeter: e.target.value })} />
            </div>
          </TwoCol>
        </FormCard>

        <FormCard>
          <TwoCol>
            <div>
              {chargeKeys.map((key) => (
                <MoneyField
                  key={key}
                  label={chargeLabels[key]}
                  value={form[key] ?? 0}
                  onChange={(n) => setForm({ ...form, [key]: n })}
                />
              ))}
            </div>
            <div>
              <MoneyField label="Total" value={total} readOnly />
              <MoneyField label="GST" value={form.gst ?? 0} onChange={(gst) => setForm({ ...form, gst })} />
              <MoneyField label="Grand Total" value={grandTotal} readOnly />
              <SelectField label="GST Paid By" name="gstPaidBy" value={form.gstPaidBy ?? "Consigner"} onChange={(e) => setForm({ ...form, gstPaidBy: e.target.value })} options={["Consigner", "Consignee", "Company", "Broker"]} placeholder="" />
              <InputField label="E Way Bill No" name="ewayBill" value={form.ewayBill ?? ""} onChange={(e) => setForm({ ...form, ewayBill: e.target.value })} />
              <DateField label="Valid Date" value={form.validDate ?? ""} onChange={(validDate) => setForm({ ...form, validDate })} />
              <SelectField label="LR Type" name="lrType" value={form.lrType ?? "TBB"} onChange={(e) => setForm({ ...form, lrType: e.target.value })} options={["TBB", "ToPay", "Paid"]} placeholder="" />
              <InputField label="Value Rs." name="valueRs" value={form.valueRs ?? ""} onChange={(e) => setForm({ ...form, valueRs: e.target.value })} />
            </div>
          </TwoCol>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button type="submit" disabled={!!editId}>
              Save LR
            </Button>
            <Button type="button" variant="teal" disabled={!editId} onClick={() => editId && update(editId, { ...form, total, grandTotal })}>
              Update LR
            </Button>
            <Button type="button" variant="danger" disabled={!editId} onClick={() => editId && remove(editId).then((ok) => ok && setEditId(null))}>
              Delete LR
            </Button>
          </div>
        </FormCard>

        <FormCard>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <FieldWrap label="Enter LR No for Find">
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
              <div className="flex gap-2">
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
      </AdminForm>
    </>
  );
}

export default function LrBookingPage() {
  return (
    <Suspense fallback={<p>Loading booking form...</p>}>
      <LrBookingInner />
    </Suspense>
  );
}
