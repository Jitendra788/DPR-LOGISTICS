import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

function resolveDatabaseUrl() {
  if (process.env.VERCEL) {
    const tmp = "/tmp/dpr.db";
    if (!fs.existsSync(tmp)) {
      const bundled = path.join(process.cwd(), "prisma", "prod.db");
      if (fs.existsSync(bundled)) {
        fs.copyFileSync(bundled, tmp);
      }
    }
    return `file:${tmp}`;
  }
  return process.env.DATABASE_URL ?? "file:./dev.db";
}

const datasourceUrl = resolveDatabaseUrl();

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
