/** Edge-compatible session verify (no Node crypto). Used by middleware. */

export type SessionUser = {
  id: number;
  username: string;
  name: string;
  role: string;
  branch: string;
  exp: number;
};

function edgeSecret() {
  const secret = process.env.SESSION_SECRET?.trim();
  if (secret) return secret;
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) return "";
  return "dev-only-session-secret-change-me";
}

export async function verifySessionTokenEdge(raw?: string | null): Promise<SessionUser | null> {
  if (!raw?.trim()) return null;
  const parts = raw.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, sig] = parts;
  if (!payloadB64 || !sig) return null;

  const secret = edgeSecret();
  if (!secret) return null;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadB64));
  const bytes = new Uint8Array(mac);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!);
  const expected = btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  if (expected.length !== sig.length) return null;
  let ok = 0;
  for (let i = 0; i < expected.length; i++) ok |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  if (ok !== 0) return null;

  try {
    const padded = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
    const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
    const json = atob(padded + pad);
    const payload = JSON.parse(json) as SessionUser;
    if (!payload?.id || !payload.username || !payload.exp) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return {
      id: Number(payload.id),
      username: String(payload.username),
      name: String(payload.name || ""),
      role: String(payload.role || "Operator"),
      branch: String(payload.branch || ""),
      exp: Number(payload.exp),
    };
  } catch {
    return null;
  }
}
