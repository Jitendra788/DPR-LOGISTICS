import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { requireAdmin } from "@/lib/api-auth";
import { apiError } from "@/lib/handle-api-error";
import { backupSummaryHtml, collectBackup, collectBackupCounts, restoreBackup, type BackupPayload } from "@/lib/backup";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
/** Large legacy JSON restores can take several minutes */
export const maxDuration = 300;

function stamp() {
  return new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  try {
    const format = (req.nextUrl.searchParams.get("format") || "json").toLowerCase();

    if (format === "summary") {
      const counts = await collectBackupCounts();
      return NextResponse.json({
        exportedAt: new Date().toISOString(),
        counts,
        total: Object.values(counts).reduce((s, n) => s + n, 0),
      });
    }

    const backup = await collectBackup();

    if (format === "json") {
      const body = JSON.stringify(backup, null, 2);
      return new NextResponse(body, {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="dpr-backup-${stamp()}.json"`,
        },
      });
    }

    if (format === "xlsx" || format === "excel") {
      const wb = XLSX.utils.book_new();
      const summary = Object.entries(backup.counts).map(([table, count]) => ({ table, count }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summary), "Summary");

      for (const [name, rows] of Object.entries(backup.tables)) {
        const sheetName = name.slice(0, 31);
        const safeRows = (rows || []).map((row) => {
          const copy: Record<string, unknown> = {};
          for (const [k, v] of Object.entries(row)) {
            if (k === "password" || k === "passwordOtpHash") {
              copy[k] = "[hidden-in-excel]";
              continue;
            }
            if (typeof v === "object" && v !== null) copy[k] = JSON.stringify(v);
            else copy[k] = v;
          }
          return copy;
        });
        XLSX.utils.book_append_sheet(
          wb,
          XLSX.utils.json_to_sheet(safeRows.length ? safeRows : [{ note: "empty" }]),
          sheetName,
        );
      }

      if (backup.dataOwners.length) {
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(backup.dataOwners), "DataOwners");
      }

      const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
      return new NextResponse(new Uint8Array(buf), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="dpr-backup-${stamp()}.xlsx"`,
        },
      });
    }

    if (format === "pdf" || format === "html") {
      const html = backupSummaryHtml(backup);
      return new NextResponse(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Disposition": format === "pdf" ? `inline; filename="dpr-backup-${stamp()}.html"` : "inline",
        },
      });
    }

    return NextResponse.json({ error: "format must be json, xlsx, or pdf" }, { status: 400 });
  } catch (err) {
    return apiError(err, "Backup failed");
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  try {
    const body = (await req.json()) as { backup?: BackupPayload; confirm?: string };
    if (body.confirm !== "RESTORE") {
      return NextResponse.json(
        { error: 'Type confirm: "RESTORE" to wipe current data and import backup.' },
        { status: 400 },
      );
    }
    if (!body.backup) {
      return NextResponse.json({ error: "backup JSON required" }, { status: 400 });
    }

    const restored = await restoreBackup(body.backup);
    return NextResponse.json({
      ok: true,
      message: "Database restored from backup. Please login again if needed.",
      restored,
    });
  } catch (err) {
    console.error("Restore failed", err);
    return apiError(err, "Restore failed");
  }
}
