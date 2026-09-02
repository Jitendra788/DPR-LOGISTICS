import { execSync } from "node:child_process";
import { resolveDbEnv } from "./resolve-db-env.mjs";
import { applySchema } from "./select-schema.mjs";

const env = resolveDbEnv();
if (!env.DATABASE_URL) {
  env.DATABASE_URL = "file:./dev.db";
}

const kind = applySchema(env);

if (kind === "sqlite") {
  console.log("Preparing local SQLite database…");
  execSync("npx prisma db push --skip-generate --accept-data-loss", { stdio: "inherit", env, cwd: process.cwd() });
} else {
  if (!env.DATABASE_URL) {
    console.error("DATABASE_URL is missing. Connect Vercel Postgres in project env.");
    process.exit(1);
  }
  console.log("Applying database migrations to Vercel Postgres…");
  execSync("npx prisma migrate deploy", { stdio: "inherit", env, cwd: process.cwd() });
}

execSync("npx tsx prisma/bootstrap.ts", { stdio: "inherit", env, cwd: process.cwd() });
console.log("Database ready.");
