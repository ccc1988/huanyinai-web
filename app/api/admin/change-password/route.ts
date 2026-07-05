import { NextRequest, NextResponse } from "next/server";
import { writeData } from "@/lib/dataStore";
import { hashPassword } from "@/lib/crypto";
import { verifyPassword, requireAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;
  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "请填写当前密码和新密码" }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "新密码至少 6 位" }, { status: 400 });
    }

    // 验证当前密码
    if (!verifyPassword(currentPassword)) {
      return NextResponse.json({ error: "当前密码不正确" }, { status: 403 });
    }

    // 哈希新密码并存储到 admin-config.json
    const { hash, salt } = hashPassword(newPassword);
    writeData.adminConfig({
      passwordHash: hash,
      passwordSalt: salt,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: "密码修改成功，即时生效" });
  } catch {
    return NextResponse.json({ error: "修改失败" }, { status: 500 });
  }
}
