import { NextRequest, NextResponse } from "next/server";
import { getModel, isResource, sanitize } from "@/lib/resources";

type Ctx = { params: Promise<{ resource: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { resource } = await ctx.params;
  if (!isResource(resource)) {
    return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  }
  const rows = await getModel(resource).findMany({ orderBy: { id: "desc" } });
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { resource } = await ctx.params;
  if (!isResource(resource)) {
    return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  }
  const body = (await req.json()) as Record<string, unknown>;
  try {
    const created = await getModel(resource).create({ data: sanitize(body, resource) });
    return NextResponse.json(created);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
