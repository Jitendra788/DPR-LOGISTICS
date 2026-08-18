"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { DateField, InputField, ManualNumberField, SelectField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { useCrud } from "@/hooks/useCrud";
import { api } from "@/lib/api-client";
import { isoToDisplay, todayIso } from "@/lib/dates";

type Party = { name: string };
type Slip = {
  id: number;
  slipNo: string;
  partyName: string;
  lorryNo: string;
  fromStation: string;
  toStation: string;
  receiptDate: string;
  guaranteeWeight: string;
  freight: number;
  advance: number;
  balance: number;
  receiptNo: string;
  remark: string;
  mailId: string;
};

const emptyForm = {
  partyName: "",
  lorryNo: "",
  fromStation: "",
  toStation: "",
  receiptDate: todayIso(),
  guaranteeWeight: "",
  freight: 0,
  advance: 0,
  receiptNo: "",
  remark: "",
  mailId: "",
};

export default function BookingSlipPage() {
  const { rows, message, create, update, remove, setMessage } = useCrud<Slip>("slips");
  const [parties, setParties] = useState<Party[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [nextSr, setNextSr] = useState("");
  const [form, setForm] = useState(emptyForm);
  const tableRef = useRef<HTMLDivElement>(null);

  const balance = useMemo(() => Number((form.freight - form.advance).toFixed(2)), [form.freight, form.advance]);

  useEffect(() => {
    api<Party[]>("/api/parties").then(setParties).catch(() => setParties([]));
    api<{ sr: number; receiptNo: string }>("/api/next-no?type=slip").then((d) => {
      setNextSr(String(d.sr));
      setForm((f) => ({ ...f, receiptNo: f.receiptNo || d.receiptNo }));
    });
  }, []);

  function resetForm(nextReceipt?: string) {
    setEditId(null);
    setForm({
      ...emptyForm,
      receiptDate: todayIso(),
      receiptNo: nextReceipt ?? String(Number(form.receiptNo || 0) + 1),
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const body = {
      ...form,
      vehNo: form.lorryNo,
      date: form.receiptDate,
      amount: form.freight,
      balance,
      slipNo: editId ? rows.find((r) => r.id === editId)?.slipNo || nextSr : nextSr,
    };
    const saved = editId ? await update(editId, body) : await create(body);
    if (!saved) return;
    const nxt = await api<{ sr: number; receiptNo: string }>("/api/next-no?type=slip");
    setNextSr(String(nxt.sr));
    setEditId(null);
    setForm({
      ...emptyForm,
      receiptDate: todayIso(),
      receiptNo: nxt.receiptNo,
    });
  }

  function load(row: Slip) {
    setEditId(row.id);
    setForm({
      partyName: row.partyName || "",
      lorryNo: row.lorryNo || "",
      fromStation: row.fromStation || "",
      toStation: row.toStation || "",
      receiptDate: row.receiptDate || todayIso(),
      guaranteeWeight: row.guaranteeWeight || "",
      freight: row.freight || 0,
      advance: row.advance || 0,
      receiptNo: row.receiptNo || "",
      remark: row.remark || "",
      mailId: row.mailId || "",
    });
    setMessage({ type: "ok", text: `Loaded slip ${row.receiptNo || row.slipNo}` });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteRow(row: Slip) {
    const ok = await remove(row.id);
    if (ok && editId === row.id) resetForm(form.receiptNo);
  }

  function printRow(row: Slip) {
    window.open(`/roadways/booking-slip/print?id=${row.id}`, "_blank");
  }

  function sendMail() {
    if (!form.mailId) {
      setMessage({ type: "err", text: "Enter Mail Id" });
      return;
    }
    const subject = encodeURIComponent(`Booking Slip ${form.receiptNo || nextSr}`);
    const body = encodeURIComponent(
      `Sr No: ${nextSr}\nReceipt No: ${form.receiptNo}\nParty: ${form.partyName}\nLorry No: ${form.lorryNo}\nFrom: ${form.fromStation}\nTo: ${form.toStation}\nDate: ${isoToDisplay(form.receiptDate)}\nWeight: ${form.guaranteeWeight}\nFreight: ${form.freight}\nAdvance: ${form.advance}\nBalance: ${balance}\nRemark: ${form.remark}`,
    );
    window.location.href = `mailto:${form.mailId}?subject=${subject}&body=${body}`;
  }

  return (
    <>
      <PageHeader
        title="Booking Slip"
        subtitle="Fill all the fields"
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Booking Slip" }]}
      />
      <Flash message={message} />
      <form onSubmit={onSubmit}>
        <FormCard>
          <TwoCol>
            <div>
              <InputField label="Sr No." value={nextSr} readOnly />
              <SelectField
                label="Enter Party Name"
                value={form.partyName}
                onChange={(e) => setForm({ ...form, partyName: e.target.value })}
                options={parties.map((p) => p.name)}
              />
              <InputField label="Lorry No" value={form.lorryNo} onChange={(e) => setForm({ ...form, lorryNo: e.target.value })} />
              <InputField label="From" value={form.fromStation} onChange={(e) => setForm({ ...form, fromStation: e.target.value })} />
              <InputField label="To" value={form.toStation} onChange={(e) => setForm({ ...form, toStation: e.target.value })} />
            </div>
            <div>
              <DateField label="Receipt Date" value={form.receiptDate} onChange={(receiptDate) => setForm({ ...form, receiptDate })} />
              <InputField label="Guarantee Weight" value={form.guaranteeWeight} onChange={(e) => setForm({ ...form, guaranteeWeight: e.target.value })} />
              <ManualNumberField label="Freight" value={form.freight} onChange={(freight) => setForm({ ...form, freight })} />
              <ManualNumberField label="Advance" value={form.advance} onChange={(advance) => setForm({ ...form, advance })} />
              <ManualNumberField label="Balance" value={balance} readOnly />
              <InputField label="Receipt No." value={form.receiptNo} onChange={(e) => setForm({ ...form, receiptNo: e.target.value })} />
              <InputField label="Remark" value={form.remark} onChange={(e) => setForm({ ...form, remark: e.target.value })} />
            </div>
          </TwoCol>
          <div className="mt-1 flex flex-wrap gap-2">
            <Button type="submit">{editId ? "Update Data" : "Save Data"}</Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => tableRef.current?.scrollIntoView({ behavior: "smooth" })}
            >
              View Booking Slip Report
            </Button>
          </div>
          <div className="mt-4 max-w-md">
            <InputField label="Enter Mail Id" type="email" value={form.mailId} onChange={(e) => setForm({ ...form, mailId: e.target.value })} />
            <Button type="button" variant="teal" onClick={sendMail}>
              Send Mail
            </Button>
          </div>
        </FormCard>
      </form>

      <div ref={tableRef} className="mt-4">
        <DataTable
          rows={rows.map((r, i) => ({ ...r, srNo: i + 1 }))}
          columns={[
            {
              key: "view",
              header: "View",
              render: (row) => (
                <Button type="button" size="sm" variant="teal" onClick={() => load(row)}>
                  View
                </Button>
              ),
            },
            {
              key: "del",
              header: "Delete",
              render: (row) => (
                <Button type="button" size="sm" variant="danger" onClick={() => deleteRow(row)}>
                  Delete
                </Button>
              ),
            },
            {
              key: "print",
              header: "Print",
              render: (row) => (
                <Button type="button" size="sm" onClick={() => printRow(row)}>
                  Print
                </Button>
              ),
            },
            { key: "srNo", header: "Sr No" },
            { key: "partyName", header: "Party Name" },
            { key: "lorryNo", header: "Lorry No" },
            { key: "fromStation", header: "From" },
            { key: "toStation", header: "To" },
            { key: "receiptNo", header: "Receipt No" },
            { key: "receiptDate", header: "Receipt Date", render: (row) => isoToDisplay(row.receiptDate) || row.receiptDate },
            { key: "guaranteeWeight", header: "Weight" },
            { key: "freight", header: "Freight" },
            { key: "advance", header: "Advance" },
            { key: "balance", header: "Balance" },
            { key: "remark", header: "Remark" },
          ]}
        />
      </div>
    </>
  );
}
