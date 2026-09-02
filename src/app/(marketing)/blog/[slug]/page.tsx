import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { company } from "@/data/marketing/company";
import { BlogCover } from "@/components/marketing/BlogCover";
import { JsonLd } from "@/components/marketing/JsonLd";
import { MarketingButton } from "@/components/marketing/Button";
import { absoluteUrl, articleJsonLd, createPageMetadata } from "@/lib/seo";
import { getPostBySlug, getPublishedSlugs } from "@/services/blogService";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
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
  const post = await getPostBySlug(slug);
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
            {" · "}
            {post.readTime} read
          </p>
        </div>
      </section>

      <section className="mkt-section">
        <div className="mkt-container mkt-blog-article">
          <div className="mkt-blog-article-cover">
            <BlogCover src={post.cover} alt={post.title} />
          </div>
          <div className="mkt-prose mkt-prose-rich mkt-inner-panel">
            {post.content.map((para) => (
              <p key={para.slice(0, 40)}>{para}</p>
            ))}
          </div>

          <div className="mkt-cta-band mkt-cta-band-rich">
            <div>
              <h3>Need transport on this lane?</h3>
              <p>Book a pickup or track your shipment with {company.name}.</p>
            </div>
            <div className="mkt-cta-band-actions">
              <MarketingButton href="/quote">Pickup Request</MarketingButton>
              <MarketingButton href="/tracking" variant="outline">
                Track Shipment
              </MarketingButton>
            </div>
          </div>

          <p className="mkt-blog-back">
            <Link href="/blog">← Back to all articles</Link>
          </p>
        </div>
      </section>
    </>
  );
}
