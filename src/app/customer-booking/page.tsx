"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { api } from "@/lib/api-client";
import { todayIso } from "@/lib/dates";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { company } from "@/data/marketing/company";
import "./public.css";

type FormState = {
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
  gst: number;
  gstPaidBy: string;
  ewayBill: string;
  validDate: string;
  lrType: string;
  valueRs: string;
};

const empty = (): FormState => ({
  bookingFrom: "",
  lrNo: "",
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
});

const moneyFields: { key: keyof FormState; label: string }[] = [
  { key: "freight", label: "Freight" },
  { key: "serviceTax", label: "Service Tax" },
  { key: "haltage", label: "Halting" },
  { key: "insurance", label: "Insurance" },
  { key: "stCharges", label: "St. Charges" },
  { key: "doorCollection", label: "Door Collection" },
  { key: "barrier", label: "Barrier" },
  { key: "other", label: "Other" },
  { key: "hamali", label: "Hamali" },
];

export default function CustomerBookingPage() {
  const [form, setForm] = useState<FormState>(empty);
  const [stations, setStations] = useState<string[]>([]);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api<{ lrNo: string; stations: string[] }>("/api/public/booking")
      .then((d) => {
        setStations(d.stations);
        setForm((f) => ({ ...f, lrNo: f.lrNo || d.lrNo }));
      })
      .catch(() => setMessage({ type: "err", text: "Unable to load booking form" }));
  }, []);

  const total = useMemo(
    () =>
      form.freight +
      form.serviceTax +
      form.haltage +
      form.insurance +
      form.stCharges +
      form.doorCollection +
      form.barrier +
      form.other +
      form.hamali,
    [form],
  );
  const grandTotal = total + form.gst;

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const saved = await api<{ lrNo: string }>("/api/public/booking", {
        method: "POST",
        body: JSON.stringify({ ...form, total, grandTotal }),
      });
      setMessage({ type: "ok", text: `Booking saved. LR No ${saved.lrNo}` });
      window.open(`/customer-booking/print?lrNo=${encodeURIComponent(saved.lrNo)}`, "_blank");
      const next = await api<{ lrNo: string; stations: string[] }>("/api/public/booking");
      setForm({ ...empty(), lrNo: next.lrNo });
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Save failed" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pub">
      <header className="pub-top">
        <Link href="/" className="pub-brand">
          <BrandLogo width={140} height={56} className="pub-brand-logo" />
        </Link>
        <nav className="pub-nav" aria-label="Public pages">
          <Link href="/tracking">Track Shipment</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/quote">Pickup Request</Link>
          <Link href="/tracking" className="pub-nav-accent">
            GC Tracking
          </Link>
        </nav>
        <Link href="/login" className="pub-login">
          Staff Sign In
        </Link>
      </header>

      <main className="pub-wrap">
        <div className="pub-head">
          <p className="pub-kicker">DPR Logistics — Public booking</p>
          <h1>LR Booking</h1>
          <p>
            Create a lorry receipt for your shipment. Fill in the details below and save to generate a printable LR copy.
            Need help? Call us at{" "}
            <a href={`tel:${company.phone.replace(/\s/g, "")}`}>{company.phone}</a>.
          </p>
          <div className="pub-help">
            <Link href="/tracking">Track existing shipment</Link>
            <Link href="/contact/care">Customer care</Link>
            <Link href="/">Back to website</Link>
          </div>
        </div>

        <form onSubmit={onSubmit}>
          <section className="pub-card">
            <h2>Shipment details</h2>
            <div className="pub-grid">
              <Field label="Booking From" value={form.bookingFrom} onChange={(v) => set("bookingFrom", v)} />
              <Field label="LR No" value={form.lrNo} readOnly />
              <Field label="LR Date" type="date" value={form.lrDate} onChange={(v) => set("lrDate", v)} />
              <Field label="From Station" value={form.fromStation} onChange={(v) => set("fromStation", v)} list="pub-stations" required />
              <Field label="To Station" value={form.toStation} onChange={(v) => set("toStation", v)} list="pub-stations" required />
              <Field label="Veh No" value={form.vehNo} onChange={(v) => set("vehNo", v)} />
              <Select label="Delivery At" value={form.deliveryAt} onChange={(v) => set("deliveryAt", v)} options={["DOOR", "GODOWN"]} />
              <Field label="Billing Party" value={form.billingParty} onChange={(v) => set("billingParty", v)} required />
              <Field label="Consignor" value={form.consignor} onChange={(v) => set("consignor", v)} required />
              <Field label="Consignee" value={form.consignee} onChange={(v) => set("consignee", v)} required />
              <Field label="No Of Articles" value={form.articles} onChange={(v) => set("articles", v)} />
              <Field label="Particulars" value={form.particulars} onChange={(v) => set("particulars", v)} />
              <Field label="Invoice & Date" value={form.invNoDate} onChange={(v) => set("invNoDate", v)} />
              <Field label="Act. Weight" value={form.actWeight} onChange={(v) => set("actWeight", v)} />
              <Field label="Charged Weight" value={form.chargedWeight} onChange={(v) => set("chargedWeight", v)} />
              <Field label="Rate" value={form.rate} onChange={(v) => set("rate", v)} />
              <Select label="Bill As" value={form.billAs} onChange={(v) => set("billAs", v)} options={["Weight", "Mtr", "Package"]} />
              <Field label="Total Meter" value={form.totalMeter} onChange={(v) => set("totalMeter", v)} />
            </div>
            <datalist id="pub-stations">
              {stations.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </section>

          <section className="pub-card">
            <h2>Charges &amp; billing</h2>
            <div className="pub-grid">
              {moneyFields.map((f) => (
                <Field
                  key={f.key}
                  label={f.label}
                  type="number"
                  step="0.01"
                  value={String(form[f.key])}
                  onChange={(v) => set(f.key, Number(v) || 0)}
                />
              ))}
              <Field label="Total" value={total.toFixed(2)} readOnly />
              <Field label="GST" type="number" step="0.01" value={String(form.gst)} onChange={(v) => set("gst", Number(v) || 0)} />
              <Field label="Grand Total" value={grandTotal.toFixed(2)} readOnly />
              <Select label="GST Paid By" value={form.gstPaidBy} onChange={(v) => set("gstPaidBy", v)} options={["Consigner", "Consignee", "Company", "Broker"]} />
              <Field label="E-Way Bill No" value={form.ewayBill} onChange={(v) => set("ewayBill", v)} />
              <Field label="Valid Date" type="date" value={form.validDate} onChange={(v) => set("validDate", v)} />
              <Select label="LR Type" value={form.lrType} onChange={(v) => set("lrType", v)} options={["TBB", "ToPay", "Paid"]} />
              <Field label="Value Rs." value={form.valueRs} onChange={(v) => set("valueRs", v)} />
            </div>
          </section>

          <button type="submit" className="pub-submit" disabled={saving}>
            {saving ? "Saving…" : "Save & Print LR"}
          </button>
          {message ? (
            <div className={`pub-flash ${message.type === "ok" ? "is-ok" : "is-err"}`} role="status">
              {message.text}
            </div>
          ) : null}
        </form>

        <footer className="pub-foot">
          <p>
            {company.name} · {company.address} ·{" "}
            <a href={`mailto:${company.email}`}>{company.email}</a> ·{" "}
            <a href={`tel:${company.phone.replace(/\s/g, "")}`}>{company.phone}</a>
          </p>
        </footer>
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  readOnly,
  list,
  step,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  type?: string;
  required?: boolean;
  readOnly?: boolean;
  list?: string;
  step?: string;
}) {
  return (
    <label className="pub-field">
      <span>{label}</span>
      <input
        type={type}
        step={step}
        value={value}
        required={required}
        readOnly={readOnly}
        list={list}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="pub-field">
      <span>{label}</span>
      <SearchSelect value={value} options={options} onChange={onChange} placeholder="" />
    </div>
  );
}
