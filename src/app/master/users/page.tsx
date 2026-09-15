"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { InputField, ComboboxField, PasswordField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { AdminForm } from "@/components/ui/AdminForm";
import { useCrud } from "@/hooks/useCrud";
import { api, formToObject } from "@/lib/api-client";

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

type OnlineUser = {
  id: number;
  username: string;
  name: string;
  role: string;
  branch: string;
  lastSeenAt: string | null;
  isYou?: boolean;
};

export default function UserCreationPage() {
  const { rows, message, create, update, remove, setMessage } = useCrud<User>("users");
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<User>>({ role: "Operator", branch: "DPR Logistics", status: "Active" });
  const [online, setOnline] = useState<OnlineUser[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpMobileMasked, setOtpMobileMasked] = useState("******2142");
  const [sendingOtp, setSendingOtp] = useState(false);

  const loadOnline = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", { credentials: "include" });
      if (!res.ok) return;
      const data = (await res.json()) as { count?: number; users?: OnlineUser[] };
      setOnline(Array.isArray(data.users) ? data.users : []);
      setOnlineCount(Number(data.count) || 0);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void loadOnline();
    const id = window.setInterval(() => void loadOnline(), 30_000);
    return () => window.clearInterval(id);
  }, [loadOnline]);

  function load(row: User) {
    setEditId(row.id);
    setForm({ ...row, password: "" });
    setOtp("");
    setOtpSent(false);
    setMessage({ type: "ok", text: `Editing ${row.username}` });
  }

  function resetForm(e?: FormEvent<HTMLFormElement>) {
    setEditId(null);
    setOtp("");
    setOtpSent(false);
    setForm({ role: "Operator", branch: "DPR Logistics", status: "Active" });
    e?.currentTarget.reset();
  }

  async function sendPasswordOtp() {
    if (!editId) {
      setMessage({ type: "err", text: "Open a user with Update first, then send OTP to change password." });
      return;
    }
    if (!String(form.password ?? "").trim()) {
      setMessage({ type: "err", text: "Enter new password first, then send OTP." });
      return;
    }
    setSendingOtp(true);
    try {
      const res = await api<{
        ok: boolean;
        mobileMasked?: string;
        toMasked?: string;
        channel?: string;
        message?: string;
        devOtp?: string;
      }>("/api/auth/password-otp", {
        method: "POST",
        body: JSON.stringify({ userId: editId }),
      });
      setOtpSent(true);
      setOtpMobileMasked(res.toMasked || res.mobileMasked || "******2142");
      setMessage({
        type: "ok",
        text: res.devOtp
          ? `${res.message || "OTP sent"} (dev OTP: ${res.devOtp})`
          : res.message || `OTP sent to ${res.toMasked || res.mobileMasked}`,
      });
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Could not send OTP" });
    } finally {
      setSendingOtp(false);
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = { ...form, ...formToObject(e.currentTarget) };
    const passwordEntered = Boolean(String(body.password ?? "").trim());
    if (editId && !body.password) delete body.password;

    if (editId && passwordEntered) {
      if (!otpSent || !String(otp).trim()) {
        setMessage({ type: "err", text: "Send OTP to ******2142 and enter it before changing password." });
        return;
      }
      (body as Record<string, unknown>).otp = String(otp).trim();
    }

    const saved = editId ? await update(editId, body) : await create(body);
    if (!saved) return;

    const result = saved as User & { forceLogout?: boolean; passwordChanged?: boolean };
    if (result.forceLogout) {
      window.location.assign("/login");
      return;
    }
    if (editId && passwordEntered) {
      setMessage({
        type: "ok",
        text: "Password updated — user logged out everywhere. They must login again.",
      });
      void loadOnline();
    }
    resetForm(e);
  }

  const showOtpStep = Boolean(editId && String(form.password ?? "").trim());

  return (
    <>
      <PageHeader title="User Creation" subtitle="Create login users and assign roles" crumbs={[{ label: "Home", href: "/dashboard" }, { label: "User Creation" }]} />
      <Flash message={message} />

      <FormCard
        title={`Logged in users (${onlineCount})`}
        subtitle="Active in the last 5 minutes"
        className="online-users-card"
      >
        {online.length ? (
          <ul className="online-users-list">
            {online.map((user) => (
              <li key={user.id} className="online-users-chip">
                <span className="online-users-dot" aria-hidden="true" />
                <span>
                  {user.name || user.username}
                  {user.isYou ? " (you)" : ""}
                  <span style={{ opacity: 0.75 }}> · {user.role} · {user.branch || "—"}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="online-users-empty">No users online right now.</p>
        )}
      </FormCard>

      <AdminForm onSubmit={onSubmit}>
        <FormCard title="User Details" subtitle="Create or update login credentials and role access">
          <TwoCol>
            <div>
              <InputField label="Username" name="username" value={form.username ?? ""} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
              <PasswordField
                label="Password"
                name="password"
                value={form.password ?? ""}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  setOtpSent(false);
                  setOtp("");
                }}
                required={!editId}
                placeholder={editId ? "Leave blank to keep" : ""}
                autoComplete="new-password"
              />
              {showOtpStep ? (
                <div className="password-otp-box">
                  <p className="password-otp-hint">
                    OTP only on phone <strong>9371662142</strong> via Fast2SMS{" "}
                    Quick SMS (~₹5).
                    {otpSent ? (
                      <>
                        {" "}
                        Sent → <strong>{otpMobileMasked}</strong>
                      </>
                    ) : null}
                  </p>
                  <div className="password-otp-row">
                    <InputField
                      label="OTP"
                      name="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 8))}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="6-digit OTP"
                      required
                    />
                    <Button type="button" variant="teal" disabled={sendingOtp} onClick={() => void sendPasswordOtp()}>
                      {sendingOtp ? "Sending…" : otpSent ? "Resend OTP" : "Send OTP"}
                    </Button>
                  </div>
                </div>
              ) : null}
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
