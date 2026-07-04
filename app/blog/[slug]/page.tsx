import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ChevronRight, Calendar, Tag } from "lucide-react";
import { blogPosts, getBlogPostBySlug, company } from "@/lib/data";
import { createMetadata } from "@/lib/seo";
import { getBlogPostJsonLd } from "@/lib/geo";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return params.then(({ slug }) => {
    const post = getBlogPostBySlug(slug);
    if (!post) return {};
    return createMetadata({
      title: post.title,
      description: post.excerpt,
      path: `/blog/${slug}`,
      keywords: post.tags,
    });
  });
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const jsonLd = getBlogPostJsonLd(post!);
  const relatedPosts = blogPosts.filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <div className="pt-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <article>
        <header className="py-20 relative overflow-hidden" style={{ backgroundColor: "var(--color-bg-base)" }}>
          <div className="absolute inset-0 -z-0 grid-bg" />
          <div className="absolute inset-0 -z-0 starfield" />
          <div
            className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-50"
            style={{ background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)", transform: "translate(30%, -30%)" }}
          />
          <div className="container-max max-w-3xl">
            {/* Breadcrumb */}
            <nav className="inline-flex items-center gap-2 text-sm mb-8 px-4 py-2 rounded-full" style={{ color: "var(--color-text-muted)", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <Link href="/" className="hover:text-[var(--color-text-body)] transition-colors">首页</Link>
              <ChevronRight size={14} />
              <Link href="/blog" className="hover:text-[var(--color-text-body)] transition-colors">博客</Link>
              <ChevronRight size={14} />
              <span style={{ color: "var(--color-text-body)" }} className="truncate">{post!.category}</span>
            </nav>

            <span className="pill-tag mb-4">{post!.category}</span>
            <h1
              className="font-bold mb-6"
              style={{
                color: "var(--color-text-primary)",
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                lineHeight: 1.3,
              }}
            >
              {post!.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: "var(--color-text-muted)" }}>
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {post!.date}
              </span>
              <span>作者：{post!.author}</span>
            </div>

            {/* Excerpt */}
            <p
              className="mt-6 text-lg leading-relaxed"
              style={{ color: "var(--color-text-body)" }}
            >
              {post!.excerpt}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-6">
              {post!.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-3 py-1 rounded-full text-xs"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  <Tag size={10} />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </header>

        {/* Body */}
        <section className="py-20 relative overflow-hidden" style={{ backgroundColor: "var(--color-bg-elevated)" }}>
          <div className="absolute inset-0 -z-0 section-decor" />
          <div className="container-max max-w-3xl">
            <div className="prose-content">
              {post!.sections.map((section, i) => (
                <div key={i} className="mb-8">
                  <h2
                    className="text-2xl font-bold mb-4"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {section.heading}
                  </h2>
                  <p
                    className="text-base leading-relaxed"
                    style={{ color: "var(--color-text-body)" }}
                  >
                    {section.body}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div
              className="glass-card hud-corners rounded-[var(--radius-lg)] p-8 mt-12 text-center"
            >
              <h3
                className="text-xl font-bold mb-3"
                style={{ color: "var(--color-text-primary)" }}
              >
                想了解更多 AI 落地方案？
              </h3>
              <p className="mb-6" style={{ color: "var(--color-text-body)" }}>
                告诉我们你的业务场景，我们给出可落地的 AI 方案
              </p>
              <Link href="/contact" className="cta-primary">
                预约免费咨询
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      </article>

      {/* Related posts */}
      <section className="py-20 relative overflow-hidden" style={{ backgroundColor: "var(--color-bg-base)" }}>
        <div className="absolute inset-0 -z-0 grid-bg" />
        <div className="container-max max-w-4xl">
          <h2
            className="text-2xl font-bold mb-8"
            style={{ color: "var(--color-text-primary)" }}
          >
            继续阅读
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {relatedPosts.map((rp) => (
              <Link
                key={rp.slug}
                href={`/blog/${rp.slug}`}
                className="glass-card hud-corners rounded-[var(--radius-md)] p-6 group cursor-pointer"
              >
                <span
                  className="text-xs font-medium mb-2 block"
                  style={{ color: "var(--color-accent-light)" }}
                >
                  {rp.category}
                </span>
                <h3
                  className="font-bold mb-2 leading-snug"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {rp.title}
                </h3>
                <div
                  className="inline-flex items-center gap-1 text-sm font-medium mt-2"
                  style={{ color: "var(--color-accent-light)" }}
                >
                  阅读全文
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
