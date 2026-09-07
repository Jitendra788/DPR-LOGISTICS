"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BillTaxInvoice, type BillPrintData, type BillPrintVariant } from "@/components/print/BillTaxInvoice";
import { api } from "@/lib/api-client";
import { isMeterBill } from "@/lib/bill-route";
import { lrPrintCompany } from "@/lib/lr-print";
import "@/components/print/bill-print.css";

function PrintInner() {
  const params = useSearchParams();
  const billNo = params.get("billNo") ?? "";
  const share = params.get("share") ?? "";
  const [data, setData] = useState<BillPrintData | null>(null);
  const [variant, setVariant] = useState<BillPrintVariant>("weight");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!billNo) {
      setError("Bill number missing.");
      return;
    }
    let cancelled = false;
    const qs = new URLSearchParams({ billNo });
    if (share) qs.set("share", share);
    api<{
      bill: BillPrintData & {
        poNo: string;
        partyName: string;
        billDate: string;
        billNo: string;
        billAt?: string;
        source?: string;
      };
      party: { address: string; gst: string } | null;
      lrs: Array<BillPrintData["lrs"][number] & { billAs?: string; totalMeter?: string }>;
    }>(`/api/bills/print-data?${qs.toString()}`)
      .then((res) => {
        if (cancelled) return;
        const source = (res.bill.source || "DPR").toUpperCase();
        // Roadways bills use Loading Memo layout (old website style)
        if (source === "ROADWAYS") {
          const rwQs = new URLSearchParams({ billNo });
          if (share) rwQs.set("share", share);
          window.location.replace(`/roadways/bills/print?${rwQs.toString()}`);
          return;
        }
        const meter = isMeterBill(res.bill, res.lrs.map((r) => r.billAs));
        setVariant(meter ? "meter" : "weight");
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
        setTimeout(() => window.print(), 80);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unable to load bill");
      });
    return () => {
      cancelled = true;
    };
  }, [billNo, share]);

  if (error) return <p className="p-8">{error}</p>;
  if (!billNo) return <p className="p-8">Bill number missing.</p>;
  if (!data) return <p className="p-8">Loading bill…</p>;

  return (
    <div className="bill-print-page">
      <BillTaxInvoice data={data} variant={variant} company={lrPrintCompany} docTitle="TAX INVOICE" />
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
