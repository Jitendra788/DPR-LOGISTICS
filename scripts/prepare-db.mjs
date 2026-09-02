import { execSync } from "node:child_process";
import { resolveDbEnv } from "./resolve-db-env.mjs";

const env = resolveDbEnv();

if (!env.DATABASE_URL) {
  console.error(
    "DATABASE_URL is missing. Connect Vercel Postgres and set DATABASE_URL (or POSTGRES_PRISMA_URL) in project env.",
  );
  process.exit(1);
}

console.log("Applying database migrations to Vercel Postgres…");
execSync("npx prisma migrate deploy", { stdio: "inherit", env, cwd: process.cwd() });
execSync("npx tsx prisma/bootstrap.ts", { stdio: "inherit", env, cwd: process.cwd() });
console.log("Database ready.");
