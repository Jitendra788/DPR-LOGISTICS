import { nextPadded, parseDocNumber } from "./doc-numbers";

/** Display LR number without decorative prefixes (LR- / RW-). */
export function stripLrPrefix(lrNo: string) {
  const trimmed = lrNo.trim();
  const stripped = trimmed.replace(/^(LR|RW)[\s-]*/i, "").trim();
  return stripped || trimmed;
}

export function lrNoKey(lrNo: string) {
  return stripLrPrefix(lrNo).toLowerCase();
}

export function lrNoEquals(a: string, b: string) {
  return lrNoKey(a) === lrNoKey(b);
}

/** Common stored/display variants for exact DB lookups. */
export function lrNoCandidates(lrNo: string) {
  const trimmed = lrNo.trim();
  const core = stripLrPrefix(trimmed);
  return [...new Set([trimmed, core, `LR-${core}`, `LR ${core}`, `RW-${core}`, `RW ${core}`])].filter(Boolean);
}

export function nextLrNumber(lastLrNoOrId: string | number = 0) {
  const last = typeof lastLrNoOrId === "number" ? lastLrNoOrId : parseDocNumber(lastLrNoOrId);
  return nextPadded([last], 3);
}
