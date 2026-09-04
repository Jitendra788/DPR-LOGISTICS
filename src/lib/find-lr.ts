import { prisma } from "./prisma";
import { lrNoCandidates, lrNoEquals } from "./lr-no";

/** Resolve one LR without loading the full bookings table. */
export async function findLrBookingByNo(lrNo: string) {
  const trimmed = lrNo.trim();
  if (!trimmed) return null;

  const byExact = await prisma.lrBooking.findMany({
    where: { OR: lrNoCandidates(trimmed).map((value) => ({ lrNo: value })) },
    take: 8,
  });
  return byExact.find((row) => lrNoEquals(row.lrNo, trimmed)) ?? byExact[0] ?? null;
}
