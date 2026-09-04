"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LoadingMemo } from "@/components/print/LoadingMemo";
import { api } from "@/lib/api-client";
import { isoToDisplay } from "@/lib/dates";
import { isMeterBillAs } from "@/lib/lr-totals";
import type { LoadingMemoData } from "@/lib/roadways-print";
import "@/components/print/loading-memo.css";

type PrintPayload = {
  bill: {
    billNo: string;
    billDate: string;
    fromDate: string;
    partyName: string;
    fromStation: string;
    toStation: string;
    freight: number;
    grandTotal: number;
    paidRs: number;
    remark: string;
  };
  lrs: Array<{
    vehNo: string;
    fromStation: string;
    toStation: string;
    chargedWeight: string;
    actWeight: string;
    totalMeter: string;
    billAs: string;
  }>;
};

function slashDate(value: string) {
  const text = isoToDisplay(value) || value;
  return text.replaceAll("-", "/");
}

function PrintInner() {
  const params = useSearchParams();
  const billNo = params.get("billNo") ?? "";
  const [data, setData] = useState<LoadingMemoData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!billNo) return;
    api<PrintPayload>(`/api/bills/print-data?billNo=${encodeURIComponent(billNo)}`)
      .then((res) => {
        const linked = res.lrs || [];
        const vehNos = [...new Set(linked.map((r) => r.vehNo).filter(Boolean))];
        const weights = linked
          .map((r) => {
            if (isMeterBillAs(r.billAs) && r.totalMeter) return `${r.totalMeter} Mtr`;
            return r.chargedWeight || r.actWeight || "";
          })
          .filter(Boolean);
        const freight = Number(res.bill.freight) || 0;
        const grand = Number(res.bill.grandTotal) || freight;
        const paid = Number(res.bill.paidRs) || 0;
        setData({
          slipNo: res.bill.billNo,
          date: slashDate(res.bill.billDate || res.bill.fromDate),
          partyName: res.bill.partyName,
          lorryNo: vehNos.join(", "),
          fromStation: res.bill.fromStation || linked[0]?.fromStation || "",
          toStation: res.bill.toStation || linked[0]?.toStation || "",
          guaranteeWeight: weights[0] || weights.join(", "),
          freight,
          advance: paid,
          balance: Number(Math.max(0, grand - paid).toFixed(2)),
          remark: res.bill.remark,
        });
        setTimeout(() => window.print(), 400);
      })
      .catch(() => setError("Could not load bill"));
  }, [billNo]);

  if (!billNo) return <p className="p-8">Bill number missing.</p>;
  if (error) return <p className="p-8">{error}</p>;
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

/** Roadways bill print — Loading Memo format (separate from DPR tax invoice). */
export default function RoadwaysBillPrintPage() {
  return (
    <Suspense fallback={<p className="p-8">Loading…</p>}>
      <PrintInner />
    </Suspense>
  );
}
