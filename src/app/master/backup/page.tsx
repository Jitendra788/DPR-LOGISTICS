"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DatabaseBackup,
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  Loader2,
  RefreshCw,
  Upload,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard } from "@/components/ui/FormCard";
import { Button } from "@/components/ui/Button";
import { Flash } from "@/components/ui/Flash";

type Counts = Record<string, number>;

type RestorePhase = "idle" | "reading" | "uploading" | "importing" | "done" | "error";

const PHASE_LABEL: Record<Exclude<RestorePhase, "idle">, string> = {
  reading: "Step A — JSON file padh rahe hain…",
  uploading: "Step B — Server ko backup bhej rahe hain…",
  importing: "Step C — Database me data import ho raha hai…",
  done: "Import complete",
  error: "Import fail ho gaya",
};

export default function DataBackupPage() {
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string; at?: number } | null>(null);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restorePhase, setRestorePhase] = useState<RestorePhase>("idle");
  const [restoreElapsed, setRestoreElapsed] = useState(0);
  const [restoreResult, setRestoreResult] = useState<Counts | null>(null);
  const [restoreSkipped, setRestoreSkipped] = useState<Counts | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const refreshCounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/backup?format=summary", { credentials: "include" });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error || "Could not load backup preview");
      }
      const data = (await res.json()) as { counts?: Counts; exportedAt?: string };
      setCounts(data.counts || {});
      setMessage({ type: "ok", text: `Live snapshot ready · ${data.exportedAt || "now"}`, at: Date.now() });
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Preview failed", at: Date.now() });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshCounts();
  }, [refreshCounts]);

  useEffect(() => {
    if (!restoring) return;
    setRestoreElapsed(0);
    const t0 = Date.now();
    const id = window.setInterval(() => {
      setRestoreElapsed(Math.floor((Date.now() - t0) / 1000));
    }, 250);
    return () => window.clearInterval(id);
  }, [restoring]);

  useEffect(() => {
    if (restoring) {
      progressRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [restoring, restorePhase]);

  function download(format: "json" | "xlsx" | "pdf") {
    window.location.href = `/api/admin/backup?format=${format}`;
  }

  async function onRestoreFile(file: File | null) {
    if (!file) return;
    setFileName(file.name);
    if (confirmText !== "RESTORE") {
      setMessage({
        type: "err",
        text: "Pehle niche box me RESTORE type karo, phir file choose karo.",
        at: Date.now(),
      });
      return;
    }
    setRestoring(true);
    setRestoreResult(null);
    setRestoreSkipped(null);
    setMessage({
      type: "ok",
      text: `Import start: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB) — page band mat karo`,
      at: Date.now(),
    });
    try {
      setRestorePhase("reading");
      const text = await file.text();
      let backup: unknown;
      try {
        backup = JSON.parse(text);
      } catch {
        throw new Error("JSON file invalid hai — sahi backup file choose karo");
      }

      setRestorePhase("uploading");
      const fetchPromise = fetch("/api/admin/backup", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ backup, confirm: "RESTORE" }),
      });

      // Upload ke baad zyada time server-side import me jata hai
      const switchTimer = window.setTimeout(() => setRestorePhase("importing"), 900);
      const res = await fetchPromise;
      window.clearTimeout(switchTimer);
      setRestorePhase("importing");

      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
        restored?: Counts;
        skipped?: Counts;
      };
      if (!res.ok) throw new Error(data.error || "Restore failed");

      setRestorePhase("done");
      setRestoreResult(data.restored || null);
      setRestoreSkipped(data.skipped || null);
      const total = data.restored
        ? Object.values(data.restored).reduce((s, n) => s + (Number(n) || 0), 0)
        : 0;
      const skipTotal = data.skipped
        ? Object.values(data.skipped).reduce((s, n) => s + (Number(n) || 0), 0)
        : 0;
      setMessage({
        type: "ok",
        text:
          data.message ||
          `Merge complete — ${total.toLocaleString("en-IN")} added, ${skipTotal.toLocaleString("en-IN")} duplicates skipped`,
        at: Date.now(),
      });
      setConfirmText("");
      setFileName("");
      void refreshCounts();
    } catch (err) {
      setRestorePhase("error");
      setMessage({
        type: "err",
        text: err instanceof Error ? err.message : "Restore failed",
        at: Date.now(),
      });
    } finally {
      setRestoring(false);
    }
  }

  const totalRecords = counts
    ? Object.values(counts).reduce((s, n) => s + (Number(n) || 0), 0)
    : 0;

  const phaseSteps: Array<Exclude<RestorePhase, "idle" | "done" | "error">> = [
    "reading",
    "uploading",
    "importing",
  ];
  const phaseIndex =
    restorePhase === "reading"
      ? 0
      : restorePhase === "uploading"
        ? 1
        : restorePhase === "importing" || restorePhase === "done"
          ? 2
          : restorePhase === "error"
            ? -1
            : -1;

  return (
    <div className="backup-admin">
      <PageHeader
        title="Data Backup"
        subtitle="Admin only — export complete database to Excel / PDF / JSON, and restore from JSON"
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Data Backup" }]}
      />
      <Flash message={message} />

      <section className="backup-hero">
        <div>
          <p className="backup-hero-kicker">
            <DatabaseBackup className="h-4 w-4" aria-hidden />
            Full system backup
          </p>
          <h2>Protect every table in one click</h2>
          <p>
            JSON is the restore format. Excel is for offline review. PDF/HTML is a printable summary —
            use browser Print → Save as PDF.
          </p>
        </div>
        <div className="backup-hero-stat">
          <span>Total records</span>
          <strong>{loading ? "…" : totalRecords.toLocaleString("en-IN")}</strong>
          <button type="button" className="backup-refresh" onClick={() => void refreshCounts()} disabled={loading || restoring}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "is-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </section>

      <div className="backup-grid">
        <FormCard title="Download backup" subtitle="Choose format">
          <div className="backup-actions">
            <button type="button" className="backup-dl tone-json" onClick={() => download("json")} disabled={restoring}>
              <FileJson className="h-5 w-5" />
              <span>
                <strong>JSON</strong>
                <small>Full restore file (recommended)</small>
              </span>
              <Download className="h-4 w-4 backup-dl-ico" />
            </button>
            <button type="button" className="backup-dl tone-xlsx" onClick={() => download("xlsx")} disabled={restoring}>
              <FileSpreadsheet className="h-5 w-5" />
              <span>
                <strong>Excel (.xlsx)</strong>
                <small>All tables as sheets (passwords hidden)</small>
              </span>
              <Download className="h-4 w-4 backup-dl-ico" />
            </button>
            <button type="button" className="backup-dl tone-pdf" onClick={() => download("pdf")} disabled={restoring}>
              <FileText className="h-5 w-5" />
              <span>
                <strong>PDF summary</strong>
                <small>Opens report — Print → Save as PDF</small>
              </span>
              <Download className="h-4 w-4 backup-dl-ico" />
            </button>
          </div>
        </FormCard>

        <FormCard title="Restore into database" subtitle="Merge mode — existing data is kept">
          <div className="backup-restore">
            <p className="backup-warn">
              Restore <strong>purana data delete nahi karta</strong> — sirf naye rows add hote hain. Party / Vendor
              (name), LR / Bill / Challan (number) duplicate skip ho jate hain. Photos disk pe alag rehte hain.
            </p>
            <label className="backup-confirm-label" htmlFor="backup-restore-confirm">
              Step 1 — type <code>RESTORE</code> here
              <input
                id="backup-restore-confirm"
                className="form-control"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value.replace(/\s+/g, "").toUpperCase())}
                placeholder="Type RESTORE"
                autoComplete="off"
                spellCheck={false}
                disabled={restoring}
              />
            </label>
            <p className={`backup-unlock-hint ${confirmText === "RESTORE" ? "is-ok" : ""}`}>
              {confirmText === "RESTORE"
                ? "Unlocked — ab Step 2 pe JSON file choose karo"
                : confirmText
                  ? `Abhi “${confirmText}” dikh raha hai — pura RESTORE likho`
                  : "Pehle upar RESTORE type karo, phir neeche file choose hogi"}
            </p>
            <div className={`backup-upload ${confirmText === "RESTORE" ? "is-ready" : ""} ${restoring ? "is-busy" : ""}`}>
              {restoring ? <Loader2 className="h-5 w-5 is-spin" aria-hidden /> : <Upload className="h-5 w-5" aria-hidden />}
              <span>
                <strong>{restoring ? "Import chal raha hai…" : fileName || "Step 2 — Choose JSON backup"}</strong>
                <small>
                  {restoring
                    ? "Neeche progress dekho — wait karo"
                    : confirmText === "RESTORE"
                      ? "Click Browse / yahan se .json file select karo"
                      : "Pehle Step 1 me RESTORE type karo"}
                </small>
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                disabled={restoring}
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  e.target.value = "";
                  void onRestoreFile(file);
                }}
              />
              <button
                type="button"
                className="backup-upload-btn"
                disabled={restoring}
                onClick={() => {
                  if (confirmText !== "RESTORE") {
                    setMessage({
                      type: "err",
                      text: "Pehle Confirmation box me RESTORE type karo, phir file choose karo.",
                      at: Date.now(),
                    });
                    document.getElementById("backup-restore-confirm")?.focus();
                    return;
                  }
                  fileInputRef.current?.click();
                }}
              >
                {restoring ? "Working…" : "Browse…"}
              </button>
            </div>

            {(restoring || restorePhase === "done" || restorePhase === "error") && (
              <div
                ref={progressRef}
                className={`backup-progress ${restorePhase === "done" ? "is-done" : ""} ${restorePhase === "error" ? "is-err" : ""}`}
                role="status"
                aria-live="polite"
              >
                <div className="backup-progress-head">
                  <strong>
                    {restorePhase !== "idle" ? PHASE_LABEL[restorePhase] : "Import"}
                  </strong>
                  <span className="backup-progress-timer">
                    {restoring ? `${restoreElapsed}s` : restorePhase === "done" ? `Done in ${restoreElapsed}s` : ""}
                  </span>
                </div>

                {restoring && (
                  <>
                    <div className="backup-progress-bar" aria-hidden>
                      <div className="backup-progress-bar-indeterminate" />
                    </div>
                    <ol className="backup-progress-steps">
                      {phaseSteps.map((step, i) => {
                        const state =
                          phaseIndex > i ? "is-done" : phaseIndex === i ? "is-active" : "";
                        return (
                          <li key={step} className={state}>
                            {state === "is-active" && <Loader2 className="h-3.5 w-3.5 is-spin" aria-hidden />}
                            {PHASE_LABEL[step].replace(/^Step [A-C] — /, "")}
                          </li>
                        );
                      })}
                    </ol>
                    <p className="backup-progress-note">
                      Merge restore chal raha hai — pehla data delete nahi hoga. Tab band mat karo.
                    </p>
                  </>
                )}

                {restorePhase === "done" && restoreResult && (
                  <div className="backup-progress-result">
                    <p>
                      Merge successful — pehla data safe hai.
                      {restoreSkipped
                        ? ` Duplicates skipped: ${Object.values(restoreSkipped)
                            .reduce((s, n) => s + (Number(n) || 0), 0)
                            .toLocaleString("en-IN")}.`
                        : ""}
                    </p>
                    <div className="backup-progress-result-grid">
                      {Object.entries(restoreResult)
                        .filter(([, n]) => Number(n) > 0)
                        .sort((a, b) => Number(b[1]) - Number(a[1]))
                        .slice(0, 12)
                        .map(([table, count]) => (
                          <div key={table}>
                            <span>{table}</span>
                            <strong>+{Number(count).toLocaleString("en-IN")}</strong>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {restorePhase === "error" && (
                  <p className="backup-progress-note">
                    Error upar toast me dikha — file dubara try karo ya server log check karo.
                  </p>
                )}
              </div>
            )}
          </div>
        </FormCard>
      </div>

      <FormCard title="Current database counts" subtitle="Live row counts per table">
        {counts ? (
          <div className="backup-count-grid">
            {Object.entries(counts)
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([table, count]) => (
                <div key={table} className="backup-count-item">
                  <span>{table}</span>
                  <strong>{Number(count).toLocaleString("en-IN")}</strong>
                </div>
              ))}
          </div>
        ) : (
          <p className="backup-empty">Loading counts…</p>
        )}
        <div className="backup-foot">
          <Button type="button" variant="secondary" size="sm" onClick={() => void refreshCounts()} disabled={loading || restoring}>
            Refresh counts
          </Button>
        </div>
      </FormCard>
    </div>
  );
}
