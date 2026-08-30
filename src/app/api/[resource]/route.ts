import { NextRequest, NextResponse } from "next/server";
import { getModel, isResource, sanitize } from "@/lib/resources";
import { prisma } from "@/lib/prisma";
import { attachBookingTrackToken, stripBookingTrackToken } from "@/services/trackingService";

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
    if (resource === "parties") {
      const name = String(body.name ?? "").trim();
      const gst = String(body.gst ?? "").trim().toUpperCase();
      if (name) {
        const recent = await prisma.party.findMany({
          where: { name },
          orderBy: { id: "desc" },
          take: 5,
        });
        const match = recent.find((row) => {
          const sameGst = (row.gst || "").trim().toUpperCase() === gst;
          const ageMs = Date.now() - new Date(row.createdAt).getTime();
          return sameGst && ageMs < 60_000;
        });
        if (match) return NextResponse.json(match);
      }
    }

    let data = sanitize(body, resource);
    if (resource === "bookings") data = stripBookingTrackToken(data);

    const created = await getModel(resource).create({ data });
    if (resource === "bookings" && created && typeof created === "object" && "id" in created) {
      const withToken = await attachBookingTrackToken(created as { id: number });
      return NextResponse.json(withToken);
    }
    return NextResponse.json(created);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
