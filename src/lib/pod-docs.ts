import fs from "node:fs/promises";
import path from "node:path";

export const POD_UPLOAD_DIR = path.join(process.cwd(), "uploads", "pod");

export function safeFileName(name: string) {
  const base = path.basename(name || "document").replace(/[^a-zA-Z0-9._-]/g, "_");
  return base.slice(0, 120) || "document";
}

export function podFilePath(storedName: string) {
  return path.join(POD_UPLOAD_DIR, storedName);
}

export async function ensurePodUploadDir() {
  await fs.mkdir(POD_UPLOAD_DIR, { recursive: true });
}
