import { execSync } from "node:child_process";
import { resolveDbEnv } from "./resolve-db-env.mjs";
import { applySchema } from "./select-schema.mjs";

const env = resolveDbEnv();
if (!env.DATABASE_URL) {
  console.error("DATABASE_URL is missing. Paste your Neon POSTGRES_PRISMA_URL into .env first.");
  process.exit(1);
}

applySchema(env);
execSync("npx prisma generate", { stdio: "inherit", env });
execSync("npx tsx prisma/reset-erp-data.ts", { stdio: "inherit", env, cwd: process.cwd() });
