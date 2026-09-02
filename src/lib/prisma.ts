import { PrismaClient } from "@prisma/client";

function resolveDatabaseUrl() {
  const url =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL ??
    "";

  if (url) return url;
  if (process.env.VERCEL) return "";
  return "file:./dev.db";
}

/** False on Vercel when Postgres env vars are missing. */
export function isDatabaseConfigured() {
  return Boolean(resolveDatabaseUrl());
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: resolveDatabaseUrl(),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
