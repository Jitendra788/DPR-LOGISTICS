import { nextPadded, parseDocNumber } from "./doc-numbers";

/** Display LR number without LR- prefix (e.g. LR-22463 → 22463). */
export function stripLrPrefix(lrNo: string) {
  const trimmed = lrNo.trim();
  const stripped = trimmed.replace(/^LR[\s-]*/i, "").trim();
  return stripped || trimmed;
}

export function lrNoKey(lrNo: string) {
  return stripLrPrefix(lrNo).toLowerCase();
}

export function lrNoEquals(a: string, b: string) {
  return lrNoKey(a) === lrNoKey(b);
}

export function nextLrNumber(lastLrNoOrId: string | number = 0) {
  const last = typeof lastLrNoOrId === "number" ? lastLrNoOrId : parseDocNumber(lastLrNoOrId);
  return nextPadded([last], 3);
}
