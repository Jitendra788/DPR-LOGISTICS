import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Tag } from "lucide-react";
import { blogPosts } from "@/data/marketing/blog";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Logistics Blog & Guides",
  description:
    "DPR Logistics blog — guides on GC/LR tracking, part load vs FTL, warehousing tips, Maharashtra–Gujarat transport and choosing a logistics partner in Kolhapur.",
  path: "/blog",
  keywords: [
    "logistics blog India",
    "cargo transport guide",
    "part load FTL guide",
    "GC LR tracking help",
    "Kolhapur logistics tips",
  ],
});

export default function BlogPage() {
  const sorted = [...blogPosts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  return (
    <>
      <section className="mkt-page-hero mkt-page-hero-premium">
        <div className="mkt-container">
          <span className="mkt-eyebrow">Blog</span>
          <h1>Logistics Insights &amp; Guides</h1>
          <p>
            Practical tips on cargo transport, tracking, warehousing and route planning from the DPR Logistics team.
          </p>
        </div>
      </section>

      <section className="mkt-section">
        <div className="mkt-container">
          <div className="mkt-grid-3">
            {sorted.map((post) => (
              <article key={post.slug} className="mkt-blog-card">
                <div className="mkt-blog-card-meta">
                  <span className="mkt-blog-tag">
                    <Tag aria-hidden size={14} /> {post.category}
                  </span>
                  <span className="mkt-blog-read">
                    <Clock aria-hidden size={14} /> {post.readTime}
                  </span>
                </div>
                <h2>
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                <p>{post.excerpt}</p>
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </time>
                <Link href={`/blog/${post.slug}`} className="mkt-service-link">
                  Read article <ArrowRight aria-hidden size={16} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
