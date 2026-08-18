"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api-client";
import { isoToDisplay } from "@/lib/dates";
import { lrPrintCompany } from "@/lib/lr-print";

type Slip = {
  id: number;
  slipNo: string;
  partyName: string;
  lorryNo: string;
  fromStation: string;
  toStation: string;
  receiptDate: string;
  guaranteeWeight: string;
  freight: number;
  advance: number;
  balance: number;
  receiptNo: string;
  remark: string;
};

function PrintInner() {
  const params = useSearchParams();
  const id = Number(params.get("id") || 0);
  const [row, setRow] = useState<Slip | null>(null);

  useEffect(() => {
    if (!id) return;
    api<Slip[]>(`/api/slips`).then((rows) => {
      setRow(rows.find((r) => r.id === id) ?? null);
      setTimeout(() => window.print(), 400);
    });
  }, [id]);

  if (!row) return <p className="p-8">Loading booking slip...</p>;

  return (
    <div className="mx-auto max-w-[210mm] bg-white p-8 text-black">
      <h1 className="text-center text-xl font-bold">{lrPrintCompany.name}</h1>
      <p className="text-center text-sm">{lrPrintCompany.tagline}</p>
      <p className="mb-4 text-center text-sm">{lrPrintCompany.address}</p>
      <h2 className="mb-4 text-center text-lg font-bold underline">BOOKING SLIP</h2>
      <table className="w-full border-collapse text-sm">
        <tbody>
          {[
            ["Receipt No", row.receiptNo, "Date", isoToDisplay(row.receiptDate) || row.receiptDate],
            ["Party Name", row.partyName, "Lorry No", row.lorryNo],
            ["From", row.fromStation, "To", row.toStation],
            ["Weight", row.guaranteeWeight, "Freight", String(row.freight || "")],
            ["Advance", String(row.advance || ""), "Balance", String(row.balance || "")],
            ["Remark", row.remark, "Sr No", row.slipNo],
          ].map((cells) => (
            <tr key={cells.join("-")}>
              <td className="border border-black px-2 py-1 font-semibold">{cells[0]}</td>
              <td className="border border-black px-2 py-1">{cells[1]}</td>
              <td className="border border-black px-2 py-1 font-semibold">{cells[2]}</td>
              <td className="border border-black px-2 py-1">{cells[3]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-8 text-right text-sm">For {lrPrintCompany.name}</p>
    </div>
  );
}

export default function BookingSlipPrintPage() {
  return (
    <Suspense fallback={<p className="p-8">Loading...</p>}>
      <PrintInner />
    </Suspense>
  );
}
