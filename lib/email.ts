import nodemailer from "nodemailer";
import { decryptFromString } from "./crypto";
import type { SmtpConfig, Submission } from "./data";

/** HTML 转义，防止邮件模板注入 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendNotificationEmail(
  config: SmtpConfig,
  submission: Submission
): Promise<{ success: boolean; error?: string }> {
  if (!config.enabled || !config.host || !config.username) {
    return { success: false, error: "SMTP not configured" };
  }

  let password = "";
  if (config.encryptedPassword) {
    password = decryptFromString(config.encryptedPassword);
  }
  if (!password) {
    return { success: false, error: "SMTP password missing" };
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.username,
      pass: password,
    },
  });

  const subject = config.subjectTemplate
    .replace("{company}", submission.company)
    .replace("{name}", submission.name)
    .replace("{phone}", submission.phone);

  const safeName = escapeHtml(submission.name);
  const safeCompany = escapeHtml(submission.company);
  const safePhone = escapeHtml(submission.phone);
  const safeEmail = escapeHtml(submission.email || "未提供");
  const safeMessage = escapeHtml(submission.message);

  const html = `
    <h2>新预约咨询</h2>
    <table style="border-collapse:collapse;width:100%;font-size:14px;">
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">姓名</td><td style="padding:8px;border:1px solid #ddd;">${safeName}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">公司</td><td style="padding:8px;border:1px solid #ddd;">${safeCompany}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">电话</td><td style="padding:8px;border:1px solid #ddd;">${safePhone}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">邮箱</td><td style="padding:8px;border:1px solid #ddd;">${safeEmail}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">提交时间</td><td style="padding:8px;border:1px solid #ddd;">${new Date(submission.createdAt).toLocaleString("zh-CN")}</td></tr>
    </table>
    <h3 style="margin-top:16px;">需求描述</h3>
    <div style="padding:12px;background:#f5f5f5;border-radius:6px;white-space:pre-wrap;">${safeMessage}</div>
    <p style="margin-top:16px;color:#999;font-size:12px;">此邮件由寰引智能官网自动发送，请勿直接回复。</p>
  `;

  try {
    await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: config.recipients.join(", "),
      subject,
      html,
    });
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

export async function sendTestEmail(
  config: SmtpConfig,
  testRecipient: string
): Promise<{ success: boolean; error?: string }> {
  let password = "";
  if (config.encryptedPassword) {
    password = decryptFromString(config.encryptedPassword);
  }
  if (!password) {
    return { success: false, error: "SMTP password missing" };
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.username,
      pass: password,
    },
  });

  try {
    await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: testRecipient,
      subject: "【测试】寰引智能官网邮件通知测试",
      html: "<p>这是一封测试邮件，如果您收到说明 SMTP 配置正确。</p>",
    });
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}
