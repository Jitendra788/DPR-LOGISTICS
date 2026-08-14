"use client";

import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { DateField, InputField, SelectField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { useCrud } from "@/hooks/useCrud";
import { api } from "@/lib/api-client";
import { todayIso } from "@/lib/dates";

type Vendor = { name: string };
type Row = { id: number; voucherNo: string; date: string; vendorName: string; amount: number; particulars: string; paymentType: string };

function outstandingOf(rows: Row[], name: string) {
  return rows
    .filter((r) => r.vendorName === name)
    .reduce((sum, r) => sum + (r.paymentType === "Dr" ? -r.amount : r.amount), 0);
}

export default function VendorVoucherPage() {
  const { rows, message, create, update, remove, setMessage } = useCrud<Row>("vendor-vouchers");
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [sr, setSr] = useState("835");
  const [form, setForm] = useState({
    vendorName: "",
    date: todayIso(),
    amount: 0,
    paymentType: "Cr",
    particulars: "",
  });

  useEffect(() => {
    api<Vendor[]>("/api/vendors").then(setVendors);
    api<{ sr: number }>("/api/next-no?type=vendor-voucher").then((d) => setSr(String(d.sr)));
  }, [rows]);

  const outstanding = form.vendorName ? outstandingOf(rows, form.vendorName) : 0;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const body = { ...form, voucherNo: String(editId ?? sr) };
    const saved = editId ? await update(editId, body) : await create(body);
    if (saved) {
      setEditId(null);
      setForm({ vendorName: "", date: todayIso(), amount: 0, paymentType: "Cr", particulars: "" });
    }
  }

  return (
    <>
      <PageHeader title="Vendor Voucher" subtitle="Fill all the fields" crumbs={[{ label: "Home", href: "/" }, { label: "Vendor Voucher" }]} />
      <Flash message={message} />
      <form onSubmit={onSubmit}>
        <FormCard>
          <TwoCol>
            <div>
              <InputField label="Sl No" value={editId ?? sr} readOnly />
              <SelectField label="Select Vendor" value={form.vendorName} onChange={(e) => setForm({ ...form, vendorName: e.target.value })} options={vendors.map((v) => v.name)} />
              <InputField label="Outstanding" value={outstanding.toFixed(2)} readOnly />
              <DateField label="Payment Date" value={form.date} onChange={(date) => setForm({ ...form, date })} />
            </div>
            <div>
              <InputField label="Payment Amount" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) || 0 })} />
              <SelectField label="Payment Type" value={form.paymentType} onChange={(e) => setForm({ ...form, paymentType: e.target.value })} options={["Cr", "Dr"]} placeholder="" />
              <InputField label="Narration" value={form.particulars} onChange={(e) => setForm({ ...form, particulars: e.target.value })} />
            </div>
          </TwoCol>
          <Button type="submit">Save Data</Button>
        </FormCard>
      </form>
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
                    vendorName: row.vendorName,
                    date: row.date,
                    amount: row.amount,
                    paymentType: row.paymentType || "Cr",
                    particulars: row.particulars,
                  });
                  setMessage({ type: "ok", text: `Loaded ${row.vendorName}` });
                }}
              >
                Update
              </Button>
            ),
          },
          { key: "delete", header: "Delete", render: (row) => <Button type="button" size="sm" variant="danger" onClick={() => remove(row.id)}>Delete</Button> },
          { key: "id", header: "Sl No" },
          { key: "vendorName", header: "Vendor Name" },
          { key: "amount", header: "Amount" },
          { key: "date", header: "Date" },
          { key: "particulars", header: "Narration" },
          { key: "paymentType", header: "Type" },
        ]}
      />
    </>
  );
}
