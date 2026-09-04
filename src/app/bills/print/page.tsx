"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BillTaxInvoice, type BillPrintData } from "@/components/print/BillTaxInvoice";
import { api } from "@/lib/api-client";
import "@/components/print/bill-print.css";

function PrintInner() {
  const params = useSearchParams();
  const billNo = params.get("billNo") ?? "";
  const [data, setData] = useState<BillPrintData | null>(null);

  useEffect(() => {
    if (!billNo) return;
    api<{
      bill: BillPrintData & { poNo: string; partyName: string; billDate: string; billNo: string };
      party: { address: string; gst: string } | null;
      lrs: BillPrintData["lrs"];
    }>(`/api/bills/print-data?billNo=${encodeURIComponent(billNo)}`)
      .then((res) => {
        setData({
          billNo: res.bill.billNo,
          billDate: res.bill.billDate,
          poNo: res.bill.poNo,
          partyName: res.bill.partyName,
          partyAddress: res.party?.address ?? "",
          partyGst: res.party?.gst ?? "",
          freight: res.bill.freight,
          cgstPct: res.bill.cgstPct,
          cgstAmt: res.bill.cgstAmt,
          sgstPct: res.bill.sgstPct,
          sgstAmt: res.bill.sgstAmt,
          igstPct: res.bill.igstPct,
          igstAmt: res.bill.igstAmt,
          grandTotal: res.bill.grandTotal,
          lrs: res.lrs,
        });
        setTimeout(() => window.print(), 50);
      })
      .catch(() => setData(null));
  }, [billNo]);

  if (!billNo) return <p className="p-8">Bill number missing.</p>;
  if (!data) return <p className="p-8">Loading bill…</p>;

  return (
    <div className="bill-print-page">
      <BillTaxInvoice data={data} />
    </div>
  );
}

export default function BillPrintPage() {
  return (
    <Suspense fallback={<p className="p-8">Loading…</p>}>
      <PrintInner />
    </Suspense>
  );
}
