"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api-client";

type Booking = {
  lrNo: string;
  lrDate: string;
  fromStation: string;
  toStation: string;
  vehNo: string;
  billingParty: string;
  consignor: string;
  consignee: string;
  particulars: string;
  articles: string;
  chargedWeight: string;
  freight: number;
  gst: number;
  grandTotal: number;
  deliveryAt: string;
};

function PrintInner() {
  const params = useSearchParams();
  const lrNo = params.get("lrNo") ?? "";
  const copies = (params.get("copies") || "Consignor").split(",").filter(Boolean);
  const [row, setRow] = useState<Booking | null>(null);

  useEffect(() => {
    api<Booking[]>("/api/bookings").then((rows) => {
      setRow(rows.find((r) => r.lrNo === lrNo) ?? null);
      setTimeout(() => window.print(), 400);
    });
  }, [lrNo]);

  if (!row) return <p className="p-8">Loading LR...</p>;

  return (
    <div className="space-y-8 p-8 print:p-4">
      {copies.map((copy) => (
        <div key={copy} className="break-after-page border p-6">
          <h1 className="text-center text-xl font-bold">DPR Logistics — Lorry Receipt</h1>
          <p className="mb-4 text-center text-sm">{copy} Copy</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p><b>LR No:</b> {row.lrNo}</p>
            <p><b>Date:</b> {row.lrDate}</p>
            <p><b>From:</b> {row.fromStation}</p>
            <p><b>To:</b> {row.toStation}</p>
            <p><b>Vehicle:</b> {row.vehNo}</p>
            <p><b>Delivery:</b> {row.deliveryAt}</p>
            <p><b>Billing Party:</b> {row.billingParty}</p>
            <p><b>Consignor:</b> {row.consignor}</p>
            <p><b>Consignee:</b> {row.consignee}</p>
            <p><b>Articles:</b> {row.articles}</p>
            <p><b>Particulars:</b> {row.particulars}</p>
            <p><b>Weight:</b> {row.chargedWeight}</p>
            <p><b>Freight:</b> {row.freight}</p>
            <p><b>GST:</b> {row.gst}</p>
            <p><b>Grand Total:</b> {row.grandTotal}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LrPrintPage() {
  return (
    <Suspense fallback={<p className="p-8">Loading...</p>}>
      <PrintInner />
    </Suspense>
  );
}
