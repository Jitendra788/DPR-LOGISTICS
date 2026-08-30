import Image from "next/image";
import { BRAND_LOGO_HEADER, BRAND_NAME } from "@/lib/brand";

export function BlogCover({
  src,
  alt,
  compact = false,
}: {
  src: string;
  alt: string;
  compact?: boolean;
}) {
  return (
    <div className={`mkt-blog-cover${compact ? " is-compact" : ""}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 360px"
        className="mkt-blog-cover-img"
      />
      <div className="mkt-blog-cover-logo-badge">
        <Image
          src={BRAND_LOGO_HEADER}
          alt={BRAND_NAME}
          width={compact ? 120 : 160}
          height={compact ? 46 : 62}
          className="mkt-blog-cover-logo-img"
        />
      </div>
    </div>
  );
}
