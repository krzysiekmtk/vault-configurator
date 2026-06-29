"use client";

import { useState } from "react";
import { Code2, Briefcase, Palette, GraduationCap, BookHeart, FileQuestion } from "lucide-react";
import type { ProfileId } from "@/lib/config/types";
import { PROFILE_IDS } from "@/lib/config/schema";
import { PROFILE_LABELS, PROFILE_DESCRIPTIONS } from "@/lib/config/presets";
import { useVaultConfig } from "@/lib/state/useVaultConfig";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";

const ICONS: Record<ProfileId, React.ReactNode> = {
  dev: <Code2 size={18} />,
  manager: <Briefcase size={18} />,
  creative: <Palette size={18} />,
  student: <GraduationCap size={18} />,
  journal: <BookHeart size={18} />,
  empty: <FileQuestion size={18} />,
};

export function ProfileSelector() {
  const { config, setProfile } = useVaultConfig();
  const [pending, setPending] = useState<ProfileId | null>(null);

  function handleClick(id: ProfileId) {
    if (id === config.profile) return;
    setPending(id);
  }

  function confirmSwitch() {
    if (!pending) return;
    setProfile(pending);
    setPending(null);
  }

  function cancelSwitch() {
    setPending(null);
  }

  return (
    <Card>
      <CardHeader
        title="Starter profile"
        description="Pick a starting point. It configures everything below — tweak freely after."
      />
      <CardBody className="space-y-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PROFILE_IDS.map((id) => {
            const active = config.profile === id;
            return (
              <button
                key={id}
                onClick={() => handleClick(id)}
                aria-pressed={active}
                title={PROFILE_DESCRIPTIONS[id]}
                className={cn(
                  "flex flex-col items-start gap-1.5 rounded-lg border p-3 text-left transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70",
                  active
                    ? "border-brand bg-brand-soft"
                    : "border-border bg-bg-soft/50 hover:border-brand/40",
                )}
              >
                <span className={cn("flex items-center gap-2", active ? "text-brand" : "text-muted")}>
                  {ICONS[id]}
                  <span className={cn("text-sm font-semibold", active && "text-white")}>
                    {PROFILE_LABELS[id]}
                  </span>
                </span>
                <span className="text-xs leading-snug text-muted">{PROFILE_DESCRIPTIONS[id]}</span>
              </button>
            );
          })}
        </div>

        {pending && (
          <div className="flex items-center gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2.5 text-sm">
            <span className="text-amber-200">
              This will overwrite your current settings. Switch to{" "}
              <strong>{PROFILE_LABELS[pending]}</strong>?
            </span>
            <div className="ml-auto flex shrink-0 gap-2">
              <button
                onClick={confirmSwitch}
                className="rounded-md bg-brand px-3 py-1 text-xs font-semibold text-white hover:bg-brand/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70"
              >
                Yes
              </button>
              <button
                onClick={cancelSwitch}
                className="rounded-md border border-border px-3 py-1 text-xs text-muted hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
