import { blogPosts as staticPosts } from "@/data/marketing/blog";
import { parseBlogContent, type PublicBlogPost } from "@/lib/blog-content";
import { ensureWebsiteContentSeeded } from "@/lib/seed-website-content";
import { prisma } from "@/lib/prisma";

export type { PublicBlogPost };

type BlogRow = {
  slug: string;
  title: string;
  excerpt: string;
  seoDescription: string;
  category: string;
  coverPath: string;
  publishedAt: string;
  readTime: string;
  author: string;
  contentJson: string;
};

function mapRow(row: BlogRow): PublicBlogPost {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    seoDescription: row.seoDescription,
    category: row.category,
    cover: row.coverPath,
    publishedAt: row.publishedAt,
    readTime: row.readTime,
    author: row.author,
    content: parseBlogContent(row.contentJson),
  };
}

function staticFallback(): PublicBlogPost[] {
  return staticPosts.map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    seoDescription: post.seoDescription,
    category: post.category,
    cover: post.cover,
    publishedAt: post.publishedAt,
    readTime: post.readTime,
    author: post.author,
    content: [...post.content],
  }));
}

export async function getPublishedPosts(): Promise<PublicBlogPost[]> {
  try {
    await ensureWebsiteContentSeeded();
    const rows = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
    });
    if (!rows.length) return staticFallback();
    return rows.map(mapRow);
  } catch {
    return staticFallback();
  }
}

export async function getLatestPosts(limit = 3): Promise<PublicBlogPost[]> {
  const posts = await getPublishedPosts();
  return posts.slice(0, limit);
}

export async function getPostBySlug(slug: string): Promise<PublicBlogPost | null> {
  try {
    await ensureWebsiteContentSeeded();
    const row = await prisma.blogPost.findFirst({
      where: { slug, published: true },
    });
    if (row) return mapRow(row);
  } catch {
    /* fallback below */
  }
  const fallback = staticPosts.find((p) => p.slug === slug);
  if (!fallback) return null;
  return {
    slug: fallback.slug,
    title: fallback.title,
    excerpt: fallback.excerpt,
    seoDescription: fallback.seoDescription,
    category: fallback.category,
    cover: fallback.cover,
    publishedAt: fallback.publishedAt,
    readTime: fallback.readTime,
    author: fallback.author,
    content: [...fallback.content],
  };
}

export async function getPublishedSlugs(): Promise<string[]> {
  const posts = await getPublishedPosts();
  return posts.map((p) => p.slug);
}
