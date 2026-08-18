"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { DateField, InputField, ManualNumberField, SelectField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Flash } from "@/components/ui/Flash";
import { api } from "@/lib/api-client";
import { todayIso } from "@/lib/dates";

type Party = { name: string };
type Bill = { billNo: string; partyName: string; amount: number; billDate: string; source?: string };

export function MoneyReceiptSearch({
  source = "DPR",
  reportHref,
  editHref,
}: {
  source?: string;
  reportHref: string;
  editHref: string;
}) {
  const router = useRouter();
  const [parties, setParties] = useState<Party[]>([]);
  const [billNo, setBillNo] = useState("");
  const [partyName, setPartyName] = useState("");
  const [billDate, setBillDate] = useState(todayIso());
  const [tdsPct, setTdsPct] = useState(0);
  const [paidAmt, setPaidAmt] = useState(0);
  const [otherDed, setOtherDed] = useState(0);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const tdsAmt = useMemo(() => Number(((paidAmt * tdsPct) / 100).toFixed(2)), [paidAmt, tdsPct]);

  useEffect(() => {
    api<Party[]>("/api/parties").then(setParties);
  }, []);

  async function findBill(e?: FormEvent) {
    e?.preventDefault();
    if (!billNo.trim()) {
      setMessage({ type: "err", text: "Enter bill no" });
      return;
    }
    const bills = await api<Bill[]>("/api/bills");
    const bill = bills.find((b) => b.billNo.toLowerCase() === billNo.trim().toLowerCase());
    if (!bill) {
      setMessage({ type: "err", text: "Bill not found" });
      return;
    }
    setPartyName(bill.partyName);
    if (bill.billDate) setBillDate(bill.billDate);
    if (!paidAmt && bill.amount) setPaidAmt(bill.amount);
    setMessage({ type: "ok", text: `Loaded bill ${bill.billNo}` });
  }

  async function saveReceipt() {
    if (!billNo.trim() || !partyName) {
      setMessage({ type: "err", text: "Enter bill no and party name" });
      return;
    }
    try {
      await api("/api/receipts", {
        method: "POST",
        body: JSON.stringify({
          billNo: billNo.trim(),
          partyName,
          date: billDate || todayIso(),
          tdsPct,
          tdsAmt,
          paidAmt,
          otherDed,
          amount: paidAmt,
          source,
        }),
      });
      setMessage({ type: "ok", text: "Money reciept saved" });
      setBillNo("");
      setPartyName("");
      setTdsPct(0);
      setPaidAmt(0);
      setOtherDed(0);
      setBillDate(todayIso());
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Save failed" });
    }
  }

  return (
    <>
      <PageHeader
        title="Money Reciept"
        subtitle="Select and fill data for the payment"
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Money Reciept" }]}
      />
      <Flash message={message} />
      <form onSubmit={findBill}>
        <FormCard>
          <div className="mb-3 flex flex-wrap gap-2">
            <Button type="button" variant="teal" onClick={() => router.push(editHref)}>
              Edit/Delete Money Reciept
            </Button>
            <Button type="button" onClick={() => router.push(reportHref)}>
              View Report
            </Button>
          </div>
          <TwoCol>
            <div>
              <InputField label="Enter Bill No For Search" value={billNo} onChange={(e) => setBillNo(e.target.value)} />
              <SelectField label="Party Name" value={partyName} onChange={(e) => setPartyName(e.target.value)} options={parties.map((p) => p.name)} />
              <DateField label="Bill Date" value={billDate} onChange={setBillDate} />
              <Button type="submit" variant="teal">
                Search Bill
              </Button>
            </div>
            <div>
              <ManualNumberField label="Tds %" value={tdsPct} onChange={setTdsPct} />
              <ManualNumberField label="TDS Amt" value={tdsAmt} readOnly />
              <ManualNumberField label="Paid Amt" value={paidAmt} onChange={setPaidAmt} />
              <ManualNumberField label="Other Ded" value={otherDed} onChange={setOtherDed} />
              <Button type="button" onClick={saveReceipt}>
                Save Reciept
              </Button>
            </div>
          </TwoCol>
        </FormCard>
      </form>
    </>
  );
}
