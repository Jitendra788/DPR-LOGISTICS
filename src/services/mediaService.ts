import { marketingMediaUrl } from "@/lib/marketing-media";
import { prisma } from "@/lib/prisma";

export type PublicMediaItem = {
  id: number;
  title: string;
  alt: string;
  category: string;
  url: string;
  sortOrder: number;
};

function mapRow(row: {
  id: number;
  title: string;
  alt: string;
  category: string;
  sortOrder: number;
}): PublicMediaItem {
  return {
    id: row.id,
    title: row.title,
    alt: row.alt || row.title,
    category: row.category,
    url: marketingMediaUrl(row.id),
    sortOrder: row.sortOrder,
  };
}

export async function getPublishedMedia(category?: string): Promise<PublicMediaItem[]> {
  try {
    const rows = await prisma.marketingMedia.findMany({
      where: {
        published: true,
        ...(category ? { category } : {}),
      },
      orderBy: [{ sortOrder: "asc" }, { id: "desc" }],
    });
    return rows.map(mapRow);
  } catch {
    return [];
  }
}

export async function getGalleryPhotos(): Promise<PublicMediaItem[]> {
  return getPublishedMedia("gallery");
}
