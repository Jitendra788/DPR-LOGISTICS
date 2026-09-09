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

export type PartyLite = { name: string; address?: string; gst?: string };

/** Resolve each multi-select name to Party Master address / GST (fallback name-only). */
export function resolveParties(parties: PartyLite[], raw: string): PartyLite[] {
  const names = splitPartyNames(raw);
  if (!names.length) {
    const single = String(raw ?? "").trim();
    return single ? [{ name: single, address: "", gst: "" }] : [];
  }
  return names.map((name) => {
    const q = name.toLowerCase();
    const hit = parties.find((p) => p.name.trim().toLowerCase() === q);
    return {
      name: hit?.name || name,
      address: hit?.address || "",
      gst: hit?.gst || "",
    };
  });
}
