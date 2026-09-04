"use client";

import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { DateField, InputField, ComboboxField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { AdminForm } from "@/components/ui/AdminForm";
import { useCrud } from "@/hooks/useCrud";
import { api } from "@/lib/api-client";
import { todayIso } from "@/lib/dates";

type Driver = { name: string };
type Row = { id: number; voucherNo: string; date: string; driverName: string; amount: number; particulars: string; paymentType: string };

function outstandingOf(rows: Row[], name: string) {
  return rows
    .filter((r) => r.driverName === name)
    .reduce((sum, r) => sum + (r.paymentType === "Dr" ? -r.amount : r.amount), 0);
}

export default function DriverVoucherPage() {
  const { rows, message, create, update, remove, setMessage } = useCrud<Row>("driver-vouchers");
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [sr, setSr] = useState("1");
  const [form, setForm] = useState({
    driverName: "",
    date: todayIso(),
    amount: 0,
    paymentType: "Cr",
    particulars: "",
  });

  useEffect(() => {
    api<Driver[]>("/api/drivers").then(setDrivers);
  }, []);

  useEffect(() => {
    api<{ sr: number }>("/api/next-no?type=driver-voucher").then((d) => setSr(String(d.sr)));
  }, [rows]);

  const outstanding = form.driverName ? outstandingOf(rows, form.driverName) : 0;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const body = {
      ...form,
      voucherNo: String(editId ?? sr),
    };
    const saved = editId ? await update(editId, body) : await create(body);
    if (saved) {
      setEditId(null);
      setForm({ driverName: "", date: todayIso(), amount: 0, paymentType: "Cr", particulars: "" });
    }
  }

  return (
    <>
      <PageHeader title="Driver Voucher" subtitle="Fill all the fields" crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Driver Voucher" }]} />
      <Flash message={message} />
      <AdminForm onSubmit={onSubmit}>
        <FormCard>
          <TwoCol>
            <div>
              <InputField label="Sr No." value={editId ?? sr} readOnly />
              <ComboboxField label="Select Driver" value={form.driverName} onChange={(driverName) => setForm({ ...form, driverName })} options={drivers.map((d) => d.name)} placeholder="Search or select driver" />
              <InputField label="Outstanding" value={outstanding.toFixed(2)} readOnly />
              <DateField label="Payment Date" value={form.date} onChange={(date) => setForm({ ...form, date })} />
            </div>
            <div>
              <InputField label="Amount Rs." value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) || 0 })} />
              <ComboboxField label="Payment Type" value={form.paymentType} onChange={(paymentType) => setForm({ ...form, paymentType })} options={["Cr", "Dr"]} placeholder="Select" />
              <InputField label="Narration" value={form.particulars} onChange={(e) => setForm({ ...form, particulars: e.target.value })} />
            </div>
          </TwoCol>
          <Button type="submit" variant="teal">
            Save Data
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
                    driverName: row.driverName,
                    date: row.date,
                    amount: row.amount,
                    paymentType: row.paymentType || "Cr",
                    particulars: row.particulars,
                  });
                  setMessage({ type: "ok", text: `Loaded ${row.driverName}` });
                }}
              >
                Update
              </Button>
            ),
          },
          { key: "delete", header: "Delete", render: (row) => <Button type="button" size="sm" variant="danger" onClick={() => remove(row.id)}>Delete</Button> },
          { key: "id", header: "Sr No" },
          { key: "driverName", header: "Driver Name" },
          { key: "amount", header: "Amount" },
          { key: "date", header: "Date" },
          { key: "particulars", header: "Narration" },
          { key: "paymentType", header: "Type" },
        ]}
      />
    </>
  );
}
