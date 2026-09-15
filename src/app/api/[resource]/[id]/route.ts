import { NextRequest, NextResponse } from "next/server";
import { getModel, isResource, sanitize, type ResourceKey } from "@/lib/resources";
import { resolveBillDeleteId, resolveUpdateId } from "@/lib/resolve-update";
import { userFacingError } from "@/lib/handle-api-error";
import { assertUniqueOnUpdate } from "@/lib/api-instructions";
import { isUnknownPrismaArg, withoutUnknownArgs } from "@/lib/prisma-retry";
import { prisma } from "@/lib/prisma";
import { cascadeDeleteBill, syncBillAfterLrRemoved } from "@/lib/cascade-delete";
import { hashPassword, getUserAllowedModules, setUserAllowedModules, setUserPasswordPlain, stripPassword, withUserPasswordPlain } from "@/lib/auth-session";
import { requireAdmin, requireSession } from "@/lib/api-auth";
import { OTP_MAX_ATTEMPTS, otpMatches, maskMobile, PASSWORD_OTP_MOBILE } from "@/lib/password-otp";
import { normalizeModulesInput } from "@/lib/modules";
import { isOwnerScoped, isRecordOwnedBy, shouldScopeToOwner } from "@/lib/data-scope";

type Ctx = { params: Promise<{ resource: string; id: string }> };

function gate(req: NextRequest, resource: ResourceKey) {
  return resource === "users" ? requireAdmin(req) : requireSession(req);
}

async function assertCanAccessRecord(
  auth: { role: string; username: string },
  resource: ResourceKey,
  recordId: number,
) {
  if (!shouldScopeToOwner(auth.role) || !isOwnerScoped(resource)) return true;
  return isRecordOwnedBy(resource, recordId, auth.username);
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
  const auth = await gate(req, resource);
  if (auth instanceof NextResponse) return auth;
  try {
    const rowId = Number(id);
    const row = await getModel(resource).findUnique({ where: { id: rowId } });
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!(await assertCanAccessRecord(auth, resource, rowId))) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (resource === "users") {
      return NextResponse.json(
        stripPassword(
          (await withUserPasswordPlain([row as { id: number }]))[0] as Record<string, unknown>,
        ),
      );
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
  const auth = await gate(req, resource);
  if (auth instanceof NextResponse) return auth;

  const id = Number(idParam);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid record id" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const updateId = await resolveId(resource, id, body);
    if (!updateId) {
      return NextResponse.json(
        { error: "Record not found. Refresh the page and try again." },
        { status: 404 },
      );
    }
    if (!(await assertCanAccessRecord(auth, resource, updateId))) {
      return NextResponse.json({ error: "Record not found. Refresh the page and try again." }, { status: 404 });
    }

    let data = sanitize(body, resource);
    let passwordChanged = false;
    let modulesChanged = false;
    let nextAllowedModules: string | null = null;
    const otpCode = String(body.otp ?? "").trim();
    if (resource === "users") {
      if (typeof data.password === "string" && data.password) {
        passwordChanged = true;
      } else {
        delete data.password;
      }
      if ("allowedModules" in body || "allowedModules" in data) {
        nextAllowedModules = normalizeModulesInput(body.allowedModules ?? data.allowedModules);
      }
      if (
        String(data.role || body.role || "").toLowerCase() === "admin" &&
        (nextAllowedModules === "[]" || nextAllowedModules === null)
      ) {
        nextAllowedModules = "*";
      }
      delete data.allowedModules;
      delete data.passwordPlain;
      const existingRole = (
        await prisma.user.findUnique({
          where: { id: updateId },
          select: { role: true },
        })
      )?.role;
      const existingMods = await getUserAllowedModules(updateId);
      if (existingRole != null) {
        const nextRole = String(data.role ?? existingRole);
        const nextMods = nextAllowedModules ?? existingMods;
        modulesChanged =
          nextMods !== existingMods || nextRole.toLowerCase() !== String(existingRole).toLowerCase();
      }
    }
    await assertUniqueOnUpdate(resource, updateId, data);
    for (let attempt = 0; attempt < 6; attempt++) {
      try {
        if (resource === "users" && passwordChanged) {
          if (!/^\d{4,8}$/.test(otpCode)) {
            return NextResponse.json(
              {
                error: `Enter the OTP sent to ${maskMobile(PASSWORD_OTP_MOBILE)} to change password`,
              },
              { status: 400 },
            );
          }
          const row = await prisma.user.findUnique({
            where: { id: updateId },
            select: {
              passwordOtpHash: true,
              passwordOtpExpires: true,
              passwordOtpAttempts: true,
            },
          });
          if (!row?.passwordOtpHash || !row.passwordOtpExpires || row.passwordOtpExpires.getTime() < Date.now()) {
            return NextResponse.json(
              { error: "OTP expired or not sent. Click Send OTP first." },
              { status: 400 },
            );
          }
          if (Number(row.passwordOtpAttempts) >= OTP_MAX_ATTEMPTS) {
            return NextResponse.json(
              { error: "Too many wrong OTP attempts. Send a new OTP." },
              { status: 400 },
            );
          }
          if (!otpMatches(otpCode, updateId, row.passwordOtpHash)) {
            await prisma.user.update({
              where: { id: updateId },
              data: { passwordOtpAttempts: { increment: 1 } },
            });
            return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
          }

          const plainPassword = String(body.password ?? "");
          data.password = hashPassword(plainPassword);
          delete data.passwordPlain;
          const updated = await prisma.user.update({
            where: { id: updateId },
            data: {
              ...data,
              sessionVersion: { increment: 1 },
              lastSeenAt: null,
              passwordOtpHash: "",
              passwordOtpExpires: null,
              passwordOtpAttempts: 0,
            },
          });
          await setUserPasswordPlain(updateId, plainPassword);
          if (nextAllowedModules != null) await setUserAllowedModules(updateId, nextAllowedModules);
          const withPlain = await withUserPasswordPlain([updated as { id: number }]);
          const payload = stripPassword({
            ...(withPlain[0] as Record<string, unknown>),
            allowedModules: nextAllowedModules ?? (await getUserAllowedModules(updateId)),
          });
          const res = NextResponse.json({
            ...payload,
            forceLogout: auth.id === updateId,
            passwordChanged: true,
          });
          if (auth.id === updateId) {
            res.cookies.set("dpr_session", "", { httpOnly: true, path: "/", maxAge: 0 });
          }
          return res;
        }
        const updated = await getModel(resource).update({
          where: { id: updateId },
          data:
            resource === "users" && modulesChanged
              ? { ...data, sessionVersion: { increment: 1 }, lastSeenAt: null }
              : data,
        });
        if (resource === "users") {
          if (nextAllowedModules != null) await setUserAllowedModules(updateId, nextAllowedModules);
          const withPlain = await withUserPasswordPlain([updated as { id: number }]);
          return NextResponse.json(
            stripPassword({
              ...(withPlain[0] as Record<string, unknown>),
              allowedModules: nextAllowedModules ?? (await getUserAllowedModules(updateId)),
            }),
          );
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
  const auth = await gate(req, resource);
  if (auth instanceof NextResponse) return auth;

  const id = Number(idParam);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid record id" }, { status: 400 });
  }

  try {
    if (!(await assertCanAccessRecord(auth, resource, id))) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }
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
