/** Old-site LR Type (TBB / ToPay / Paid) — same options & billing rules project-wide. */

export const LR_TYPES = ["TBB", "ToPay", "Paid"] as const;
export type LrType = (typeof LR_TYPES)[number];

export function normalizeLrType(value?: string | null): LrType {
  const raw = String(value ?? "TBB").trim().toLowerCase().replace(/\s+/g, "");
  if (raw === "topay" || raw === "to-pay" || raw === "topay.") return "ToPay";
  if (raw === "paid" || raw === "paid.") return "Paid";
  return "TBB";
}

/** Only TBB LRs go into Weightwise / Meterwise party bill (old BillWeightwise flow). */
export function isBillableLrType(value?: string | null) {
  return normalizeLrType(value) === "TBB";
}

export function lrTypeLabel(value?: string | null) {
  const t = normalizeLrType(value);
  if (t === "ToPay") return "To Pay";
  if (t === "Paid") return "Paid";
  return "TBB (To Be Billed)";
}

/** Short stamp used on LR print / reports. */
export function lrTypeStamp(value?: string | null) {
  return normalizeLrType(value);
}
