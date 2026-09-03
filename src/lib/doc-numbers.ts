/** Parse digits from a document number (LR-001, 01, BILL-0003 → numeric). */
export function parseDocNumber(value: string | number | null | undefined) {
  const digits = String(value ?? "").replace(/\D/g, "");
  const n = parseInt(digits, 10);
  return Number.isFinite(n) ? n : 0;
}

export function padDoc(n: number, width: number) {
  return String(Math.max(1, n)).padStart(width, "0");
}

export function nextPadded(values: Array<string | number | null | undefined>, width: number) {
  const max = values.reduce<number>((m, v) => Math.max(m, parseDocNumber(v)), 0);
  return padDoc(max + 1, width);
}
