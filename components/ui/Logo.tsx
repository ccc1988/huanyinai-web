import { Hexagon } from "lucide-react";

export default function Logo({
  size = "default",
}: {
  size?: "default" | "footer";
}) {
  const textSize = size === "footer" ? "text-lg" : "text-base";
  const iconSize = size === "footer" ? 24 : 20;

  return (
    <span className="flex items-center gap-2 font-[family-name:var(--font-heading)] font-bold">
      <Hexagon
        size={iconSize}
        className="text-[var(--color-accent)]"
        strokeWidth={2}
      />
      <span className={`${textSize} text-[var(--color-text-primary)]`}>
        寰引智能
      </span>
    </span>
  );
}
