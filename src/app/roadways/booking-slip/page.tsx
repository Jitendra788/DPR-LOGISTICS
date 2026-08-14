"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { DateField, InputField, MoneyField, SelectField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { useCrud } from "@/hooks/useCrud";
import { api, downloadCsv } from "@/lib/api-client";
import { todayIso } from "@/lib/dates";

type Party = { name: string };
type Slip = {
  id: number;
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
  paid: boolean;
};

export default function BookingSlipPage() {
  const { rows, message, create, setMessage } = useCrud<Slip>("slips");
  const [parties, setParties] = useState<Party[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [nextSr, setNextSr] = useState("504");
  const [form, setForm] = useState({
    partyName: "",
    lorryNo: "",
    fromStation: "",
    toStation: "",
    receiptDate: todayIso(),
    guaranteeWeight: "",
    freight: 0,
    advance: 0,
    receiptNo: "438",
    remark: "",
    mailId: "",
  });

  const balance = useMemo(() => Number((form.freight - form.advance).toFixed(2)), [form.freight, form.advance]);

  useEffect(() => {
    api<Party[]>("/api/parties").then((p) => {
      setParties(p);
      setForm((f) => ({ ...f, partyName: f.partyName || p[0]?.name || "" }));
    });
    api<{ sr: number; receiptNo: string }>("/api/next-no?type=slip").then((d) => {
      setNextSr(String(d.sr));
      setForm((f) => ({ ...f, receiptNo: d.receiptNo }));
    });
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const saved = await create({
      ...form,
      vehNo: form.lorryNo,
      date: form.receiptDate,
      amount: form.freight,
      balance,
      slipNo: nextSr,
    });
    if (saved) {
      const next = Number(nextSr) + 1;
      setNextSr(String(next));
      setForm({
        partyName: parties[0]?.name || "",
        lorryNo: "",
        fromStation: "",
        toStation: "",
        receiptDate: todayIso(),
        guaranteeWeight: "",
        freight: 0,
        advance: 0,
        receiptNo: String(Number(form.receiptNo || 0) + 1),
        remark: "",
        mailId: "",
      });
    }
  }

  return (
    <>
      <PageHeader
        title="New Booking Slip Creation"
        subtitle="Fill all the fields"
        crumbs={[{ label: "Home", href: "/" }, { label: "Booking Slip" }]}
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
                placeholder=""
              />
              <InputField label="Lorry No" value={form.lorryNo} onChange={(e) => setForm({ ...form, lorryNo: e.target.value })} />
              <InputField label="From" value={form.fromStation} onChange={(e) => setForm({ ...form, fromStation: e.target.value })} />
              <InputField label="To" value={form.toStation} onChange={(e) => setForm({ ...form, toStation: e.target.value })} />
            </div>
            <div>
              <DateField label="Reciept Date" value={form.receiptDate} onChange={(receiptDate) => setForm({ ...form, receiptDate })} />
              <InputField label="Guarantee Weight" value={form.guaranteeWeight} onChange={(e) => setForm({ ...form, guaranteeWeight: e.target.value })} />
              <MoneyField label="Freight" value={form.freight} onChange={(freight) => setForm({ ...form, freight })} />
              <MoneyField label="Advance" value={form.advance} onChange={(advance) => setForm({ ...form, advance })} />
              <MoneyField label="Balance" value={balance} readOnly />
              <InputField label="Reciept No." value={form.receiptNo} onChange={(e) => setForm({ ...form, receiptNo: e.target.value })} />
              <InputField label="Remark" value={form.remark} onChange={(e) => setForm({ ...form, remark: e.target.value })} />
            </div>
          </TwoCol>
          <div className="mt-1 flex flex-wrap gap-2">
            <Button type="submit">Save Data</Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                setShowReport(true);
                setMessage({ type: "ok", text: `Showing ${rows.length} booking slip(s)` });
              }}
            >
              View Booking Slip Report
            </Button>
          </div>
          <div className="mt-4 max-w-md">
            <InputField label="Enter Mail Id" type="email" value={form.mailId} onChange={(e) => setForm({ ...form, mailId: e.target.value })} />
          </div>
        </FormCard>
      </form>
      {showReport ? (
        <>
          <FormCard>
            <Button type="button" onClick={() => downloadCsv("booking-slip-report.csv", rows as unknown as Record<string, unknown>[])}>
              Export to Excel
            </Button>
          </FormCard>
          <DataTable
            rows={rows}
            columns={[
              { key: "id", header: "Sr No" },
              { key: "partyName", header: "Party Name" },
              { key: "lorryNo", header: "Lorry No" },
              { key: "fromStation", header: "From" },
              { key: "toStation", header: "To" },
              { key: "receiptDate", header: "Reciept Date" },
              { key: "guaranteeWeight", header: "G. Weight" },
              { key: "freight", header: "Freight" },
              { key: "advance", header: "Advance" },
              { key: "balance", header: "Balance" },
              { key: "receiptNo", header: "Reciept No" },
              { key: "remark", header: "Remark" },
            ]}
          />
        </>
      ) : null}
    </>
  );
}
