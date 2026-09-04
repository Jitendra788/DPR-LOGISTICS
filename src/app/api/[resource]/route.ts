import { NextRequest, NextResponse } from "next/server";
import { getModel, isResource, sanitize } from "@/lib/resources";
import { apiError, userFacingError } from "@/lib/handle-api-error";
import { prisma } from "@/lib/prisma";
import { attachBookingTrackToken, stripBookingTrackToken } from "@/services/trackingService";
import { createWithUniqueRetry } from "@/lib/unique-create";
import { hashPassword, stripPassword, stripPasswords } from "@/lib/auth-session";
import { requireAdmin, requireSession } from "@/lib/api-auth";

type Ctx = { params: Promise<{ resource: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { resource } = await ctx.params;
  if (!isResource(resource)) {
    return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  }
  const session = requireSession(req);
  if (session instanceof NextResponse) return session;

  try {
    const rows = await getModel(resource).findMany({ orderBy: { id: "desc" } });
    if (resource === "users") {
      return NextResponse.json(stripPasswords(rows as Array<Record<string, unknown>>));
    }
    return NextResponse.json(rows);
  } catch (err) {
    return apiError(err, "Could not load records");
  }
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { resource } = await ctx.params;
  if (!isResource(resource)) {
    return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  }

  if (resource === "users") {
    const admin = requireAdmin(req);
    if (admin instanceof NextResponse) return admin;
  } else {
    const session = requireSession(req);
    if (session instanceof NextResponse) return session;
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
    if (resource === "users" && typeof data.password === "string" && data.password) {
      data.password = hashPassword(String(data.password));
    }

    const created = await createWithUniqueRetry(resource, data);
    if (resource === "bookings" && created && typeof created === "object" && "id" in created) {
      const withToken = await attachBookingTrackToken(created as { id: number });
      return NextResponse.json(withToken);
    }
    if (resource === "users" && created && typeof created === "object") {
      return NextResponse.json(stripPassword(created as Record<string, unknown>));
    }
    return NextResponse.json(created);
  } catch (err) {
    console.error(`POST /api/${resource} failed`, err);
    return NextResponse.json({ error: userFacingError(err, "Could not save. Please try again.") }, { status: 400 });
  }
}
