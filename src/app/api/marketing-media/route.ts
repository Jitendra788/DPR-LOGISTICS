import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import { prisma } from "@/lib/prisma";
import { ensureMarketingUploadDir, marketingFilePath, safeFileName } from "@/lib/marketing-media";

const MAX_BYTES = 8 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function GET(req: NextRequest) {
  try {
    const category = req.nextUrl.searchParams.get("category")?.trim() ?? "";
    const rows = await prisma.marketingMedia.findMany({
      where: category ? { category } : undefined,
      orderBy: [{ sortOrder: "asc" }, { id: "desc" }],
    });
    return NextResponse.json(rows);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load photos";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const title = String(form.get("title") ?? "").trim();
    const alt = String(form.get("alt") ?? "").trim();
    const category = String(form.get("category") ?? "gallery").trim() || "gallery";
    const sortOrder = Number(form.get("sortOrder") ?? 0) || 0;
    const published = String(form.get("published") ?? "true") !== "false";

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Select an image to upload" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Image is too large (max 8 MB)" }, { status: 400 });
    }
    const mime = file.type || "image/jpeg";
    if (!IMAGE_TYPES.has(mime)) {
      return NextResponse.json({ error: "Only JPG, PNG, WebP or GIF images are allowed" }, { status: 400 });
    }

    const storedName = `${Date.now()}-${safeFileName(file.name)}`;
    await ensureMarketingUploadDir();
    const buf = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(marketingFilePath(storedName), buf);

    const created = await prisma.marketingMedia.create({
      data: {
        title,
        alt: alt || title,
        category,
        storedName,
        mimeType: mime,
        sortOrder,
        published,
      },
    });
    return NextResponse.json(created);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
