"use client";

import { LayoutDashboard } from "lucide-react";
import type { DashboardSection } from "@/lib/config/types";
import { DASHBOARD_SECTION_DEFS } from "@/lib/config/catalog";
import { useVaultConfig } from "@/lib/state/useVaultConfig";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { Checkbox } from "@/components/ui/Checkbox";

export function DashboardConfig() {
  const { config, update } = useVaultConfig();
  const sections = new Set<DashboardSection>(config.dashboard.sections);
  const on = config.dashboard.enabled;

  const toggle = (key: DashboardSection) =>
    update((d) => {
      const i = d.dashboard.sections.indexOf(key);
      if (i >= 0) d.dashboard.sections.splice(i, 1);
      else d.dashboard.sections.push(key);
    });

  return (
    <Card>
      <CardHeader
        icon={<LayoutDashboard size={18} />}
        title="Dashboard"
        description="Generate a Home.md that links the parts of your vault together."
      />
      <CardBody className="space-y-4">
        <Toggle
          label="Generate Home dashboard"
          description="Adds Home.md with the sections below."
          checked={on}
          onChange={(v) => update((d) => { d.dashboard.enabled = v; })}
        />
        <div className={on ? "" : "pointer-events-none opacity-50"}>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {DASHBOARD_SECTION_DEFS.map((s) => (
              <Checkbox
                key={s.key}
                label={s.label}
                checked={sections.has(s.key)}
                onChange={() => toggle(s.key)}
              />
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
