import fs from "node:fs";
import path from "node:path";
import { resolveDbEnv } from "./resolve-db-env.mjs";

export function isSqliteUrl(url = "") {
  return url.startsWith("file:");
}

export function pickDatabaseKind(env = resolveDbEnv()) {
  const url = env.DATABASE_URL ?? "file:./dev.db";
  return isSqliteUrl(url) ? "sqlite" : "postgres";
}

export function applySchema(env = resolveDbEnv()) {
  const kind = pickDatabaseKind(env);
  const root = process.cwd();
  const src = path.join(root, "prisma", kind === "sqlite" ? "schema.sqlite.prisma" : "schema.postgres.prisma");
  const dest = path.join(root, "prisma", "schema.prisma");

  if (!fs.existsSync(src)) {
    throw new Error(`Missing Prisma schema template: ${src}`);
  }

  fs.copyFileSync(src, dest);
  console.log(`Prisma schema: ${kind === "sqlite" ? "SQLite (local)" : "PostgreSQL (Vercel)"}`);
  return kind;
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}`) {
  applySchema();
}
