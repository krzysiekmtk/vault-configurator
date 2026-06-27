"use client";

import { Boxes, AlertTriangle, X } from "lucide-react";
import { useVaultConfig } from "@/lib/state/useVaultConfig";
import { ProfileSelector } from "@/components/config/ProfileSelector";
import { WorkflowPacksConfig } from "@/components/config/WorkflowPacksConfig";
import { ExperienceLevelConfig } from "@/components/config/ExperienceLevelConfig";
import { FolderConfig } from "@/components/config/FolderConfig";
import { PropertiesConfig } from "@/components/config/PropertiesConfig";
import { TagConfig } from "@/components/config/TagConfig";
import { DailyNoteConfig } from "@/components/config/DailyNoteConfig";
import { DashboardConfig } from "@/components/config/DashboardConfig";
import { BasesConfig } from "@/components/config/BasesConfig";
import { PluginConfig } from "@/components/config/PluginConfig";
import { SyncConfig } from "@/components/config/SyncConfig";
import { VaultHealthPanel } from "@/components/health/VaultHealthPanel";
import { PreviewPanel } from "@/components/preview/PreviewPanel";
import { DownloadZipButton } from "@/components/actions/DownloadZipButton";
import { ExportImportPanel } from "@/components/actions/ExportImportPanel";

function ShareErrorBanner() {
  const { shareError, dismissShareError } = useVaultConfig();
  if (!shareError) return null;
  return (
    <div className="mb-4 flex items-center gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-200">
      <AlertTriangle size={16} />
      <span>That shared link was invalid or outdated — loaded the default config instead.</span>
      <button onClick={dismissShareError} className="ml-auto text-amber-200/70 hover:text-amber-100">
        <X size={15} />
      </button>
    </div>
  );
}

export default function Home() {
  const { hydrated } = useVaultConfig();

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 lg:py-10">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
            <Boxes size={22} />
          </span>
          <div>
            <h1 className="text-lg font-bold text-white">Vault Configurator</h1>
            <p className="text-sm text-muted">Build your perfect Obsidian vault in minutes.</p>
          </div>
        </div>
        <div className="sm:self-start">
          <ExportImportPanel />
        </div>
      </header>

      <ShareErrorBanner />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Left: configuration */}
        <div className="space-y-4">
          <ProfileSelector />
          <WorkflowPacksConfig />
          <ExperienceLevelConfig />
          <FolderConfig />
          <PropertiesConfig />
          <TagConfig />
          <DailyNoteConfig />
          <DashboardConfig />
          <BasesConfig />
          <PluginConfig />
          <SyncConfig />
        </div>

        {/* Right: live preview + primary CTA */}
        <div className="lg:sticky lg:top-6 lg:h-fit lg:self-start">
          <div className="space-y-4">
            <DownloadZipButton />
            <VaultHealthPanel />
            {hydrated ? (
              <PreviewPanel />
            ) : (
              <div className="h-64 animate-pulse rounded-xl border border-border bg-bg-card/60" />
            )}
          </div>
        </div>
      </div>

      <footer className="mt-10 border-t border-border-soft pt-6 text-center text-xs text-muted">
        Runs entirely in your browser. No account, no upload — your config stays on this device.
      </footer>
    </main>
  );
}
