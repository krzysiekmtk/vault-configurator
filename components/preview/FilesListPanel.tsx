"use client";

import { File, Folder } from "lucide-react";
import { useVaultConfig } from "@/lib/state/useVaultConfig";
import { generateVaultFiles } from "@/lib/generators/generateVaultFiles";

const ROOT_DOC_NAMES = new Set([
  "README.md",
  "CLAUDE.md",
  "VAULT MANIFEST.md",
  "START HERE.md",
  "First 7 Days.md",
  "Vault Map.md",
  "How to Use This Vault.md",
  "Home.md",
]);

function inferKind(path: string): "template" | "doc" | "config" | "file" {
  if (path.startsWith("Templates/")) return "template";
  if (path.startsWith(".obsidian/")) return "config";
  const name = path.split("/").pop() ?? "";
  if (ROOT_DOC_NAMES.has(name)) return "doc";
  return "file";
}

const ICON_CLASS: Record<string, string> = {
  template: "text-amber-400",
  doc: "text-blue-400",
  config: "text-muted",
  file: "text-green-400",
};

export function FilesListPanel() {
  const { config } = useVaultConfig();
  const now = new Date();
  const { files } = generateVaultFiles(config, now);

  const allPaths = Object.keys(files).sort();
  const totalCount = allPaths.length;

  const groups: Record<string, string[]> = {};
  for (const path of allPaths) {
    const parts = path.split("/");
    const group = parts.length > 1 ? parts[0] : "(root)";
    if (!groups[group]) groups[group] = [];
    groups[group].push(path);
  }

  const sortedGroups = Object.entries(groups).sort(([a], [b]) => {
    if (a === "(root)") return 1;
    if (b === "(root)") return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">{totalCount} files in ZIP</p>
      {sortedGroups.map(([group, paths]) => (
        <div key={group}>
          <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted">
            {group !== "(root)" && <Folder size={12} />}
            <span>{group}</span>
          </div>
          <ul className="space-y-0.5 pl-4">
            {paths.map((path) => {
              const segments = path.split("/");
              const name = segments.length > 1 ? segments.slice(1).join("/") : path;
              const kind = inferKind(path);
              return (
                <li key={path} className="flex items-center gap-1.5 text-xs text-muted/80">
                  <File size={11} className={ICON_CLASS[kind]} />
                  <span>{name}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
