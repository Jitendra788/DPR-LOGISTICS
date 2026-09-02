import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Tag } from "lucide-react";
import { BlogCover } from "@/components/marketing/BlogCover";
import { createPageMetadata } from "@/lib/seo";
import { getPublishedPosts } from "@/services/blogService";

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

export const revalidate = 60;

export default async function BlogPage() {
  const sorted = await getPublishedPosts();

  return (
    <>
      <section className="mkt-page-hero mkt-page-hero-premium">
        <div className="mkt-container">
          <span className="mkt-eyebrow">Blog</span>
          <h1>Logistics Insights &amp; Guides</h1>
          <p>
            Practical tips on cargo transport, GC / LR tracking, warehousing and route planning from the DPR team.
          </p>
        </div>
      </section>

      <section className="mkt-section" id="blog-articles">
        <div className="mkt-container">
          <div className="mkt-grid-3 mkt-blog-grid">
            {sorted.map((post) => (
              <article key={post.slug} className="mkt-blog-card mkt-blog-card-media">
                <Link href={`/blog/${post.slug}`} className="mkt-blog-cover-link">
                  <BlogCover src={post.cover} alt={post.title} />
                </Link>
                <div className="mkt-blog-card-body">
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
                  <div className="mkt-blog-card-foot">
                    <time dateTime={post.publishedAt}>
                      {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </time>
                    <Link href={`/blog/${post.slug}`} className="mkt-btn mkt-btn-primary mkt-btn-sm">
                      Read article <ArrowRight aria-hidden size={14} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
