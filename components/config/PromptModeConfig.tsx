"use client";

import { Wand2 } from "lucide-react";
import { useVaultConfig } from "@/lib/state/useVaultConfig";
import { PROMPT_MODE_DEFS } from "@/lib/config/catalog";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { PromptMode } from "@/lib/config/types";

export function PromptModeConfig() {
  const { config, update } = useVaultConfig();

  const currentDef = PROMPT_MODE_DEFS.find((d) => d.key === config.promptMode);

  return (
    <Card>
      <CardHeader
        icon={<Wand2 size={18} />}
        title="Prompt mode"
        description="Choose what the Claude prompt will generate."
      />
      <CardBody className="space-y-3">
        <SegmentedControl<PromptMode>
          ariaLabel="Prompt mode"
          value={config.promptMode}
          onChange={(v) => update((d) => { d.promptMode = v; })}
          options={PROMPT_MODE_DEFS.map((d) => ({ value: d.key, label: d.label }))}
        />
        {currentDef && (
          <p className="text-xs text-muted">{currentDef.description}</p>
        )}
      </CardBody>
    </Card>
  );
}
