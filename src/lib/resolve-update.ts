import { prisma } from "./prisma";
import { lrNoCandidates, lrNoEquals } from "./lr-no";
import type { ResourceKey } from "./resources";

/** When URL id is stale, resolve the live row by business key from the request body. */
export async function resolveUpdateId(
  resource: ResourceKey,
  body: Record<string, unknown>,
): Promise<number | null> {
  if (resource === "bookings") {
    const lrNo = String(body.lrNo ?? "").trim();
    if (!lrNo) return null;

    const byExact = await prisma.lrBooking.findMany({
      where: { OR: lrNoCandidates(lrNo).map((value) => ({ lrNo: value })) },
      take: 5,
    });
    const match = byExact.find((row) => lrNoEquals(row.lrNo, lrNo)) ?? byExact[0];
    return match?.id ?? null;
  }

  if (resource === "bills") {
    const billNo = String(body.billNo ?? "").trim();
    if (!billNo) return null;
    const row = await prisma.bill.findFirst({ where: { billNo } });
    return row?.id ?? null;
  }

  if (resource === "lhc") {
    const challanNo = String(body.challanNo ?? "").trim();
    if (!challanNo) return null;
    const row = await prisma.lhcContract.findFirst({ where: { challanNo } });
    return row?.id ?? null;
  }

  return null;
}

/** Resolve bill delete when id is stale but billNo is known. */
export async function resolveBillDeleteId(id: number, billNo?: string): Promise<number | null> {
  const byId = await prisma.bill.findUnique({ where: { id } });
  if (byId) return byId.id;
  if (billNo?.trim()) {
    const row = await prisma.bill.findFirst({ where: { billNo: billNo.trim() } });
    return row?.id ?? null;
  }
  return null;
}
