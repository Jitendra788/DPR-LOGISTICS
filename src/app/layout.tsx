import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import { BRAND_FAVICON, BRAND_LOGO, BRAND_LOGO_ALT } from "@/lib/brand";
import { SITE_URL } from "@/lib/seo";
import "./globals.css";
import "./erp.css";
import "./theme-dark.css";
import "./responsive.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "DPR Logistics | Admin",
    template: "%s | DPR Logistics",
  },
  description:
    "DPR Logistics — transport company in Kolhapur. Part load, FTL, trailer, warehousing and online GC/LR tracking across India. Call +91 93562 59949.",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon.ico", sizes: "any" },
      { url: BRAND_LOGO, type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: BRAND_LOGO, type: "image/png" }],
    shortcut: BRAND_FAVICON,
  },
  applicationName: BRAND_LOGO_ALT,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${inter.variable}`} suppressHydrationWarning>
      <body className={`${inter.className} min-h-full font-sans`} suppressHydrationWarning>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
