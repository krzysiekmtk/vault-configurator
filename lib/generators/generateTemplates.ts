import type { VaultConfig } from "../config/types";
import { WORKFLOW_PACKS } from "../config/workflowPacks";
import { LIBRARY_TEMPLATES } from "../config/templateLibrary";
import { buildFrontmatter } from "./generateFrontmatter";

/**
 * Build the `Templates/*.md` files contributed by the selected Workflow Packs
 * and the Template Library. Daily Note is handled separately (see `generateVaultFiles`).
 * Templates keep the `{{date}}`/`{{title}}` tokens so Obsidian's Templates core plugin
 * fills them. Deduped by path.
 */
export function generateTemplates(config: VaultConfig): Record<string, string> {
  const files: Record<string, string> = {};

  for (const pack of config.workflowPacks) {
    for (const tpl of WORKFLOW_PACKS[pack].templates) {
      const path = `Templates/${tpl.name}.md`;
      if (files[path]) continue;
      files[path] = buildFrontmatter(config, tpl.props) + tpl.body;
    }
  }

  for (const tpl of LIBRARY_TEMPLATES) {
    if (!config.templateLibrary.includes(tpl.id)) continue;
    const path = `Templates/${tpl.filename}.md`;
    if (files[path]) continue;
    files[path] = buildFrontmatter(config, tpl.props) + tpl.body;
  }

  return files;
}
