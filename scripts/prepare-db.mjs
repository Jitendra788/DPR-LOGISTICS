import { execSync } from "node:child_process";
import { resolveDbEnv } from "./resolve-db-env.mjs";
import { applySchema } from "./select-schema.mjs";

function run(cmd, env) {
  execSync(cmd, { stdio: "inherit", env, cwd: process.cwd() });
}

const env = resolveDbEnv();

if (!env.DATABASE_URL && process.env.VERCEL) {
  console.warn("Vercel build: no Postgres URL found — skipping database setup.");
  console.log("Database ready (skipped).");
  process.exit(0);
}

if (!env.DATABASE_URL) {
  env.DATABASE_URL = "file:./dev.db";
}

const kind = applySchema(env);

if (kind === "sqlite") {
  console.log("Preparing local SQLite database…");
  run("npx prisma db push --skip-generate --accept-data-loss", env);
} else {
  if (!env.DATABASE_URL) {
    console.error("DATABASE_URL is missing. Connect Neon Postgres in Vercel Storage.");
    process.exit(1);
  }
  if (!env.DATABASE_URL_UNPOOLED) {
    console.error(
      "DATABASE_URL_UNPOOLED is missing. Reconnect Neon in Vercel Storage and redeploy.",
    );
    process.exit(1);
  }

  console.log("Postgres env ready:", {
    DATABASE_URL: true,
    DATABASE_URL_UNPOOLED: true,
  });

  console.log("Syncing Postgres schema…");
  try {
    run("npx prisma migrate deploy", env);
  } catch {
    console.warn("migrate deploy failed — falling back to db push…");
    run("npx prisma db push --skip-generate --accept-data-loss", env);
  }
}

run("npx tsx prisma/bootstrap.ts", env);
console.log("Database ready.");
