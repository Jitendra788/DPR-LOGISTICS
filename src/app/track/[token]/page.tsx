"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { trackShipmentViaApi } from "@/services/trackingClient";
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

type StatusData = {
  trackingNumber: string;
  origin: string;
  destination: string;
  consignee: string;
  currentLocation: string;
  vehicleNumber: string;
  expectedDelivery: string;
  bookingDate: string;
};

export default function CustomerTrackPage() {
  const params = useParams<{ token: string }>();
  const token = useMemo(() => String(params.token ?? ""), [params.token]);
  const [data, setData] = useState<LiveData | null>(null);
  const [status, setStatus] = useState<StatusData | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!token) return;

    const liveRes = await fetch(`/api/public/live-track?customer=${encodeURIComponent(token)}`);
    const liveJson = (await liveRes.json()) as { ok: boolean; data?: LiveData; error?: string };
    if (liveJson.ok && liveJson.data) {
      setError("");
      setData(liveJson.data);
      setStatus(null);
      return;
    }

    const track = await trackShipmentViaApi({ trackToken: token });
    if (track.ok && track.data.verified) {
      setError("");
      setData(null);
      setStatus({
        trackingNumber: track.data.trackingNumber,
        origin: track.data.origin,
        destination: track.data.destination,
        consignee: track.data.consignee,
        currentLocation: track.data.currentLocation,
        vehicleNumber: track.data.vehicleNumber,
        expectedDelivery: track.data.expectedDelivery,
        bookingDate: track.data.bookingDate,
      });
      if (track.data.live?.lastLat != null) {
        setData({
          tripNo: track.data.live.tripNo,
          vehNo: track.data.vehicleNumber,
          fromStation: track.data.origin,
          toStation: track.data.destination,
          lrNos: track.data.trackingNumber,
          status: track.data.live.status,
          lastLat: track.data.live.lastLat,
          lastLng: track.data.live.lastLng,
          lastLocationAt: track.data.live.lastLocationAt,
          etaMinutes: track.data.live.etaMinutes,
          distanceRemainingKm: track.data.live.distanceRemainingKm,
          mapsUrl: track.data.live.mapsUrl,
          route: track.data.live.route,
        });
      }
      return;
    }

    setError(track.ok === false ? track.error : liveJson.error || "Tracking link invalid or expired.");
    setData(null);
    setStatus(null);
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
        <h1>Your shipment — secure track link</h1>
        {error ? <p className="lt-error">{error}</p> : null}
        {status ? (
          <section className="lt-card">
            <div className="lt-meta">
              <p>
                <strong>{status.trackingNumber}</strong>
              </p>
              <p>
                {status.origin} → {status.destination}
              </p>
              <p>Consignee: {status.consignee}</p>
              <p>Vehicle: {status.vehicleNumber}</p>
              <p>Status location: {status.currentLocation}</p>
              <p>Expected: {status.expectedDelivery}</p>
            </div>
          </section>
        ) : null}
        {data ? (
          <section className="lt-card">
            <div className="lt-meta">
              <p>
                <strong>{data.vehNo || "Vehicle"}</strong> · Trip {data.tripNo}
              </p>
              <p>
                {data.fromStation} → {data.toStation}
              </p>
              {data.lrNos ? <p>LR: {data.lrNos}</p> : null}
              {data.etaMinutes != null ? <p>ETA ~{data.etaMinutes} min</p> : null}
              {data.distanceRemainingKm != null ? <p>{data.distanceRemainingKm} km remaining</p> : null}
              {data.lastLocationAt ? <p>Updated: {data.lastLocationAt}</p> : null}
            </div>
            {data.lastLat != null && data.lastLng != null ? (
              <LiveTrackMap
                lastLat={data.lastLat}
                lastLng={data.lastLng}
                route={data.route}
                fromLabel={data.fromStation}
                toLabel={data.toStation}
                height={420}
              />
            ) : (
              <p className="lt-map-empty">Waiting for live GPS…</p>
            )}
            {data.mapsUrl ? (
              <p>
                <a href={data.mapsUrl} target="_blank" rel="noreferrer">
                  Open in Google Maps
                </a>
              </p>
            ) : null}
          </section>
        ) : null}
      </main>
    </div>
  );
}
