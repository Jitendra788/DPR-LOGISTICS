import "dotenv/config";
import { defineConfig } from "prisma/config";

// Fallback for Vercel postinstall (prisma generate) when DATABASE_URL is not set yet.
const databaseUrl = process.env.DATABASE_URL ?? "file:./prod.db";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl,
  },
});
