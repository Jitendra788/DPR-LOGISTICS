"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import "@/app/live-track/live-track.css";

const LiveTrackMap = dynamic(() => import("@/components/tracking/LiveTrackMap").then((m) => m.LiveTrackMap), {
  ssr: false,
  loading: () => <div className="lt-map-empty">Loading map…</div>,
});

type LiveData = {
  tripNo: string;
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
  mapsUrl: string | null;
  route: { lat: number; lng: number; at: string; source: string }[];
};

export default function CustomerTrackPage() {
  const params = useParams<{ token: string }>();
  const token = useMemo(() => String(params.token ?? ""), [params.token]);
  const [data, setData] = useState<LiveData | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    const res = await fetch(`/api/public/live-track?customer=${encodeURIComponent(token)}`);
    const json = (await res.json()) as { ok: boolean; data?: LiveData; error?: string };
    if (!json.ok || !json.data) {
      setError(json.error || "Tracking link invalid or trip ended.");
      setData(null);
      return;
    }
    setError("");
    setData(json.data);
  }, [token]);

  useEffect(() => {
    load().catch(() => setError("Could not load tracking."));
  }, [load]);

  useEffect(() => {
    if (!data || data.status !== "InTransit") return;
    const id = window.setInterval(() => {
      load().catch(() => undefined);
    }, 15000);
    return () => window.clearInterval(id);
  }, [data, load]);

  return (
    <div className="lt-page">
      <header className="lt-header">
        <Link href="/" className="lt-brand">
          DPR Logistics
        </Link>
        <span>Shipment Live Track</span>
      </header>
      <main className="lt-main">
        <h1>Your shipment — live on map</h1>
        {error ? <p className="lt-error">{error}</p> : null}
        {data ? (
          <section className="lt-card">
            <div className="lt-meta">
              <p>
                <strong>{data.vehNo || "Vehicle"}</strong> · Trip {data.tripNo}
              </p>
              <p>
                {data.fromStation} → {data.toStation}
              </p>
              {data.lrNos ? <p>LR/GC: {data.lrNos}</p> : null}
              <p>
                Status: <strong>{data.status}</strong>
              </p>
              {data.lastLocationAt ? <p>Last update: {data.lastLocationAt}</p> : <p>Awaiting live GPS…</p>}
              {data.etaMinutes != null && data.status === "InTransit" ? (
                <p>
                  ETA ~{Math.floor(data.etaMinutes / 60)}h {data.etaMinutes % 60}m
                  {data.distanceRemainingKm != null ? ` · ${data.distanceRemainingKm} km` : ""}
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
