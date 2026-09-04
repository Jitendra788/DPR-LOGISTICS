"use client";

import { FormEvent, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { InputField, ComboboxField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { AdminForm } from "@/components/ui/AdminForm";
import { useCrud } from "@/hooks/useCrud";
import { formToObject } from "@/lib/api-client";

type User = {
  id: number;
  username: string;
  password: string;
  name: string;
  mobile: string;
  email: string;
  role: string;
  branch: string;
  status: string;
};

export default function UserCreationPage() {
  const { rows, message, create, update, remove, setMessage } = useCrud<User>("users");
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<User>>({ role: "Operator", branch: "DPR Logistics", status: "Active" });

  function load(row: User) {
    setEditId(row.id);
    setForm({ ...row, password: "" });
    setMessage({ type: "ok", text: `Editing ${row.username}` });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = { ...form, ...formToObject(e.currentTarget) };
    if (editId && !body.password) delete body.password;
    const saved = editId ? await update(editId, body) : await create(body);
    if (saved) {
      setEditId(null);
      e.currentTarget.reset();
      setForm({ role: "Operator", branch: "DPR Logistics", status: "Active" });
    }
  }

  return (
    <>
      <PageHeader title="User Creation" subtitle="Create login users and assign roles" crumbs={[{ label: "Home", href: "/dashboard" }, { label: "User Creation" }]} />
      <Flash message={message} />
      <AdminForm onSubmit={onSubmit}>
        <FormCard title="User Details" subtitle="Create or update login credentials and role access">
          <TwoCol>
            <div>
              <InputField label="Username" name="username" value={form.username ?? ""} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
              <InputField label="Password" name="password" type="password" value={form.password ?? ""} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editId} placeholder={editId ? "Leave blank to keep" : ""} />
              <InputField label="Full Name" name="name" value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <InputField label="Mobile No." name="mobile" value={form.mobile ?? ""} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
            </div>
            <div>
              <InputField label="Email" name="email" type="email" value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <ComboboxField label="Role" name="role" value={form.role ?? ""} onChange={(role) => setForm({ ...form, role })} options={["Admin", "Booking", "Accounts", "Operator"]} placeholder="Select role" />
              <ComboboxField label="Branch" name="branch" value={form.branch ?? ""} onChange={(branch) => setForm({ ...form, branch })} options={["DPR Logistics", "Delhi", "Punjab Roadways"]} placeholder="Select branch" />
              <ComboboxField label="Status" name="status" value={form.status ?? "Active"} onChange={(status) => setForm({ ...form, status })} options={["Active", "Inactive"]} placeholder="Select status" />
            </div>
          </TwoCol>
          <Button type="submit">{editId ? "Update User" : "Save Data"}</Button>
        </FormCard>
      </AdminForm>
      <DataTable
        rows={rows}
        columns={[
          { key: "view", header: "Update", render: (row) => <Button type="button" size="sm" variant="teal" onClick={() => load(row)}>Update</Button> },
          { key: "delete", header: "Delete", render: (row) => <Button type="button" size="sm" variant="danger" onClick={() => remove(row.id)}>Delete</Button> },
          { key: "id", header: "Sr No" },
          { key: "username", header: "Username" },
          { key: "name", header: "Full Name" },
          { key: "mobile", header: "Mobile" },
          { key: "role", header: "Role" },
          { key: "branch", header: "Branch" },
          { key: "status", header: "Status" },
        ]}
      />
    </>
  );
}
