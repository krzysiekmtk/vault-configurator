# Vault Configurator

[![CI](https://github.com/krzysiekmtk/vault-configurator/actions/workflows/ci.yml/badge.svg)](https://github.com/krzysiekmtk/vault-configurator/actions/workflows/ci.yml)

**Build your perfect Obsidian vault in minutes.**

Configure an Obsidian vault visually, watch a live preview update as you go, then
**download a ready-to-use `.zip`** or **copy a Claude Code prompt** that builds the
same vault for you. Everything runs in the browser — no account, no upload, no backend.

![Vault Configurator](public/.gitkeep)

## Features (MVP)

- **6 starter profiles** — Dev, Manager, Creative, Student, Journal, Empty. One click sets the entire config.
- **Folder structure** — Minimal / Standard / PARA / Custom presets, optional monthly daily-note subfolders.
- **Filename prefixes** — none, `YYYY-MM-DD-`, `YYYYMMDD-`, or type-based (`project-`, `note-`…).
- **Tag system** — toggleable Status / Type / Priority / Area groups plus normalized custom tags.
- **Daily Note builder** — choose sections, see the Markdown template generated live.
- **Plugin recommendations** — core + community plugins surfaced in README, CLAUDE.md and the prompt (never auto-installed).
- **Git + iCloud guidance** — adds a `.gitignore` and cautious setup notes when enabled.
- **Live preview** — Folder Tree, Daily Note, a stylized Graph View mock, and the Claude prompt.
- **Download Vault ZIP** — a complete starter vault with folders, templates, sample notes, README and CLAUDE.md.
- **Copy Claude Prompt** — a full prompt ready to paste into Claude Code.
- **Export / Import JSON** — validated with Zod.
- **Shareable URL** — config encoded into the location hash, restored on load.
- **Persistence** — current config saved to `localStorage`.

## Tech stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS · Zod · JSZip · Lucide icons.
No backend, no database, no auth — 100% client-side.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npm run typecheck
npm test
npm run build
npm run start      # serve the production build
```

## Run with Docker

The image uses a multi-stage build on top of Next.js `standalone` output, so it stays small.

```bash
docker build -t vault-configurator .
docker run -p 3001:3000 vault-configurator
```

Or with Docker Compose:

```bash
docker compose up --build
```

Then open <http://localhost:3001>. The container listens on `3000` internally;
the host port is `3001` (change the left side of `-p` / the compose `ports` mapping
to use a different one).

## npm scripts

| Script             | What it does                          |
| ------------------ | ------------------------------------- |
| `npm run dev`      | Start the dev server                  |
| `npm run build`    | Production build (standalone output)  |
| `npm run start`    | Serve the production build            |
| `npm run lint`     | ESLint (`next lint`)                  |
| `npm run typecheck`| `tsc --noEmit`                        |
| `npm test`         | Vitest unit tests for generators      |

## Project structure

```text
app/                     # Next.js App Router shell (layout, page, globals)
components/
  config/                # Left panel — configuration cards
  preview/               # Right panel — live previews + tabs
  actions/               # Download ZIP, Copy prompt, Share, Export/Import
  ui/                    # Lightweight UI primitives (Button, Toggle, …)
lib/
  config/                # Zod schema, types, defaults, presets, catalog, io
  generators/            # Pure functions: folder tree, daily note, vault files, ZIP, prompt
  share/                 # Config <-> URL hash encoding
  state/                 # useVaultConfig provider (state + persistence)
  utils/                 # normalizeTags, downloadFile, cn
.github/workflows/ci.yml # CI: lint, typecheck, test, build + Docker build
Dockerfile, docker-compose.yml, .dockerignore
```

The **generators are pure and UI-free** — the live preview and the ZIP consume the
exact same functions, so what you see is what you download.

## GitHub Actions

`.github/workflows/ci.yml` runs on push and PR to `main`:

1. **verify** — `npm ci`, `lint`, `typecheck`, `test`, `build`.
2. **docker** — `docker build` to ensure the Dockerfile stays valid.

## SaaS roadmap

The MVP is intentionally local, but the architecture is ready to grow:

- User accounts + auth
- Cloud-saved configurations and version history
- Preset marketplace (free + paid)
- Server-side vault generation
- Public/private shareable config links (beyond the URL hash)
- User dashboard and billing

Because config is a single Zod-validated object and all output is produced by pure
generators, adding a backend means persisting that object and optionally moving ZIP
generation server-side — no rewrite of the core logic.

## Known MVP limitations

- No backend, database, accounts, payments or marketplace.
- **Core** plugins and settings are pre-enabled via a bundled `.obsidian/` config, so the vault opens ready to use. **Community** plugins are pre-listed and auto-enable once installed, but their code is not bundled — Obsidian downloads that itself.
- Does **not** run Git or touch iCloud on your machine.
- The Graph View is a stylized mock, not a real graph.
- Share links live in the URL hash only (not stored server-side).
