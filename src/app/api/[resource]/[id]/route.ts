import { NextRequest, NextResponse } from "next/server";
import { getModel, isResource, sanitize, type ResourceKey } from "@/lib/resources";
import { resolveBillDeleteId, resolveUpdateId } from "@/lib/resolve-update";
import { userFacingError } from "@/lib/handle-api-error";
import { isUnknownPrismaArg, withoutUnknownArgs } from "@/lib/prisma-retry";
import { prisma } from "@/lib/prisma";
import { cascadeDeleteBill, syncBillAfterLrRemoved } from "@/lib/cascade-delete";
import { hashPassword, stripPassword } from "@/lib/auth-session";
import { requireAdmin, requireSession } from "@/lib/api-auth";

type Ctx = { params: Promise<{ resource: string; id: string }> };

function gate(req: NextRequest, resource: ResourceKey) {
  return resource === "users" ? requireAdmin(req) : requireSession(req);
}

async function resolveId(resource: ResourceKey, id: number, body?: Record<string, unknown>) {
  const model = getModel(resource);
  const existing = await model.findUnique({ where: { id } });
  if (existing) return id;
  if (!body) return null;
  const fallback = await resolveUpdateId(resource, body);
  return fallback;
}

export async function GET(req: NextRequest, ctx: Ctx) {
  const { resource, id } = await ctx.params;
  if (!isResource(resource)) {
    return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  }
  const auth = gate(req, resource);
  if (auth instanceof NextResponse) return auth;
  try {
    const row = await getModel(resource).findUnique({ where: { id: Number(id) } });
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (resource === "users") {
      return NextResponse.json(stripPassword(row as Record<string, unknown>));
    }
    return NextResponse.json(row);
  } catch (err) {
    return NextResponse.json({ error: userFacingError(err, "Could not load record") }, { status: 400 });
  }
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { resource, id: idParam } = await ctx.params;
  if (!isResource(resource)) {
    return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  }
  const auth = gate(req, resource);
  if (auth instanceof NextResponse) return auth;

  const id = Number(idParam);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid record id" }, { status: 400 });
  }

  const body = (await req.json()) as Record<string, unknown>;
  try {
    const updateId = await resolveId(resource, id, body);
    if (!updateId) {
      return NextResponse.json(
        { error: "Record not found. Refresh the page and try again." },
        { status: 404 },
      );
    }

    let data = sanitize(body, resource);
    if (resource === "users") {
      if (typeof data.password === "string" && data.password) {
        data.password = hashPassword(String(data.password));
      } else {
        delete data.password;
      }
    }
    for (let attempt = 0; attempt < 6; attempt++) {
      try {
        const updated = await getModel(resource).update({
          where: { id: updateId },
          data,
        });
        if (resource === "users") {
          return NextResponse.json(stripPassword(updated as Record<string, unknown>));
        }
        return NextResponse.json(updated);
      } catch (err) {
        if (!isUnknownPrismaArg(err)) throw err;
        const { data: cleaned, dropped } = withoutUnknownArgs(data, err);
        if (!dropped.length) throw err;
        console.warn(`PUT /api/${resource}/${id}: dropped unknown Prisma fields`, dropped);
        data = cleaned;
      }
    }
    throw new Error("Could not update. Please try again.");
  } catch (err) {
    console.error(`PUT /api/${resource}/${id} failed`, err);
    return NextResponse.json({ error: userFacingError(err, "Could not update. Please try again.") }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const { resource, id: idParam } = await ctx.params;
  if (!isResource(resource)) {
    return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  }
  const auth = gate(req, resource);
  if (auth instanceof NextResponse) return auth;

  const id = Number(idParam);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid record id" }, { status: 400 });
  }

  try {
    if (resource === "bills") {
      const billNoParam = req.nextUrl.searchParams.get("billNo") ?? undefined;
      const resolved = await resolveBillDeleteId(id, billNoParam);
      if (!resolved) {
        return NextResponse.json({ error: "Bill not found" }, { status: 404 });
      }
      const bill = await prisma.bill.findUnique({ where: { id: resolved } });
      if (!bill) {
        return NextResponse.json({ error: "Bill not found" }, { status: 404 });
      }
      // Unlink LRs + remove MRs + delete bill (outstanding goes away)
      await cascadeDeleteBill(bill.billNo);
      return NextResponse.json({ ok: true });
    }

    const existing = await getModel(resource).findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    if (resource === "bookings") {
      const lr = existing as { billNo?: string };
      const linkedBillNo = String(lr.billNo ?? "").trim();
      await prisma.lrBooking.delete({ where: { id } });
      // If this was the last LR on the bill → bill+MR gone; else refresh bill amount
      await syncBillAfterLrRemoved(linkedBillNo);
      return NextResponse.json({ ok: true });
    }

    if (resource === "lhc") {
      const lhc = existing as { challanNo?: string };
      const challanNo = String(lhc.challanNo ?? "").trim();
      if (challanNo) {
        await prisma.lrBooking.updateMany({
          where: { lhcNo: challanNo },
          data: { lhcNo: "" },
        });
      }
    }

    await getModel(resource).delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(`DELETE /api/${resource}/${id} failed`, err);
    return NextResponse.json({ error: userFacingError(err, "Could not delete. Please try again.") }, { status: 400 });
  }
}
