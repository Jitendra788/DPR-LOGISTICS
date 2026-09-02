import type { Metadata } from "next";
import Image from "next/image";
import { InnerPage } from "@/components/marketing/InnerPage";
import { createPageMetadata } from "@/lib/seo";
import { getGalleryPhotos } from "@/services/mediaService";

export const metadata: Metadata = createPageMetadata({
  title: "Media Center",
  description: "DPR Logistics media center — gallery, press updates and company news from India's trusted cargo transport partner.",
  path: "/media",
});

export const revalidate = 60;

export default async function MediaPage() {
  const photos = await getGalleryPhotos();

  return (
    <InnerPage eyebrow="Media Center" title="Gallery" subtitle="Operations snapshots from our Kolhapur base and network.">
      {photos.length ? (
        <div className="mkt-media-grid">
          {photos.map((photo) => (
            <figure key={photo.id} className="mkt-media-item">
              <Image
                src={photo.url}
                alt={photo.alt}
                width={640}
                height={480}
                className="mkt-media-image"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              {photo.title ? <figcaption>{photo.title}</figcaption> : null}
            </figure>
          ))}
        </div>
      ) : (
        <p>Fleet, godown and branch visuals will appear here once uploaded from the admin Website Content section.</p>
      )}
    </InnerPage>
  );
}
