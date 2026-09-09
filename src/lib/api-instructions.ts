import type { ResourceKey } from "@/lib/resources";
import { getModel } from "@/lib/resources";

/** Unique fields per API resource — used for clear "already saved" instructions. */
export const RESOURCE_UNIQUE_FIELDS: Partial<Record<ResourceKey, readonly string[]>> = {
  bookings: ["lrNo"],
  bills: ["billNo"],
  lhc: ["challanNo"],
  users: ["username"],
  vehicles: ["vehNo"],
  fleet: ["vehNo"],
  stations: ["name"],
  "blog-posts": ["slug"],
  "trip-desk": ["referenceId"],
};

const FIELD_INSTRUCTION: Record<string, (value: string) => string> = {
  lrNo: (v) => `LR ${v} already saved`,
  billNo: (v) => `Bill ${v} already saved`,
  challanNo: (v) => `Challan ${v} already saved`,
  username: (v) => `Username "${v}" already exists`,
  vehNo: (v) => `Vehicle ${v} already saved`,
  name: (v) => `"${v}" already saved`,
  slug: (v) => `Slug "${v}" already exists`,
  referenceId: (v) => `Reference ${v} already saved`,
};

export function alreadySavedInstruction(field: string, value: string) {
  const v = String(value ?? "").trim();
  if (!v) return `${field} already saved`;
  return FIELD_INSTRUCTION[field]?.(v) || `${field} "${v}" already saved`;
}

/**
 * Before create: if any unique field value already exists, throw a clear instruction error.
 */
export async function assertUniqueOnCreate(resource: ResourceKey, data: Record<string, unknown>) {
  const fields = RESOURCE_UNIQUE_FIELDS[resource];
  if (!fields?.length) return;
  const model = getModel(resource);

  for (const field of fields) {
    const value = String(data[field] ?? "").trim();
    if (!value) continue;
    const existing = await model.findFirst({
      where: { [field]: value },
      select: { id: true },
    });
    if (existing) {
      throw new Error(alreadySavedInstruction(field, value));
    }
  }
}

/**
 * Before update: same check, excluding the current row id.
 */
export async function assertUniqueOnUpdate(
  resource: ResourceKey,
  id: number,
  data: Record<string, unknown>,
) {
  const fields = RESOURCE_UNIQUE_FIELDS[resource];
  if (!fields?.length) return;
  const model = getModel(resource);

  for (const field of fields) {
    if (!(field in data)) continue;
    const value = String(data[field] ?? "").trim();
    if (!value) continue;
    const existing = await model.findFirst({
      where: { [field]: value },
      select: { id: true },
    });
    if (existing && Number((existing as { id: number }).id) !== id) {
      throw new Error(alreadySavedInstruction(field, value));
    }
  }
}
