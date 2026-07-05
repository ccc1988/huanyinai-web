import { NextRequest, NextResponse } from "next/server";
import { readData, writeData } from "@/lib/dataStore";
import { sendNotificationEmail } from "@/lib/email";
import type { Submission } from "@/lib/data";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Server-side validation
    const { name, company, phone, email, message } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "请输入有效的姓名" },
        { status: 400 }
      );
    }

    if (!company || typeof company !== "string" || company.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "请输入有效的公司名称" },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== "string" || phone.trim().length < 6) {
      return NextResponse.json(
        { success: false, error: "请输入有效的联系方式" },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || message.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: "请输入需求描述（至少 10 个字）" },
        { status: 400 }
      );
    }

    const now = new Date();
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // 持久化到 submissions.json
    const submission: Submission = {
      id: `sub-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}-${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      company: company.trim(),
      phone: phone.trim(),
      email: (email || "").trim(),
      message: message.trim(),
      ip,
      userAgent,
      createdAt: now.toISOString(),
      status: "unread",
      category: "",
      tags: [],
      notes: "",
      emailSent: false,
      emailSentAt: null,
    };

    try {
      const submissions = readData.submissions();
      submissions.unshift(submission);
      writeData.submissions(submissions);
    } catch (err) {
      console.error("[Contact] Failed to persist submission:", err);
    }

    // 异步发送邮件通知（不阻塞用户提交）
    try {
      const smtpConfig = readData.smtpConfig();
      if (smtpConfig.enabled && smtpConfig.recipients.length > 0) {
        const result = await sendNotificationEmail(smtpConfig, submission);
        if (result.success) {
          const submissions = readData.submissions();
          const idx = submissions.findIndex((s) => s.id === submission.id);
          if (idx >= 0) {
            submissions[idx].emailSent = true;
            submissions[idx].emailSentAt = new Date().toISOString();
            writeData.submissions(submissions);
          }
        } else {
          console.error("[Contact] Email send failed:", result.error);
        }
      }
    } catch (err) {
      console.error("[Contact] Email notification error:", err);
    }

    // Check for webhook URL env var for external integration
    const webhookUrl = process.env.CONTACT_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            company,
            phone,
            email,
            message,
          }),
        });
      } catch (webhookError) {
        console.error("[Webhook Error]", webhookError);
        // Don't fail the request if webhook fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "提交成功，我们会在 24 小时内与您联系。",
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "服务器错误，请稍后重试。" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "/api/contact",
    method: "POST",
  });
}
