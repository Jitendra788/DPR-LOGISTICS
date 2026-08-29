import type { Metadata } from "next";
import { company } from "@/data/marketing/company";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://www.dprlogistics.in";

export const SITE_NAME = company.name;

export const DEFAULT_OG_IMAGE = "/dpr-logo-header.png";

export const SEO_KEYWORDS = [
  "DPR Logistics",
  "dprlogistics.in",
  "logistics company India",
  "cargo transport India",
  "transport company Kolhapur",
  "part load transport",
  "part load cargo Maharashtra",
  "full truck load FTL",
  "FTL transport India",
  "trailer transport India",
  "container transport India",
  "warehousing logistics",
  "GC tracking",
  "LR tracking",
  "shipment tracking India",
  "pan India logistics",
  "Kolhapur to Pune transport",
  "Maharashtra Gujarat transport",
  "B2B logistics India",
  "freight transport company",
] as const;

type PageMetaOptions = {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  noIndex?: boolean;
  ogImage?: string;
};

export function absoluteUrl(path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

export function createPageMetadata({
  title,
  description,
  path = "/",
  keywords,
  noIndex,
  ogImage,
}: PageMetaOptions): Metadata {
  const url = absoluteUrl(path);
  const image = ogImage ?? DEFAULT_OG_IMAGE;
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  return {
    title,
    description,
    keywords: keywords ?? [...SEO_KEYWORDS],
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_IN",
      images: [{ url: image, alt: `${SITE_NAME} — SP Group` }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

export const marketingRoutes = [
  { path: "/", priority: 1, changeFrequency: "weekly" as const },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/about/mission", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/about/management", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/about/milestone", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/about/history", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/about/clients", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/services", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/tracking", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/network", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/business-solutions", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/quote", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/contact", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/contact/care", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/contact/faq", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/contact/complaint", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/careers", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/careers/openings", priority: 0.7, changeFrequency: "weekly" as const },
  { path: "/careers/associate", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/careers/vendor", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/media", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/media/awards", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/customer-booking", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/blog", priority: 0.75, changeFrequency: "weekly" as const },
  { path: "/routes", priority: 0.85, changeFrequency: "weekly" as const },
];

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    legalName: company.name,
    alternateName: ["DPR", "DPR Logistics Kolhapur", "dprlogistics.in", "DPR Logistics SP Group"],
    url: SITE_URL,
    logo: absoluteUrl(DEFAULT_OG_IMAGE),
    description: company.description,
    email: company.email,
    telephone: company.phone,
    foundingDate: String(company.foundedYear),
    address: {
      "@type": "PostalAddress",
      streetAddress: company.address,
      addressLocality: "Kagal",
      addressRegion: "Maharashtra",
      postalCode: "416216",
      addressCountry: "IN",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: company.phone,
        contactType: "customer service",
        areaServed: "IN",
        availableLanguage: ["English", "Hindi", "Marathi"],
      },
    ],
    sameAs: [company.social.linkedin, company.social.facebook],
  };
}

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LogisticsService",
    name: company.name,
    image: absoluteUrl(DEFAULT_OG_IMAGE),
    url: SITE_URL,
    telephone: company.phone,
    email: company.email,
    description: company.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: company.address,
      addressLocality: "Kolhapur",
      addressRegion: "Maharashtra",
      postalCode: "416216",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 16.5788,
      longitude: 74.3248,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:00",
      closes: "19:00",
    },
    areaServed: {
      "@type": "Country",
      name: "India",
    },
    priceRange: "$$",
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: company.name,
    url: SITE_URL,
    description: company.description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/tracking?gc={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function faqJsonLd(faqs: readonly { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };
}

export function serviceJsonLd(service: { title: string; description: string; url: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.description,
    url: service.url,
    provider: {
      "@type": "Organization",
      name: company.name,
      url: SITE_URL,
    },
    areaServed: {
      "@type": "Country",
      name: "India",
    },
  };
}

export function articleJsonLd(article: {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  author: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    url: article.url,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: {
      "@type": "Organization",
      name: article.author,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: company.name,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl(DEFAULT_OG_IMAGE),
      },
    },
    mainEntityOfPage: article.url,
  };
}

export function routeJsonLd(
  route: { title: string; description: string; from: string; to: string },
  url: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: route.title,
    description: route.description,
    url,
    serviceType: "Cargo Transport",
    provider: {
      "@type": "Organization",
      name: company.name,
      url: SITE_URL,
    },
    areaServed: [
      { "@type": "City", name: route.from },
      { "@type": "City", name: route.to },
    ],
  };
}
