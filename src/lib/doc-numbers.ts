/** Parse digits from a document number (LR-001, RW-01, 2330, 2280__2 → numeric). */
export function parseDocNumber(value: string | number | null | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value);
  const t = String(value ?? "").trim();
  if (!t) return 0;
  // Leading number after optional alpha prefix; ignore suffixes like __2 / -A
  const m = t.match(/^(?:[A-Za-z]+[\s-]*)?(\d+)/);
  if (m) {
    const n = parseInt(m[1], 10);
    return Number.isFinite(n) ? n : 0;
  }
  const digits = t.replace(/\D/g, "");
  const n = parseInt(digits, 10);
  return Number.isFinite(n) ? n : 0;
}

export function padDoc(n: number, width: number) {
  return String(Math.max(1, n)).padStart(width, "0");
}

/** Next padded doc no. Optional `minNext` floors the sequence (e.g. LHC ≥ 2331). */
export function nextPadded(
  values: Array<string | number | null | undefined>,
  width: number,
  minNext = 1,
) {
  const max = values.reduce<number>((m, v) => Math.max(m, parseDocNumber(v)), 0);
  return padDoc(Math.max(max + 1, minNext), width);
}

/** Business floors for continuing legacy serials after import. */
export const DOC_SEQUENCE_FLOOR = {
  lhc: 2331,
  billRoadways: 228,
} as const;
