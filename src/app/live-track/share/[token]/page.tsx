"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import "../../live-track.css";

const QUEUE_KEY = "dpr_gps_queue";

type QueuedPoint = { token: string; lat: number; lng: number; speed: number; heading: number; accuracy: number; ts: number };

type LiveData = {
  tripNo: string;
  driverPhone: string;
  driverName: string;
  vehNo: string;
  fromStation: string;
  toStation: string;
  status: string;
  lastLat: number | null;
  lastLng: number | null;
  lastLocationAt: string | null;
};

function loadQueue(): QueuedPoint[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]") as QueuedPoint[];
  } catch {
    return [];
  }
}

function saveQueue(q: QueuedPoint[]) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q.slice(-50)));
  } catch {
    /* ignore */
  }
}

export default function DriverShareLocationPage() {
  const params = useParams<{ token: string }>();
  const token = useMemo(() => String(params.token ?? ""), [params.token]);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Share link open — Start Sharing dabao.");
  const [data, setData] = useState<LiveData | null>(null);
  const lastSentRef = useRef(0);

  const refresh = useCallback(async () => {
    if (!token) return;
    const res = await fetch(`/api/public/live-track?token=${encodeURIComponent(token)}`);
    const json = (await res.json()) as { ok: boolean; data?: LiveData; error?: string };
    if (!json.ok || !json.data) {
      setError(json.error || "Trip not found or not In Transit.");
      setData(null);
      return;
    }
    setError("");
    setData(json.data);
  }, [token]);

  const flushQueue = useCallback(async () => {
    if (!token) return;
    const queue = loadQueue().filter((p) => p.token === token);
    if (!queue.length) return;
    const remaining: QueuedPoint[] = loadQueue().filter((p) => p.token !== token);
    for (const p of queue) {
      try {
        const res = await fetch("/api/public/live-track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            lat: p.lat,
            lng: p.lng,
            speed: p.speed,
            heading: p.heading,
            accuracy: p.accuracy,
          }),
        });
        const json = (await res.json()) as { ok: boolean; data?: LiveData };
        if (json.ok && json.data) setData(json.data);
      } catch {
        remaining.push(...queue);
        break;
      }
    }
    saveQueue(remaining);
  }, [token]);

  useEffect(() => {
    refresh().catch(() => setError("Could not load trip."));
    flushQueue().catch(() => undefined);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw-tracking.js").catch(() => undefined);
    }
  }, [refresh, flushQueue]);

  useEffect(() => {
    if (!sharing || !token) return;

    let watchId = 0;
    let cancelled = false;

    async function send(lat: number, lng: number, speed: number, heading: number, accuracy: number) {
      const now = Date.now();
      if (now - lastSentRef.current < 12000) return;
      lastSentRef.current = now;

      try {
        const res = await fetch("/api/public/live-track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, lat, lng, speed, heading, accuracy }),
        });
        const json = (await res.json()) as { ok: boolean; data?: LiveData; error?: string };
        if (!json.ok) {
          if (!navigator.onLine) {
            const q = loadQueue();
            q.push({ token, lat, lng, speed, heading, accuracy, ts: now });
            saveQueue(q);
            setStatus(`Offline — queued · ${new Date().toLocaleTimeString()}`);
            return;
          }
          setError(json.error || "Location update failed.");
          return;
        }
        setError("");
        setData(json.data ?? null);
        setStatus(`Location sent · ${new Date().toLocaleTimeString()}`);
      } catch {
        const q = loadQueue();
        q.push({ token, lat, lng, speed, heading, accuracy, ts: Date.now() });
        saveQueue(q);
        setStatus(`Network error — queued · ${new Date().toLocaleTimeString()}`);
      }
    }

    if (!navigator.geolocation) {
      setError("Is phone pe GPS / location support nahi hai.");
      setSharing(false);
      return;
    }

    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (cancelled) return;
        send(
          pos.coords.latitude,
          pos.coords.longitude,
          pos.coords.speed ?? 0,
          pos.coords.heading ?? 0,
          pos.coords.accuracy,
        ).catch(() => undefined);
      },
      (err) => {
        setError(err.message || "Location permission denied.");
        setSharing(false);
      },
      { enableHighAccuracy: true, maximumAge: 8000, timeout: 20000 },
    );

    return () => {
      cancelled = true;
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [sharing, token]);

  return (
    <div className="lt-share">
      <header>
        <Link href="/">DPR Logistics</Link>
        <span>Driver Live Share</span>
      </header>
      <main>
        <h1>GPS share for live tracking</h1>
        {data ? (
          <p>
            Trip <strong>{data.tripNo}</strong> · {data.vehNo || "Vehicle"} · {data.fromStation} → {data.toStation}
          </p>
        ) : null}
        {error ? <p className="err">{error}</p> : <p className="ok">{status}</p>}
        <button type="button" className={sharing ? "stop" : "start"} onClick={() => setSharing((v) => !v)}>
          {sharing ? "Stop Sharing" : "Start Sharing Location"}
        </button>
        <p className="hint">
          Location permission Allow karo. Page open rakho ya home screen pe add karo. Offline ho to location queue ho jati hai.
        </p>
        {data?.lastLocationAt ? (
          <p className="meta">
            Last sent: {data.lastLocationAt}
            {data.lastLat != null && data.lastLng != null
              ? ` (${data.lastLat.toFixed(5)}, ${data.lastLng.toFixed(5)})`
              : ""}
          </p>
        ) : null}
      </main>
    </div>
  );
}
