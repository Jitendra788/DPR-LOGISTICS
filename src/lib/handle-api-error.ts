import { NextResponse } from "next/server";

export function apiError(err: unknown, label = "Request failed") {
  const message = err instanceof Error ? err.message : label;
  console.error(label, err);
  return NextResponse.json({ error: message }, { status: 500 });
}
