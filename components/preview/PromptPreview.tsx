"use client";

import { useMemo } from "react";
import { useVaultConfig } from "@/lib/state/useVaultConfig";
import { generatePrompt } from "@/lib/generators/generatePrompt";
import { CopyPromptButton } from "@/components/actions/CopyPromptButton";

export function PromptPreview() {
  const { config } = useVaultConfig();
  const now = useMemo(() => new Date(), []);
  const prompt = useMemo(() => generatePrompt(config, now), [config, now]);

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <CopyPromptButton prompt={prompt} />
      </div>
      <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-border-soft bg-bg-soft/40 p-3 font-mono text-xs text-white/90">
        {prompt}
      </pre>
    </div>
  );
}
