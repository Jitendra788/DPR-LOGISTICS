import { NextRequest, NextResponse } from "next/server";
import { getModel, isResource, sanitize } from "@/lib/resources";

type Ctx = { params: Promise<{ resource: string; id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { resource, id } = await ctx.params;
  if (!isResource(resource)) {
    return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  }
  const row = await getModel(resource).findUnique({ where: { id: Number(id) } });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { resource, id } = await ctx.params;
  if (!isResource(resource)) {
    return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  }
  const body = (await req.json()) as Record<string, unknown>;
  try {
    const updated = await getModel(resource).update({
      where: { id: Number(id) },
      data: sanitize(body, resource),
    });
    return NextResponse.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { resource, id } = await ctx.params;
  if (!isResource(resource)) {
    return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  }
  try {
    await getModel(resource).delete({ where: { id: Number(id) } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
