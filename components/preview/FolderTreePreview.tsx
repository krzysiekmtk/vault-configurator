"use client";

import { useMemo } from "react";
import { Folder, FileText } from "lucide-react";
import { useVaultConfig } from "@/lib/state/useVaultConfig";
import { generateFolderTree, type TreeNode } from "@/lib/generators/generateFolderTree";

function TreeRow({ node, depth }: { node: TreeNode; depth: number }) {
  return (
    <>
      <div
        className="flex items-center gap-2 py-0.5 text-sm"
        style={{ paddingLeft: depth * 16 }}
      >
        {node.kind === "dir" ? (
          <Folder size={14} className="shrink-0 text-brand" />
        ) : (
          <FileText size={14} className="shrink-0 text-muted" />
        )}
        <span className={node.kind === "dir" ? "text-white" : "text-muted"}>{node.name}</span>
      </div>
      {node.children.map((child) => (
        <TreeRow key={`${depth}-${child.name}`} node={child} depth={depth + 1} />
      ))}
    </>
  );
}

export function FolderTreePreview() {
  const { config } = useVaultConfig();
  const now = useMemo(() => new Date(), []);
  const tree = useMemo(() => generateFolderTree(config, now), [config, now]);

  return (
    <div className="font-mono">
      <TreeRow node={tree} depth={0} />
    </div>
  );
}
