import { NextRequest, NextResponse } from "next/server";
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

    const index = posts.findIndex((p) => p.slug === data.slug);
    if (index === -1) {
      posts.push(data as BlogPost);
    } else {
      posts[index] = { ...posts[index], ...data };
    }

    writeData.blogPosts(posts);
    return NextResponse.json({ success: true, data: posts[index] || data });
  } catch {
    return NextResponse.json({ error: "保存失败" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { slug } = await request.json();
    const posts = readData.blogPosts() as BlogPost[];
    const filtered = posts.filter((p) => p.slug !== slug);
    writeData.blogPosts(filtered);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
