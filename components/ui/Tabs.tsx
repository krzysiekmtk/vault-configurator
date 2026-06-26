"use client";

import { cn } from "@/lib/utils/cn";

export interface TabItem {
  id: string;
  label: string;
}

export function Tabs({
  items,
  active,
  onChange,
}: {
  items: TabItem[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div role="tablist" className="flex gap-1 rounded-lg border border-border bg-bg-soft p-1">
      {items.map((item) => {
        const selected = item.id === active;
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(item.id)}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70",
              selected ? "bg-brand text-white" : "text-muted hover:text-white",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
