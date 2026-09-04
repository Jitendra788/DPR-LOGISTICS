import { nextPadded, padDoc, parseDocNumber } from "@/lib/doc-numbers";

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
 * Next LR/Bill number for a module.
 * Roadways uses RW-001… so it never collides with DPR/CUSTOMER sequences.
 */
export function nextModuleDoc(
  values: Array<string | number | null | undefined>,
  width: number,
  source?: string | null,
) {
  const next = nextPadded(values, width);
  if (normalizeDocSource(source) === "ROADWAYS") {
    return `${ROADWAYS_DOC_PREFIX}${padDoc(parseDocNumber(next), width)}`;
  }
  return next;
}
