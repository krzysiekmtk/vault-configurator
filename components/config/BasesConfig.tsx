"use client";

import { Database } from "lucide-react";
import type { BaseView } from "@/lib/config/types";
import { BASE_VIEW_DEFS } from "@/lib/config/catalog";
import { useVaultConfig } from "@/lib/state/useVaultConfig";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { Checkbox } from "@/components/ui/Checkbox";

export function BasesConfig() {
  const { config, update } = useVaultConfig();
  const views = new Set<BaseView>(config.bases.views);
  const on = config.bases.enabled;

  const toggle = (key: BaseView) =>
    update((d) => {
      const i = d.bases.views.indexOf(key);
      if (i >= 0) d.bases.views.splice(i, 1);
      else d.bases.views.push(key);
    });

  return (
    <Card>
      <CardHeader
        icon={<Database size={18} />}
        title="Bases / Database views"
        description="Markdown docs describing recommended database views (filters, columns, views)."
      />
      <CardBody className="space-y-4">
        <Toggle
          label="Generate Bases docs"
          description="Adds a Bases/ folder with one note per view."
          checked={on}
          onChange={(v) => update((d) => { d.bases.enabled = v; })}
        />
        <div className={on ? "" : "pointer-events-none opacity-50"}>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {BASE_VIEW_DEFS.map((b) => (
              <Checkbox
                key={b.key}
                label={b.label}
                description={b.description}
                checked={views.has(b.key)}
                onChange={() => toggle(b.key)}
              />
            ))}
          </div>
        </div>
        {config.communityPlugins.dataview && (
          <p className="text-xs text-muted">
            Dataview is on — each view also gets an equivalent Dataview query.
          </p>
        )}
      </CardBody>
    </Card>
  );
}
