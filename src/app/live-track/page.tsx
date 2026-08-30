"use client";

import dynamic from "next/dynamic";
import { FormEvent, Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import "./live-track.css";

const LiveTrackMap = dynamic(() => import("@/components/tracking/LiveTrackMap").then((m) => m.LiveTrackMap), {
  ssr: false,
  loading: () => <div className="lt-map-empty">Loading map…</div>,
});

type LiveData = {
  tripNo: string;
  driverPhone: string;
  driverName: string;
  vehNo: string;
  fromStation: string;
  toStation: string;
  lrNos: string;
  status: string;
  startedAt: string;
  lastLat: number | null;
  lastLng: number | null;
  lastLocationAt: string | null;
  etaMinutes: number | null;
  distanceRemainingKm: number | null;
  mapsUrl: string | null;
  route: { lat: number; lng: number; at: string; source: string }[];
};

function LiveTrackInner() {
  const searchParams = useSearchParams();
  const initialPhone = searchParams.get("phone") ?? "";
  const [phone, setPhone] = useState(initialPhone);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<LiveData | null>(null);

  const load = useCallback(async (value: string) => {
    const trimmed = value.replace(/\D/g, "").slice(-10);
    if (trimmed.length !== 10) {
      setError("Enter a valid 10-digit driver phone number.");
      setData(null);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/public/live-track?phone=${encodeURIComponent(trimmed)}`);
      const json = (await res.json()) as { ok: boolean; data?: LiveData; error?: string };
      if (!json.ok || !json.data) {
        setData(null);
        setError(json.error || "No live trip found.");
      } else {
        setData(json.data);
      }
    } catch {
      setError("Could not load live tracking.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialPhone) {
      setPhone(initialPhone);
      load(initialPhone);
    }
  }, [initialPhone, load]);

  useEffect(() => {
    if (!data?.driverPhone) return;
    const id = window.setInterval(() => {
      load(data.driverPhone);
    }, 15000);
    return () => window.clearInterval(id);
  }, [data?.driverPhone, load]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    load(phone);
  }

  return (
    <div className="lt-page">
      <header className="lt-header">
        <Link href="/" className="lt-brand">
          DPR Logistics
        </Link>
        <span>Live Vehicle Track</span>
      </header>

      <main className="lt-main">
        <h1>Track gaadi by driver phone</h1>
        <p className="lt-lead">
          Sirf <strong>In Transit</strong> trips. GPS phone link, GPS device, ya SIM tracking se location aati hai.
        </p>

        <form className="lt-form" onSubmit={onSubmit}>
          <input
            type="tel"
            inputMode="numeric"
            placeholder="Driver 10-digit mobile"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            aria-label="Driver phone"
          />
          <button type="submit" disabled={loading}>
            {loading ? "Searching…" : "Track Live"}
          </button>
        </form>

        {error ? <p className="lt-error">{error}</p> : null}

        {data ? (
          <section className="lt-card">
            <div className="lt-meta">
              <p>
                <strong>{data.vehNo || "Vehicle"}</strong> · {data.driverName || "Driver"} · {data.driverPhone}
              </p>
              <p>
                {data.fromStation || "—"} → {data.toStation || "—"}
              </p>
              <p>
                Trip <strong>{data.tripNo}</strong> · Status <strong>{data.status}</strong>
              </p>
              {data.lrNos ? <p>LR/GC: {data.lrNos}</p> : null}
              {data.lastLocationAt ? <p>Last update: {data.lastLocationAt}</p> : <p>Location abhi share nahi hui.</p>}
              {data.etaMinutes != null ? (
                <p>
                  ETA ~{Math.floor(data.etaMinutes / 60)}h {data.etaMinutes % 60}m
                  {data.distanceRemainingKm != null ? ` · ${data.distanceRemainingKm} km remaining` : ""}
                </p>
              ) : null}
            </div>

            <LiveTrackMap
              lastLat={data.lastLat}
              lastLng={data.lastLng}
              route={data.route}
              fromLabel={data.fromStation}
              toLabel={data.toStation}
            />

            {data.mapsUrl ? (
              <a className="lt-maps-link" href={data.mapsUrl} target="_blank" rel="noopener noreferrer">
                Open in Google Maps
              </a>
            ) : null}
          </section>
        ) : null}
      </main>
    </div>
  );
}

export default function LiveTrackPage() {
  return (
    <Suspense fallback={<div className="lt-page"><main className="lt-main">Loading…</main></div>}>
      <LiveTrackInner />
    </Suspense>
  );
}
