import { NextRequest, NextResponse } from "next/server";
import { getModel, isResource, sanitize, type ResourceKey } from "@/lib/resources";
import { resolveBillDeleteId, resolveUpdateId } from "@/lib/resolve-update";
import { userFacingError } from "@/lib/handle-api-error";
import { isUnknownPrismaArg, withoutUnknownArgs } from "@/lib/prisma-retry";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ resource: string; id: string }> };

async function resolveId(resource: ResourceKey, id: number, body?: Record<string, unknown>) {
  const model = getModel(resource);
  const existing = await model.findUnique({ where: { id } });
  if (existing) return id;
  if (!body) return null;
  const fallback = await resolveUpdateId(resource, body);
  return fallback;
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { resource, id } = await ctx.params;
  if (!isResource(resource)) {
    return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  }
  try {
    const row = await getModel(resource).findUnique({ where: { id: Number(id) } });
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
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
    for (let attempt = 0; attempt < 6; attempt++) {
      try {
        const updated = await getModel(resource).update({
          where: { id: updateId },
          data,
        });
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

  const id = Number(idParam);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid record id" }, { status: 400 });
  }

  try {
    let deleteId = id;
    if (resource === "bills") {
      const billNo = req.nextUrl.searchParams.get("billNo") ?? undefined;
      const resolved = await resolveBillDeleteId(id, billNo);
      if (!resolved) {
        return NextResponse.json({ error: "Bill not found" }, { status: 404 });
      }
      deleteId = resolved;
      const bill = await prisma.bill.findUnique({ where: { id: deleteId } });
      if (bill?.billNo) {
        await prisma.lrBooking.updateMany({
          where: { billNo: bill.billNo },
          data: { billed: false, billNo: "" },
        });
      }
    } else {
      const existing = await getModel(resource).findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json({ error: "Record not found" }, { status: 404 });
      }
    }

    await getModel(resource).delete({ where: { id: deleteId } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(`DELETE /api/${resource}/${id} failed`, err);
    return NextResponse.json({ error: userFacingError(err, "Could not delete. Please try again.") }, { status: 400 });
  }
}
