import JSZip from "jszip";
import type { VaultConfig } from "../config/types";
import { generateVaultFiles } from "./generateVaultFiles";

/**
 * Build the starter vault as a ZIP Blob, entirely client-side.
 * Folders (even empty ones) and every generated file are written under the vault name.
 */
export async function generateZip(config: VaultConfig, now: Date = new Date()): Promise<Blob> {
  const { folders, files } = generateVaultFiles(config, now);
  const zip = new JSZip();
  const root = zip.folder(config.vaultName);
  if (!root) throw new Error("Failed to initialize ZIP root folder");

  // Create folders explicitly so empty ones survive in the archive.
  for (const folder of folders) {
    root.folder(folder);
  }

  for (const [path, content] of Object.entries(files)) {
    root.file(path, content);
  }

  return zip.generateAsync({ type: "blob", compression: "DEFLATE" });
}

/** Suggested ZIP filename derived from the vault name. */
export function zipFilename(config: VaultConfig): string {
  const slug = config.vaultName
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9\-_]/g, "")
    .toLowerCase();
  return `${slug || "obsidian-vault"}.zip`;
}
