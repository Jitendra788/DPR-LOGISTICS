import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { getLatestPosts } from "@/data/marketing/blog";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { ScrollReveal } from "@/components/marketing/ScrollReveal";
import { MarketingButton } from "@/components/marketing/Button";

export function BlogPreviewSection() {
  const posts = getLatestPosts(3);

  return (
    <section className="mkt-section">
      <div className="mkt-container">
        <ScrollReveal>
          <SectionHeading
            eyebrow="Blog"
            title="Logistics Guides & Tips"
            subtitle="Practical advice on tracking, booking and choosing the right transport option for your cargo."
          />
        </ScrollReveal>
        <div className="mkt-grid-3">
          {posts.map((post, idx) => (
            <ScrollReveal key={post.slug} delay={idx * 40}>
              <article className="mkt-blog-card mkt-blog-card-compact">
                <span className="mkt-blog-tag">{post.category}</span>
                <h3>
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>
                <p>{post.excerpt}</p>
                <span className="mkt-blog-read">
                  <Clock aria-hidden size={14} /> {post.readTime}
                </span>
                <Link href={`/blog/${post.slug}`} className="mkt-service-link">
                  Read more <ArrowRight aria-hidden size={14} />
                </Link>
              </article>
            </ScrollReveal>
          ))}
        </div>
        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <MarketingButton href="/blog" variant="outline">
            View All Articles <ArrowRight aria-hidden className="mkt-btn-icon" />
          </MarketingButton>
        </div>
      </div>
    </section>
  );
}
