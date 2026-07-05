"use client";

import { useState, useEffect, useRef } from "react";
import type { Contact } from "@/lib/data";

/**
 * 懒加载二维码组件
 * - 通过 next/dynamic ssr:false 加载，不参与 SSR，base64 数据不出现在首屏 HTML
 * - 进入视口后才渲染 <img>，避免客户端首屏加载 1.8MB base64
 */
export default function LazyQRContacts({ contacts }: { contacts: Contact[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="mt-6 flex flex-row gap-4">
      {contacts.map((contact, idx) => (
        <div key={idx} className="flex flex-col items-center">
          <div
            className="w-24 h-24 rounded-[var(--radius-md)] flex items-center justify-center overflow-hidden"
            style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {contact.qrCode && visible ? (
              <img
                src={contact.qrCode}
                alt={`${contact.name || "联系人"}二维码`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span
                className="text-xs text-center leading-relaxed px-1"
                style={{ color: "var(--color-text-copyright)" }}
              >
                {contact.name || "微信"}
                <br />
                二维码
              </span>
            )}
          </div>
          {(contact.name || contact.role) && (
            <span
              className="mt-1.5 text-xs text-center"
              style={{ color: "var(--color-text-copyright)" }}
            >
              {contact.name}
              {contact.name && contact.role && " · "}
              {contact.role}
            </span>
          )}
          {contact.phone && (
            <span className="text-xs" style={{ color: "var(--color-text-copyright)" }}>
              {contact.phone}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
