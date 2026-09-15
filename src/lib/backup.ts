import { prisma } from "@/lib/prisma";
import { getModel, type ResourceKey } from "@/lib/resources";
import { ensureDataOwnerTable } from "@/lib/data-scope";

/** Tables included in full admin backup (restore order = create order). */
export const BACKUP_TABLES: ResourceKey[] = [
  "parties",
  "users",
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
];

export type BackupPayload = {
  version: number;
  app: string;
  exportedAt: string;
  tables: Record<string, Array<Record<string, unknown>>>;
  dataOwners: Array<{ resource: string; recordId: number; username: string }>;
  counts: Record<string, number>;
};

function serializeRow(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    if (v instanceof Date) out[k] = v.toISOString();
    else out[k] = v;
  }
  return out;
}

export async function collectBackupCounts(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const key of BACKUP_TABLES) {
    counts[key] = await getModel(key).count();
  }
  try {
    await ensureDataOwnerTable();
    const owners = await prisma.$queryRaw<Array<{ c: number }>>`SELECT COUNT(*) as c FROM "DataOwner"`;
    counts.dataOwners = Number(owners[0]?.c || 0);
  } catch {
    counts.dataOwners = 0;
  }
  return counts;
}

export async function collectBackup(): Promise<BackupPayload> {
  const tables: BackupPayload["tables"] = {};
  const counts: Record<string, number> = {};

  for (const key of BACKUP_TABLES) {
    const rows = (await getModel(key).findMany({ orderBy: { id: "asc" } })) as Array<Record<string, unknown>>;
    tables[key] = rows.map(serializeRow);
    counts[key] = rows.length;
  }

  await ensureDataOwnerTable();
  let dataOwners: BackupPayload["dataOwners"] = [];
  try {
    dataOwners = await prisma.$queryRaw<Array<{ resource: string; recordId: number; username: string }>>`
      SELECT "resource", "recordId", "username" FROM "DataOwner" ORDER BY "id" ASC
    `;
  } catch {
    dataOwners = [];
  }
  counts.dataOwners = dataOwners.length;

  return {
    version: 1,
    app: "dpr-logistics",
    exportedAt: new Date().toISOString(),
    tables,
    dataOwners,
    counts,
  };
}

function stripId(row: Record<string, unknown>) {
  const copy = { ...row };
  delete copy.id;
  return copy;
}

/** Wipe ERP tables then insert backup rows (Admin only). Keeps schema. */
export async function restoreBackup(payload: BackupPayload, opts?: { keepUserIds?: boolean }) {
  if (!payload || payload.app !== "dpr-logistics" || !payload.tables) {
    throw new Error("Invalid backup file");
  }

  const keepIds = opts?.keepUserIds !== false;

  // Delete children / transactional first, then masters (reverse of create list)
  const deleteOrder = [...BACKUP_TABLES].reverse();
  for (const key of deleteOrder) {
    await getModel(key).deleteMany({});
  }
  try {
    await ensureDataOwnerTable();
    await prisma.$executeRaw`DELETE FROM "DataOwner"`;
  } catch {
    /* ignore */
  }

  const idMaps: Record<string, Map<number, number>> = {};

  for (const key of BACKUP_TABLES) {
    const rows = payload.tables[key] || [];
    idMaps[key] = new Map();
    for (const row of rows) {
      const oldId = Number(row.id);
      const data = keepIds ? { ...row } : stripId(row);
      // Dates
      for (const [k, v] of Object.entries(data)) {
        if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v) && (k.endsWith("At") || k === "createdAt" || k === "passwordOtpExpires" || k === "publishedAt" || k === "lastSeenAt")) {
          data[k] = new Date(v);
        }
      }
      try {
        const created = (await getModel(key).create({ data })) as { id: number };
        if (Number.isFinite(oldId) && created?.id) idMaps[key]!.set(oldId, created.id);
      } catch (err) {
        // Retry without id if unique/id conflict when keepIds
        if (keepIds && "id" in data) {
          const again = stripId(data);
          const created = (await getModel(key).create({ data: again })) as { id: number };
          if (Number.isFinite(oldId) && created?.id) idMaps[key]!.set(oldId, created.id);
        } else {
          throw err;
        }
      }
    }
  }

  // Restore DataOwner with remapped ids when needed
  for (const own of payload.dataOwners || []) {
    const map = idMaps[own.resource];
    const recordId = map?.get(Number(own.recordId)) ?? Number(own.recordId);
    if (!Number.isFinite(recordId) || !own.username || !own.resource) continue;
    try {
      await prisma.$executeRaw`
        INSERT OR IGNORE INTO "DataOwner" ("resource", "recordId", "username")
        VALUES (${own.resource}, ${recordId}, ${own.username})
      `;
    } catch {
      try {
        await prisma.$executeRaw`
          INSERT INTO "DataOwner" ("resource", "recordId", "username")
          VALUES (${own.resource}, ${recordId}, ${own.username})
          ON CONFLICT ("resource", "recordId") DO NOTHING
        `;
      } catch {
        /* skip */
      }
    }
  }

  const restored: Record<string, number> = {};
  for (const key of BACKUP_TABLES) {
    restored[key] = (payload.tables[key] || []).length;
  }
  restored.dataOwners = (payload.dataOwners || []).length;
  return restored;
}

export function backupSummaryHtml(backup: BackupPayload) {
  const rows = Object.entries(backup.counts)
    .map(([k, n]) => `<tr><td>${k}</td><td style="text-align:right">${n}</td></tr>`)
    .join("");
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>DPR Logistics Backup</title>
<style>
  body{font-family:Segoe UI,Arial,sans-serif;padding:24px;color:#0f172a}
  h1{font-size:20px;margin:0 0 6px}
  p{color:#64748b;margin:0 0 16px;font-size:13px}
  table{border-collapse:collapse;width:100%;max-width:520px}
  th,td{border:1px solid #e2e8f0;padding:8px 10px;font-size:13px}
  th{background:#f8fafc;text-align:left}
  @media print{button{display:none}}
</style></head><body>
<button onclick="window.print()" style="margin-bottom:16px;padding:8px 14px;background:#0f766e;color:#fff;border:0;border-radius:8px;cursor:pointer">Print / Save as PDF</button>
<h1>DPR Logistics — Data Backup Report</h1>
<p>Exported: ${backup.exportedAt} · Version ${backup.version}</p>
<table><thead><tr><th>Table</th><th>Records</th></tr></thead><tbody>${rows}</tbody></table>
</body></html>`;
}
