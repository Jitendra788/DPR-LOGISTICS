"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LrConsignmentNote, type LrPrintBooking } from "@/components/print/LrConsignmentNote";
import { api } from "@/lib/api-client";

type Party = { name: string; address: string; gst: string };

function findParty(parties: Party[], name: string) {
  const q = name.trim().toLowerCase();
  return parties.find((p) => p.name.trim().toLowerCase() === q);
}

function PrintInner() {
  const params = useSearchParams();
  const lrNo = params.get("lrNo") ?? "";
  const [row, setRow] = useState<LrPrintBooking | null>(null);
  const [parties, setParties] = useState<Party[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!lrNo) {
      setError("Missing LR number");
      return;
    }
    Promise.all([
      api<LrPrintBooking>(`/api/public/booking?lrNo=${encodeURIComponent(lrNo)}`),
      api<Party[]>("/api/parties").catch(() => [] as Party[]),
    ])
      .then(([data, partyRows]) => {
        setRow(data);
        setParties(partyRows);
        setTimeout(() => window.print(), 500);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Not found"));
  }, [lrNo]);

  const consignorParty = useMemo(() => (row ? findParty(parties, row.consignor) : undefined), [parties, row]);
  const consigneeParty = useMemo(() => (row ? findParty(parties, row.consignee) : undefined), [parties, row]);

  if (error) return <p className="p-8">{error}</p>;
  if (!row) return <p className="p-8">Loading LR...</p>;

  return (
    <div className="lr-print-page">
      {["Consignor Copy", "Lorry Copy", "Consignee Copy"].map((copyLabel) => (
        <LrConsignmentNote
          key={copyLabel}
          booking={row}
          copyLabel={copyLabel}
          consignorParty={consignorParty}
          consigneeParty={consigneeParty}
        />
      ))}
    </div>
  );
}

export default function CustomerBookingPrintPage() {
  return (
    <Suspense fallback={<p className="p-8">Loading...</p>}>
      <PrintInner />
    </Suspense>
  );
}
