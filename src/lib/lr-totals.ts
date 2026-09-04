/** LR charge fields used for bill / receipt totals. */
export type LrCharges = {
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
  grandTotal?: number;
};

const CHARGE_KEYS = [
  "freight",
  "serviceTax",
  "haltage",
  "insurance",
  "stCharges",
  "doorCollection",
  "barrier",
  "other",
  "hamali",
] as const;

/** Subtotal before LR-level GST (freight + all extra charges). */
export function lrSubtotal(row: LrCharges) {
  const sum = CHARGE_KEYS.reduce((acc, key) => acc + (Number(row[key]) || 0), 0);
  if (sum > 0) return Number(sum.toFixed(2));

  const stored = Number(row.total) || 0;
  if (stored > 0) return Number(stored.toFixed(2));

  return 0;
}

/** True when LR should bill under Meter-wise preparation. */
export function isMeterBillAs(billAs?: string | null) {
  const as = String(billAs ?? "")
    .toLowerCase()
    .replace(/\./g, "")
    .trim();
  return as === "mtr" || as === "meter" || as === "meters" || as === "metre" || as === "metres";
}

/** Auto freight: Rate × Total Meter (Mtr) or Rate × Charged Weight (Weight/Package). */
export function autoLrFreight(input: {
  billAs?: string | null;
  rate?: string | number | null;
  totalMeter?: string | number | null;
  chargedWeight?: string | number | null;
}) {
  const rate = Number(String(input.rate ?? "").replace(/,/g, "").trim()) || 0;
  if (rate <= 0) return null;

  if (isMeterBillAs(input.billAs)) {
    const meters = Number(String(input.totalMeter ?? "").replace(/,/g, "").trim()) || 0;
    if (meters <= 0) return null;
    return Number((rate * meters).toFixed(2));
  }

  const weight = Number(String(input.chargedWeight ?? "").replace(/,/g, "").trim()) || 0;
  if (weight <= 0) return null;
  return Number((rate * weight).toFixed(2));
}

/** Billable amount per LR — excludes LR GST (bill GST applied separately). */
export function lrBillableAmount(row: LrCharges) {
  const subtotal = lrSubtotal(row);
  if (subtotal > 0) return subtotal;

  const grand = Number(row.grandTotal) || 0;
  const gst = Number(row.gst) || 0;
  if (grand > 0 && gst > 0) return Number(Math.max(0, grand - gst).toFixed(2));
  if (grand > 0) return grand;

  return 0;
}

export function sumLrBillableAmount(rows: LrCharges[]) {
  return Number(rows.reduce((sum, row) => sum + lrBillableAmount(row), 0).toFixed(2));
}
