import { NextRequest, NextResponse } from "next/server";
import { readData, writeData } from "@/lib/dataStore";
import { encryptToString } from "@/lib/crypto";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;
  const config = readData.smtpConfig();
  // 密码字段不返回明文
  return NextResponse.json({
    ...config,
    encryptedPassword: config.encryptedPassword ? "••••••••" : null,
    hasPassword: !!config.encryptedPassword,
  });
}

export async function PUT(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;
  try {
    const body = await request.json();
    const current = readData.smtpConfig();

    // 如果传了 newPassword，加密存储；否则保留原密码
    let encryptedPassword = current.encryptedPassword;
    if (body.newPassword && body.newPassword.length > 0) {
      encryptedPassword = encryptToString(body.newPassword);
    }
    // 如果显式传 password: "" 则清除密码
    if (body.clearPassword === true) {
      encryptedPassword = null;
    }

    const config = {
      enabled: body.enabled ?? current.enabled,
      host: body.host ?? current.host,
      port: body.port ?? current.port,
      secure: body.secure ?? current.secure,
      username: body.username ?? current.username,
      encryptedPassword,
      fromName: body.fromName ?? current.fromName,
      fromEmail: body.fromEmail ?? current.fromEmail,
      recipients: body.recipients ?? current.recipients,
      subjectTemplate: body.subjectTemplate ?? current.subjectTemplate,
    };

    writeData.smtpConfig(config);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "保存失败" }, { status: 500 });
  }
}
