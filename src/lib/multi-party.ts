/** Split stored multi-party value (comma / pipe / semicolon separated). */
export function splitPartyNames(raw: string): string[] {
  const text = String(raw ?? "").trim();
  if (!text) return [];
  return text
    .split(/\s*[|,;]\s*|\s*,\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

/** Join selected party names for storage on a single string column. */
export function joinPartyNames(names: string[]): string {
  return names.map((n) => n.trim()).filter(Boolean).join(", ");
}
