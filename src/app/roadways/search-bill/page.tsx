"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { DateField, ComboboxField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { AdminForm } from "@/components/ui/AdminForm";
import { api, downloadCsv } from "@/lib/api-client";
import { todayIso } from "@/lib/dates";

type Party = { name: string };
type Bill = { billNo: string; partyName: string; fromDate: string; toDate: string; amount: number; lrCount: number; source?: string };

export default function RoadwaysSearchBillPage() {
  const router = useRouter();
  const [parties, setParties] = useState<Party[]>([]);
  const [rows, setRows] = useState<Bill[] | null>(null);
  const [allBills, setAllBills] = useState<Bill[]>([]);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [filters, setFilters] = useState({
    partyName: "",
    billNo: "",
    fromDate: todayIso(),
    toDate: todayIso(),
  });
  const billOptions = useMemo(() => {
    const list = allBills.filter((b) => {
      if (b.source && b.source !== "ROADWAYS") return false;
      if (filters.partyName && b.partyName !== filters.partyName) return false;
      return true;
    });
    return list.map((b) => b.billNo).filter(Boolean);
  }, [allBills, filters.partyName]);

  useEffect(() => {
    Promise.all([api<Party[]>("/api/parties"), api<Bill[]>("/api/bills")]).then(([p, bills]) => {
      setParties(p);
      setAllBills(bills);
      setFilters((f) => ({ ...f, partyName: f.partyName || p[0]?.name || "" }));
    });
  }, []);

  async function show(e?: FormEvent) {
    e?.preventDefault();
    const all = await api<Bill[]>("/api/bills");
    const filtered = all.filter((b) => {
      if (b.source && b.source !== "ROADWAYS") return false;
      if (filters.partyName && b.partyName !== filters.partyName) return false;
      if (filters.billNo && !b.billNo.toLowerCase().includes(filters.billNo.toLowerCase())) return false;
      if (filters.fromDate && b.fromDate && b.fromDate < filters.fromDate) return false;
      if (filters.toDate && b.toDate && b.toDate > filters.toDate) return false;
      return true;
    });
    setRows(filtered);
    setMessage({ type: "ok", text: `Found ${filtered.length} bill(s)` });
  }

  return (
    <>
      <PageHeader
        title="Search Bill"
        subtitle="Select Date and View Report"
        subtitleClass="text-red-600"
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Search Bill" }]}
      />
      <Flash message={message} />
      <AdminForm onSubmit={show}>
        <FormCard>
          <TwoCol>
            <div>
              <ComboboxField
                label="Party Name"
                value={filters.partyName}
                onChange={(partyName) => setFilters({ ...filters, partyName, billNo: "" })}
                options={parties.map((p) => p.name)}
                placeholder="Search or select party"
              />
              <DateField label="From Date" value={filters.fromDate} onChange={(fromDate) => setFilters({ ...filters, fromDate })} />
              <Button type="submit">Show All</Button>
            </div>
            <div>
              <ComboboxField
                label="Bill No"
                value={filters.billNo}
                onChange={(billNo) => setFilters({ ...filters, billNo })}
                options={billOptions}
                placeholder="Search or select bill"
              />
              <DateField label="To Date" value={filters.toDate} onChange={(toDate) => setFilters({ ...filters, toDate })} />
            </div>
          </TwoCol>
        </FormCard>
      </AdminForm>
      {rows ? (
        <>
          <FormCard>
            <Button type="button" onClick={() => downloadCsv("roadways-search-bill.csv", rows as unknown as Record<string, unknown>[])}>
              Export to Excel
            </Button>
          </FormCard>
          <DataTable
            rows={rows}
            columns={[
              {
                key: "view",
                header: "View",
                render: (row) => (
                  <Button type="button" size="sm" variant="teal" onClick={() => router.push(`/roadways/bill-weightwise?billNo=${encodeURIComponent(row.billNo)}`)}>
                    View
                  </Button>
                ),
              },
              { key: "billNo", header: "Bill No" },
              { key: "partyName", header: "Party" },
              { key: "fromDate", header: "From" },
              { key: "toDate", header: "To" },
              { key: "lrCount", header: "L.R Count" },
              { key: "amount", header: "Amount" },
            ]}
          />
        </>
      ) : (
        <FormCard className="min-h-16" />
      )}
    </>
  );
}
