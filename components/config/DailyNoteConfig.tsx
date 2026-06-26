"use client";

import { CalendarDays } from "lucide-react";
import { useVaultConfig } from "@/lib/state/useVaultConfig";
import { DAILY_SECTIONS } from "@/lib/config/catalog";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";

export function DailyNoteConfig() {
  const { config, update } = useVaultConfig();

  return (
    <Card>
      <CardHeader
        icon={<CalendarDays size={18} />}
        title="Daily Note sections"
        description="Each enabled section becomes a heading in the daily note template."
      />
      <CardBody>
        <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
          {DAILY_SECTIONS.map((s) => (
            <Toggle
              key={s.key}
              label={s.label}
              checked={config.dailyNoteSections[s.key]}
              onChange={(v) => update((d) => { d.dailyNoteSections[s.key] = v; })}
            />
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
