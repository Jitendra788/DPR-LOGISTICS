import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/auth-session";
import type { ResourceKey } from "@/lib/resources";

/** Resources where non-admin users only see their own rows. */
export const OWNER_SCOPED_RESOURCES = new Set<ResourceKey>([
  "parties",
  "drivers",
  "vehicles",
  "vendors",
  "stations",
  "rates",
  "bookings",
  "lhc",
  "bills",
  "driver-register",
  "driver-advance",
  "trips",
  "expenses",
  "fleet",
  "maintenance",
  "receipts",
  "vendor-vouchers",
  "driver-vouchers",
  "slips",
  "tyres",
  "trip-desk",
  "blog-posts",
  "marketing-media",
  "web-inquiries",
]);

export function isOwnerScoped(resource: string): resource is ResourceKey {
  return OWNER_SCOPED_RESOURCES.has(resource as ResourceKey);
}

export function shouldScopeToOwner(role: string | null | undefined) {
  return !isAdminRole(role);
}

function isPostgres() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || "";
  return /^postgres/i.test(url);
}

let ensured = false;

export async function ensureDataOwnerTable() {
  if (ensured) return;
  if (isPostgres()) {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "DataOwner" (
        "id" SERIAL PRIMARY KEY,
        "resource" TEXT NOT NULL,
        "recordId" INTEGER NOT NULL,
        "username" TEXT NOT NULL,
        UNIQUE ("resource", "recordId")
      )
    `);
    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS "DataOwner_username_resource_idx" ON "DataOwner"("username", "resource")`,
    );
  } else {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "DataOwner" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "resource" TEXT NOT NULL,
        "recordId" INTEGER NOT NULL,
        "username" TEXT NOT NULL,
        UNIQUE ("resource", "recordId")
      )
    `);
    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS "DataOwner_username_resource_idx" ON "DataOwner"("username", "resource")`,
    );
  }
  ensured = true;
}

export async function assignRecordOwner(resource: string, recordId: number, username: string) {
  if (!username || !Number.isFinite(recordId) || recordId <= 0) return;
  await ensureDataOwnerTable();
  if (isPostgres()) {
    await prisma.$executeRaw`
      INSERT INTO "DataOwner" ("resource", "recordId", "username")
      VALUES (${resource}, ${recordId}, ${username})
      ON CONFLICT ("resource", "recordId") DO NOTHING
    `;
  } else {
    await prisma.$executeRaw(
      Prisma.sql`INSERT OR IGNORE INTO "DataOwner" ("resource", "recordId", "username") VALUES (${resource}, ${recordId}, ${username})`,
    );
  }
}

export async function ownedRecordIds(resource: string, username: string): Promise<number[]> {
  await ensureDataOwnerTable();
  const rows = await prisma.$queryRaw<Array<{ recordId: number }>>`
    SELECT "recordId" FROM "DataOwner"
    WHERE "resource" = ${resource} AND "username" = ${username}
  `;
  return rows.map((r) => Number(r.recordId)).filter((id) => Number.isFinite(id) && id > 0);
}

export async function isRecordOwnedBy(resource: string, recordId: number, username: string): Promise<boolean> {
  await ensureDataOwnerTable();
  const rows = await prisma.$queryRaw<Array<{ ok: number }>>`
    SELECT 1 as ok FROM "DataOwner"
    WHERE "resource" = ${resource} AND "recordId" = ${recordId} AND "username" = ${username}
    LIMIT 1
  `;
  return rows.length > 0;
}
