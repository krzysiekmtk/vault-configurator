import type { VaultConfig } from "../config/types";
import { generateVaultFiles } from "./generateVaultFiles";

export interface TreeNode {
  name: string;
  kind: "dir" | "file";
  children: TreeNode[];
}

function ensureChild(parent: TreeNode, name: string, kind: "dir" | "file"): TreeNode {
  let node = parent.children.find((c) => c.name === name);
  if (!node) {
    node = { name, kind, children: [] };
    parent.children.push(node);
  }
  return node;
}

function sortTree(node: TreeNode): void {
  node.children.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "dir" ? -1 : 1;
    return a.name.localeCompare(b.name, undefined, { numeric: true });
  });
  node.children.forEach(sortTree);
}

/**
 * Build a nested folder tree from the resolved folders and generated file paths.
 * Reuses generateVaultFiles so the preview always matches the ZIP exactly.
 */
export function generateFolderTree(config: VaultConfig, now: Date = new Date()): TreeNode {
  const { folders, files } = generateVaultFiles(config, now);
  const root: TreeNode = { name: config.vaultName, kind: "dir", children: [] };

  // Empty folders first so they appear even without sample files.
  for (const folder of folders) {
    const segments = folder.split("/").filter(Boolean);
    let cursor = root;
    for (const seg of segments) cursor = ensureChild(cursor, seg, "dir");
  }

  // Then file paths (creating intermediate dirs as needed).
  for (const path of Object.keys(files)) {
    const segments = path.split("/").filter(Boolean);
    let cursor = root;
    segments.forEach((seg, i) => {
      const isFile = i === segments.length - 1;
      cursor = ensureChild(cursor, seg, isFile ? "file" : "dir");
    });
  }

  sortTree(root);
  return root;
}

/** Render a tree as ASCII (used inside the Claude prompt). */
export function asciiTree(node: TreeNode): string {
  const lines: string[] = [`${node.name}/`];
  const walk = (nodes: TreeNode[], prefix: string) => {
    nodes.forEach((child, i) => {
      const last = i === nodes.length - 1;
      const branch = last ? "└── " : "├── ";
      lines.push(`${prefix}${branch}${child.name}${child.kind === "dir" ? "/" : ""}`);
      if (child.children.length) {
        walk(child.children, prefix + (last ? "    " : "│   "));
      }
    });
  };
  walk(node.children, "");
  return lines.join("\n");
}
