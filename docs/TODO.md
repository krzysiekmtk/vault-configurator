# TODO / Backlog

## Import & Reorganize existing vault (proposed feature)

Take a user's **existing** Obsidian vault and reorganize it according to the same
config toggles — second mode alongside "Create new vault".

**Status:** idea + mockup only. Not built.
**Mockup:** `docs/mockups/import-mockup.html` (rough UI, layout/copy only).

### Flow (all client-side)
1. User drops a `.zip` or picks the vault folder (`<input webkitdirectory>` / File System Access API). No upload.
2. Parse: `.md` files, YAML frontmatter, tags, `[[wikilinks]]`, attachments.
3. Apply transforms from the config.
4. Download a **new** ZIP. Original untouched.

### MVP scope (deterministic, no AI)
- Tag style rewrite nested ↔ flat across all notes.
- Filename prefix add/change (incl. `[MM-DD-YYYY]`).
- Folder remap by rules (e.g. route by `#type/project` → `10 Projects/`).
- Rewrite `[[wikilinks]]` when files are renamed (keep links intact).
- Refresh `.obsidian/` (enable chosen core plugins + settings).
- Add missing templates (Daily / Project / Meeting).
- **Change report** (diff before download): renamed / moved / added counts + per-file list.

### Later / premium
- AI categorization (Claude) for notes without tags — "where does this belong?" into PARA.
- Server-side processing for very large vaults.

### Risks
- Link integrity on rename → must rewrite wikilinks.
- Data safety → never mutate original, output a copy only.
- Large vaults → browser memory limits.
- Attachments must move with their notes.

### Fits current architecture
Add a layer: **vault parser → same VaultConfig → existing generators**. Generators
already exist; only need the reader for existing files + the remap/diff logic.

---

## Other backlog
- i18n (PL/EN toggle) — UI strings centralized in `lib/config/catalog.ts`, deferred.
- Bump CI `node-version` to 22 to silence the Node 20 deprecation annotation (cosmetic).
