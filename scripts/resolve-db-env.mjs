/** Normalize Vercel Postgres env vars for Prisma (local + production). */
export function resolveDbEnv(base = process.env) {
  const env = { ...base };

  const urlKeys = [
    "DATABASE_URL",
    "POSTGRES_PRISMA_URL",
    "POSTGRES_URL",
    "POSTGRES_URL_NON_POOLING",
    "DATABASE_URL_UNPOOLED",
  ];

  if (!env.DATABASE_URL || (base.VERCEL && env.DATABASE_URL.startsWith("file:"))) {
    for (const key of urlKeys) {
      const candidate = env[key]?.trim();
      if (!candidate) continue;
      if (base.VERCEL && candidate.startsWith("file:")) continue;
      env.DATABASE_URL = candidate;
      break;
    }
  }

  if (!env.DIRECT_URL) {
    env.DIRECT_URL =
      env.DATABASE_URL_UNPOOLED?.trim() ||
      env.POSTGRES_URL_NON_POOLING?.trim() ||
      env.POSTGRES_URL?.trim() ||
      "";
  }
  if (!env.DATABASE_URL_UNPOOLED) {
    env.DATABASE_URL_UNPOOLED =
      env.DIRECT_URL?.trim() ||
      env.POSTGRES_URL_NON_POOLING?.trim() ||
      env.POSTGRES_URL?.trim() ||
      "";
  }
  if (!env.DIRECT_URL && env.DATABASE_URL && !env.DATABASE_URL.startsWith("file:")) {
    env.DIRECT_URL = env.DATABASE_URL;
    env.DATABASE_URL_UNPOOLED = env.DATABASE_URL;
  }

  if (!env.DATABASE_URL && !env.POSTGRES_PRISMA_URL && !env.POSTGRES_URL && !base.VERCEL) {
    env.DATABASE_URL = "file:./dev.db";
  }

  return env;
}
