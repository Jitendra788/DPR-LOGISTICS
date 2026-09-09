"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LrConsignmentNote, type LrPrintBooking, type LrPrintParty } from "@/components/print/LrConsignmentNote";
import { api } from "@/lib/api-client";
import { ROADWAYS_LOGO_PRINT, ROADWAYS_STAMP_PRINT } from "@/lib/brand";
import { printWhenReady } from "@/lib/print-when-ready";
import { roadwaysPrintCompany } from "@/lib/roadways-print";

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
  const copiesParam = params.get("copies") || "Consignor,Lorry,Consignee";
  const copies = copiesParam
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
  const [row, setRow] = useState<LrPrintBooking | null>(null);
  const [consignorParties, setConsignorParties] = useState<LrPrintParty[]>([]);
  const [consigneeParties, setConsigneeParties] = useState<LrPrintParty[]>([]);
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
      consignorParty: LrPrintParty | null;
      consigneeParty: LrPrintParty | null;
      consignorParties?: LrPrintParty[];
      consigneeParties?: LrPrintParty[];
    }>(`/api/bookings/print-data?${qs.toString()}`)
      .then((res) => {
        if (cancelled) return;
        setRow(res.booking);
        setConsignorParties(res.consignorParties?.length ? res.consignorParties : res.consignorParty ? [res.consignorParty] : []);
        setConsigneeParties(res.consigneeParties?.length ? res.consigneeParties : res.consigneeParty ? [res.consigneeParty] : []);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unable to load Roadways LR");
      });
    return () => {
      cancelled = true;
    };
  }, [lrNo, share]);

  useEffect(() => {
    if (!row) return;
    printWhenReady(copies.length > 1 ? 180 : 100);
  }, [row, copies.length]);

  if (error) return <p className="p-8">{error}</p>;
  if (!row) return <p className="p-8">Loading Roadways LR…</p>;

  return (
    <div className="lr-print-page">
      {copies.map((copy) => (
        <LrConsignmentNote
          key={copy}
          booking={row}
          copyLabel={copyMap[copy] || `${copy} Copy`}
          consignorParty={consignorParties[0]}
          consigneeParty={consigneeParties[0]}
          consignorParties={consignorParties}
          consigneeParties={consigneeParties}
          company={roadwaysLrCompany}
          logoSrc={ROADWAYS_LOGO_PRINT}
          stampSrc={ROADWAYS_STAMP_PRINT}
          signFor="For DELHI PUNJAB ROADWAYS"
          gstPartyLabel="DPR"
        />
      ))}
    </div>
  );
}

export default function RoadwaysLrPrintPage() {
  return (
    <Suspense fallback={<p className="p-8">Loading…</p>}>
      <PrintInner />
    </Suspense>
  );
}
