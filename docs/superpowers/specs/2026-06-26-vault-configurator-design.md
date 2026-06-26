# Vault Configurator — Design

**Date:** 2026-06-26
**Promise:** Build your perfect Obsidian vault in minutes.

## Goal

A client-side-only web tool where a user configures an Obsidian vault, sees a live
preview, then downloads it as a `.zip` or copies a Claude Code prompt. MVP has no
backend, DB, auth, or payments, but the architecture is SaaS-ready.

## Decisions (locked with user)

- Public GitHub repo `vault-configurator`, pushed.
- UI in English now; i18n (PL) deferred — labels centralized in `lib/config/catalog.ts`.
- Hand-rolled UI primitives (no shadcn/Radix) for a lighter, CI-safe build.
- Minimal Vitest unit tests on the pure generators.
- Stack: Next.js 15 App Router, TypeScript, Tailwind v3, Zod, JSZip, Lucide.

## Architecture

Layered, with a one-way data flow `config → generators → preview`:

- **Domain** (`lib/config`): `schema.ts` (Zod = single source of truth, types via
  `z.infer`), `defaults.ts`, `presets.ts` (6 profiles + folder presets), `catalog.ts`
  (tag groups, sections, plugin metadata), `activeTags.ts`, `io.ts` (import/export).
- **Generators** (`lib/generators`): pure `VaultConfig → output`. `generateVaultFiles`
  is the canonical builder (folders + path→content map); `generateFolderTree`,
  `generateDailyNote`, `generatePrompt`, `generateZip` all derive from it / the config.
  Preview and ZIP share these — what you see is what you download.
- **State** (`lib/state/useVaultConfig.tsx`): React context, persistence to
  localStorage, hydration from URL hash. Precedence hash > localStorage > defaults.
- **Share** (`lib/share`): config ↔ base64url in the location hash.
- **UI** (`components/{config,preview,actions,ui}`): left = config cards, right =
  tabbed preview + primary CTA.

## Components / data flow

`useVaultConfig` holds the `VaultConfig`. Config cards dispatch `update`/`setProfile`.
Preview components call generators in `useMemo` keyed on config. Actions
(ZIP/prompt/share/export-import) read the same config.

## Error handling

- Invalid import JSON → Zod error surfaced as a toast; state unchanged.
- Invalid share hash → fall back to defaults, show a dismissible banner.
- ZIP/clipboard failures → error toast, no crash.

## Testing

Vitest over pure functions: `normalizeTags`, `generateDailyNote`,
`generateVaultFiles` (templates, `.gitignore` gating, monthly subfolders, prefixes),
`generateFolderTree`, `generatePrompt`, and the share round-trip.

## Out of scope (MVP)

Backend, DB, auth, payments, marketplace, server-side generation, Obsidian API,
auto plugin install, running Git/iCloud locally.
