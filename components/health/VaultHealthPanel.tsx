"use client";

import { Activity, Lightbulb } from "lucide-react";
import { useVaultConfig } from "@/lib/state/useVaultConfig";
import { calculateVaultHealth, type HealthLevel } from "@/lib/health/calculateVaultHealth";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";

type Direction = "lowGood" | "highGood";

const METRICS: { key: keyof ReturnType<typeof calculateVaultHealth>; label: string; dir: Direction }[] = [
  { key: "complexity", label: "Complexity", dir: "lowGood" },
  { key: "beginnerFriendliness", label: "Beginner friendly", dir: "highGood" },
  { key: "mobileRisk", label: "Mobile risk", dir: "lowGood" },
  { key: "pluginDependency", label: "Plugin dependency", dir: "lowGood" },
  { key: "maintenanceEffort", label: "Maintenance", dir: "lowGood" },
];

function tone(level: HealthLevel, dir: Direction): string {
  const good = dir === "lowGood" ? level === "Low" : level === "High";
  const bad = dir === "lowGood" ? level === "High" : level === "Low";
  if (good) return "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";
  if (bad) return "bg-rose-500/10 text-rose-300 border-rose-500/30";
  return "bg-amber-500/10 text-amber-200 border-amber-500/30";
}

export function VaultHealthPanel() {
  const { config } = useVaultConfig();
  const health = calculateVaultHealth(config);

  return (
    <Card>
      <CardHeader
        icon={<Activity size={18} />}
        title="Vault Health"
        description="A live read on how heavy and maintainable this setup is."
      />
      <CardBody className="space-y-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {METRICS.map((m) => {
            const level = health[m.key] as HealthLevel;
            return (
              <div key={m.key} className="rounded-lg border border-border-soft bg-bg-soft/40 p-2.5">
                <p className="text-xs text-muted">{m.label}</p>
                <span
                  className={cn(
                    "mt-1 inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold",
                    tone(level, m.dir),
                  )}
                >
                  {level}
                </span>
              </div>
            );
          })}
        </div>

        {health.recommendations.length > 0 && (
          <ul className="space-y-1.5 border-t border-border-soft pt-3">
            {health.recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted">
                <Lightbulb size={13} className="mt-0.5 shrink-0 text-brand" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
