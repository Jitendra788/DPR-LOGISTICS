-- DataOwner: per-user record ownership (non-admin sees only own rows)
CREATE TABLE IF NOT EXISTS "DataOwner" (
  "id" SERIAL PRIMARY KEY,
  "resource" TEXT NOT NULL,
  "recordId" INTEGER NOT NULL,
  "username" TEXT NOT NULL,
  UNIQUE ("resource", "recordId")
);
CREATE INDEX IF NOT EXISTS "DataOwner_username_resource_idx" ON "DataOwner"("username", "resource");
