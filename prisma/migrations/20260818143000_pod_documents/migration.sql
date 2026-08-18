-- CreateTable
CREATE TABLE "PodDocument" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "lrNo" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL DEFAULT 'application/octet-stream',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
