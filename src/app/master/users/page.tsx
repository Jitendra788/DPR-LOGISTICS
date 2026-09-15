"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  LayoutGrid,
  Pencil,
  Plus,
  Shield,
  ShieldCheck,
  UserRound,
  Users,
  Wifi,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { InputField, ComboboxField, PasswordField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { AdminForm } from "@/components/ui/AdminForm";
import { useCrud } from "@/hooks/useCrud";
import { api, formToObject } from "@/lib/api-client";
import {
  ALL_MODULE_KEYS,
  APP_MODULES,
  parseAllowedModules,
  serializeAllowedModules,
  type ModuleKey,
} from "@/lib/modules";

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
  allowedModules?: string;
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

const BRANCH_OPTIONS = ["DPR Logistics", "Delhi", "Surat", "Punjab Roadways", "HO"];
const ROLE_OPTIONS = ["Admin", "Booking", "Accounts", "Operator"];

function modulesFromUser(row?: Partial<User> | null): ModuleKey[] {
  if (String(row?.role || "").toLowerCase() === "admin") return [...ALL_MODULE_KEYS];
  const parsed = parseAllowedModules(row?.allowedModules);
  if (parsed === "*") return [...ALL_MODULE_KEYS];
  return parsed;
}

function roleTone(role: string) {
  const r = role.toLowerCase();
  if (r === "admin") return "admin";
  if (r === "booking") return "booking";
  if (r === "accounts") return "accounts";
  return "operator";
}

export default function UserCreationPage() {
  const { rows, message, create, update, remove, setMessage } = useCrud<User>("users");
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<User>>({ role: "Operator", branch: "DPR Logistics", status: "Active" });
  const [modules, setModules] = useState<ModuleKey[]>(["dashboard"]);
  const [online, setOnline] = useState<OnlineUser[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpMobileMasked, setOtpMobileMasked] = useState("******2142");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [savedPassword, setSavedPassword] = useState("");

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

  const stats = useMemo(() => {
    const active = rows.filter((r) => String(r.status).toLowerCase() === "active").length;
    const inactive = rows.length - active;
    const admins = rows.filter((r) => String(r.role).toLowerCase() === "admin").length;
    return { total: rows.length, active, inactive, admins, online: onlineCount };
  }, [rows, onlineCount]);

  function load(row: User) {
    const plain = String(row.password ?? "");
    setEditId(row.id);
    setForm({ ...row, password: plain });
    setSavedPassword(plain);
    setModules(modulesFromUser(row));
    setOtp("");
    setOtpSent(false);
    setMessage({
      type: "ok",
      text: plain
        ? `Editing ${row.username}`
        : `Editing ${row.username} — set password once to show it next time.`,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm(e?: FormEvent<HTMLFormElement>) {
    setEditId(null);
    setOtp("");
    setOtpSent(false);
    setSavedPassword("");
    setModules(["dashboard"]);
    setForm({ role: "Operator", branch: "DPR Logistics", status: "Active", password: "" });
    e?.currentTarget.reset();
  }

  function cancelEdit() {
    resetForm();
    setMessage({ type: "ok", text: "Edit cancelled — ready for new user." });
  }

  function toggleModule(key: ModuleKey) {
    setModules((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  function setRole(role: string) {
    setForm((prev) => ({ ...prev, role }));
    if (role.toLowerCase() === "admin") setModules([...ALL_MODULE_KEYS]);
  }

  async function sendPasswordOtp() {
    if (!editId) {
      setMessage({ type: "err", text: "Open a user with Update first, then send OTP to change password." });
      return;
    }
    const next = String(form.password ?? "").trim();
    if (!next) {
      setMessage({ type: "err", text: "Enter new password first, then send OTP." });
      return;
    }
    if (next === savedPassword) {
      setMessage({ type: "err", text: "Password same as current. Change it before sending OTP." });
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
    const body = { ...form, ...formToObject(e.currentTarget) } as Partial<User> & { otp?: string };
    const typedPassword = String(body.password ?? "").trim();
    const passwordChanged = Boolean(editId && typedPassword && typedPassword !== savedPassword);
    const passwordEntered = Boolean(typedPassword);

    if (editId && (!typedPassword || typedPassword === savedPassword)) {
      delete body.password;
    }

    const isAdmin = String(body.role || "").toLowerCase() === "admin";
    if (!isAdmin && modules.length === 0) {
      setMessage({ type: "err", text: "Select at least one sidebar module for this user." });
      return;
    }
    body.allowedModules = isAdmin ? "*" : serializeAllowedModules(modules);

    if (passwordChanged) {
      if (!otpSent || !String(otp).trim()) {
        setMessage({ type: "err", text: "Password change needs OTP. Send OTP to ******2142 and enter it." });
        return;
      }
      body.otp = String(otp).trim();
    }

    if (!editId && !passwordEntered) {
      setMessage({ type: "err", text: "Password required for new user." });
      return;
    }

    const saved = editId ? await update(editId, body) : await create(body);
    if (!saved) return;

    const result = saved as User & { forceLogout?: boolean; passwordChanged?: boolean };
    if (result.forceLogout) {
      window.location.assign("/login");
      return;
    }
    if (editId && passwordChanged) {
      setMessage({
        type: "ok",
        text: "Password updated — user logged out everywhere. They must login again.",
      });
      void loadOnline();
    } else if (editId) {
      setMessage({
        type: "ok",
        text: "User updated. If modules changed, that user must login again.",
      });
    }
    resetForm(e);
  }

  const showOtpStep = Boolean(editId && String(form.password ?? "").trim() && String(form.password ?? "") !== savedPassword);
  const isAdminForm = String(form.role || "").toLowerCase() === "admin";
  const masterMods = APP_MODULES.filter((m) => m.group === "Master Data");
  const otherMods = APP_MODULES.filter((m) => !m.group);
  const selectedCount = isAdminForm ? ALL_MODULE_KEYS.length : modules.length;

  return (
    <div className="users-admin">
      <PageHeader
        title="User Creation"
        subtitle="Create logins, roles, branches and sidebar module access"
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "User Creation" }]}
      />
      <Flash message={message} />

      <section className="users-stat-grid" aria-label="User summary">
        <article className="users-stat tone-total">
          <span className="users-stat-ico" aria-hidden>
            <Users className="h-4 w-4" />
          </span>
          <div>
            <p className="users-stat-label">Total users</p>
            <p className="users-stat-value">{stats.total}</p>
          </div>
        </article>
        <article className="users-stat tone-online">
          <span className="users-stat-ico" aria-hidden>
            <Wifi className="h-4 w-4" />
          </span>
          <div>
            <p className="users-stat-label">Online now</p>
            <p className="users-stat-value">{stats.online}</p>
          </div>
        </article>
        <article className="users-stat tone-active">
          <span className="users-stat-ico" aria-hidden>
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div>
            <p className="users-stat-label">Active</p>
            <p className="users-stat-value">{stats.active}</p>
          </div>
        </article>
        <article className="users-stat tone-admin">
          <span className="users-stat-ico" aria-hidden>
            <Shield className="h-4 w-4" />
          </span>
          <div>
            <p className="users-stat-label">Admins</p>
            <p className="users-stat-value">{stats.admins}</p>
          </div>
        </article>
      </section>

      <FormCard title="Live sessions" subtitle="Active in the last 5 minutes" className="users-online-card">
        {online.length ? (
          <ul className="users-online-list">
            {online.map((user) => (
              <li key={user.id} className="users-online-chip">
                <span className="users-online-avatar" aria-hidden>
                  {(user.name || user.username || "?").slice(0, 1).toUpperCase()}
                </span>
                <span className="users-online-meta">
                  <strong>
                    {user.name || user.username}
                    {user.isYou ? " · you" : ""}
                  </strong>
                  <small>
                    {user.role} · {user.branch || "—"}
                  </small>
                </span>
                <span className="users-online-live">Live</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="users-online-empty">No users online right now.</p>
        )}
      </FormCard>

      <AdminForm onSubmit={onSubmit} className="users-form">
        <FormCard
          title={editId ? "Update user" : "Create new user"}
          subtitle={editId ? `Editing #${editId}` : "Fill account details, then assign sidebar modules"}
          className="users-form-card"
        >
          {editId ? (
            <div className="users-edit-banner">
              <span>
                <Pencil className="h-3.5 w-3.5" aria-hidden />
                Editing <strong>{form.username || "user"}</strong>
              </span>
              <button type="button" className="users-edit-cancel" onClick={cancelEdit}>
                <X className="h-3.5 w-3.5" />
                Cancel edit
              </button>
            </div>
          ) : null}

          <div className="users-section">
            <div className="users-section-head">
              <UserRound className="h-4 w-4" aria-hidden />
              <div>
                <h3>Account</h3>
                <p>Login credentials and contact</p>
              </div>
            </div>
            <TwoCol>
              <div>
                <InputField label="Username" name="username" value={form.username ?? ""} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
                <PasswordField
                  label="Password"
                  name="password"
                  value={form.password ?? ""}
                  defaultShow
                  onChange={(e) => {
                    setForm({ ...form, password: e.target.value });
                    setOtpSent(false);
                    setOtp("");
                  }}
                  required={!editId}
                  placeholder={editId ? (savedPassword ? "" : "Set password to show next time") : "Create a strong password"}
                  autoComplete="new-password"
                />
                {showOtpStep ? (
                  <div className="password-otp-box">
                    <p className="password-otp-hint">
                      OTP only on phone <strong>9371662142</strong> via Fast2SMS Quick SMS (~₹5).
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
                <ComboboxField label="Role" name="role" value={form.role ?? ""} onChange={setRole} options={ROLE_OPTIONS} placeholder="Select role" />
                <ComboboxField label="Branch" name="branch" value={form.branch ?? ""} onChange={(branch) => setForm({ ...form, branch })} options={BRANCH_OPTIONS} placeholder="Select branch" />
                <ComboboxField label="Status" name="status" value={form.status ?? "Active"} onChange={(status) => setForm({ ...form, status })} options={["Active", "Inactive"]} placeholder="Select status" />
              </div>
            </TwoCol>
          </div>

          <div className="users-section users-section-modules">
            <div className="users-section-head">
              <LayoutGrid className="h-4 w-4" aria-hidden />
              <div>
                <h3>Sidebar access</h3>
                <p>
                  {isAdminForm
                    ? "Admin gets every module including User Creation"
                    : `${selectedCount} module${selectedCount === 1 ? "" : "s"} selected · User Creation is Admin-only`}
                </p>
              </div>
              {!isAdminForm ? (
                <div className="users-module-actions">
                  <Button type="button" size="sm" variant="teal" onClick={() => setModules([...ALL_MODULE_KEYS])}>
                    Select all
                  </Button>
                  <Button type="button" size="sm" variant="secondary" onClick={() => setModules(["dashboard"])}>
                    Dashboard only
                  </Button>
                </div>
              ) : null}
            </div>

            {isAdminForm ? (
              <div className="users-admin-full">
                <ShieldCheck className="h-5 w-5" aria-hidden />
                <div>
                  <strong>Full access enabled</strong>
                  <p>Admin role always includes User Creation and every sidebar module.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="users-admin-lock">
                  <Shield className="h-4 w-4" aria-hidden />
                  <span>
                  <strong>User Creation</strong> — Admin only · <strong>Data Backup</strong> — Admin only
                </span>
                </div>

                <div className="users-module-block">
                  <p className="users-module-block-title">Master Data</p>
                  <div className="users-module-chips">
                    {masterMods.map((mod) => {
                      const on = modules.includes(mod.key);
                      return (
                        <button
                          key={mod.key}
                          type="button"
                          className={`users-module-chip ${on ? "is-on" : ""}`}
                          onClick={() => toggleModule(mod.key)}
                          aria-pressed={on}
                        >
                          {on ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                          {mod.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="users-module-block">
                  <p className="users-module-block-title">Other modules</p>
                  <div className="users-module-chips">
                    {otherMods.map((mod) => {
                      const on = modules.includes(mod.key);
                      return (
                        <button
                          key={mod.key}
                          type="button"
                          className={`users-module-chip ${on ? "is-on" : ""}`}
                          onClick={() => toggleModule(mod.key)}
                          aria-pressed={on}
                        >
                          {on ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                          {mod.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="users-form-actions">
            {editId ? (
              <Button type="button" variant="secondary" onClick={cancelEdit}>
                Cancel
              </Button>
            ) : null}
            <Button type="submit">{editId ? "Update User" : "Create User"}</Button>
          </div>
        </FormCard>
      </AdminForm>

      <FormCard title="All users" subtitle="Search, update or remove login accounts" className="users-table-card">
        <DataTable
          rows={rows}
          columns={[
            {
              key: "view",
              header: "Update",
              render: (row) => (
                <Button type="button" size="sm" variant="teal" onClick={() => load(row)}>
                  Update
                </Button>
              ),
            },
            {
              key: "delete",
              header: "Delete",
              render: (row) => (
                <Button type="button" size="sm" variant="danger" onClick={() => remove(row.id)}>
                  Delete
                </Button>
              ),
            },
            { key: "id", header: "Sr" },
            {
              key: "username",
              header: "User",
              render: (row) => (
                <div className="users-cell-user">
                  <span className="users-cell-avatar" aria-hidden>
                    {(row.name || row.username || "?").slice(0, 1).toUpperCase()}
                  </span>
                  <span>
                    <strong>{row.username}</strong>
                    <small>{row.name}</small>
                  </span>
                </div>
              ),
            },
            { key: "mobile", header: "Mobile" },
            {
              key: "role",
              header: "Role",
              render: (row) => <span className={`users-badge role-${roleTone(row.role)}`}>{row.role}</span>,
            },
            {
              key: "allowedModules",
              header: "Modules",
              render: (row) => {
                const list = modulesFromUser(row);
                const all = String(row.role).toLowerCase() === "admin" || parseAllowedModules(row.allowedModules) === "*";
                return <span className="users-mod-pill">{all ? "All access" : `${list.length} modules`}</span>;
              },
            },
            { key: "branch", header: "Branch" },
            {
              key: "status",
              header: "Status",
              render: (row) => (
                <span className={`users-status ${String(row.status).toLowerCase() === "active" ? "is-active" : "is-inactive"}`}>
                  {row.status}
                </span>
              ),
            },
          ]}
        />
      </FormCard>
    </div>
  );
}
