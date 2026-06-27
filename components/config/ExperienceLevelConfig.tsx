"use client";

import { Gauge } from "lucide-react";
import type { ExperienceLevel } from "@/lib/config/types";
import { EXPERIENCE_LEVEL_DEFS } from "@/lib/config/catalog";
import { useVaultConfig } from "@/lib/state/useVaultConfig";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

const OPTIONS = EXPERIENCE_LEVEL_DEFS.map((d) => ({ value: d.key, label: d.label }));

export function ExperienceLevelConfig() {
  const { config, update } = useVaultConfig();
  const current = EXPERIENCE_LEVEL_DEFS.find((d) => d.key === config.experienceLevel);

  return (
    <Card>
      <CardHeader
        icon={<Gauge size={18} />}
        title="Experience level"
        description="Tunes the recommendations in Vault Health. Does not change your settings."
      />
      <CardBody className="space-y-2">
        <SegmentedControl
          ariaLabel="Experience level"
          options={OPTIONS}
          value={config.experienceLevel}
          onChange={(v: ExperienceLevel) => update((d) => { d.experienceLevel = v; })}
        />
        {current && <p className="text-xs text-muted">{current.description}</p>}
      </CardBody>
    </Card>
  );
}
