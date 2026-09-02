import fs from "node:fs/promises";
import path from "node:path";
import { marketingMediaUrl } from "@/lib/marketing-media-url";

export { marketingMediaUrl };

export const MARKETING_UPLOAD_DIR = path.join(process.cwd(), "uploads", "marketing");

export function safeFileName(name: string) {
  const base = path.basename(name || "image").replace(/[^a-zA-Z0-9._-]/g, "_");
  return base.slice(0, 120) || "image";
}

export function marketingFilePath(storedName: string) {
  return path.join(MARKETING_UPLOAD_DIR, storedName);
}

export async function ensureMarketingUploadDir() {
  await fs.mkdir(MARKETING_UPLOAD_DIR, { recursive: true });
}
