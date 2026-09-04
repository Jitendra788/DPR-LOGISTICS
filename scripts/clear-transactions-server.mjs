/**
 * Clear transactional ERP data against a Postgres server DB only.
 * Refuses local SQLite. Requires CLEAR_TX=YES and a non-file DATABASE_URL.
 *
 * Example:
 *   CLEAR_TX=YES DATABASE_URL="postgresql://..." node scripts/clear-transactions-server.mjs
 */
import { execSync } from "node:child_process";
import { resolveDbEnv } from "./resolve-db-env.mjs";
import { applySchema } from "./select-schema.mjs";

const env = resolveDbEnv();
const url = String(env.DATABASE_URL || "").trim();

if (process.env.CLEAR_TX !== "YES") {
  console.error('Refusing: set CLEAR_TX=YES to clear server transactional data.');
  process.exit(1);
}

if (!url || url.startsWith("file:")) {
  console.error("Refusing: DATABASE_URL must be Postgres (server). Local SQLite will not be cleared.");
  process.exit(1);
}

if (!/postgres/i.test(url)) {
  console.error("Refusing: DATABASE_URL does not look like Postgres.");
  process.exit(1);
}

console.log("Target DB host:", (() => {
  try {
    return new URL(url.replace(/^postgresql:/, "http:")).host;
  } catch {
    return "(unparsed)";
  }
})());

applySchema(env);
execSync("npx prisma generate", { stdio: "inherit", env });
execSync("npx tsx prisma/clear-transactions.ts", { stdio: "inherit", env, cwd: process.cwd() });
