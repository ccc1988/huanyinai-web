import Link from "next/link";
import { ArrowRight, ChevronRight, Calendar } from "lucide-react";
import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";
import { blogPosts } from "@/lib/data";

export const metadata: Metadata = createMetadata({
  title: "行业洞察与 AI 落地实践",
  description: "寰引智能分享 AI 落地实践经验，涵盖跨境物流 AI、报关文件智能处理、物流轨迹追踪、企微 AI 客服等真实案例。",
  path: "/blog",
});

export default function BlogPage() {
  const sortedPosts = [...blogPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="py-20 relative overflow-hidden" style={{ backgroundColor: "var(--color-bg-base)" }}>
        <div className="absolute inset-0 -z-0 grid-bg" />
        <div className="absolute inset-0 -z-0 starfield" />
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-50"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)", transform: "translate(30%, -30%)" }}
        />
        <div className="container-max">
          <span className="pill-tag mb-4">行业洞察</span>
          <h1
            className="font-bold mb-4"
            style={{
              color: "var(--color-text-primary)",
              fontSize: "clamp(2rem, 4vw, 3rem)",
            }}
          >
            AI 落地实践
          </h1>
          <p
            className="max-w-2xl text-lg"
            style={{ color: "var(--color-text-body)" }}
          >
            真实案例背后的思考与方法论
          </p>
        </div>
      </section>

      {/* Blog list */}
      <section className="py-20 relative overflow-hidden" style={{ backgroundColor: "var(--color-bg-elevated)" }}>
        <div className="absolute inset-0 -z-0 section-decor" />
        <div className="container-max">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="glass-card hud-corners rounded-[var(--radius-lg)] p-8 flex flex-col group cursor-pointer"
              >
                {/* Category */}
                <span
                  className="text-xs font-medium mb-3"
                  style={{ color: "var(--color-accent-light)" }}
                >
                  {post.category}
                </span>

                {/* Title */}
                <h3
                  className="text-lg font-bold mb-3 leading-snug"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p
                  className="text-sm leading-relaxed flex-1 mb-4 line-clamp-3"
                  style={{ color: "var(--color-text-body)" }}
                >
                  {post.excerpt}
                </p>

                {/* Tags + Date */}
                <div className="flex items-center justify-between text-xs mt-auto">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: "rgba(255,255,255,0.05)",
                          color: "var(--color-text-muted)",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span
                    className="flex items-center gap-1"
                    style={{ color: "var(--color-text-logo)" }}
                  >
                    <Calendar size={12} />
                    {post.date}
                  </span>
                </div>

                {/* Read more */}
                <div
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium"
                  style={{ color: "var(--color-accent-light)" }}
                >
                  阅读全文
                  <ArrowRight
                    size={14}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
