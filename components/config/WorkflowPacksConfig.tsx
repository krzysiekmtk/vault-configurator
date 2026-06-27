"use client";

import { Layers } from "lucide-react";
import type { WorkflowPack } from "@/lib/config/types";
import { WORKFLOW_PACK_DEFS } from "@/lib/config/catalog";
import { useVaultConfig } from "@/lib/state/useVaultConfig";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";

export function WorkflowPacksConfig() {
  const { config, update } = useVaultConfig();
  const selected = new Set<WorkflowPack>(config.workflowPacks);

  const toggle = (key: WorkflowPack) =>
    update((d) => {
      const i = d.workflowPacks.indexOf(key);
      if (i >= 0) d.workflowPacks.splice(i, 1);
      else d.workflowPacks.push(key);
    });

  return (
    <Card>
      <CardHeader
        icon={<Layers size={18} />}
        title="What do you want this vault to help you with?"
        description="Pick the workflows you actually use. Each adds templates, sample notes and Home sections."
      />
      <CardBody>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {WORKFLOW_PACK_DEFS.map((pack) => {
            const active = selected.has(pack.key);
            return (
              <button
                key={pack.key}
                onClick={() => toggle(pack.key)}
                aria-pressed={active}
                title={pack.description}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70",
                  active ? "border-brand bg-brand-soft" : "border-border bg-bg-soft/50 hover:border-brand/40",
                )}
              >
                <span className={cn("text-sm font-semibold", active ? "text-white" : "text-muted")}>
                  {pack.label}
                </span>
                <span className="text-xs leading-snug text-muted">{pack.description}</span>
              </button>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
