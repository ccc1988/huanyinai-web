import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ backgroundColor: "var(--color-bg-base)" }}
    >
      <span
        className="font-[family-name:var(--font-heading)] font-bold text-7xl mb-4"
        style={{ color: "var(--color-text-primary)" }}
      >
        404
      </span>
      <p className="text-lg mb-8" style={{ color: "var(--color-text-body)" }}>
        页面不存在
      </p>
      <Link href="/" className="cta-primary">
        <Home size={18} />
        返回首页
      </Link>
    </div>
  );
}
