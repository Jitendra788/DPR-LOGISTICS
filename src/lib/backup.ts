import { prisma } from "@/lib/prisma";
import { getModel, type ResourceKey } from "@/lib/resources";
import { assignRecordOwner, ensureDataOwnerTable } from "@/lib/data-scope";
import { ERP_SEQUENCE_TABLES, resetPostgresSequences } from "@/lib/reset-erp";

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

export type RestoreStats = {
  inserted: Record<string, number>;
  skipped: Record<string, number>;
  dataOwners: number;
};

const BATCH_SIZE = 400;

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

function normKey(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function vehKey(value: unknown) {
  return String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

/** Business-key used to skip duplicates on merge restore (never wipe). */
function dedupeKey(resource: ResourceKey, row: Record<string, unknown>): string | null {
  switch (resource) {
    case "parties":
    case "vendors":
      return normKey(row.name) || null;
    case "drivers": {
      const name = normKey(row.name);
      return name ? `${name}|${normKey(row.licenceNo)}` : null;
    }
    case "users":
      return normKey(row.username) || null;
    case "vehicles":
    case "fleet":
      return vehKey(row.vehNo) || null;
    case "stations":
      return normKey(row.name) || null;
    case "bookings":
      return normKey(row.lrNo) || null;
    case "lhc":
      return normKey(row.challanNo) || null;
    case "bills":
      return normKey(row.billNo) || null;
    case "receipts":
      return `${normKey(row.receiptNo)}|${normKey(row.billNo)}|${normKey(row.date)}|${row.amount ?? ""}`;
    case "slips":
      return `${normKey(row.slipNo)}|${normKey(row.date)}|${vehKey(row.vehNo)}|${row.freight ?? row.amount ?? ""}`;
    case "vendor-vouchers":
      return `${normKey(row.voucherNo)}|${normKey(row.vendorName)}|${normKey(row.date)}|${row.amount ?? ""}`;
    case "driver-vouchers":
      return `${normKey(row.voucherNo)}|${normKey(row.driverName)}|${normKey(row.date)}|${row.amount ?? ""}`;
    case "rates":
      return `${normKey(row.fromStation)}|${normKey(row.toStation)}|${normKey(row.effectiveDate)}`;
    case "expenses":
      return `${normKey(row.date)}|${vehKey(row.vehNo)}|${normKey(row.expenseType)}|${row.amount ?? ""}|${normKey(row.billNo)}`;
    case "driver-advance":
      return `${normKey(row.date)}|${normKey(row.driverName)}|${vehKey(row.vehNo)}|${row.amount ?? ""}`;
    case "driver-register":
      return `${normKey(row.date)}|${normKey(row.driverName)}|${vehKey(row.vehNo)}`;
    case "trips":
      return `${normKey(row.tripDate)}|${vehKey(row.vehNo)}|${normKey(row.fromStation)}|${normKey(row.toStation)}`;
    case "maintenance":
      return `${normKey(row.serviceDate)}|${vehKey(row.vehNo)}|${normKey(row.workType)}|${row.amount ?? ""}`;
    case "tyres":
      return `${vehKey(row.vehNo)}|${normKey(row.tyrePosition)}|${normKey(row.serialNo)}`;
    case "blog-posts":
      return normKey(row.slug) || null;
    case "web-inquiries":
      return normKey(row.referenceId) || null;
    case "marketing-media":
      return `${normKey(row.storedName)}|${normKey(row.title)}`;
    case "trip-desk": {
      const tripNo = normKey(row.tripNo);
      const token = normKey(row.shareToken);
      return tripNo || token || null;
    }
    default:
      return null;
  }
}

function coerceDates(data: Record<string, unknown>) {
  for (const [k, v] of Object.entries(data)) {
    if (
      typeof v === "string" &&
      /^\d{4}-\d{2}-\d{2}T/.test(v) &&
      (k.endsWith("At") ||
        k === "createdAt" ||
        k === "passwordOtpExpires" ||
        k === "publishedAt" ||
        k === "lastSeenAt")
    ) {
      data[k] = new Date(v);
    }
  }
  return data;
}

async function loadExistingKeys(resource: ResourceKey): Promise<Set<string>> {
  const rows = (await getModel(resource).findMany({})) as Array<Record<string, unknown>>;
  const keys = new Set<string>();
  for (const row of rows) {
    const key = dedupeKey(resource, row);
    if (key) keys.add(key);
  }
  return keys;
}

async function insertBatch(resource: ResourceKey, rows: Array<Record<string, unknown>>) {
  if (!rows.length) return 0;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const chunk = rows.slice(i, i + BATCH_SIZE);
    try {
      const result = await getModel(resource).createMany({ data: chunk });
      inserted += result.count;
    } catch {
      // Fallback row-by-row if createMany rejects (e.g. sqlite quirks / bad row)
      for (const row of chunk) {
        try {
          await getModel(resource).create({ data: row });
          inserted += 1;
        } catch {
          /* skip bad / unique conflict */
        }
      }
    }
  }
  return inserted;
}

/**
 * Merge restore: keeps existing ERP data.
 * Skips duplicates (party/vendor by name, LR/bill/challan by number, etc.).
 * Uses batched createMany for speed.
 */
export async function restoreBackup(payload: BackupPayload): Promise<RestoreStats> {
  if (!payload || payload.app !== "dpr-logistics" || !payload.tables) {
    throw new Error("Invalid backup file");
  }

  const inserted: Record<string, number> = {};
  const skipped: Record<string, number> = {};

  for (const key of BACKUP_TABLES) {
    const incoming = payload.tables[key] || [];
    inserted[key] = 0;
    skipped[key] = 0;

    if (!incoming.length) continue;

    const existing = await loadExistingKeys(key);
    const toInsert: Array<Record<string, unknown>> = [];

    for (const raw of incoming) {
      const data = coerceDates(stripId(raw));
      const keyVal = dedupeKey(key, data);

      if (keyVal && existing.has(keyVal)) {
        skipped[key]! += 1;
        continue;
      }
      if (keyVal) existing.add(keyVal);
      toInsert.push(data);
    }

    // Always batch-insert for speed (merge never reuses old PKs)
    inserted[key] = await insertBatch(key, toInsert);
  }

  let ownersOk = 0;
  for (const own of payload.dataOwners || []) {
    const recordId = Number(own.recordId);
    if (!Number.isFinite(recordId) || !own.username || !own.resource) continue;
    try {
      await assignRecordOwner(own.resource, recordId, own.username);
      ownersOk += 1;
    } catch {
      /* skip — ids may not match after merge */
    }
  }

  try {
    await resetPostgresSequences(ERP_SEQUENCE_TABLES, true);
  } catch {
    /* sqlite */
  }

  return { inserted, skipped, dataOwners: ownersOk };
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
  th,td{border:1px solid #e2e8f0;padding:8px 10px;font-size:13px}
  th{background:#f8fafc;text-align:left}
  table{border-collapse:collapse;width:100%;max-width:520px}
  @media print{button{display:none}}
</style></head><body>
<button onclick="window.print()" style="margin-bottom:16px;padding:8px 14px;background:#0f766e;color:#fff;border:0;border-radius:8px;cursor:pointer">Print / Save as PDF</button>
<h1>DPR Logistics — Data Backup Report</h1>
<p>Exported: ${backup.exportedAt} · Version ${backup.version}</p>
<table><thead><tr><th>Table</th><th>Records</th></tr></thead><tbody>${rows}</tbody></table>
</body></html>`;
}
