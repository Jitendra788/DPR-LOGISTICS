"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DatabaseBackup,
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  Upload,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard } from "@/components/ui/FormCard";
import { Button } from "@/components/ui/Button";
import { Flash } from "@/components/ui/Flash";

type Counts = Record<string, number>;

export default function DataBackupPage() {
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setMessage({ type: "ok", text: `Live snapshot ready · ${data.exportedAt || "now"}` });
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Preview failed" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshCounts();
  }, [refreshCounts]);

  function download(format: "json" | "xlsx" | "pdf") {
    window.location.href = `/api/admin/backup?format=${format}`;
  }

  async function onRestoreFile(file: File | null) {
    if (!file) return;
    setFileName(file.name);
    if (confirmText !== "RESTORE") {
      setMessage({ type: "err", text: 'Pehle niche box me RESTORE type karo, phir file choose karo.' });
      return;
    }
    setRestoring(true);
    setMessage(null);
    try {
      const text = await file.text();
      const backup = JSON.parse(text) as unknown;
      const res = await fetch("/api/admin/backup", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ backup, confirm: "RESTORE" }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string; restored?: Counts };
      if (!res.ok) throw new Error(data.error || "Restore failed");
      setMessage({ type: "ok", text: data.message || "Restore complete" });
      setConfirmText("");
      setFileName("");
      void refreshCounts();
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Restore failed" });
    } finally {
      setRestoring(false);
    }
  }

  const totalRecords = counts
    ? Object.values(counts).reduce((s, n) => s + (Number(n) || 0), 0)
    : 0;

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
          <button type="button" className="backup-refresh" onClick={() => void refreshCounts()} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "is-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </section>

      <div className="backup-grid">
        <FormCard title="Download backup" subtitle="Choose format">
          <div className="backup-actions">
            <button type="button" className="backup-dl tone-json" onClick={() => download("json")}>
              <FileJson className="h-5 w-5" />
              <span>
                <strong>JSON</strong>
                <small>Full restore file (recommended)</small>
              </span>
              <Download className="h-4 w-4 backup-dl-ico" />
            </button>
            <button type="button" className="backup-dl tone-xlsx" onClick={() => download("xlsx")}>
              <FileSpreadsheet className="h-5 w-5" />
              <span>
                <strong>Excel (.xlsx)</strong>
                <small>All tables as sheets (passwords hidden)</small>
              </span>
              <Download className="h-4 w-4 backup-dl-ico" />
            </button>
            <button type="button" className="backup-dl tone-pdf" onClick={() => download("pdf")}>
              <FileText className="h-5 w-5" />
              <span>
                <strong>PDF summary</strong>
                <small>Opens report — Print → Save as PDF</small>
              </span>
              <Download className="h-4 w-4 backup-dl-ico" />
            </button>
          </div>
        </FormCard>

        <FormCard title="Restore into database" subtitle="Warning: replaces current ERP data">
          <div className="backup-restore">
            <p className="backup-warn">
              Restore <strong>deletes current data</strong> and loads the JSON backup. Photo files on disk are not
              included — only database rows.
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
              />
            </label>
            <p className={`backup-unlock-hint ${confirmText === "RESTORE" ? "is-ok" : ""}`}>
              {confirmText === "RESTORE"
                ? "Unlocked — ab Step 2 pe JSON file choose karo"
                : confirmText
                  ? `Abhi “${confirmText}” dikh raha hai — pura RESTORE likho`
                  : "Pehle upar RESTORE type karo, phir neeche file choose hogi"}
            </p>
            <div className={`backup-upload ${confirmText === "RESTORE" ? "is-ready" : ""}`}>
              <Upload className="h-5 w-5" aria-hidden />
              <span>
                <strong>{restoring ? "Restoring…" : fileName || "Step 2 — Choose JSON backup"}</strong>
                <small>
                  {confirmText === "RESTORE"
                    ? "Click here to select .json file"
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
                    });
                    document.getElementById("backup-restore-confirm")?.focus();
                    return;
                  }
                  fileInputRef.current?.click();
                }}
              >
                Browse…
              </button>
            </div>
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
          <Button type="button" variant="secondary" size="sm" onClick={() => void refreshCounts()} disabled={loading}>
            Refresh counts
          </Button>
        </div>
      </FormCard>
    </div>
  );
}
