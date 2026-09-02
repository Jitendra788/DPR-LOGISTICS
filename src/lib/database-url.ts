type Env = Record<string, string | undefined>;

const URL_KEYS = [
  "DATABASE_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL",
  "POSTGRES_URL_NON_POOLING",
  "DATABASE_URL_UNPOOLED",
] as const;

export function databaseUrlKeysPresent(env: Env = process.env) {
  return Object.fromEntries(URL_KEYS.map((key) => [key, Boolean(env[key]?.trim())]));
}

/** Pick a Postgres URL; ignore SQLite file URLs on Vercel. */
export function pickDatabaseUrl(env: Env = process.env) {
  for (const key of URL_KEYS) {
    const url = env[key]?.trim();
    if (!url) continue;
    if (env.VERCEL && url.startsWith("file:")) continue;
    return url;
  }
  if (env.VERCEL) return "";
  return "file:./dev.db";
}

export function pickDirectUrl(env: Env = process.env) {
  const direct =
    env.DIRECT_URL?.trim() ||
    env.DATABASE_URL_UNPOOLED?.trim() ||
    env.POSTGRES_URL_NON_POOLING?.trim() ||
    env.POSTGRES_URL?.trim() ||
    "";
  if (direct && !(env.VERCEL && direct.startsWith("file:"))) return direct;

  const pooled = pickDatabaseUrl(env);
  if (pooled && !pooled.startsWith("file:")) return pooled;
  return "";
}
