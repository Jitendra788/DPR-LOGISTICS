type BillAmounts = {
  amount: number;
  cgstAmt?: number;
  sgstAmt?: number;
  igstAmt?: number;
  cgstPct?: number;
  sgstPct?: number;
  igstPct?: number;
};

/** Freight / subtotal before bill-level GST. */
export function billFreightAmount(bill: BillAmounts, lrFreightSum = 0) {
  const tax = (bill.cgstAmt || 0) + (bill.sgstAmt || 0) + (bill.igstAmt || 0);
  if (lrFreightSum > 0) return Number(lrFreightSum.toFixed(2));
  if (tax > 0) {
    const derived = Number((bill.amount - tax).toFixed(2));
    if (derived > 0) return derived;
  }
  return bill.amount;
}

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
