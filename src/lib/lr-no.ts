/** Display LR number without LR- prefix (e.g. LR-22463 → 22463). */
export function stripLrPrefix(lrNo: string) {
  const trimmed = lrNo.trim();
  const stripped = trimmed.replace(/^LR[\s-]*/i, "").trim();
  return stripped || trimmed;
}

export function nextLrNumber(lastId: number) {
  return String(lastId + 22451);
}
