# P0 Product/Workflow Features — Design

Date: 2026-06-27
Status: approved, implementing on `main`.

Adds a product/workflow layer on top of the existing technical configurator. The
user picks *what they want the vault for*, not just folders and plugins.

## Decisions (from user)
- **Workflow Packs are content-only.** They add templates, sample notes, and
  `Home.md` sections into the existing preset folders. They do NOT create new
  folders (folder structure stays preset-driven). Avoids two competing structure
  sources.
- **Experience level affects recommendations only.** Never mutates the user's
  toggles. Changes Vault Health wording/scoring and the Claude prompt.
- **Delivery:** commit + push directly to `main`.

## New config fields (all `.default()` for back-compat with old JSON / share URLs)
```ts
workflowPacks: WorkflowPack[]            // default []
properties: { useFrontmatter: boolean; enabled: PropertyKey[] }  // default { true, all }
bases: { enabled: boolean; views: BaseView[] }                   // default { false, [] }
dashboard: { enabled: boolean; sections: DashboardSection[] }    // default { true, [] }
experienceLevel: "beginner" | "balanced" | "power"              // default "balanced"
devices: Device[]                        // default ["desktop"]
syncStrategy: "none"|"obsidian-sync"|"icloud"|"git"|"dropbox-onedrive" // default "none"
```
Legacy `sync { git, icloud }` stays canonical for `.gitignore` generation.
`syncStrategy` is UI sugar that writes through to `sync.git/icloud` on change, and
drives the advisor text. No existing field removed → no regression.

## Workflow Packs
`projects, tasks, meetings, research, content, learning, journal, people, reading`.
Single source `lib/config/workflowPacks.ts` maps each pack to: templates, a sample
note (placed by folder role with fallback), a Home section, frontmatter property
set, and a Bases view id.

Profile → packs:
- dev: projects, tasks, meetings, research
- manager: projects, tasks, meetings, people
- creative: content, research, journal
- student: learning, research, reading, tasks
- journal: journal, reading
- empty: none

## New generators (pure)
`generateFrontmatter.ts`, `generateTemplates.ts`, `generateHomeDashboard.ts`,
`generateOnboardingDocs.ts` (START HERE / First 7 Days / Vault Map / How to Use),
`generateBasesDocs.ts`, `generateSyncAdvice.ts`, `lib/health/calculateVaultHealth.ts`.

Wired into `generateVaultFiles`; `generatePrompt`, README and CLAUDE.md generators
gain new sections. Folder tree + ZIP update for free (reuse the builder).

## Bases (MVP)
Safe markdown only: `Bases/README.md` + one descriptive `*.md` per selected view
(filters / columns / views). Optional Dataview query appended when Dataview on. No
`.base` binary format.

## UI (new card order)
Profile → Workflow Packs → Experience level → Structure → Properties → Tags →
Daily → Dashboard → Bases → Plugins → Mobile/Sync Advisor. Vault Health panel
shown at the top of the preview column (live). Same dark/purple style, hand-rolled
primitives.

## Acceptance
`npm run lint/typecheck/build` pass, Docker + CI unchanged, ZIP contains Home +
onboarding docs + Bases docs, import of old JSON does not crash, share URL carries
new fields, no existing feature removed.
