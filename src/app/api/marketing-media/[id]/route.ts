import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import { prisma } from "@/lib/prisma";
import { marketingFilePath } from "@/lib/marketing-media";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const row = await prisma.marketingMedia.findUnique({ where: { id: Number(id) } });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const buf = await fs.readFile(marketingFilePath(row.storedName));
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": row.mimeType || "image/jpeg",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return NextResponse.json({ error: "File missing" }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const row = await prisma.marketingMedia.findUnique({ where: { id: Number(id) } });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    await fs.unlink(marketingFilePath(row.storedName));
  } catch {
    /* file may already be gone */
  }
  await prisma.marketingMedia.delete({ where: { id: row.id } });
  return NextResponse.json({ ok: true });
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = (await req.json()) as Record<string, unknown>;
  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = String(body.title);
  if (body.alt !== undefined) data.alt = String(body.alt);
  if (body.category !== undefined) data.category = String(body.category);
  if (body.sortOrder !== undefined) data.sortOrder = Number(body.sortOrder) || 0;
  if (body.published !== undefined) {
    data.published = body.published === true || body.published === "true" || body.published === "1";
  }

  const updated = await prisma.marketingMedia.update({
    where: { id: Number(id) },
    data,
  });
  return NextResponse.json(updated);
}
