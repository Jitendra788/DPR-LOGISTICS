import { NextResponse } from "next/server";

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

const UNIQUE_LABELS: Record<string, string> = {
  lrNo: "LR number",
  billNo: "Bill number",
  challanNo: "Challan number",
  username: "Username",
  vehNo: "Vehicle number",
  name: "Name",
  slug: "Slug",
  referenceId: "Reference",
};

export function isUniqueViolation(err: unknown, field?: string) {
  if (prismaCode(err) !== "P2002") return false;
  if (!field) return true;
  const target = prismaTarget(err).toLowerCase();
  const message = err instanceof Error ? err.message.toLowerCase() : "";
  return target.includes(field.toLowerCase()) || message.includes(field.toLowerCase());
}

export function userFacingError(err: unknown, fallback = "Could not save. Please try again.") {
  if (isUniqueViolation(err)) {
    const key = prismaTarget(err).split(",")[0]?.trim() || "";
    const label = UNIQUE_LABELS[key] || key || "This value";
    return `${label} already exists`;
  }
  if (prismaCode(err) === "P2025") {
    return "Record not found. Refresh the page and try again.";
  }

  const message = err instanceof Error ? err.message : "";
  if (!message) return fallback;
  if (/prisma|invocation|unknown argument|argument ` /i.test(message) || message.length > 160) {
    return fallback;
  }
  return message;
}

export function apiError(err: unknown, label = "Request failed") {
  console.error(label, err);
  return NextResponse.json({ error: userFacingError(err, label) }, { status: 500 });
}
