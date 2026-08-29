import type { MetadataRoute } from "next";
import { blogPosts } from "@/data/marketing/blog";
import { transportRoutes } from "@/data/marketing/routes";
import { extraServices, services } from "@/data/marketing/services";
import { absoluteUrl, marketingRoutes } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticPages = marketingRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const servicePages = [...services, ...extraServices].map((service) => ({
    url: absoluteUrl(service.href),
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  const blogPages = blogPosts.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const routePages = transportRoutes.map((route) => ({
    url: absoluteUrl(`/routes/${route.slug}`),
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.88,
  }));

  return [...staticPages, ...servicePages, ...blogPages, ...routePages];
}
