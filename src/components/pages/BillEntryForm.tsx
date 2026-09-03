"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { DateField, ComboboxField, DropdownField, InputField, ManualNumberField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Flash } from "@/components/ui/Flash";
import { DataTable } from "@/components/ui/DataTable";
import { useCrud } from "@/hooks/useCrud";
import { api } from "@/lib/api-client";
import { isoToDisplay, todayIso } from "@/lib/dates";
import { billFreightAmount, billGrandTotal, calcBillTaxes } from "@/lib/bill-totals";
import { lrBillableAmount } from "@/lib/lr-totals";

type Party = { name: string };
type LrRow = {
  id: number;
  lrNo: string;
  lrDate: string;
  fromStation: string;
  toStation: string;
  vehNo: string;
  billingParty: string;
  billAs: string;
  chargedWeight: string;
  totalMeter: string;
  freight?: number;
  serviceTax?: number;
  haltage?: number;
  insurance?: number;
  stCharges?: number;
  doorCollection?: number;
  barrier?: number;
  other?: number;
  hamali?: number;
  total?: number;
  gst?: number;
  grandTotal: number;
  billed: boolean;
  billNo: string;
  source: string;
};
type Bill = {
  id: number;
  billNo: string;
  partyName: string;
  poNo: string;
  billAt: string;
  billDate: string;
  amount: number;
  cgstPct: number;
  cgstAmt: number;
  sgstPct: number;
  sgstAmt: number;
  igstPct: number;
  igstAmt: number;
  paidRs: number;
  remark: string;
  scanDate: string;
  submitDate: string;
  source: string;
};

function matchesBillAs(row: LrRow, variant: "weight" | "meter", billAs?: string) {
  const as = (row.billAs || "Weight").toLowerCase();
  if (billAs) return as === billAs.toLowerCase();
  if (variant === "meter") return as === "mtr" || as === "meter";
  return as !== "mtr" && as !== "meter";
}

function matchesSource(row: LrRow, source: string) {
  if (source === "ROADWAYS") return row.source === "ROADWAYS";
  return row.source !== "ROADWAYS";
}

