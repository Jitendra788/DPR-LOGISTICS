"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api-client";

type Bill = {
  billNo: string;
  partyName: string;
  fromDate: string;
  toDate: string;
  amount: number;
  lrCount: number;
};

function PrintInner() {
  const params = useSearchParams();
  const billNo = params.get("billNo") ?? "";
  const [bill, setBill] = useState<Bill | null>(null);

  useEffect(() => {
    api<Bill[]>("/api/bills").then((rows) => {
      setBill(rows.find((r) => r.billNo === billNo) ?? null);
      setTimeout(() => window.print(), 400);
    });
  }, [billNo]);

  if (!bill) return <p className="p-8">Loading bill...</p>;

  return (
    <div className="p-8">
      <h1 className="mb-4 text-center text-xl font-bold">DPR Logistics — Bill</h1>
      <div className="space-y-2 text-sm">
        <p><b>Bill No:</b> {bill.billNo}</p>
        <p><b>Party:</b> {bill.partyName}</p>
        <p><b>Period:</b> {bill.fromDate} to {bill.toDate}</p>
        <p><b>LR Count:</b> {bill.lrCount}</p>
        <p><b>Amount:</b> ₹ {bill.amount.toFixed(2)}</p>
      </div>
    </div>
  );
}

export default function BillPrintPage() {
  return (
    <Suspense fallback={<p className="p-8">Loading...</p>}>
      <PrintInner />
    </Suspense>
  );
}
