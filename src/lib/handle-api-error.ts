import { NextResponse } from "next/server";
import { alreadySavedInstruction } from "@/lib/api-instructions";

function prismaCode(err: unknown) {
  if (err && typeof err === "object" && "code" in err) return String((err as { code: unknown }).code);
  return "";
}

function prismaTarget(err: unknown) {
  if (!err || typeof err !== "object" || !("meta" in err)) return "";
  const target = (err as { meta?: { target?: unknown } }).meta?.target;
  if (Array.isArray(target)) return target.map(String).join(", ");
  return target ? String(target) : "";
}

export function isUniqueViolation(err: unknown, field?: string) {
  if (prismaCode(err) !== "P2002") return false;
  if (!field) return true;
  const target = prismaTarget(err).toLowerCase();
  const message = err instanceof Error ? err.message.toLowerCase() : "";
  return target.includes(field.toLowerCase()) || message.includes(field.toLowerCase());
}

export function userFacingError(err: unknown, fallback = "Could not save. Please try again.") {
  if (err instanceof Error) {
    const msg = err.message.trim();
    if (/already saved|already exists|already billed/i.test(msg)) return msg;
  }
  if (isUniqueViolation(err)) {
    const key = prismaTarget(err).split(",")[0]?.trim() || "";
    return alreadySavedInstruction(key || "record", "");
  }
  if (prismaCode(err) === "P2025") {
    return "Record not found. Refresh the page and try again.";
  }
  if (prismaCode(err) === "P2003") {
    return "Cannot delete — this record is linked to other data";
  }

  const message = err instanceof Error ? err.message : "";
  if (!message) return fallback;
  if (/prisma|invocation|unknown argument|argument ` /i.test(message) || message.length > 160) {
    return fallback;
  }
  return message;
}

/** Prefer 400 for client/instruction errors; 500 only for unexpected failures. */
export function apiError(err: unknown, label = "Request failed") {
  console.error(label, err);
  const text = userFacingError(err, label);
  const clientHint = /already saved|already exists|required|not found|invalid|unauthorized|linked/i.test(text);
  return NextResponse.json({ error: text }, { status: clientHint ? 400 : 500 });
}
