# CLAUDE.md — Vault Configurator

Guidance for AI assistants working on **this repository** (the configurator app
itself — not the Obsidian vaults it generates).

## What this is

A client-side Next.js 15 (App Router) + TypeScript app. No backend, no DB, no auth.
Users configure an Obsidian vault, see a live preview, then download a ZIP or copy a
Claude Code prompt.

## Architecture rules

- **`lib/config/schema.ts` is the single source of truth.** All types come from
  `z.infer`. To add a config field: add it to the schema, then to `presets.ts`
  (every profile) and `defaults.ts`. It threads through the rest automatically.
- **Generators in `lib/generators/` are pure and UI-free.** They take a `VaultConfig`
  (+ optional `Date`) and return data/strings. The live preview and the ZIP consume the
  same generators — never duplicate generation logic in a component.
- **State lives in `lib/state/useVaultConfig.tsx`.** Components read slices and call
  `update(draft => …)`, `setProfile`, `setConfig`, or `reset`. Don't add parallel state.
- **UI primitives in `components/ui/` are hand-rolled** (no shadcn/Radix). Keep them
  small and accessible (roles + keyboard).

## Conventions

- Hydration: the app renders defaults on the server, then loads hash/localStorage in an
  effect and sets `hydrated`. Date-dependent previews render only after `hydrated`.
- Config precedence on load: **URL hash > localStorage > defaults**.
- Keep filenames and tags consistent with `lib/config/catalog.ts`.

## Commands

```bash
npm run dev | build | start | lint | typecheck | test
```

## Rules for AI edits

- Run `npm run lint` and `npm run typecheck` before claiming done.
- Don't introduce a backend, database, or auth — that's deliberately out of MVP scope.
- Don't auto-install Obsidian plugins or run Git/iCloud operations from the app.
- Ask before large refactors; keep components focused and generators pure.
