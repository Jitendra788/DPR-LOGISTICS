import Image from "next/image";
import { BRAND_LOGO, BRAND_LOGO_ALT, BRAND_LOGO_HEADER, type BrandLogoVariant } from "@/lib/brand";

type Props = {
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  variant?: BrandLogoVariant;
};

/** Intrinsic dimensions of dpr-logo-header.png — CSS controls display size */
const HEADER_INTRINSIC = { width: 287, height: 222 };

export function BrandLogo({
  width = 180,
  height = 72,
  className = "",
  priority = false,
  variant = "default",
}: Props) {
  const isHeader = variant === "header";
  const src = isHeader ? BRAND_LOGO_HEADER : BRAND_LOGO;
  const w = isHeader ? HEADER_INTRINSIC.width : width;
  const h = isHeader ? HEADER_INTRINSIC.height : height;

  return (
    <Image
      src={src}
      alt={BRAND_LOGO_ALT}
      width={w}
      height={h}
      priority={priority}
      quality={95}
      className={`brand-logo ${isHeader ? "brand-logo-header" : ""} ${className}`.trim()}
    />
  );
}
