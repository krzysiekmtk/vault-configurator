"use client";

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

  return (
    <Card>
      <CardHeader
        title="Starter profile"
        description="Pick a starting point. It configures everything below — tweak freely after."
      />
      <CardBody>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PROFILE_IDS.map((id) => {
            const active = config.profile === id;
            return (
              <button
                key={id}
                onClick={() => setProfile(id)}
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
      </CardBody>
    </Card>
  );
}
