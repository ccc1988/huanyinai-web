import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { readData, writeData } from "@/lib/dataStore";
import type { BlogPost } from "@/lib/data";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;
  const posts = readData.blogPosts();
  return NextResponse.json(posts);
}

export async function PUT(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;
  try {
    const data: unknown = await request.json();
    const posts = readData.blogPosts() as BlogPost[];
    const isNew = isRecord(data) && !posts.some((item) => item.slug === data.slug);
    const validationError = validateBlogPost(data, isNew);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });
    const post = data as BlogPost;
    const now = new Date().toISOString();

    const index = posts.findIndex((p) => p.slug === post.slug);
    const nextPost = { ...post, ...(isNew && !post.reviewStatus ? { reviewStatus: "draft" as const } : {}), updatedAt: now } as BlogPost;
    if (index === -1) {
      posts.push(nextPost);
    } else {
      posts[index] = { ...posts[index], ...post, updatedAt: now };
    }

    writeData.blogPosts(posts);
    revalidatePath("/sitemap.xml");
    revalidatePath("/api/llms");
    revalidatePath("/blog");
    revalidatePath("/blog/[slug]", "page");
    return NextResponse.json({ success: true, data: posts[index] || nextPost });
  } catch {
    return NextResponse.json({ error: "保存失败" }, { status: 500 });
  }
}

function validateBlogPost(value: unknown, isNew = false): string | null {
  if (!isRecord(value)) return "文章数据必须是对象";
  if (!isSlug(value.slug)) return "slug 只能使用小写字母、数字和连字符";
  for (const field of ["title", "excerpt", "category", "date", "author"]) {
    if (!isNonEmptyString(value[field])) return `${field} 不能为空`;
  }
  if (!isStringArray(value.tags)) return "tags 必须是字符串数组";
  if (!Array.isArray(value.sections) || !value.sections.every((item) => isRecord(item) && isNonEmptyString(item.heading) && isNonEmptyString(item.body))) return "文章段落必须包含小标题和正文";
  if (value.reviewStatus !== undefined && value.reviewStatus !== "draft" && value.reviewStatus !== "reviewed") return "reviewStatus 无效";
  if (value.sources !== undefined && (!Array.isArray(value.sources) || !value.sources.every((item) => isRecord(item) && isNonEmptyString(item.title) && isHttpUrl(item.url) && isNonEmptyString(item.accessedAt)))) return "资料来源必须包含名称、http(s) 地址和访问日期";
  for (const field of ["reviewedAt", "reviewer"]) {
    if (value[field] !== undefined && typeof value[field] !== "string") return `${field} 必须是字符串`;
  }
  const status = value.reviewStatus || (isNew ? "draft" : undefined);
  if (status === "reviewed") {
    if (!isNonEmptyString(value.reviewedAt) || !isNonEmptyString(value.reviewer)) return "已审核文章必须填写审核日期和审核人";
    if (!Array.isArray(value.sources) || value.sources.length === 0) return "已审核文章至少需要一条资料来源";
  }
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isSlug(value: unknown): value is string {
  return typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function isHttpUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function DELETE(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;
  try {
    const { slug } = await request.json();
    const posts = readData.blogPosts() as BlogPost[];
    const filtered = posts.filter((p) => p.slug !== slug);
    writeData.blogPosts(filtered);
    revalidatePath("/sitemap.xml");
    revalidatePath("/blog");
    revalidatePath("/blog/[slug]", "page");
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
