"use client";

import { GitBranch, Cloud } from "lucide-react";
import { useVaultConfig } from "@/lib/state/useVaultConfig";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";

export function SyncConfig() {
  const { config, update } = useVaultConfig();

  return (
    <Card>
      <CardHeader
        icon={<GitBranch size={18} />}
        title="Sync"
        description="Adds setup guidance to the README and Claude prompt. Nothing runs on your machine."
      />
      <CardBody className="space-y-1">
        <Toggle
          label="Git"
          description="Include a .gitignore and a recommended Git workflow."
          checked={config.sync.git}
          onChange={(v) => update((d) => { d.sync.git = v; })}
        />
        <div className="flex items-start gap-2 border-t border-border-soft pt-2">
          <Cloud size={16} className="mt-2 shrink-0 text-muted" />
          <Toggle
            label="iCloud Sync"
            description="Add cautious iCloud setup notes to the README."
            checked={config.sync.icloud}
            onChange={(v) => update((d) => { d.sync.icloud = v; })}
          />
        </div>
      </CardBody>
    </Card>
  );
}
