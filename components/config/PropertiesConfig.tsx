"use client";

import { ListChecks } from "lucide-react";
import type { PropertyKey } from "@/lib/config/types";
import { PROPERTY_DEFS } from "@/lib/config/catalog";
import { useVaultConfig } from "@/lib/state/useVaultConfig";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { Checkbox } from "@/components/ui/Checkbox";

export function PropertiesConfig() {
  const { config, update } = useVaultConfig();
  const enabled = new Set<PropertyKey>(config.properties.enabled);
  const on = config.properties.useFrontmatter;

  const toggle = (key: PropertyKey) =>
    update((d) => {
      const i = d.properties.enabled.indexOf(key);
      if (i >= 0) d.properties.enabled.splice(i, 1);
      else d.properties.enabled.push(key);
    });

  return (
    <Card>
      <CardHeader
        icon={<ListChecks size={18} />}
        title="Properties system"
        description="YAML frontmatter fields baked into templates and sample notes."
      />
      <CardBody className="space-y-4">
        <Toggle
          label="Use YAML frontmatter"
          description="Add a properties block to generated notes."
          checked={on}
          onChange={(v) => update((d) => { d.properties.useFrontmatter = v; })}
        />
        <div className={on ? "" : "pointer-events-none opacity-50"}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {PROPERTY_DEFS.map((p) => (
              <Checkbox
                key={p.key}
                label={p.label}
                description={p.description}
                checked={enabled.has(p.key)}
                onChange={() => toggle(p.key)}
              />
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
