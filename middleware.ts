import { NextRequest, NextResponse } from "next/server";

// 避免从 auth.ts 导入（该文件使用 Node.js crypto，不兼容 Edge Runtime）
const SESSION_COOKIE = "huanyin_admin_session";

/**
 * Middleware (Edge Runtime)
 * 仅做轻量级 session 检查（解码 token + 验证过期时间）
 * 完整 HMAC 签名验证由 API 路由在 Node.js 运行时执行
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 登录页和 API 登录端点不拦截
  if (pathname === "/admin/login" || pathname === "/api/auth/login") {
    return NextResponse.next();
  }

  // 拦截所有 /admin 开头的路由
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!isValidTokenShape(token)) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 拦截所有 /api/admin 开头的路由
  if (pathname.startsWith("/api/admin")) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!isValidTokenShape(token)) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

/**
 * 轻量级 token 检查（Edge Runtime 兼容）
 * 仅验证 token 格式和过期时间，HMAC 签名由 API 路由验证
 */
function isValidTokenShape(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  try {
    const payload = JSON.parse(
      Buffer.from(parts[0], "base64url").toString("utf-8")
    );
    if (Date.now() > payload.exp) return false;
    return true;
  } catch {
    return false;
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
