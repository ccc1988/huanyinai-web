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
    const data = await request.json();
    const posts = readData.blogPosts() as BlogPost[];
    const now = new Date().toISOString();

    const index = posts.findIndex((p) => p.slug === data.slug);
    const nextPost = { ...data, updatedAt: now } as BlogPost;
    if (index === -1) {
      posts.push(nextPost);
    } else {
      posts[index] = { ...posts[index], ...data, updatedAt: now };
    }

    writeData.blogPosts(posts);
    revalidatePath("/sitemap.xml");
    revalidatePath("/blog");
    revalidatePath("/blog/[slug]", "page");
    return NextResponse.json({ success: true, data: posts[index] || nextPost });
  } catch {
    return NextResponse.json({ error: "保存失败" }, { status: 500 });
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
