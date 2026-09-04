/** Extract Prisma "Unknown argument `field`" names from an error message. */
export function unknownPrismaArgs(err: unknown): string[] {
  const message = err instanceof Error ? err.message : String(err ?? "");
  const found = new Set<string>();
  const re = /Unknown argument [`'](\w+)[`']/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(message))) {
    found.add(match[1]);
  }
  return [...found];
}

export function isUnknownPrismaArg(err: unknown) {
  return unknownPrismaArgs(err).length > 0;
}

/** Drop fields Prisma client does not recognize (stale client / pending migrate). */
export function withoutUnknownArgs(
  data: Record<string, unknown>,
  err: unknown,
): { data: Record<string, unknown>; dropped: string[] } {
  const dropped = unknownPrismaArgs(err).filter((key) => key in data);
  if (!dropped.length) return { data, dropped: [] };
  const next = { ...data };
  for (const key of dropped) delete next[key];
  return { data: next, dropped };
}
