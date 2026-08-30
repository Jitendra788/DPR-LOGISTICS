"use client";

import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { DateField, SelectField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { AdminForm } from "@/components/ui/AdminForm";
import { api, downloadCsv } from "@/lib/api-client";
import { todayIso } from "@/lib/dates";

type Party = { name: string };
type Trip = {
  vehNo: string;
  fromStation: string;
  toStation: string;
  lhcDate: string;
  tripDate: string;
  lhcFreight: number;
  freight: number;
  totalKm: string;
  lhcNo: string;
};

export default function MonthwiseReportPage() {
  const [parties, setParties] = useState<Party[]>([]);
  const [partyName, setPartyName] = useState("");
  const [fromDate, setFromDate] = useState(todayIso());
  const [toDate, setToDate] = useState(todayIso());
  const [rows, setRows] = useState<Trip[] | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    api<Party[]>("/api/parties").then(setParties);
  }, []);

  async function show(e?: FormEvent) {
    e?.preventDefault();
    const all = await api<Trip[]>("/api/trips");
    const filtered = all.filter((r) => {
      const d = r.lhcDate || r.tripDate || "";
      if (fromDate && d && d < fromDate) return false;
      if (toDate && d && d > toDate) return false;
      return true;
    });
    setRows(filtered);
    setMessage({ type: "ok", text: `Loaded ${filtered.length} record(s)` });
  }

  return (
    <>
      <PageHeader
        title="Monthwise Margin Report"
        subtitle="Select Data and View Ledger"
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Monthwise Margin Report" }]}
      />
      <Flash message={message} />
      <AdminForm onSubmit={show}>
        <FormCard>
          <TwoCol>
            <div>
              <DateField label="From Date" value={fromDate} onChange={setFromDate} />
              <DateField label="To Date" value={toDate} onChange={setToDate} />
              <Button type="submit" variant="teal">
                View Report
              </Button>
            </div>
            <div>
              <SelectField label="Party Name" value={partyName} onChange={(e) => setPartyName(e.target.value)} options={parties.map((p) => p.name)} />
              <Button type="submit" variant="teal">
                Show Selected Vehicle Ledger
              </Button>
            </div>
          </TwoCol>
        </FormCard>
      </AdminForm>
      <FormCard>
        <Button
          type="button"
          variant="teal"
          disabled={!rows?.length}
          onClick={() => rows && downloadCsv("monthwise-margin.csv", rows as unknown as Record<string, unknown>[])}
        >
          Export as Excel
        </Button>
      </FormCard>
      {rows ? (
        <DataTable
          rows={rows}
          columns={[
            { key: "vehNo", header: "Veh No" },
            { key: "lhcNo", header: "LHC No" },
            { key: "lhcDate", header: "Date" },
            { key: "fromStation", header: "From" },
            { key: "toStation", header: "To" },
            { key: "totalKm", header: "Total KM" },
            { key: "lhcFreight", header: "Freight" },
          ]}
        />
      ) : null}
    </>
  );
}
