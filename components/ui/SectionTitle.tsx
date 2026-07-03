export default function SectionTitle({
  children,
  subtitle,
  align = "center",
}: {
  children: React.ReactNode;
  subtitle?: string;
  align?: "center" | "left";
}) {
  return (
    <div
      className={
        align === "center"
          ? "text-center max-w-3xl mx-auto mb-12"
          : "max-w-3xl mb-12"
      }
    >
      <h2
        className="text-[clamp(1.75rem,4vw,3rem)] font-semibold leading-tight"
        style={{ color: "var(--color-text-primary)" }}
      >
        {children}
      </h2>
      {subtitle && (
        <p
          className="mt-4 text-lg"
          style={{ color: "var(--color-text-muted)" }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
