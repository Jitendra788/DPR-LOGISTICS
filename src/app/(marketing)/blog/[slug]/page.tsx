import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts, getBlogPost } from "@/data/marketing/blog";
import { company } from "@/data/marketing/company";
import { JsonLd } from "@/components/marketing/JsonLd";
import { MarketingButton } from "@/components/marketing/Button";
import { absoluteUrl, articleJsonLd, createPageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Article" };
  return createPageMetadata({
    title: post.title,
    description: post.seoDescription,
    path: `/blog/${slug}`,
    keywords: [post.category, "DPR Logistics blog", "logistics guide India"],
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const url = absoluteUrl(`/blog/${slug}`);

  return (
    <>
      <JsonLd
        data={articleJsonLd({
          title: post.title,
          description: post.seoDescription,
          url,
          publishedAt: post.publishedAt,
          author: post.author,
        })}
      />
      <section className="mkt-page-hero mkt-page-hero-premium">
        <div className="mkt-container">
          <span className="mkt-eyebrow">{post.category}</span>
          <h1>{post.title}</h1>
          <p className="mkt-blog-hero-meta">
            By {post.author} ·{" "}
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
            {" · "}{post.readTime} read
          </p>
        </div>
      </section>

      <section className="mkt-section">
        <div className="mkt-container mkt-prose mkt-blog-article">
          {post.content.map((para) => (
            <p key={para.slice(0, 40)}>{para}</p>
          ))}

          <div className="mkt-cta-band" style={{ marginTop: "2.5rem" }}>
            <div>
              <h3>Need transport on this lane?</h3>
              <p>Book a pickup or track your shipment with {company.name}.</p>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <MarketingButton href="/quote" variant="secondary">Pickup Request</MarketingButton>
              <MarketingButton href="/tracking" variant="outline">Track Shipment</MarketingButton>
            </div>
          </div>

          <p style={{ marginTop: "2rem" }}>
            <Link href="/blog" className="mkt-service-link">← Back to Blog</Link>
          </p>
        </div>
      </section>
    </>
  );
}
