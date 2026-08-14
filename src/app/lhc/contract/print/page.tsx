"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api-client";

type Lhc = {
  challanNo: string;
  challanDate: string;
  vehNo: string;
  fromStation: string;
  toStation: string;
  ownerName: string;
  driverName: string;
  brokerName: string;
  lorryFreight: number;
  totalAdvance: number;
  balance: number;
  lrNos: string;
};

function PrintInner() {
  const params = useSearchParams();
  const challanNo = params.get("challanNo") ?? "";
  const [row, setRow] = useState<Lhc | null>(null);

  useEffect(() => {
    api<Lhc[]>("/api/lhc").then((rows) => {
      setRow(rows.find((r) => r.challanNo === challanNo) ?? null);
      setTimeout(() => window.print(), 400);
    });
  }, [challanNo]);

  if (!row) return <p className="p-8">Loading challan...</p>;

  return (
    <div className="p-8">
      <h1 className="mb-4 text-center text-xl font-bold">DPR Logistics — Lorry Hire Contract</h1>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <p><b>Challan No:</b> {row.challanNo}</p>
        <p><b>Date:</b> {row.challanDate}</p>
        <p><b>Vehicle:</b> {row.vehNo}</p>
        <p><b>Broker:</b> {row.brokerName}</p>
        <p><b>From:</b> {row.fromStation}</p>
        <p><b>To:</b> {row.toStation}</p>
        <p><b>Owner:</b> {row.ownerName}</p>
        <p><b>Driver:</b> {row.driverName}</p>
        <p><b>Freight:</b> {row.lorryFreight}</p>
        <p><b>Advance:</b> {row.totalAdvance}</p>
        <p><b>Balance:</b> {row.balance}</p>
        <p><b>Linked LRs:</b> {row.lrNos}</p>
      </div>
    </div>
  );
}

export default function LhcPrintPage() {
  return (
    <Suspense fallback={<p className="p-8">Loading...</p>}>
      <PrintInner />
    </Suspense>
  );
}
