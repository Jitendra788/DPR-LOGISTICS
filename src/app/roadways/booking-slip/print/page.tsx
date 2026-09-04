"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LoadingMemo } from "@/components/print/LoadingMemo";
import { api } from "@/lib/api-client";
import { isoToDisplay } from "@/lib/dates";
import type { LoadingMemoData } from "@/lib/roadways-print";
import "@/components/print/loading-memo.css";

type Slip = {
  id: number;
  slipNo: string;
  partyName: string;
  lorryNo: string;
  fromStation: string;
  toStation: string;
  receiptDate: string;
  guaranteeWeight: string;
  freight: number;
  advance: number;
  balance: number;
  receiptNo: string;
  remark: string;
};

function slashDate(value: string) {
  const text = isoToDisplay(value) || value;
  return text.replaceAll("-", "/");
}

function PrintInner() {
  const params = useSearchParams();
  const id = Number(params.get("id") || 0);
  const [data, setData] = useState<LoadingMemoData | null>(null);

  useEffect(() => {
    if (!id) return;
    api<Slip[]>("/api/slips").then((rows) => {
      const row = rows.find((r) => r.id === id);
      if (!row) {
        setData(null);
        return;
      }
      setData({
        slipNo: row.receiptNo || row.slipNo || String(row.id),
        date: slashDate(row.receiptDate),
        partyName: row.partyName,
        lorryNo: row.lorryNo,
        fromStation: row.fromStation,
        toStation: row.toStation,
        guaranteeWeight: row.guaranteeWeight,
        freight: row.freight,
        advance: row.advance,
        balance: row.balance,
        remark: row.remark,
      });
      setTimeout(() => window.print(), 400);
    });
  }, [id]);

  if (!id) return <p className="p-8">Slip id missing.</p>;
  if (!data) return <p className="p-8">Loading Loading Memo…</p>;

  return (
    <div className="lm-page">
      <div className="no-print mb-3 flex justify-center gap-2">
        <button type="button" className="btn-admin btn-admin-solid bg-[#0f766e]" onClick={() => window.print()}>
          Print
        </button>
      </div>
      <LoadingMemo data={data} />
    </div>
  );
}

export default function BookingSlipPrintPage() {
  return (
    <Suspense fallback={<p className="p-8">Loading...</p>}>
      <PrintInner />
    </Suspense>
  );
}
