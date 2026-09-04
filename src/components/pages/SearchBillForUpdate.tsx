"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard } from "@/components/ui/FormCard";
import { ComboboxField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Flash } from "@/components/ui/Flash";
import { AdminForm } from "@/components/ui/AdminForm";
import { api } from "@/lib/api-client";
import { dprBillEditHref, isMeterBill, roadwaysBillEditHref } from "@/lib/bill-route";

type Bill = { billNo: string; billAt?: string; source?: string; partyName?: string };
type Lr = { billNo?: string; billAs?: string; source?: string };

/**
 * Old site searchbillAll.aspx / searchbillAllR.aspx:
 * "Search Bill For Update" → Enter Bill No → open Weight/Meter bill for update.
 */
export function SearchBillForUpdate({
  source = "DPR",
}: {
  source?: "DPR" | "ROADWAYS";
}) {
  const router = useRouter();
  const [billNo, setBillNo] = useState("");
  const [bills, setBills] = useState<Bill[]>([]);
  const [bookings, setBookings] = useState<Lr[]>([]);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const billOptions = useMemo(() => {
    return bills
      .filter((b) => {
        if (source === "ROADWAYS") return (b.source || "DPR") === "ROADWAYS";
        return (b.source || "DPR") !== "ROADWAYS";
      })
      .map((b) => b.billNo)
      .filter(Boolean);
  }, [bills, source]);

  useEffect(() => {
    Promise.all([api<Bill[]>("/api/bills"), api<Lr[]>("/api/bookings")]).then(([allBills, allLrs]) => {
      setBills(allBills);
      setBookings(allLrs);
    });
  }, []);

  async function search(e: FormEvent) {
    e.preventDefault();
    if (!billNo.trim()) {
      setMessage({ type: "err", text: "Enter Bill No for Search" });
      return;
    }

    const all = bills.length ? bills : await api<Bill[]>("/api/bills");
    const found = all.find((b) => {
      if (b.billNo.toLowerCase() !== billNo.trim().toLowerCase()) return false;
      if (source === "ROADWAYS") return (b.source || "DPR") === "ROADWAYS";
      return (b.source || "DPR") !== "ROADWAYS";
    });

    if (!found) {
      setMessage({ type: "err", text: "Bill not found" });
      return;
    }

    const linkedAs = (bookings.length ? bookings : await api<Lr[]>("/api/bookings"))
      .filter((lr) => (lr.billNo || "").toLowerCase() === found.billNo.toLowerCase())
      .map((lr) => lr.billAs);
    const meter = isMeterBill(found, linkedAs);
    const href = source === "ROADWAYS" ? roadwaysBillEditHref(found.billNo, meter) : dprBillEditHref(found.billNo, meter);
    setMessage({ type: "ok", text: `Opening bill ${found.billNo}…` });
    router.push(href);
  }

  return (
    <>
      <PageHeader
        title="Search Bill For Update"
        subtitle="Enter Data For Search"
        crumbs={[
          { label: "Home", href: "/dashboard" },
          { label: source === "ROADWAYS" ? "DPR Roadways" : "Bill Prepration" },
          { label: "Search Bill" },
        ]}
      />
      <Flash message={message} />
      <AdminForm onSubmit={search}>
        <FormCard>
          <div className="erp-search-bill-panel">
            <div className="erp-search-bill-row">
              <ComboboxField
                label="Enter Bill No for Search"
                value={billNo}
                onChange={setBillNo}
                options={billOptions}
                placeholder="Search or select bill no"
              />
              <Button type="submit" variant="teal">
                Search
              </Button>
            </div>
            <p className="erp-search-bill-meta">
              {billOptions.length ? `${billOptions.length} bill(s) available` : "Loading bills…"}
            </p>
          </div>
        </FormCard>
      </AdminForm>
    </>
  );
}
