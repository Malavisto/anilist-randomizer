# AGENTS.md

## What this is

- Next.js (App Router) static-export SPA: `next.config.ts` sets `output: 'export'` → `out/`. No server, no API routes, no server-side env vars or secrets — all code ships to the browser.
- The UI is one client component: `src/components/anime-randomizer.tsx`; client-side AniList fetching and selection live in `src/lib/anilist.ts`. Pages live in `src/app/`.
- The stylesheet is `src/app/globals.css`.

## Commands

- Dev: `pnpm dev` (Turbopack)
- Typecheck: `pnpm typecheck`
- Build (also typechecks): `pnpm build` → outputs to `out/`
- Tests: `pnpm test` (Node built-in test runner).
- No linter is configured; the obsolete Next lint setup was removed. Verify with `pnpm test`, `pnpm typecheck`, and `pnpm build`.
- Use the pnpm version in `packageManager` and commit only `pnpm-lock.yaml`.

## Deployment (two parallel consumers of `out/`)

1. GitHub Pages: `.github/workflows/deploy.yml` on push to `main`.
2. Docker image (nginx serving `out/`): `.github/workflows/docker-publish.yml` on push/PRs to `main`; self-hosted via `compose.yml` behind Traefik.

- Traefik strips the `/anilist-randomizer` prefix and nginx serves assets from root (`location /`), so the build must emit root-relative asset paths.
- `next.config.ts` deliberately sets no `basePath`: changing one deployment side (basePath, nginx conf, Traefik labels) without checking the other will break assets on one target.

## Conventions

- UI: shadcn/ui-style components in `src/components/ui/` (Radix + CVA + `cn()` from `src/lib/utils.ts`), Tailwind v3, path alias `@/*` → `src/*`.
- Dependency updates are handled by Renovate (`renovate.json`) — don't hand-bump versions in `package.json`.
- Default branch: `main`. Both workflows deploy/publish from it.
- The Pages and Docker publishing workflows were manually disabled when audited. Preserve that state unless deployment changes are requested; Vercel is also connected and builds PR previews.
- CI runs on PRs and `renovate/**` pushes so branch automerge has real checks. Renovate requires `App checks` and `Container checks`.
