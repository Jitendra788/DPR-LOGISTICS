"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { DateField, ComboboxField, DropdownField, FieldWrap, InputField, MoneyField } from "@/components/ui/FormField";
import { LR_TYPES, normalizeLrType } from "@/lib/lr-type";
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
  cgstAmt: number;
  sgstAmt: number;
  igstAmt: number;
  grandTotal: number;
  gstPaidBy: string;
  ewayBill: string;
  validDate: string;
  lrType: string;
  valueRs: string;
  source?: string;
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
    cgstAmt: 0,
    sgstAmt: 0,
    igstAmt: 0,
    gst: 0,
  });
  const [parties, setParties] = useState<Party[]>([]);
  const partyNames = useMemo(() => parties.map((p) => p.name).filter(Boolean), [parties]);
  const [searchLr, setSearchLr] = useState("");
  const [printOpts, setPrintOpts] = useState({ consignor: true, lorry: false, consignee: false });
  const [email, setEmail] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [lastShare, setLastShare] = useState<{ lrNo: string; url: string } | null>(null);
  const lrOptions = useMemo(
    () => rows.filter((r) => (r.source || "DPR") !== "ROADWAYS").map((r) => r.lrNo).filter(Boolean),
    [rows],
  );

  function patchForm(patch: Partial<Booking>) {
    setForm((prev) => {
      const next = { ...prev, ...patch };
      const cgst = Number(next.cgstAmt) || 0;
      const sgst = Number(next.sgstAmt) || 0;
      const igst = Number(next.igstAmt) || 0;
      if ("cgstAmt" in patch || "sgstAmt" in patch || "igstAmt" in patch) {
        next.gst = Number((cgst + sgst + igst).toFixed(2));
      }
      return next;
    });
  }

  useEffect(() => {
    Promise.all([api<Party[]>("/api/parties"), api<{ value: string }>("/api/next-no?type=lr&source=DPR")]).then(([p, next]) => {
      setParties(p);
      setForm((f) => ({ ...f, lrNo: f.lrNo || next.value }));
    });
    void fetch("/api/mail/warmup", { method: "POST", credentials: "include" }).catch(() => {});
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
      ...row,
      cgstAmt: gstSplit > 0 ? cgst : Number(row.gst) || 0,
      sgstAmt: gstSplit > 0 ? sgst : 0,
      igstAmt: gstSplit > 0 ? igst : 0,
      gst: gstSplit > 0 ? gstSplit : Number(row.gst) || 0,
    });
    setMessage({ type: "ok", text: `Loaded LR ${row.lrNo}` });
  }

  function search() {
    const found = rows.find(
      (r) => lrNoEquals(r.lrNo, searchLr.trim()) && (r.source || "DPR") !== "ROADWAYS",
    );
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
      gst: gstTotal,
      cgstAmt: Number(form.cgstAmt) || 0,
      sgstAmt: Number(form.sgstAmt) || 0,
      igstAmt: Number(form.igstAmt) || 0,
      total,
      grandTotal,
      source: "DPR",
      lrType: normalizeLrType(form.lrType),
      billingParty: String(form.billingParty ?? "").trim(),
      consignor: String(form.consignor ?? "").trim(),
      consignee: String(form.consignee ?? "").trim(),
    };
    const saved = editId ? await update(editId, body) : await create(body);
    if (saved) {
      const token = String((saved as { trackToken?: string }).trackToken ?? "");
      if (token) {
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        setLastShare({ lrNo: String((saved as { lrNo?: string }).lrNo || body.lrNo || ""), url: `${origin}/track/${token}` });
      }
      setEditId(null);
      const next = await api<{ value: string }>("/api/next-no?type=lr&source=DPR");
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
        cgstAmt: 0,
        sgstAmt: 0,
        igstAmt: 0,
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
        timeoutMs: 50_000,
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
              <ComboboxField label="Delivery At" name="deliveryAt" value={form.deliveryAt ?? "DOOR"} onChange={(deliveryAt) => setForm({ ...form, deliveryAt })} options={["DOOR", "GODOWN"]} placeholder="Select delivery" />
              <ComboboxField label="Billing Party" name="billingParty" value={form.billingParty ?? ""} onChange={(billingParty) => setForm({ ...form, billingParty })} options={partyNames} placeholder="Search or select party" />
              <ComboboxField label="Consignor" name="consignor" value={form.consignor ?? ""} onChange={(consignor) => setForm({ ...form, consignor })} options={partyNames} placeholder="Search or select consignor" />
            </div>
            <div>
              <ComboboxField label="Consignee" name="consignee" value={form.consignee ?? ""} onChange={(consignee) => setForm({ ...form, consignee })} options={partyNames} placeholder="Search or select consignee" />
              <InputField label="No. of Articles" name="articles" value={form.articles ?? ""} onChange={(e) => setForm({ ...form, articles: e.target.value })} />
              <InputField label="Particulars" name="particulars" value={form.particulars ?? ""} onChange={(e) => setForm({ ...form, particulars: e.target.value })} />
              <InputField label="Inv.No. & Date" name="invNoDate" value={form.invNoDate ?? ""} onChange={(e) => setForm({ ...form, invNoDate: e.target.value })} />
              <InputField label="Act. Weight" name="actWeight" value={form.actWeight ?? ""} onChange={(e) => setForm({ ...form, actWeight: e.target.value })} />
              <InputField label="Charged Weight" name="chargedWeight" value={form.chargedWeight ?? ""} onChange={(e) => patchForm({ chargedWeight: e.target.value })} />
              <InputField label="Rate" name="rate" value={form.rate ?? ""} onChange={(e) => patchForm({ rate: e.target.value })} />
              <ComboboxField label="Bill As" name="billAs" value={form.billAs ?? "Weight"} onChange={(billAs) => patchForm({ billAs })} options={["Weight", "Mtr", "Package"]} placeholder="Select" />
              <InputField label="Total Meter" name="totalMeter" value={form.totalMeter ?? ""} onChange={(e) => patchForm({ totalMeter: e.target.value })} />
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
                  onChange={(n) => patchForm({ [key]: n })}
                />
              ))}
            </div>
            <div>
              <MoneyField label="Total" value={total} readOnly />
              <MoneyField label="CGST" value={form.cgstAmt ?? 0} onChange={(cgstAmt) => patchForm({ cgstAmt })} />
              <MoneyField label="SGST" value={form.sgstAmt ?? 0} onChange={(sgstAmt) => patchForm({ sgstAmt })} />
              <MoneyField label="IGST" value={form.igstAmt ?? 0} onChange={(igstAmt) => patchForm({ igstAmt })} />
              <MoneyField label="GST Total" value={gstTotal} readOnly />
              <MoneyField label="Grand Total" value={grandTotal} readOnly />
              <ComboboxField label="GST Paid By" name="gstPaidBy" value={form.gstPaidBy ?? "Consigner"} onChange={(gstPaidBy) => patchForm({ gstPaidBy })} options={["Consigner", "Consignee", "Company", "Broker"]} placeholder="Select" />
              <InputField label="E Way Bill No" name="ewayBill" value={form.ewayBill ?? ""} onChange={(e) => patchForm({ ewayBill: e.target.value })} />
              <DateField label="Valid Date" value={form.validDate ?? ""} onChange={(validDate) => patchForm({ validDate })} />
              <DropdownField label="LR Type" name="lrType" value={form.lrType ?? "TBB"} onChange={(e) => patchForm({ lrType: e.target.value })} options={[...LR_TYPES]} />
              <InputField label="Value Rs." name="valueRs" value={form.valueRs ?? ""} onChange={(e) => patchForm({ valueRs: e.target.value })} />
            </div>
          </TwoCol>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button type="submit" disabled={!!editId}>
              Save LR
            </Button>
            <Button type="button" variant="teal" disabled={!editId} onClick={() => editId && update(editId, { ...form, gst: gstTotal, cgstAmt: Number(form.cgstAmt) || 0, sgstAmt: Number(form.sgstAmt) || 0, igstAmt: Number(form.igstAmt) || 0, total, grandTotal, lrType: normalizeLrType(form.lrType), billingParty: String(form.billingParty ?? "").trim(), consignor: String(form.consignor ?? "").trim(), consignee: String(form.consignee ?? "").trim() })}>
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
              <div className="mt-3 erp-copy-checks flex flex-wrap gap-4 text-sm">
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
              <div className="erp-print-actions flex gap-2">
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

export default function LrBookingPage() {
  return (
    <Suspense fallback={<p>Loading booking form...</p>}>
      <LrBookingInner />
    </Suspense>
  );
}
