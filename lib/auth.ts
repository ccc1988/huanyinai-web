import { createHmac, timingSafeEqual } from "crypto";

const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "huanyin-admin-dev-secret";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
export const SESSION_COOKIE = "huanyin_admin_session";

/**
 * 验证管理员密码
 */
export function verifyPassword(password: string): boolean {
  const a = Buffer.from(password);
  const b = Buffer.from(ADMIN_PASSWORD);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * 创建签名 session token
 * 格式: data.expiresAt.signature
 */
export function createSession(): string {
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 天有效
  const data = Buffer.from(JSON.stringify({ exp: expiresAt })).toString("base64url");
  const signature = createHmac("sha256", SESSION_SECRET)
    .update(data)
    .digest("base64url");
  return `${data}.${signature}`;
}

/**
 * 验证 session token 是否有效
 */
export function verifySession(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [data, signature] = parts;

  // 验证签名
  const expectedSignature = createHmac("sha256", SESSION_SECRET)
    .update(data)
    .digest("base64url");

  if (signature !== expectedSignature) return false;

  // 验证过期时间
  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf-8"));
    if (Date.now() > payload.exp) return false;
    return true;
  } catch {
    return false;
  }
}
