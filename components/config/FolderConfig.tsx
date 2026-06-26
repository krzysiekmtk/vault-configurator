"use client";

import { FolderTree } from "lucide-react";
import type { FolderPreset, FilePrefix } from "@/lib/config/types";
import { useVaultConfig } from "@/lib/state/useVaultConfig";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Toggle } from "@/components/ui/Toggle";
import { TextArea, TextInput } from "@/components/ui/TextField";
import { cleanCustomFolders } from "@/lib/generators/helpers";

const FOLDER_OPTIONS: { value: FolderPreset; label: string }[] = [
  { value: "minimal", label: "Minimal" },
  { value: "standard", label: "Standard" },
  { value: "para", label: "PARA" },
  { value: "custom", label: "Custom" },
];

const PREFIX_OPTIONS: { value: FilePrefix; label: string }[] = [
  { value: "none", label: "None" },
  { value: "date-dash", label: "YYYY-MM-DD-" },
  { value: "date-compact", label: "YYYYMMDD-" },
  { value: "type", label: "Type" },
];

export function FolderConfig() {
  const { config, update } = useVaultConfig();

  return (
    <Card>
      <CardHeader
        icon={<FolderTree size={18} />}
        title="Structure & naming"
        description="Folder layout, monthly daily-note subfolders, and filename prefixes."
      />
      <CardBody className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted">Vault name</label>
          <TextInput
            value={config.vaultName}
            maxLength={80}
            onChange={(e) => update((d) => { d.vaultName = e.target.value || "My Vault"; })}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted">Folder preset</label>
          <SegmentedControl
            ariaLabel="Folder preset"
            options={FOLDER_OPTIONS}
            value={config.folderPreset}
            onChange={(v) => update((d) => { d.folderPreset = v; })}
          />
        </div>

        {config.folderPreset === "custom" && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted">
              Custom folders (one per line or comma-separated)
            </label>
            <TextArea
              placeholder={"Inbox\nProjects\nArchive"}
              defaultValue={config.customFolders.join("\n")}
              onBlur={(e) =>
                update((d) => {
                  d.customFolders = cleanCustomFolders(e.target.value.split(/[,\n]/));
                })
              }
            />
            <p className="text-xs text-muted">
              Cleaned and de-duplicated on blur. Currently {config.customFolders.length} folder(s).
            </p>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted">Filename prefix</label>
          <SegmentedControl
            ariaLabel="Filename prefix"
            options={PREFIX_OPTIONS}
            value={config.filePrefix}
            onChange={(v) => update((d) => { d.filePrefix = v; })}
          />
        </div>

        <div className="border-t border-border-soft pt-2">
          <Toggle
            id="monthly-subfolders"
            label="Monthly subfolders"
            description="Organize daily notes into Daily/YYYY/MM - Month/."
            checked={config.monthlySubfolders}
            onChange={(v) => update((d) => { d.monthlySubfolders = v; })}
          />
        </div>
      </CardBody>
    </Card>
  );
}
