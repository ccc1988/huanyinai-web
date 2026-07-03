import Link from "next/link";

export default function CTAButton({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}) {
  return (
    <Link
      href={href}
      className={variant === "primary" ? "cta-primary" : "cta-secondary"}
    >
      {children}
    </Link>
  );
}
