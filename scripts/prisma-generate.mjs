import { execSync } from "node:child_process";
import { resolveDbEnv } from "./resolve-db-env.mjs";

const env = resolveDbEnv();
execSync("npx prisma generate", { stdio: "inherit", env });
