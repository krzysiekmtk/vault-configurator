"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

export function Checkbox({ checked, onChange, label, description }: CheckboxProps) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border-soft bg-bg-soft/50 p-3 transition-colors hover:border-brand/40">
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70",
          checked ? "border-brand bg-brand text-white" : "border-border bg-bg-card",
        )}
      >
        {checked && <Check size={14} strokeWidth={3} />}
      </button>
      <span className="min-w-0">
        <span className="block text-sm text-white">{label}</span>
        {description && <span className="block text-xs text-muted">{description}</span>}
      </span>
    </label>
  );
}
