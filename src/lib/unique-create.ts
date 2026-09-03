import { getModel, type ResourceKey } from "@/lib/resources";
import { nextPadded } from "@/lib/doc-numbers";
import { isUniqueViolation } from "@/lib/handle-api-error";

const DOC_RETRY: Partial<Record<ResourceKey, { field: string; width: number }>> = {
  bookings: { field: "lrNo", width: 3 },
  bills: { field: "billNo", width: 2 },
  lhc: { field: "challanNo", width: 2 },
};

export async function createWithUniqueRetry(resource: ResourceKey, data: Record<string, unknown>) {
  const model = getModel(resource);
  const retry = DOC_RETRY[resource];
  let payload = { ...data };

  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      return await model.create({ data: payload });
    } catch (err) {
      if (!retry || !isUniqueViolation(err, retry.field)) throw err;
      const rows = (await model.findMany({
        select: { [retry.field]: true },
      })) as Array<Record<string, unknown>>;
      payload = {
        ...payload,
        [retry.field]: nextPadded(
          rows.map((row) => row[retry.field] as string | number | null | undefined),
          retry.width,
        ),
      };
    }
  }

  throw new Error("Could not assign a unique number. Please try again.");
}
