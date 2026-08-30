import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { BRAND_LOGO, BRAND_LOGO_ALT } from "@/lib/brand";
import "./globals.css";
import "./erp.css";
import "./theme-dark.css";
import "./responsive.css";

export const metadata: Metadata = {
  title: "DPR Logistics | Transport Company Kolhapur — Part Load & FTL",
  description:
    "DPR Logistics — transport company in Kolhapur. Part load, FTL, trailer, warehousing and online GC/LR tracking across India. Call +91 93562 59949.",
  icons: {
    icon: [
      { url: BRAND_LOGO, type: "image/jpeg" },
      { url: "/dpr-logo-header.png", type: "image/png", sizes: "512x512" },
    ],
    apple: BRAND_LOGO,
    shortcut: BRAND_LOGO,
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
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full font-sans" suppressHydrationWarning>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
