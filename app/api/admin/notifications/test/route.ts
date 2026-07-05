import { NextRequest, NextResponse } from "next/server";
import { readData } from "@/lib/dataStore";
import { sendTestEmail } from "@/lib/email";
import { requireAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;
  try {
    const { testRecipient } = await request.json();
    if (!testRecipient) {
      return NextResponse.json({ error: "请输入测试收件人邮箱" }, { status: 400 });
    }

    const config = readData.smtpConfig();
    const result = await sendTestEmail(config, testRecipient);

    if (result.success) {
      return NextResponse.json({ success: true, message: "测试邮件发送成功" });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch {
    return NextResponse.json({ error: "测试发送失败" }, { status: 500 });
  }
}
