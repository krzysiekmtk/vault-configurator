"use client";

import { Plug, Boxes } from "lucide-react";
import { useVaultConfig } from "@/lib/state/useVaultConfig";
import { CORE_PLUGINS, COMMUNITY_PLUGINS } from "@/lib/config/catalog";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";

export function PluginConfig() {
  const { config, update } = useVaultConfig();

  return (
    <Card>
      <CardHeader
        icon={<Plug size={18} />}
        title="Plugins"
        description="Recommendations only — nothing is installed for you. Community plugins must be added manually in Obsidian."
      />
      <CardBody className="space-y-4">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Core plugins</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {CORE_PLUGINS.map((p) => (
              <Checkbox
                key={p.key}
                label={p.label}
                description={p.description}
                checked={config.corePlugins[p.key]}
                onChange={(v) => update((d) => { d.corePlugins[p.key] = v; })}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
            <Boxes size={13} /> Community plugins
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {COMMUNITY_PLUGINS.map((p) => (
              <Checkbox
                key={p.key}
                label={p.label}
                description={p.description}
                checked={config.communityPlugins[p.key]}
                onChange={(v) => update((d) => { d.communityPlugins[p.key] = v; })}
              />
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
