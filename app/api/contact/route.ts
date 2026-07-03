import { NextRequest, NextResponse } from "next/server";

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

    // Log the submission (replace with actual email/CRM integration)
    console.log("[Contact Form Submission]", {
      name,
      company,
      phone,
      email: email || "(未提供)",
      message,
      timestamp: new Date().toISOString(),
      ip: request.headers.get("x-forwarded-for") || "unknown",
    });

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
