"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LorryMemo, type LorryMemoLhc, type LorryMemoLr } from "@/components/print/LorryMemo";
import { api } from "@/lib/api-client";
import { lrNoEquals } from "@/lib/lr-no";
import "@/components/print/lorry-memo.css";

type LhcRow = LorryMemoLhc & { lrNos?: string };
type BookingRow = LorryMemoLr & { lhcNo?: string };

function parseLrNos(csv: string) {
  return csv
    .split(/[,;\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function linkedBookings(bookings: BookingRow[], challanNo: string, lrNosCsv: string): LorryMemoLr[] {
  const listed = parseLrNos(lrNosCsv);
  const matched = bookings.filter(
    (b) =>
      (b.lhcNo && String(b.lhcNo).trim() === challanNo) ||
      listed.some((n) => lrNoEquals(n, b.lrNo)),
  );

  const byKey = new Map<string, BookingRow>();
  for (const row of matched) {
    const key = row.lrNo.trim().toLowerCase();
    if (!byKey.has(key)) byKey.set(key, row);
  }

  if (listed.length) {
    const ordered: LorryMemoLr[] = [];
    const used = new Set<string>();
    for (const n of listed) {
      const hit = [...byKey.values()].find((b) => lrNoEquals(n, b.lrNo));
      if (hit) {
        const key = hit.lrNo.trim().toLowerCase();
        if (!used.has(key)) {
          used.add(key);
          ordered.push(hit);
        }
      }
    }
    for (const row of byKey.values()) {
      const key = row.lrNo.trim().toLowerCase();
      if (!used.has(key)) ordered.push(row);
    }
    return ordered;
  }

  return [...byKey.values()];
}

function PrintInner() {
  const params = useSearchParams();
  const challanNo = params.get("challanNo") ?? "";
  const [lhc, setLhc] = useState<LorryMemoLhc | null>(null);
  const [rows, setRows] = useState<LorryMemoLr[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!challanNo) {
      setError("Missing challan number");
      return;
    }
    let cancelled = false;
    Promise.all([api<LhcRow[]>("/api/lhc"), api<BookingRow[]>("/api/bookings")])
      .then(([contracts, bookings]) => {
        if (cancelled) return;
        const row = contracts.find((r) => r.challanNo === challanNo) ?? null;
        if (!row) {
          setError(`Challan ${challanNo} not found`);
          return;
        }
        setLhc(row);
        setRows(linkedBookings(bookings, row.challanNo, row.lrNos || ""));
        requestAnimationFrame(() => {
          setTimeout(() => window.print(), 50);
        });
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unable to load Lorry Memo");
      });
    return () => {
      cancelled = true;
    };
  }, [challanNo]);

  if (error) return <p className="p-8">{error}</p>;
  if (!lhc) return <p className="p-8">Loading Lorry Memo…</p>;

  return (
    <div className="lhc-memo-page">
      <LorryMemo lhc={lhc} rows={rows} />
    </div>
  );
}

export default function LhcPrintPage() {
  return (
    <Suspense fallback={<p className="p-8">Loading…</p>}>
      <PrintInner />
    </Suspense>
  );
}
