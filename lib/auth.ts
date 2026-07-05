import { createHmac, timingSafeEqual } from "crypto";
import fs from "fs";
import path from "path";
import { verifyHash } from "./crypto";
import { NextRequest, NextResponse } from "next/server";

const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "huanyin-admin-dev-secret";
export const SESSION_COOKIE = "huanyin_admin_session";

/**
 * 安全读取 admin-config.json（DATA_DIR 优先）
 */
function safeReadAdminConfig(): { passwordHash: string | null; passwordSalt: string | null } | null {
  try {
    const dataDir = process.env.DATA_DIR || path.join(process.cwd(), "data");
    const filePath = path.join(dataDir, "admin-config.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    const config = JSON.parse(raw);
    return {
      passwordHash: config.passwordHash || null,
      passwordSalt: config.passwordSalt || null,
    };
  } catch {
    return null;
  }
}

/**
 * 验证管理员密码（三级优先级）
 * 1. admin-config.json 中的 passwordHash（后台修改密码后写入）
 * 2. process.env.ADMIN_PASSWORD（deploy.sh / .env.local）
 * 3. "admin123" 硬编码兑底
 */
export function verifyPassword(password: string): boolean {
  // 1. 检查 admin-config.json
  const config = safeReadAdminConfig();
  if (config?.passwordHash && config?.passwordSalt) {
    return verifyHash(password, config.passwordHash, config.passwordSalt);
  }

  // 2. 检查环境变量
  const envPw = process.env.ADMIN_PASSWORD;
  if (envPw) {
    const a = Buffer.from(password);
    const b = Buffer.from(envPw);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  }

  // 3. 默认兑底
  const a = Buffer.from(password);
  const b = Buffer.from("admin123");
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
 * 验证 session token 是否有效（完整 HMAC 签名验证）
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

/**
 * API 路由认证守卫：验证 HMAC 签名
 * 在每个 admin API 路由开头调用
 */
export function requireAuth(request: NextRequest): NextResponse | null {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!verifySession(token)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  return null;
}
