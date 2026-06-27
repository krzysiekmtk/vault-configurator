"use client";

import { Smartphone, AlertTriangle } from "lucide-react";
import type { Device, SyncStrategy } from "@/lib/config/types";
import { DEVICE_DEFS, SYNC_STRATEGY_DEFS } from "@/lib/config/catalog";
import { useVaultConfig } from "@/lib/state/useVaultConfig";
import { generateSyncAdvice } from "@/lib/generators/generateSyncAdvice";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { cn } from "@/lib/utils/cn";

export function SyncConfig() {
  const { config, update } = useVaultConfig();
  const devices = new Set<Device>(config.devices);
  const advice = generateSyncAdvice(config);

  const toggleDevice = (key: Device) =>
    update((d) => {
      const i = d.devices.indexOf(key);
      if (i >= 0) d.devices.splice(i, 1);
      else d.devices.push(key);
    });

  // Keep the legacy sync booleans in step so the generators stay correct.
  const setStrategy = (s: SyncStrategy) =>
    update((d) => {
      d.syncStrategy = s;
      d.sync.git = s === "git";
      d.sync.icloud = s === "icloud";
    });

  return (
    <Card>
      <CardHeader
        icon={<Smartphone size={18} />}
        title="Mobile / Sync advisor"
        description="Recommendations only — nothing runs on your machine."
      />
      <CardBody className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Where will you use this vault?</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {DEVICE_DEFS.map((dvc) => (
              <Checkbox
                key={dvc.key}
                label={dvc.label}
                checked={devices.has(dvc.key)}
                onChange={() => toggleDevice(dvc.key)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2 border-t border-border-soft pt-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Sync strategy</p>
          <div role="radiogroup" aria-label="Sync strategy" className="space-y-1.5">
            {SYNC_STRATEGY_DEFS.map((s) => {
              const active = config.syncStrategy === s.key;
              return (
                <button
                  key={s.key}
                  role="radio"
                  aria-checked={active}
                  onClick={() => setStrategy(s.key)}
                  className={cn(
                    "flex w-full flex-col items-start rounded-lg border p-3 text-left transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70",
                    active ? "border-brand bg-brand-soft" : "border-border bg-bg-soft/50 hover:border-brand/40",
                  )}
                >
                  <span className={cn("text-sm font-semibold", active ? "text-white" : "text-muted")}>
                    {s.label}
                  </span>
                  <span className="text-xs text-muted">{s.description}</span>
                </button>
              );
            })}
          </div>
        </div>

        {advice.warnings.length > 0 && (
          <div className="space-y-1.5 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
            {advice.warnings.map((w, i) => (
              <p key={i} className="flex items-start gap-2 text-xs text-amber-200/90">
                <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                <span>{w}</span>
              </p>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
