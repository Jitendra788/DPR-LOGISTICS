import { blogPosts } from "@/data/marketing/blog";
import { prisma } from "@/lib/prisma";

let seedPromise: Promise<void> | null = null;

export function ensureWebsiteContentSeeded() {
  if (!seedPromise) {
    seedPromise = seedWebsiteContent().catch((err) => {
      seedPromise = null;
      throw err;
    });
  }
  return seedPromise;
}

async function seedWebsiteContent() {
  const blogCount = await prisma.blogPost.count();
  if (blogCount === 0) {
    for (const post of blogPosts) {
      await prisma.blogPost.create({
        data: {
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          seoDescription: post.seoDescription,
          category: post.category,
          coverPath: post.cover,
          publishedAt: post.publishedAt,
          readTime: post.readTime,
          author: post.author,
          contentJson: JSON.stringify([...post.content]),
          published: true,
        },
      });
    }
  }
}
