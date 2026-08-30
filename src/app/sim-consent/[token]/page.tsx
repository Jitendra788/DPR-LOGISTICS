"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import "@/app/live-track/live-track.css";

type ConsentData = {
  tripNo: string;
  vehNo: string;
  fromStation: string;
  toStation: string;
  driverName: string;
  simPhone: string;
  consentStatus: string;
  consentAt: string;
};

export default function SimConsentPage() {
  const params = useParams<{ token: string }>();
  const token = useMemo(() => String(params.token ?? ""), [params.token]);
  const [data, setData] = useState<ConsentData | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    const res = await fetch(`/api/public/sim-consent?token=${encodeURIComponent(token)}`);
    const json = (await res.json()) as { ok: boolean; data?: ConsentData; error?: string };
    if (!json.ok || !json.data) {
      setError(json.error || "Link invalid.");
      setData(null);
      return;
    }
    setError("");
    setData(json.data);
    if (json.data.consentStatus === "Approved") setDone("Approved");
  }, [token]);

  useEffect(() => {
    load().catch(() => setError("Could not load."));
  }, [load]);

  async function submit(action: "approve" | "deny") {
    setBusy(true);
    setError("");
    const res = await fetch("/api/public/sim-consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, action: action === "deny" ? "deny" : "approve" }),
    });
    const json = (await res.json()) as { ok: boolean; status?: string; error?: string };
    setBusy(false);
    if (!json.ok) {
      setError(json.error || "Failed.");
      return;
    }
    setDone(json.status ?? "Approved");
    load().catch(() => undefined);
  }

  return (
    <div className="lt-share">
      <header>
        <Link href="/">DPR Logistics</Link>
        <span>SIM Location Consent</span>
      </header>
      <main>
        <h1>Network location consent</h1>
        <p className="hint">
          Trip ke dauran aapke mobile SIM ki <strong>network location</strong> track hogi — koi app install nahi karna.
          TRAI rules ke liye aapki permission zaroori hai.
        </p>

        {data ? (
          <p>
            Trip <strong>{data.tripNo}</strong> · {data.vehNo || "Vehicle"} · {data.fromStation} → {data.toStation}
            <br />
            SIM: <strong>{data.simPhone}</strong>
          </p>
        ) : null}

        {error ? <p className="err">{error}</p> : null}

        {done === "Approved" ? (
          <p className="ok">
            Dhanyawad — consent approve ho gaya. Ab gaadi bina app ke network se track ho sakti hai.
            {data?.consentAt ? ` (${data.consentAt})` : ""}
          </p>
        ) : done === "Denied" ? (
          <p className="err">Aapne tracking consent reject kar diya.</p>
        ) : (
          <>
            <button type="button" className="start" disabled={busy} onClick={() => submit("approve")}>
              {busy ? "Saving…" : "Allow SIM Tracking"}
            </button>
            <button type="button" className="stop" disabled={busy} onClick={() => submit("deny")}>
              Reject
            </button>
          </>
        )}
      </main>
    </div>
  );
}
