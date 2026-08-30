"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock3,
  Copy,
  ExternalLink,
  Link2,
  MapPin,
  Play,
  Plus,
  Radio,
  RefreshCw,
  Satellite,
  Smartphone,
  Trash2,
  Truck,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { InputField } from "@/components/ui/FormField";
import { TwoCol } from "@/components/ui/FormCard";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { AdminForm } from "@/components/ui/AdminForm";
import { useCrud } from "@/hooks/useCrud";
import {
  TdActionBtn,
  TdBadge,
  TdModePicker,
  TdStatCard,
  TdToolbar,
  TdToolBtn,
} from "@/components/tracking/TrackingUi";

type TripStatus = "Pending" | "InTransit" | "Completed";

type TripRow = {
  id: number;
  tripNo: string;
  driverPhone: string;
  driverName: string;
  vehNo: string;
  fromStation: string;
  toStation: string;
  lrNos: string;
  status: TripStatus | string;
  remarks: string;
  startedAt: string;
  completedAt: string;
  shareToken?: string;
  customerTrackToken?: string;
  trackingMode?: string;
  deviceImei?: string;
  simMsisdn?: string;
  simConsentToken?: string;
  simConsentStatus?: string;
  simLastPollAt?: string;
  simLastPollError?: string;
  simConsentAt?: string;
  destLat?: number;
  destLng?: number;
  lastLat?: number;
  lastLng?: number;
  lastLocationAt?: string;
  createdAt?: string;
};

type TabKey = "Pending" | "InTransit" | "Completed";

const emptyForm = {
  driverPhone: "",
  driverName: "",
  vehNo: "",
  fromStation: "",
  toStation: "",
  lrNos: "",
  remarks: "",
  trackingMode: "phone",
  deviceImei: "",
  simMsisdn: "",
  destLat: "",
  destLng: "",
};

function nowStamp() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, "").slice(-10);
}

