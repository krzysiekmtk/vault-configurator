"use client";

import { useVaultConfig } from "@/lib/state/useVaultConfig";
import { generateVaultFiles } from "@/lib/generators/generateVaultFiles";
import { generateManifest } from "@/lib/generators/generateManifest";

function StatChip({ label, value }: { label: string; value: string | number | boolean }) {
  const display = typeof value === "boolean" ? (value ? "yes" : "no") : String(value);
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-border bg-bg-soft px-3 py-2">
      <span className="text-lg font-bold text-white">{display}</span>
      <span className="text-xs text-muted">{label}</span>
    </div>
  );
}

export function ManifestPanel() {
  const { config } = useVaultConfig();
  const now = new Date();
  const vaultFiles = generateVaultFiles(config, now);
  const manifest = generateManifest(config, vaultFiles);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <StatChip label="Folders" value={manifest.folderCount} />
        <StatChip label="Files" value={manifest.fileCount} />
        <StatChip label="Templates" value={manifest.templateCount} />
        <StatChip label="Sample notes" value={manifest.sampleNoteCount} />
        <StatChip label="Onboarding docs" value={manifest.onboardingDocCount} />
        <StatChip label="Bases docs" value={manifest.basesDocCount} />
        <StatChip label="Home.md" value={manifest.hasHome} />
        <StatChip label=".gitignore" value={manifest.hasGitignore} />
      </div>
      {manifest.workflowPackLabels.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted">Workflow packs</p>
          <div className="flex flex-wrap gap-1.5">
            {manifest.workflowPackLabels.map((label) => (
              <span
                key={label}
                className="rounded-md border border-brand/30 bg-brand-soft px-2 py-0.5 text-xs text-brand"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
