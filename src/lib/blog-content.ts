export type PublicBlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  seoDescription: string;
  category: string;
  cover: string;
  publishedAt: string;
  readTime: string;
  author: string;
  content: string[];
};

export function parseBlogContent(contentJson: string): string[] {
  try {
    const parsed = JSON.parse(contentJson || "[]") as unknown;
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  } catch {
    /* ignore */
  }
  return [];
}

export function slugifyTitle(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function paragraphsToJson(text: string) {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  return JSON.stringify(paragraphs);
}

export function jsonToParagraphs(contentJson: string) {
  return parseBlogContent(contentJson).join("\n\n");
}
