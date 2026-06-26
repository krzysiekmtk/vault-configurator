import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function Badge({
  children,
  tone = "brand",
  className,
}: {
  children: ReactNode;
  tone?: "brand" | "accent" | "muted";
  className?: string;
}) {
  const tones = {
    brand: "bg-brand-soft text-brand border-brand/30",
    accent: "bg-accent/10 text-accent border-accent/30",
    muted: "bg-bg-hover text-muted border-border",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-xs",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
