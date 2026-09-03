"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard } from "@/components/ui/FormCard";
import { ComboboxField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Flash } from "@/components/ui/Flash";
import { AdminForm } from "@/components/ui/AdminForm";
import { api } from "@/lib/api-client";

type Bill = { billNo: string };

export default function SearchBillStatusPage() {
  const router = useRouter();
  const [billNo, setBillNo] = useState("");
  const [billOptions, setBillOptions] = useState<string[]>([]);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    api<Bill[]>("/api/bills").then((all) => setBillOptions(all.map((b) => b.billNo).filter(Boolean)));
  }, []);

  async function search(e: FormEvent) {
    e.preventDefault();
    if (!billNo.trim()) {
      setMessage({ type: "err", text: "Select a bill number" });
      return;
    }
    const all = await api<Bill[]>("/api/bills");
    const found = all.find((b) => b.billNo.toLowerCase() === billNo.trim().toLowerCase());
    if (!found) {
      setMessage({ type: "err", text: "Bill not found" });
      return;
    }
    router.push(`/bills/weightwise?billNo=${encodeURIComponent(found.billNo)}`);
  }

  return (
    <>
      <PageHeader
        title="Search Bill For Update"
        subtitle="Search or select bill number, then open for update"
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Search Bill" }]}
      />
      <Flash message={message} />
      <AdminForm onSubmit={search}>
        <FormCard title="Find bill" subtitle="Type to filter the list, then select a bill">
          <div className="erp-search-bill-panel">
            <div className="erp-search-bill-row">
              <ComboboxField
                label="Bill No"
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
