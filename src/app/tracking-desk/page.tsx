"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ExternalLink,
  MapPin,
  Radio,
  RefreshCw,
  ShieldAlert,
  Truck,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Flash } from "@/components/ui/Flash";
import {
  TdBadge,
  TdLiveDot,
  TdPanel,
  TdStatCard,
  TdToolbar,
  TdToolBtn,
} from "@/components/tracking/TrackingUi";

const FleetMap = dynamic(() => import("@/components/tracking/FleetMap").then((m) => m.FleetMap), {
  ssr: false,
  loading: () => <div className="td-empty">Loading fleet map…</div>,
});

type TripPayload = {
  tripId: number;
  tripNo: string;
  driverPhone: string;
  driverName: string;
  vehNo: string;
  fromStation: string;
  toStation: string;
  lrNos: string;
  status: string;
  lastLat: number | null;
  lastLng: number | null;
  lastLocationAt: string | null;
  etaMinutes: number | null;
  distanceRemainingKm: number | null;
  route: { lat: number; lng: number; at: string; source: string }[];
};

type AlertRow = {
  id: number;
  tripId: number;
  tripNo: string;
  vehNo: string;
  type: string;
  message: string;
  severity: string;
  triggeredAt: string;
};

export default function TrackingDeskPage() {
  const [trips, setTrips] = useState<TripPayload[]>([]);
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [lastRefresh, setLastRefresh] = useState("");

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch("/api/erp/tracking/active");
      const json = (await res.json()) as {
        ok: boolean;
        data?: { trips: TripPayload[]; alerts: AlertRow[] };
        error?: string;
      };
      if (!json.ok || !json.data) {
        setMessage({ type: "err", text: json.error || "Load failed." });
        return;
      }
      setTrips(json.data.trips);
      setAlerts(json.data.alerts);
      setLastRefresh(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
      setSelectedId((prev) => prev ?? json.data!.trips[0]?.tripId ?? null);
    } catch {
      setMessage({ type: "err", text: "Could not load tracking desk." });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load().catch(() => undefined);
    const id = window.setInterval(() => {
      load(true).catch(() => undefined);
    }, 30000);
    return () => window.clearInterval(id);
  }, [load]);

  const withGps = useMemo(() => trips.filter((t) => t.lastLat != null).length, [trips]);

  async function ackAlert(id: number) {
    await fetch("/api/erp/tracking/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setAlerts((a) => a.filter((x) => x.id !== id));
  }

  async function runAlertCheck() {
    setRefreshing(true);
    await fetch("/api/erp/tracking/active", { method: "POST" });
    await load(true);
    setMessage({ type: "ok", text: "Alerts checked + SIM polled." });
  }

  async function pollSimOnly() {
    setRefreshing(true);
    const res = await fetch("/api/erp/tracking/sim/poll", { method: "POST" });
    const json = (await res.json()) as { ok: boolean; data?: { updated: number; polled: number; errors: string[] } };
    await load(true);
    if (json.ok && json.data) {
      setMessage({
        type: "ok",
        text: `SIM: ${json.data.updated}/${json.data.polled} updated`,
      });
    }
  }

  const selected = trips.find((t) => t.tripId === selectedId) ?? null;

  return (
    <div className="td-page">
      <PageHeader
        title="Tracking Desk"
        subtitle="Live fleet control tower · map · alerts · SIM poll"
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Tracking Desk" }]}
      />
      <Flash message={message} />

      <div className="td-stats">
        <TdStatCard label="Active Trips" value={trips.length} tone="teal" icon={Truck} hint="In transit now" />
        <TdStatCard label="Live GPS" value={withGps} tone="green" icon={MapPin} hint="On map" />
        <TdStatCard label="Alerts" value={alerts.length} tone={alerts.length ? "red" : "slate"} icon={AlertTriangle} />
        <TdStatCard label="Auto Refresh" value={lastRefresh || "—"} tone="navy" icon={RefreshCw} hint="Every 30 sec" />
      </div>

      <TdToolbar>
        <TdToolBtn variant="primary" onClick={() => load()} disabled={refreshing}>
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} aria-hidden /> Refresh
        </TdToolBtn>
        <TdToolBtn variant="accent" onClick={() => runAlertCheck()} disabled={refreshing}>
          <ShieldAlert size={16} aria-hidden /> Check Alerts
        </TdToolBtn>
        <TdToolBtn onClick={() => pollSimOnly()} disabled={refreshing}>
          <Radio size={16} aria-hidden /> Poll SIM
        </TdToolBtn>
        <Link href="/trip-desk" className="td-tool-btn td-tool-ghost">
          <Truck size={16} aria-hidden /> Trip Desk
        </Link>
        <span className="td-badge td-badge-teal">
          <TdLiveDot live={withGps > 0} /> Live
        </span>
      </TdToolbar>

      {loading && !trips.length ? <div className="td-empty">Loading tracking data…</div> : null}

      <div className="td-grid-main">
        <TdPanel
          title="Live Fleet Map"
          extra={
            <TdBadge tone="slate">{withGps}/{trips.length} on map</TdBadge>
          }
        >
          <div className="td-map-frame">
            <FleetMap trips={trips} selectedId={selectedId} onSelect={setSelectedId} className="td-map-canvas" />
          </div>
        </TdPanel>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <TdPanel
            title="Alerts"
            extra={alerts.length ? <TdBadge tone="red">{alerts.length}</TdBadge> : <TdBadge tone="green">Clear</TdBadge>}
          >
            {!alerts.length ? <div className="td-empty">No active alerts</div> : null}
            <div className="td-scroll-panel td-scroll-panel-sm">
              {alerts.map((a) => (
                <div key={a.id} className={`td-alert-card ${a.severity === "high" ? "is-high" : ""}`}>
                  <div className="td-alert-card-head">
                    <TdBadge tone="red">{a.type}</TdBadge>
                    <button type="button" className="td-tool-btn" style={{ padding: "0.25rem 0.5rem", fontSize: "0.72rem" }} onClick={() => ackAlert(a.id)}>
                      Ack
                    </button>
                  </div>
                  <p>{a.message}</p>
                  <p className="td-alert-time">{a.triggeredAt}</p>
                </div>
              ))}
            </div>
          </TdPanel>

          <TdPanel title={`Active Trips (${trips.length})`}>
            {!trips.length ? <div className="td-empty">No in-transit trips</div> : null}
            <div className="td-scroll-panel td-scroll-panel-md">
              {trips.map((t) => (
                <button
                  key={t.tripId}
                  type="button"
                  className={`td-trip-card ${selectedId === t.tripId ? "is-selected" : ""}`}
                  onClick={() => setSelectedId(t.tripId)}
                >
                  <div className="td-trip-card-top">
                    <strong>{t.vehNo || t.tripNo}</strong>
                    {t.lastLat != null ? <TdBadge tone="green">GPS</TdBadge> : <TdBadge tone="amber">No GPS</TdBadge>}
                  </div>
                  <div className="td-trip-card-route">
                    {t.fromStation} → {t.toStation}
                  </div>
                  <div className="td-trip-card-meta">
                    {t.lastLocationAt ? `Updated ${t.lastLocationAt}` : "Awaiting location…"}
                  </div>
                </button>
              ))}
            </div>
          </TdPanel>
        </div>
      </div>

      {selected ? (
        <TdPanel title={`Trip ${selected.tripNo}`}>
          <div className="td-detail-grid">
            <div className="td-detail-item">
              <span>Vehicle</span>
              <strong>{selected.vehNo || "—"}</strong>
            </div>
            <div className="td-detail-item">
              <span>Driver</span>
              <strong>
                {selected.driverName || "—"} ({selected.driverPhone})
              </strong>
            </div>
            <div className="td-detail-item">
              <span>Route</span>
              <strong>
                {selected.fromStation} → {selected.toStation}
              </strong>
            </div>
            <div className="td-detail-item">
              <span>LR / GC</span>
              <strong>{selected.lrNos || "—"}</strong>
            </div>
            {selected.etaMinutes != null ? (
              <div className="td-detail-item">
                <span>ETA</span>
                <strong>
                  ~{Math.floor(selected.etaMinutes / 60)}h {selected.etaMinutes % 60}m · {selected.distanceRemainingKm ?? "—"} km
                </strong>
              </div>
            ) : null}
            <div className="td-detail-item">
              <span>Last GPS</span>
              <strong>{selected.lastLocationAt || "Not yet"}</strong>
            </div>
          </div>
          <div className="td-toolbar" style={{ marginTop: "0.85rem", padding: "0.5rem" }}>
            <a
              className="td-tool-btn td-tool-accent"
              href={`/live-track?phone=${encodeURIComponent(selected.driverPhone)}`}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink size={16} aria-hidden /> Open Live Track
            </a>
            <Link href="/trip-desk" className="td-tool-btn">
              Manage in Trip Desk
            </Link>
          </div>
        </TdPanel>
      ) : null}
    </div>
  );
}
