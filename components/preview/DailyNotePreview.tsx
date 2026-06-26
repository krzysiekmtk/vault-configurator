"use client";

import { useMemo } from "react";
import { useVaultConfig } from "@/lib/state/useVaultConfig";
import { generateDailyNote } from "@/lib/generators/generateDailyNote";

export function DailyNotePreview() {
  const { config } = useVaultConfig();
  const markdown = useMemo(() => generateDailyNote(config), [config]);

  return (
    <pre className="whitespace-pre-wrap break-words font-mono text-sm text-white/90">
      {markdown}
    </pre>
  );
}
