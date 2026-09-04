import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import { prisma } from "@/lib/prisma";
import { ensurePodUploadDir, podFilePath, safeFileName } from "@/lib/pod-docs";

const MAX_BYTES = 12 * 1024 * 1024;

export async function GET(req: NextRequest) {
  const lrNo = req.nextUrl.searchParams.get("lrNo")?.trim() ?? "";
  const rows = await prisma.podDocument.findMany({
    where: lrNo ? { lrNo } : undefined,
    orderBy: { id: "asc" },
  });
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const lrNo = String(form.get("lrNo") ?? "").trim();
  const file = form.get("file");
  if (!lrNo) return NextResponse.json({ error: "LR No is required" }, { status: 400 });
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Select a file to upload" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File is too large (max 12 MB)" }, { status: 400 });
  }

  const storedName = `${Date.now()}-${safeFileName(file.name)}`;
  await ensurePodUploadDir();
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(podFilePath(storedName), buf);

  const created = await prisma.podDocument.create({
    data: {
      lrNo,
      fileName: file.name || storedName,
      storedName,
      mimeType: file.type || "application/octet-stream",
    },
  });

  // Mark LR POD as Received after first document upload
  await prisma.lrBooking.updateMany({
    where: { lrNo },
    data: { podStatus: "Received" },
  });

  return NextResponse.json(created);
}
