"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LrConsignmentNote, type LrPrintBooking } from "@/components/print/LrConsignmentNote";
import { api } from "@/lib/api-client";

type Party = { name: string; address: string; gst: string };

const copyMap: Record<string, string> = {
  Consignor: "Consignor Copy",
  Lorry: "Lorry Copy",
  Consignee: "Consignee Copy",
};

function findParty(parties: Party[], name: string) {
  const q = name.trim().toLowerCase();
  return parties.find((p) => p.name.trim().toLowerCase() === q);
}

function PrintInner() {
  const params = useSearchParams();
  const lrNo = params.get("lrNo") ?? "";
  const copies = (params.get("copies") || "Consignor").split(",").filter(Boolean);
  const [row, setRow] = useState<LrPrintBooking | null>(null);
  const [parties, setParties] = useState<Party[]>([]);

  useEffect(() => {
    Promise.all([api<LrPrintBooking[]>("/api/bookings"), api<Party[]>("/api/parties")]).then(([rows, partyRows]) => {
      setParties(partyRows);
      setRow(rows.find((r) => r.lrNo === lrNo) ?? null);
      setTimeout(() => window.print(), 500);
    });
  }, [lrNo]);

  const consignorParty = useMemo(() => (row ? findParty(parties, row.consignor) : undefined), [parties, row]);
  const consigneeParty = useMemo(() => (row ? findParty(parties, row.consignee) : undefined), [parties, row]);

  if (!row) return <p className="p-8">Loading LR...</p>;

  return (
    <div className="lr-print-page">
      {copies.map((copy) => (
        <LrConsignmentNote
          key={copy}
          booking={row}
          copyLabel={copyMap[copy] || `${copy} Copy`}
          consignorParty={consignorParty}
          consigneeParty={consigneeParty}
        />
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
