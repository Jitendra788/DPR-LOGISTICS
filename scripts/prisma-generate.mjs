import { execSync } from "node:child_process";
import { resolveDbEnv } from "./resolve-db-env.mjs";
import { applySchema } from "./select-schema.mjs";

const env = resolveDbEnv();
if (!env.DATABASE_URL) {
  env.DATABASE_URL = "file:./dev.db";
}

applySchema(env);
execSync("npx prisma generate", { stdio: "inherit", env });
