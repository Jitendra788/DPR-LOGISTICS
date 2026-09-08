import {
  dprLogoHeaderDataUrl,
  dprStampDataUrl,
  roadwaysLogoDataUrl,
  roadwaysSignatureDataUrl,
  roadwaysStampDataUrl,
} from "@/lib/print-assets";

export const BRAND_NAME = "DPR Logistics";
/** Full colour logo (truck + DPR LOGISTICS banner) */
export const BRAND_LOGO = "/dpr-logo-google.png";
/** Site / UI header logo path */
export const BRAND_LOGO_HEADER = "/dpr-logo-header.png";
export const BRAND_STAMP = "/dpr-stamp.png";
export const ROADWAYS_LOGO = "/roadways-logo.png";
/** Circular/legacy stamp fallback */
export const ROADWAYS_STAMP = "/roadways-stamp.png";
/** Blue handwritten signature (scnacher) for Roadways booking slip */
export const ROADWAYS_SIGNATURE = "/roadways-signature.png";

/** Inlined assets for print — never wait on network / never blank */
export const BRAND_LOGO_HEADER_PRINT = dprLogoHeaderDataUrl;
export const BRAND_STAMP_PRINT = dprStampDataUrl;
export const ROADWAYS_LOGO_PRINT = roadwaysLogoDataUrl;
export const ROADWAYS_STAMP_PRINT = roadwaysStampDataUrl;
export const ROADWAYS_SIGNATURE_PRINT = roadwaysSignatureDataUrl;

export const BRAND_FAVICON = "/favicon.png";
export const BRAND_LOGO_ALT = "DPR Logistics — SP Group";

export type BrandLogoVariant = "default" | "header";