export function BillEntryForm({
  title,
  variant,
  source = "DPR",
  searchHref = "/bills/search",
  crumb = "Bill Prepration",
}: {
  title: string;
  variant: "weight" | "meter";
  source?: string;
  searchHref?: string;
  crumb?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { rows, message, update, setMessage, reload } = useCrud<Bill>("bills");
  const [parties, setParties] = useState<Party[]>([]);
  const partyNames = parties.map((p) => p.name).filter(Boolean);
  const [bookings, setBookings] = useState<LrRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    billNo: "01",
    poNo: "",
    billAt: "",
    billAs: "",
    billDate: todayIso(),
    partyName: "",
    amount: 0,
    cgstPct: 9,
    sgstPct: 9,
    igstPct: 0,
    paidRs: 0,
    remark: "",
    scanDate: todayIso(),
    submitDate: todayIso(),
    source,
  });

  const cgstAmt = useMemo(() => Number(((form.amount * form.cgstPct) / 100).toFixed(2)), [form.amount, form.cgstPct]);
  const sgstAmt = useMemo(() => Number(((form.amount * form.sgstPct) / 100).toFixed(2)), [form.amount, form.sgstPct]);
  const igstAmt = useMemo(() => Number(((form.amount * form.igstPct) / 100).toFixed(2)), [form.amount, form.igstPct]);
  const grand = useMemo(() => Number((form.amount + cgstAmt + sgstAmt + igstAmt).toFixed(2)), [form.amount, cgstAmt, sgstAmt, igstAmt]);

  const visibleLrs = useMemo(() => {
    if (!form.partyName) return [];
    if (editId) return bookings.filter((row) => row.billNo === form.billNo);
    return bookings.filter(
      (row) =>
        row.billingParty === form.partyName &&
        !row.billed &&
        matchesBillAs(row, variant, form.billAs) &&
        matchesSource(row, source),
    );
  }, [bookings, form.partyName, form.billNo, form.billAs, editId, variant, source]);

  useEffect(() => {
    Promise.all([api<Party[]>("/api/parties"), api<{ value: string }>("/api/next-no?type=bill"), api<LrRow[]>("/api/bookings")]).then(
      ([p, next, lrs]) => {
        setParties(p);
        setBookings(lrs);
        setForm((f) => ({ ...f, billNo: f.billNo === "01" ? next.value : f.billNo }));
      },
    );
  }, []);

  useEffect(() => {
    if (!editId || !form.billNo || !bookings.length) return;
    setSelectedIds(bookings.filter((b) => b.billNo === form.billNo).map((b) => b.id));
  }, [bookings, editId, form.billNo]);

  useEffect(() => {
    const q = searchParams.get("billNo");
    if (!q || !rows.length) return;
    const found = rows.find((r) => r.billNo.toLowerCase().includes(q.toLowerCase()) || r.billNo.toLowerCase() === q.toLowerCase());
    if (found) load(found);
  }, [searchParams, rows]);

  useEffect(() => {
    if (editId || !form.partyName) return;
    const ids = visibleLrs.map((row) => row.id);
    setSelectedIds(ids);
    const sum = visibleLrs.reduce((s, row) => s + lrBillableAmount(row), 0);
    setForm((f) => ({ ...f, amount: Number(sum.toFixed(2)) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.partyName, visibleLrs.map((row) => row.id).join(","), editId]);

  function fillAmount(ids: number[], list: LrRow[]) {
    const sum = list.filter((row) => ids.includes(row.id)).reduce((s, row) => s + lrBillableAmount(row), 0);
    setForm((f) => ({ ...f, amount: Number(sum.toFixed(2)) }));
  }

  function toggleLr(id: number, checked: boolean) {
    if (editId) return;
    const next = checked ? [...selectedIds, id] : selectedIds.filter((x) => x !== id);
    setSelectedIds(next);
    fillAmount(next, visibleLrs);
  }

  function load(row: Bill) {
    const linked = bookings.filter((b) => b.billNo === row.billNo);
    const lrSum = linked.reduce((s, r) => s + lrBillableAmount(r), 0);
    const freight = billFreightAmount(row, lrSum);
    setEditId(row.id);
    setForm({
      billNo: row.billNo,
      poNo: row.poNo,
      billAt: row.billAt,
      billAs: row.billAt || "",
      billDate: row.billDate || todayIso(),
      partyName: row.partyName,
      amount: freight,
      cgstPct: row.cgstPct,
      sgstPct: row.sgstPct,
      igstPct: row.igstPct,
      paidRs: row.paidRs,
      remark: row.remark,
      scanDate: row.scanDate || todayIso(),
      submitDate: row.submitDate || todayIso(),
      source: row.source || source,
    });
    setSelectedIds(linked.map((b) => b.id));
    setMessage({ type: "ok", text: `Loaded bill ${row.billNo}` });
  }

  function billFields() {
    const taxes = calcBillTaxes(form.amount, form.cgstPct, form.sgstPct, form.igstPct);
    return {
      billNo: form.billNo,
      poNo: form.poNo,
      billAt: form.billAs || form.billAt,
      billDate: form.billDate,
      partyName: form.partyName,
      amount: form.amount,
      cgstPct: form.cgstPct,
      sgstPct: form.sgstPct,
      igstPct: form.igstPct,
      paidRs: form.paidRs,
      remark: form.remark,
      scanDate: form.scanDate,
      submitDate: form.submitDate,
      fromDate: form.billDate,
      toDate: form.billDate,
      cgstAmt: taxes.cgstAmt,
      sgstAmt: taxes.sgstAmt,
      igstAmt: taxes.igstAmt,
      source,
    };
  }

  async function saveNew(e: FormEvent) {
    e.preventDefault();
    if (editId) return;
    if (!form.partyName) {
      setMessage({ type: "err", text: "Select billing party" });
      return;
    }
    if (!selectedIds.length) {
      setMessage({ type: "err", text: "No unbilled LRs selected" });
      return;
    }
    setSaving(true);
    try {
      const result = await api<{ bill: Bill; lrCount: number }>("/api/bills/generate", {
        method: "POST",
        body: JSON.stringify({
          ...billFields(),
          billAs: form.billAs || (variant === "meter" ? "Mtr" : "Weight"),
          lrIds: selectedIds,
        }),
      });
      setMessage({ type: "ok", text: `Bill ${result.bill.billNo} generated for ${result.lrCount} LR(s)` });
      await reset();
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Bill failed" });
    } finally {
      setSaving(false);
    }
  }

  async function modify() {
    if (!editId) return;
    if (!form.partyName) {
      setMessage({ type: "err", text: "Party name is required" });
      return;
    }
    setSaving(true);
    try {
      const saved = await update(editId, billFields());
      if (saved) {
        setMessage({ type: "ok", text: `Bill ${form.billNo} updated` });
        await reload();
      }
    } finally {
      setSaving(false);
    }
  }

  function printBill() {
    if (!form.billNo.trim()) {
      setMessage({ type: "err", text: "Save or load a bill first" });
      return;
    }
    window.open(`/bills/print?billNo=${encodeURIComponent(form.billNo.trim())}`, "_blank");
  }

  async function del() {
    if (!editId) return;
    if (!confirm("Delete this record?")) return;
    try {
      await api("/api/bills/unlink", { method: "POST", body: JSON.stringify({ billNo: form.billNo }) });
      await api(`/api/bills/${editId}?billNo=${encodeURIComponent(form.billNo)}`, { method: "DELETE" });
      setMessage({ type: "ok", text: "Deleted successfully" });
      await reset();
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Delete failed" });
    }
  }

  async function reset() {
    setEditId(null);
    setSelectedIds([]);
    const [next, lrs] = await Promise.all([api<{ value: string }>("/api/next-no?type=bill"), api<LrRow[]>("/api/bookings")]);
    setBookings(lrs);
    setForm({
      billNo: next.value,
      poNo: "",
      billAt: "",
      billAs: "",
      billDate: todayIso(),
      partyName: "",
      amount: 0,
      cgstPct: 9,
      sgstPct: 9,
      igstPct: 0,
      paidRs: 0,
      remark: "",
      scanDate: todayIso(),
      submitDate: todayIso(),
      source,
    });
    await reload();
  }

  return (
    <>
      <PageHeader title={title} subtitle="Fill all the fields" crumbs={[{ label: "Home", href: "/dashboard" }, { label: crumb }]} />
      <Flash message={message} />
      <form onSubmit={saveNew}>
        {variant === "meter" ? (
          <FormCard>
            <TwoCol>
              <div>
                <DropdownField
                  label="Bill As"
                  value={form.billAs || "Weight"}
                  onChange={(e) => setForm({ ...form, billAs: e.target.value, billAt: e.target.value })}
                  options={["Mtr", "Weight", "Package"]}
                />
                <InputField label="Bill No" value={form.billNo} onChange={(e) => setForm({ ...form, billNo: e.target.value })} required />
                <DateField label="Bill Date" value={form.billDate} onChange={(billDate) => setForm({ ...form, billDate })} />
              </div>
              <div>
                <InputField label="PO No" value={form.poNo} onChange={(e) => setForm({ ...form, poNo: e.target.value })} />
                <ComboboxField
                  label="Party Name"
                  value={form.partyName}
                  onChange={(partyName) => setForm({ ...form, partyName })}
                  options={partyNames}
                  placeholder="Search or select party"
                />
              </div>
            </TwoCol>
          </FormCard>
        ) : (
          <FormCard>
            <TwoCol>
              <div>
                <DateField label="Bill Date" value={form.billDate} onChange={(billDate) => setForm({ ...form, billDate })} />
                <ManualNumberField label="Total Amount" value={form.amount} onChange={(amount) => setForm({ ...form, amount })} />
                <ManualNumberField label="CGST %" value={form.cgstPct} onChange={(cgstPct) => setForm({ ...form, cgstPct })} />
                <ManualNumberField label="SGST %" value={form.sgstPct} onChange={(sgstPct) => setForm({ ...form, sgstPct })} />
                <ManualNumberField label="CGST Amount" value={cgstAmt} readOnly />
                <ManualNumberField label="SGST Amount" value={sgstAmt} readOnly />
              </div>
              <div>
                <InputField label="Bill No" value={form.billNo} onChange={(e) => setForm({ ...form, billNo: e.target.value })} required />
                <InputField label="PO No" value={form.poNo} onChange={(e) => setForm({ ...form, poNo: e.target.value })} />
                <ComboboxField
                  label="Party Name"
                  value={form.partyName}
                  onChange={(partyName) => setForm({ ...form, partyName })}
                  options={partyNames}
                  placeholder="Search or select party"
                />
                <InputField label="Remark" value={form.remark} onChange={(e) => setForm({ ...form, remark: e.target.value })} />
                <ManualNumberField label="Total Amount" value={grand} readOnly />
                <ManualNumberField label="IGST %" value={form.igstPct} onChange={(igstPct) => setForm({ ...form, igstPct })} />
                <ManualNumberField label="IGST Amount" value={igstAmt} readOnly />
                <DateField label="Subm Date" value={form.submitDate} onChange={(submitDate) => setForm({ ...form, submitDate })} />
              </div>
            </TwoCol>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button type="submit" disabled={!!editId || saving}>
                {saving ? "Saving..." : "Save Bill"}
              </Button>
              <Button type="button" variant="teal" disabled={!editId || saving} onClick={modify}>
                {saving ? "Updating..." : "Update Bill"}
              </Button>
              <Button type="button" variant="danger" disabled={!editId} onClick={del}>
                Delete Bill
              </Button>
              <Button type="button" variant="teal" onClick={() => router.push(searchHref)}>
                Search Bill
              </Button>
              <Button type="button" variant="teal" disabled={!form.billNo.trim()} onClick={printBill}>
                Print Bill
              </Button>
              <Button
                type="button"
                variant="teal"
                disabled={!form.billNo.trim() || !form.partyName.trim()}
                onClick={() =>
                  router.push(
                    `/bills/money-receipt?partyName=${encodeURIComponent(form.partyName)}&billNo=${encodeURIComponent(form.billNo)}`,
                  )
                }
              >
                Money Reciept
              </Button>
            </div>
          </FormCard>
        )}

        {variant === "meter" || form.partyName ? (
        <FormCard className={variant === "meter" && !form.partyName ? "min-h-16" : ""}>
          {form.partyName ? (
            <>
              <p className="mb-3 text-sm font-semibold text-[#333]">
                {editId ? `Linked LRs (${visibleLrs.length})` : `Unbilled LRs auto-selected (${selectedIds.length}/${visibleLrs.length})`}
              </p>
              <DataTable
                rows={visibleLrs.map((row, i) => ({ ...row, sr: i + 1 }))}
                searchKeys={["lrNo", "vehNo", "fromStation", "toStation"]}
                columns={[
                  {
                    key: "select",
                    header: "Select",
                    render: (row) => (
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(row.id)}
                        disabled={!!editId}
                        onChange={(e) => toggleLr(row.id, e.target.checked)}
                      />
                    ),
                  },
                  { key: "lrNo", header: "LR No" },
                  { key: "lrDate", header: "LR Date", render: (row) => isoToDisplay(row.lrDate) },
                  { key: "vehNo", header: "Veh No" },
                  { key: "fromStation", header: "From" },
                  { key: "toStation", header: "To" },
                  { key: "billAs", header: "Bill As" },
                  { key: variant === "meter" ? "totalMeter" : "chargedWeight", header: variant === "meter" ? "Meter" : "Weight" },
                  { key: "amount", header: "Amount", render: (row) => lrBillableAmount(row) },
                ]}
              />
              {!editId && !visibleLrs.length ? <p className="mt-2 text-sm text-[#a94442]">No unbilled LRs found for this party.</p> : null}
            </>
          ) : null}
        </FormCard>
        ) : null}

        {variant === "meter" ? (
          <FormCard>
            <TwoCol>
              <div>
                <ManualNumberField label="Total Amount" value={form.amount} onChange={(amount) => setForm({ ...form, amount })} />
                <ManualNumberField label="CGST %" value={form.cgstPct} onChange={(cgstPct) => setForm({ ...form, cgstPct })} />
                <ManualNumberField label="SGST %" value={form.sgstPct} onChange={(sgstPct) => setForm({ ...form, sgstPct })} />
                <ManualNumberField label="CGST Amount" value={cgstAmt} readOnly />
                <ManualNumberField label="SGST Amount" value={sgstAmt} readOnly />
              </div>
              <div>
                <ManualNumberField label="Total Amount" value={grand} readOnly />
                <ManualNumberField label="IGST %" value={form.igstPct} onChange={(igstPct) => setForm({ ...form, igstPct })} />
                <InputField label="Remark" value={form.remark} onChange={(e) => setForm({ ...form, remark: e.target.value })} />
                <ManualNumberField label="IGST Amount" value={igstAmt} readOnly />
                <DateField label="Subm. Date" value={form.submitDate} onChange={(submitDate) => setForm({ ...form, submitDate })} />
              </div>
            </TwoCol>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button type="submit" disabled={!!editId || saving}>
                {saving ? "Saving..." : "Save Bill"}
              </Button>
              <Button type="button" variant="teal" disabled={!editId || saving} onClick={modify}>
                {saving ? "Updating..." : "Update Bill"}
              </Button>
              <Button type="button" variant="danger" disabled={!editId} onClick={del}>
                Delete Bill
              </Button>
              <Button type="button" variant="teal" onClick={() => router.push(searchHref)}>
                Search Bill
              </Button>
              <Button type="button" variant="teal" disabled={!form.billNo.trim()} onClick={printBill}>
                Print Bill
              </Button>
              <Button
                type="button"
                variant="teal"
                disabled={!form.billNo.trim() || !form.partyName.trim()}
                onClick={() =>
                  router.push(
                    `/bills/money-receipt?partyName=${encodeURIComponent(form.partyName)}&billNo=${encodeURIComponent(form.billNo)}`,
                  )
                }
              >
                Money Reciept
              </Button>
            </div>
          </FormCard>
        ) : null}
      </form>
    </>
  );
}
