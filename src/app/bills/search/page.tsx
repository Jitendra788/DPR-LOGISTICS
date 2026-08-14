"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard } from "@/components/ui/FormCard";
import { FieldWrap } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Flash } from "@/components/ui/Flash";
import { api } from "@/lib/api-client";

type Bill = { billNo: string };

export default function SearchBillStatusPage() {
  const router = useRouter();
  const [billNo, setBillNo] = useState("");
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function search(e: FormEvent) {
    e.preventDefault();
    if (!billNo.trim()) {
      setMessage({ type: "err", text: "Enter bill no" });
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
        subtitle="Enter Details For Search"
        crumbs={[{ label: "Home", href: "/" }, { label: "Search Bill" }]}
      />
      <Flash message={message} />
      <form onSubmit={search}>
        <FormCard>
          <div className="flex w-full max-w-3xl flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <FieldWrap label="Enter Bill No for Search" className="mb-0 min-w-0 w-full flex-1 sm:min-w-[280px]">
              <input className="form-control" value={billNo} onChange={(e) => setBillNo(e.target.value)} />
            </FieldWrap>
            <Button type="submit" variant="teal" className="w-full sm:w-auto">
              Search
            </Button>
          </div>
        </FormCard>
      </form>
    </>
  );
}
