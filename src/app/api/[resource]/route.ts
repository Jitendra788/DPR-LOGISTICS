import { NextRequest, NextResponse } from "next/server";
import { getModel, isResource, sanitize } from "@/lib/resources";
import { apiError, userFacingError } from "@/lib/handle-api-error";
import { prisma } from "@/lib/prisma";
import { attachBookingTrackToken, stripBookingTrackToken } from "@/services/trackingService";
import { createWithUniqueRetry } from "@/lib/unique-create";
import {
  hashPassword,
  getUserAllowedModules,
  isAdminRole,
  setUserAllowedModules,
  setUserPasswordPlain,
  stripPassword,
  stripPasswords,
  withUserPasswordPlain,
} from "@/lib/auth-session";
import { requireAdmin, requireSession } from "@/lib/api-auth";
import { normalizeModulesInput } from "@/lib/modules";
import {
  assignRecordOwner,
  isOwnerScoped,
  ownedRecordIds,
  shouldScopeToOwner,
} from "@/lib/data-scope";

type Ctx = { params: Promise<{ resource: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { resource } = await ctx.params;
  if (!isResource(resource)) {
    return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  }
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;

  try {
    let rows: unknown[];

    if (resource !== "users" && shouldScopeToOwner(session.role) && isOwnerScoped(resource)) {
      const ids = await ownedRecordIds(resource, session.username);
      rows = ids.length
        ? await getModel(resource).findMany({ where: { id: { in: ids } }, orderBy: { id: "desc" } })
        : [];
    } else {
      rows = await getModel(resource).findMany({ orderBy: { id: "desc" } });
    }

    if (resource === "users") {
      if (!isAdminRole(session.role)) {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 });
      }
      const withPlain = await withUserPasswordPlain(rows as Array<{ id: number }>);
      const enriched = await Promise.all(
        (withPlain as Array<Record<string, unknown> & { id: number }>).map(async (row) => ({
          ...row,
          allowedModules: await getUserAllowedModules(row.id),
        })),
      );
      return NextResponse.json(stripPasswords(enriched));
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

  let actor: Awaited<ReturnType<typeof requireSession>>;
  if (resource === "users") {
    const admin = await requireAdmin(req);
    if (admin instanceof NextResponse) return admin;
    actor = admin;
  } else {
    const session = await requireSession(req);
    if (session instanceof NextResponse) return session;
    actor = session;
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
    if (resource === "bookings" && !isAdminRole(actor.role) && !String(data.bookingFrom || "").trim()) {
      data.bookingFrom = actor.branch || "";
    }

    let plainPassword = "";
    let allowedModulesValue = "";
    if (resource === "users" && typeof data.password === "string" && data.password) {
      plainPassword = String(data.password);
      data.password = hashPassword(plainPassword);
      delete data.passwordPlain;
    }
    if (resource === "users") {
      if ("allowedModules" in body || "allowedModules" in data) {
        allowedModulesValue = normalizeModulesInput(body.allowedModules ?? data.allowedModules);
      } else if (String(data.role || "").toLowerCase() === "admin") {
        allowedModulesValue = "*";
      } else {
        allowedModulesValue = "[]";
      }
      delete data.allowedModules;
    }

    const created = await createWithUniqueRetry(resource, data);
    if (created && typeof created === "object" && "id" in created && isOwnerScoped(resource)) {
      await assignRecordOwner(resource, Number((created as { id: number }).id), actor.username);
    }

    if (resource === "bookings" && created && typeof created === "object" && "id" in created) {
      const withToken = await attachBookingTrackToken(created as { id: number });
      return NextResponse.json(withToken);
    }
    if (resource === "users" && created && typeof created === "object" && "id" in created) {
      const id = Number((created as { id: number }).id);
      if (plainPassword) await setUserPasswordPlain(id, plainPassword);
      await setUserAllowedModules(id, allowedModulesValue);
      const withPlain = await withUserPasswordPlain([created as { id: number }]);
      return NextResponse.json(
        stripPassword({
          ...(withPlain[0] as Record<string, unknown>),
          allowedModules: allowedModulesValue,
        }),
      );
    }
    return NextResponse.json(created);
  } catch (err) {
    console.error(`POST /api/${resource} failed`, err);
    return NextResponse.json({ error: userFacingError(err, "Could not save. Please try again.") }, { status: 400 });
  }
}
