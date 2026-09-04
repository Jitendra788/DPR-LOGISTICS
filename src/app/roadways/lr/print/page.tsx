"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LrConsignmentNote, type LrPrintBooking } from "@/components/print/LrConsignmentNote";
import { api } from "@/lib/api-client";
import { roadwaysPrintCompany } from "@/lib/roadways-print";

type Party = { name: string; address: string; gst: string };

const copyMap: Record<string, string> = {
  Consignor: "Consignor Copy",
  Lorry: "Lorry Copy",
  Consignee: "Consignee Copy",
};

const roadwaysLrCompany = {
  name: roadwaysPrintCompany.name,
  tagline: roadwaysPrintCompany.tagline,
  address: roadwaysPrintCompany.address,
  email: roadwaysPrintCompany.email,
  phones: roadwaysPrintCompany.phones,
  jurisdiction: roadwaysPrintCompany.jurisdiction,
  customerCare: roadwaysPrintCompany.customerCare,
  companyGst: roadwaysPrintCompany.companyGst,
  companyPan: roadwaysPrintCompany.companyPan,
  blessings: roadwaysPrintCompany.blessings,
};

function PrintInner() {
  const params = useSearchParams();
  const lrNo = params.get("lrNo") ?? "";
  const share = params.get("share") ?? "";
  const copies = (params.get("copies") || "Consignor").split(",").filter(Boolean);
  const [row, setRow] = useState<LrPrintBooking | null>(null);
  const [consignorParty, setConsignorParty] = useState<Party | undefined>();
  const [consigneeParty, setConsigneeParty] = useState<Party | undefined>();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!lrNo) {
      setError("Missing LR number");
      return;
    }
    let cancelled = false;
    const qs = new URLSearchParams({ lrNo, source: "ROADWAYS" });
    if (share) qs.set("share", share);
    api<{
      booking: LrPrintBooking;
      consignorParty: Party | null;
      consigneeParty: Party | null;
    }>(`/api/bookings/print-data?${qs.toString()}`)
      .then((res) => {
        if (cancelled) return;
        setRow(res.booking);
        setConsignorParty(res.consignorParty ?? undefined);
        setConsigneeParty(res.consigneeParty ?? undefined);
        requestAnimationFrame(() => {
          setTimeout(() => window.print(), 50);
        });
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unable to load Roadways LR");
      });
    return () => {
      cancelled = true;
    };
  }, [lrNo, share]);

  if (error) return <p className="p-8">{error}</p>;
  if (!row) return <p className="p-8">Loading Roadways LR…</p>;

  return (
    <div className="lr-print-page">
      {copies.map((copy) => (
        <LrConsignmentNote
          key={copy}
          booking={row}
          copyLabel={copyMap[copy] || `${copy} Copy`}
          consignorParty={consignorParty}
          consigneeParty={consigneeParty}
          company={roadwaysLrCompany}
        />
      ))}
    </div>
  );
}

/** Roadways LR print — DELHI PUNJAB ROADWAYS branding (old LrBookingRoadways.aspx). */
export default function RoadwaysLrPrintPage() {
  return (
    <Suspense fallback={<p className="p-8">Loading…</p>}>
      <PrintInner />
    </Suspense>
  );
}
