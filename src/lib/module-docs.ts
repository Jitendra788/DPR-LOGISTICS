import { nextPadded, padDoc, parseDocNumber, DOC_SEQUENCE_FLOOR } from "@/lib/doc-numbers";

/** Document module / branch discriminator on LrBooking & Bill. */
export type DocSource = "DPR" | "ROADWAYS" | "CUSTOMER";

export const ROADWAYS_DOC_PREFIX = "RW-";

export function normalizeDocSource(source?: string | null): DocSource {
  const s = String(source ?? "DPR").trim().toUpperCase();
  if (s === "ROADWAYS") return "ROADWAYS";
  if (s === "CUSTOMER") return "CUSTOMER";
  return "DPR";
}

/** Prisma where-clause for LR/Bill number pools (Roadways vs everyone else). */
export function docSourceWhere(source?: string | null) {
  if (normalizeDocSource(source) === "ROADWAYS") {
    return { source: "ROADWAYS" as const };
  }
  return { source: { not: "ROADWAYS" } };
}

/**
 * Format a numeric sequence for a module.
 * Legacy Roadways bills/LRs are plain numbers (227, 214201055) — no RW- prefix.
 */
export function formatModuleDoc(n: number, width: number, _source?: string | null) {
  return padDoc(n, width);
}

/**
 * Next LR/Bill number for a module.
 */
export function nextModuleDoc(
  values: Array<string | number | null | undefined>,
  width: number,
  source?: string | null,
  minNext = 1,
) {
  return formatModuleDoc(parseDocNumber(nextPadded(values, width, minNext)), width, source);
}

/**
 * Next free module doc number that does not collide with any existing value.
 * Bill/LR numbers are globally unique, while sequences are module-scoped — so
 * retries must skip strings already taken by the other module (or stale clients).
 */
export function nextUniqueModuleDoc(
  moduleValues: Array<string | number | null | undefined>,
  takenValues: Array<string | number | null | undefined>,
  width: number,
  source?: string | null,
  preferred?: string | null,
  minNext = 1,
) {
  const taken = new Set(
    takenValues.map((v) => String(v ?? "").trim()).filter(Boolean),
  );
  const preferredTrim = String(preferred ?? "").trim();
  if (preferredTrim && !taken.has(preferredTrim)) {
    return preferredTrim;
  }

  let num = parseDocNumber(nextPadded(moduleValues, width, minNext));
  if (preferredTrim) {
    num = Math.max(num, parseDocNumber(preferredTrim) + 1);
  }
  num = Math.max(num, minNext);

  for (let i = 0; i < 10000; i++) {
    const candidate = formatModuleDoc(num, width, source);
    if (!taken.has(candidate)) return candidate;
    num += 1;
  }

  throw new Error("Could not assign a unique document number");
}

export function billSequenceFloor(source?: string | null) {
  return normalizeDocSource(source) === "ROADWAYS" ? DOC_SEQUENCE_FLOOR.billRoadways : 1;
}

export { DOC_SEQUENCE_FLOOR };
