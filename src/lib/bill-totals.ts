import { lrBillableAmount, sumLrBillableAmount, type LrCharges } from "./lr-totals";

type BillAmounts = {
  amount: number;
  cgstAmt?: number;
  sgstAmt?: number;
  igstAmt?: number;
  cgstPct?: number;
  sgstPct?: number;
  igstPct?: number;
};

/** Freight / subtotal before bill-level GST.
 * Bill.generate stores `amount` as before-tax freight — never subtract GST from it.
 * LR sum is only a fallback when bill amount is missing.
 */
export function billFreightAmount(bill: BillAmounts, lrFreightSum = 0) {
  const stored = Number(bill.amount) || 0;
  if (stored > 0) return Number(stored.toFixed(2));
  if (lrFreightSum > 0) return Number(lrFreightSum.toFixed(2));
  return 0;
}

export { lrBillableAmount, sumLrBillableAmount, type LrCharges };

export function billGrandTotal(bill: BillAmounts, freight?: number) {
  const base = freight ?? billFreightAmount(bill);
  return Number((base + (bill.cgstAmt || 0) + (bill.sgstAmt || 0) + (bill.igstAmt || 0)).toFixed(2));
}

export function calcBillTaxes(freight: number, cgstPct: number, sgstPct: number, igstPct: number) {
  const cgstAmt = Number(((freight * cgstPct) / 100).toFixed(2));
  const sgstAmt = Number(((freight * sgstPct) / 100).toFixed(2));
  const igstAmt = Number(((freight * igstPct) / 100).toFixed(2));
  const grand = Number((freight + cgstAmt + sgstAmt + igstAmt).toFixed(2));
  return { cgstAmt, sgstAmt, igstAmt, grand };
}
