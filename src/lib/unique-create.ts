import { getModel, type ResourceKey } from "@/lib/resources";
import { nextPadded } from "@/lib/doc-numbers";
import { isUniqueViolation } from "@/lib/handle-api-error";
import { docSourceWhere, nextModuleDoc, normalizeDocSource } from "@/lib/module-docs";
import { isUnknownPrismaArg, withoutUnknownArgs } from "@/lib/prisma-retry";

const DOC_RETRY: Partial<Record<ResourceKey, { field: string; width: number; sourceAware?: boolean }>> = {
  bookings: { field: "lrNo", width: 3, sourceAware: true },
  bills: { field: "billNo", width: 2, sourceAware: true },
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
      if (isUnknownPrismaArg(err)) {
        const { data: cleaned, dropped } = withoutUnknownArgs(payload, err);
        if (dropped.length) {
          console.warn(`POST /api/${resource}: dropped unknown Prisma fields`, dropped);
          payload = cleaned;
          continue;
        }
      }
      if (!retry || !isUniqueViolation(err, retry.field)) throw err;
      const source = retry.sourceAware ? normalizeDocSource(String(payload.source ?? "DPR")) : undefined;
      const rows = (await model.findMany({
        where: retry.sourceAware ? docSourceWhere(source) : undefined,
        select: { [retry.field]: true },
      })) as Array<Record<string, unknown>>;
      const values = rows.map((row) => row[retry.field] as string | number | null | undefined);
      payload = {
        ...payload,
        [retry.field]: retry.sourceAware
          ? nextModuleDoc(values, retry.width, source)
          : nextPadded(values, retry.width),
      };
    }
  }

  throw new Error("Could not assign a unique number. Please try again.");
}
