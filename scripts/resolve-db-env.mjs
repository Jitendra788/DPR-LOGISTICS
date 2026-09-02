/** Normalize Vercel Postgres env vars for Prisma (local + production). */
export function resolveDbEnv(base = process.env) {
  const env = { ...base };

  if (!env.DATABASE_URL && env.POSTGRES_PRISMA_URL) {
    env.DATABASE_URL = env.POSTGRES_PRISMA_URL;
  }
  if (!env.DATABASE_URL && env.POSTGRES_URL) {
    env.DATABASE_URL = env.POSTGRES_URL;
  }

  if (!env.DIRECT_URL && env.POSTGRES_URL_NON_POOLING) {
    env.DIRECT_URL = env.POSTGRES_URL_NON_POOLING;
  }
  if (!env.DIRECT_URL && env.POSTGRES_URL) {
    env.DIRECT_URL = env.POSTGRES_URL;
  }
  if (!env.DIRECT_URL && env.DATABASE_URL && !env.DATABASE_URL.startsWith("file:")) {
    env.DIRECT_URL = env.DATABASE_URL;
  }

  if (!env.DATABASE_URL && !env.POSTGRES_PRISMA_URL && !env.POSTGRES_URL && !base.VERCEL) {
    env.DATABASE_URL = "file:./dev.db";
  }

  return env;
}
