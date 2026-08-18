import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import { prisma } from "@/lib/prisma";
import { podFilePath } from "@/lib/pod-docs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const row = await prisma.podDocument.findUnique({ where: { id: Number(id) } });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const buf = await fs.readFile(podFilePath(row.storedName));
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": row.mimeType || "application/octet-stream",
        "Content-Disposition": `inline; filename="${row.fileName.replace(/"/g, "")}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "File missing" }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const row = await prisma.podDocument.findUnique({ where: { id: Number(id) } });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    await fs.unlink(podFilePath(row.storedName));
  } catch {
    // file may already be gone
  }
  await prisma.podDocument.delete({ where: { id: row.id } });
  return NextResponse.json({ ok: true });
}
