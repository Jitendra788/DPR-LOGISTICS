import { execSync } from "node:child_process";
import path from "node:path";

const dbUrl = "file:./prod.db";
const env = { ...process.env, DATABASE_URL: dbUrl };
const cwd = process.cwd();

console.log("Preparing SQLite database for deploy:", path.join(cwd, "prisma", "prod.db"));
execSync("npx prisma db push --skip-generate --accept-data-loss", { stdio: "inherit", env, cwd });
execSync("npx tsx prisma/seed.ts", { stdio: "inherit", env, cwd });
console.log("Database ready.");