function makeShareToken(prefix = "lt") {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function shareUrl(token: string) {
  if (typeof window === "undefined") return `/live-track/share/${token}`;
  return `${window.location.origin}/live-track/share/${token}`;
}

function customerUrl(token: string) {
  if (typeof window === "undefined") return `/track/${token}`;
  return `${window.location.origin}/track/${token}`;
}

function simConsentUrl(token: string) {
  if (typeof window === "undefined") return `/sim-consent/${token}`;
  return `${window.location.origin}/sim-consent/${token}`;
}

function isSimMode(row: TripRow) {
  return row.trackingMode === "sim" || normalizePhone(row.simMsisdn ?? "").length === 10;
}

function modeBadge(mode?: string) {
  if (mode === "sim") return <TdBadge tone="teal">SIM</TdBadge>;
  if (mode === "device") return <TdBadge tone="navy">Device</TdBadge>;
  return <TdBadge tone="green">Phone GPS</TdBadge>;
}

function consentBadge(status?: string) {
  if (status === "Approved") return <TdBadge tone="green">Approved</TdBadge>;
  if (status === "Denied") return <TdBadge tone="red">Denied</TdBadge>;
  return <TdBadge tone="amber">Pending</TdBadge>;
}

export default function TripDeskPage() {
  const { rows, loading, message, setMessage, create, update, remove } = useCrud<TripRow>("trip-desk");
  const [tab, setTab] = useState<TabKey>("Pending");
  const [form, setForm] = useState(emptyForm);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const counts = useMemo(() => {
    const pending = rows.filter((r) => r.status === "Pending").length;
    const inTransit = rows.filter((r) => r.status === "InTransit").length;
    const completed = rows.filter((r) => r.status === "Completed").length;
    return { pending, inTransit, completed, total: rows.length };
  }, [rows]);

  const filtered = useMemo(() => rows.filter((r) => r.status === tab), [rows, tab]);

  const withGps = useMemo(
    () => rows.filter((r) => r.status === "InTransit" && (r.lastLat || r.lastLng)).length,
    [rows],
  );

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const phone = normalizePhone(form.driverPhone);
    if (phone.length !== 10) {
      setMessage({ type: "err", text: "Enter a valid 10-digit driver phone number." });
      return;
    }
    const tripNo = `TD-${String(Date.now()).slice(-8)}`;
    const saved = await create({
      ...form,
      driverPhone: phone,
      simMsisdn: normalizePhone(form.simMsisdn),
      destLat: Number(form.destLat) || 0,
      destLng: Number(form.destLng) || 0,
      tripNo,
      status: "Pending",
      startedAt: "",
      completedAt: "",
      shareToken: "",
      customerTrackToken: "",
    });
    if (saved) {
      setForm(emptyForm);
      setTab("Pending");
    }
  }

  async function startTrip(row: TripRow) {
    setBusyId(row.id);
    const token = row.shareToken || makeShareToken("lt");
    const customerToken = row.customerTrackToken || makeShareToken("ct");
    const simMode = row.trackingMode === "sim" || normalizePhone(row.simMsisdn ?? "").length === 10;
    const simConsentToken = simMode ? row.simConsentToken || makeShareToken("sc") : "";
    await update(row.id, {
      tripNo: row.tripNo,
      driverPhone: row.driverPhone,
      driverName: row.driverName,
      vehNo: row.vehNo,
      fromStation: row.fromStation,
      toStation: row.toStation,
      lrNos: row.lrNos,
      remarks: row.remarks,
      trackingMode: simMode ? "sim" : row.trackingMode || "phone",
      deviceImei: row.deviceImei ?? "",
      simMsisdn: normalizePhone(row.simMsisdn ?? "") || row.driverPhone,
      destLat: row.destLat ?? 0,
      destLng: row.destLng ?? 0,
      status: "InTransit",
      startedAt: nowStamp(),
      completedAt: "",
      shareToken: simMode ? "" : token,
      customerTrackToken: customerToken,
      simConsentToken,
      simConsentStatus: simMode ? row.simConsentStatus || "Pending" : "",
      simConsentAt: row.simConsentStatus === "Approved" ? row.simConsentAt ?? "" : "",
      lastLat: row.lastLat ?? 0,
      lastLng: row.lastLng ?? 0,
      lastLocationAt: row.lastLocationAt ?? "",
    });
    await fetch("/api/erp/tracking/trip-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tripId: row.id, type: "trip_started" }),
    }).catch(() => undefined);
    if (simMode) {
      await fetch("/api/erp/tracking/sim/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId: row.id }),
      }).catch(() => undefined);
    }
    setBusyId(null);
    setTab("InTransit");
    if (simMode) {
      try {
        await navigator.clipboard.writeText(simConsentUrl(simConsentToken));
        setMessage({ type: "ok", text: "SIM trip started. Consent link copied." });
      } catch {
        setMessage({ type: "ok", text: "SIM trip started. Send consent link to driver." });
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl(token));
      setMessage({ type: "ok", text: "Trip started. Driver GPS link copied." });
    } catch {
      setMessage({ type: "ok", text: "Trip started." });
    }
  }

  async function completeTrip(row: TripRow) {
    setBusyId(row.id);
    await update(row.id, {
      tripNo: row.tripNo,
      driverPhone: row.driverPhone,
      driverName: row.driverName,
      vehNo: row.vehNo,
      fromStation: row.fromStation,
      toStation: row.toStation,
      lrNos: row.lrNos,
      remarks: row.remarks,
      trackingMode: row.trackingMode || "phone",
      deviceImei: row.deviceImei ?? "",
      simMsisdn: row.simMsisdn ?? "",
      destLat: row.destLat ?? 0,
      destLng: row.destLng ?? 0,
      status: "Completed",
      startedAt: row.startedAt,
      completedAt: nowStamp(),
      shareToken: row.shareToken ?? "",
      customerTrackToken: row.customerTrackToken ?? "",
      lastLat: row.lastLat ?? 0,
      lastLng: row.lastLng ?? 0,
      lastLocationAt: row.lastLocationAt ?? "",
    });
    await fetch("/api/erp/tracking/trip-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tripId: row.id, type: "trip_completed" }),
    }).catch(() => undefined);
    setBusyId(null);
    setTab("Completed");
  }

  async function copyShareLink(row: TripRow) {
    if (!row.shareToken) {
      setMessage({ type: "err", text: "Start trip first." });
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl(row.shareToken));
      setMessage({ type: "ok", text: "Driver link copied." });
    } catch {
      setMessage({ type: "err", text: shareUrl(row.shareToken) });
    }
  }

  async function copyCustomerLink(row: TripRow) {
    if (!row.customerTrackToken) {
      setMessage({ type: "err", text: "Start trip first." });
      return;
    }
    try {
      await navigator.clipboard.writeText(customerUrl(row.customerTrackToken));
      setMessage({ type: "ok", text: "Customer link copied." });
    } catch {
      setMessage({ type: "err", text: customerUrl(row.customerTrackToken) });
    }
  }

  function whatsappCustomerLink(row: TripRow) {
    if (!row.customerTrackToken) {
      setMessage({ type: "err", text: "Start trip first." });
      return;
    }
    const url = customerUrl(row.customerTrackToken);
    const text = `Track your DPR Logistics shipment (${row.lrNos || row.tripNo}): ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  function smsCustomerLink(row: TripRow) {
    if (!row.customerTrackToken) {
      setMessage({ type: "err", text: "Start trip first." });
      return;
    }
    const url = customerUrl(row.customerTrackToken);
    const text = `Track your DPR Logistics shipment (${row.lrNos || row.tripNo}): ${url}`;
    window.location.href = `sms:?body=${encodeURIComponent(text)}`;
  }

  async function copySimConsentLink(row: TripRow) {
    if (!row.simConsentToken) {
      setMessage({ type: "err", text: "Start SIM trip first." });
      return;
    }
    try {
      await navigator.clipboard.writeText(simConsentUrl(row.simConsentToken));
      setMessage({ type: "ok", text: "SIM consent link copied." });
    } catch {
      setMessage({ type: "err", text: simConsentUrl(row.simConsentToken) });
    }
  }

  async function pollSimNow(row: TripRow) {
    setBusyId(row.id);
    const res = await fetch("/api/erp/tracking/sim/poll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tripId: row.id }),
    });
    const json = (await res.json()) as { ok: boolean; data?: { error?: string } };
    setBusyId(null);
    if (json.ok && json.data && !json.data.error) {
      setMessage({ type: "ok", text: "SIM location updated." });
    } else {
      setMessage({ type: "err", text: json.data?.error || "SIM poll failed." });
    }
  }

  const columns: { key: string; header: string; render?: (row: TripRow) => ReactNode }[] = [
    {
      key: "actions",
      header: "Actions",
      render: (row) => {
        if (tab === "Pending") {
          return (
            <div className="td-action-group">
              <TdActionBtn label="Start Trip" variant="start" icon={Play} disabled={busyId === row.id} onClick={() => startTrip(row)} />
            </div>
          );
        }
        if (tab === "InTransit") {
          return (
            <div className="td-action-group">
              <TdActionBtn label="Complete" variant="complete" icon={CheckCircle2} disabled={busyId === row.id} onClick={() => completeTrip(row)} />
              {isSimMode(row) ? (
                <>
                  <TdActionBtn label="Consent" variant="link" icon={Copy} onClick={() => copySimConsentLink(row)} />
                  <TdActionBtn label="Poll SIM" variant="default" icon={Radio} disabled={busyId === row.id} onClick={() => pollSimNow(row)} />
                </>
              ) : (
                <TdActionBtn label="Driver Link" variant="link" icon={Smartphone} onClick={() => copyShareLink(row)} />
              )}
              <TdActionBtn label="Customer" variant="link" icon={Link2} onClick={() => copyCustomerLink(row)} />
              <TdActionBtn label="WhatsApp" variant="link" icon={ExternalLink} onClick={() => whatsappCustomerLink(row)} />
              <TdActionBtn label="SMS" variant="link" icon={Copy} onClick={() => smsCustomerLink(row)} />
              <a className="td-action-btn td-action-view" href={`/live-track?phone=${encodeURIComponent(row.driverPhone)}`} target="_blank" rel="noreferrer">
                <ExternalLink size={14} aria-hidden />
                <span>Live Map</span>
              </a>
            </div>
          );
        }
        return (
          <div className="td-action-group">
            <TdActionBtn label="Delete" variant="danger" icon={Trash2} onClick={() => remove(row.id)} />
          </div>
        );
      },
    },
    {
      key: "tripNo",
      header: "Trip",
      render: (row) => (
        <div>
          <strong>{row.tripNo}</strong>
          <div style={{ marginTop: 4 }}>{modeBadge(row.trackingMode)}</div>
        </div>
      ),
    },
    { key: "driverPhone", header: "Phone" },
    { key: "driverName", header: "Driver" },
    { key: "vehNo", header: "Vehicle" },
    {
      key: "route",
      header: "Route",
      render: (row) => (
        <span className="td-trip-card-route">
          {row.fromStation || "—"} → {row.toStation || "—"}
        </span>
      ),
    },
    { key: "lrNos", header: "LR / GC" },
  ];

  if (tab === "InTransit") {
    columns.push(
      {
        key: "simConsent",
        header: "SIM",
        render: (row) => (isSimMode(row) ? consentBadge(row.simConsentStatus) : "—"),
      },
      { key: "startedAt", header: "Started" },
      {
        key: "lastLocationAt",
        header: "Last GPS",
        render: (row) =>
          row.lastLocationAt ? (
            <span style={{ color: "#15803d", fontWeight: 600 }}>{row.lastLocationAt}</span>
          ) : (
            <TdBadge tone="amber">Waiting</TdBadge>
          ),
      },
    );
  } else if (tab === "Completed") {
    columns.push({ key: "startedAt", header: "Started" }, { key: "completedAt", header: "Completed" });
  } else {
    columns.push({ key: "remarks", header: "Remarks" });
  }

  return (
    <div className="td-page">
      <PageHeader
        title="Trip Desk"
        subtitle="Create trips · Start tracking · Share links"
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Trip Desk" }]}
      />
      <Flash message={message} />

      <div className="td-stats">
        <TdStatCard label="Pending" value={counts.pending} tone="amber" icon={Clock3} hint="Awaiting dispatch" />
        <TdStatCard label="In Transit" value={counts.inTransit} tone="teal" icon={Truck} hint={`${withGps} with GPS`} />
        <TdStatCard label="Completed" value={counts.completed} tone="green" icon={CheckCircle2} />
        <TdStatCard label="All Trips" value={counts.total} tone="navy" icon={MapPin} />
      </div>

      <TdToolbar>
        <TdToolBtn variant="accent" onClick={() => document.getElementById("new-trip-form")?.scrollIntoView({ behavior: "smooth" })}>
          <Plus size={16} aria-hidden /> New Trip
        </TdToolBtn>
        <Link href="/tracking-desk" className="td-tool-btn td-tool-primary">
          <MapPin size={16} aria-hidden /> Tracking Desk
        </Link>
        <a href="/live-track" target="_blank" rel="noreferrer" className="td-tool-btn">
          <ExternalLink size={16} aria-hidden /> Public Track
        </a>
        {loading ? (
          <span className="td-badge td-badge-slate">
            <RefreshCw size={12} className="animate-spin" aria-hidden /> Loading…
          </span>
        ) : null}
      </TdToolbar>

      <section className="td-form-section" id="new-trip-form">
        <div className="td-form-section-head">
          <h3>Create New Trip</h3>
          <p>Pending status · select tracking mode · add LR for customer track</p>
        </div>
        <AdminForm className="td-form-section-body" onSubmit={onCreate}>
          <TdModePicker value={form.trackingMode} onChange={(v) => setForm({ ...form, trackingMode: v })} />
          <TwoCol>
            <div>
              <InputField
                label="Driver Phone *"
                type="tel"
                inputMode="numeric"
                placeholder="10-digit mobile"
                value={form.driverPhone}
                onChange={(e) => setForm({ ...form, driverPhone: e.target.value })}
                required
              />
              <InputField label="Driver Name" value={form.driverName} onChange={(e) => setForm({ ...form, driverName: e.target.value })} />
              <InputField
                label="Vehicle No"
                value={form.vehNo}
                onChange={(e) => setForm({ ...form, vehNo: e.target.value.toUpperCase() })}
              />
            </div>
            <div>
              <InputField label="From" value={form.fromStation} onChange={(e) => setForm({ ...form, fromStation: e.target.value })} />
              <InputField label="To" value={form.toStation} onChange={(e) => setForm({ ...form, toStation: e.target.value })} />
              <InputField
                label="LR / GC Nos"
                placeholder="Comma separated"
                value={form.lrNos}
                onChange={(e) => setForm({ ...form, lrNos: e.target.value })}
              />
              <InputField label="Remarks" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
            </div>
          </TwoCol>

          <button type="button" className="td-tool-btn td-tool-ghost" onClick={() => setShowAdvanced((v) => !v)}>
            <Satellite size={14} aria-hidden /> {showAdvanced ? "Hide" : "Show"} device / ETA fields
          </button>

          {showAdvanced ? (
            <TwoCol>
              <div>
                <InputField label="GPS Device IMEI" value={form.deviceImei} onChange={(e) => setForm({ ...form, deviceImei: e.target.value })} />
                <InputField label="SIM MSISDN" value={form.simMsisdn} onChange={(e) => setForm({ ...form, simMsisdn: e.target.value })} />
              </div>
              <div>
                <InputField label="Dest Lat" value={form.destLat} onChange={(e) => setForm({ ...form, destLat: e.target.value })} placeholder="19.0760" />
                <InputField label="Dest Lng" value={form.destLng} onChange={(e) => setForm({ ...form, destLng: e.target.value })} placeholder="72.8777" />
              </div>
            </TwoCol>
          ) : null}

          <button type="submit" className="td-form-submit">
            <Plus size={18} aria-hidden /> Create Trip (Pending)
          </button>
        </AdminForm>
      </section>

      <div className="td-panel">
        <header className="td-panel-head">
          <h3>Trip List</h3>
          <div className="td-trip-tabs" role="tablist" aria-label="Trip status">
            <button type="button" role="tab" aria-selected={tab === "Pending"} className={tab === "Pending" ? "is-active" : ""} onClick={() => setTab("Pending")}>
              Pending <span>{counts.pending}</span>
            </button>
            <button type="button" role="tab" aria-selected={tab === "InTransit"} className={tab === "InTransit" ? "is-active" : ""} onClick={() => setTab("InTransit")}>
              In Transit <span>{counts.inTransit}</span>
            </button>
            <button type="button" role="tab" aria-selected={tab === "Completed"} className={tab === "Completed" ? "is-active" : ""} onClick={() => setTab("Completed")}>
              Completed <span>{counts.completed}</span>
            </button>
          </div>
        </header>
        <div className="td-table-wrap">
          <DataTable rows={filtered} columns={columns} />
        </div>
      </div>
    </div>
  );
}
