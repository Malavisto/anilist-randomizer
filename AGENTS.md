# AGENTS.md

## What this is

- Next.js (App Router) static-export SPA: `next.config.ts` sets `output: 'export'` → `out/`. No server, no API routes, no server-side env vars or secrets — all code ships to the browser.
- The entire app is one client component: `src/components/anime-randomizer.tsx` (fetches AniList GraphQL from the client). Pages live in `src/app/` (not `app/` — README's path is stale).
- Root `globals.css` is unused dead code; the real stylesheet is `src/app/globals.css`.

## Commands

- Dev: `npm run dev` (Turbopack)
- Typecheck: `npx tsc --noEmit`
- Build (also typechecks): `npm run build` → outputs to `out/`
- **Do NOT use `npm run lint`** — it's broken (Next 16 removed `next lint` and the script errors out). There is no working linter and no test suite; verification is `tsc --noEmit` + `npm run build`.

## Deployment (two parallel consumers of `out/`)

1. GitHub Pages: `.github/workflows/deploy.yml` on push to `main`.
2. Docker image (nginx serving `out/`): `.github/workflows/docker-publish.yml` on push/PRs to `main`; self-hosted via `compose.yml` behind Traefik.

- Traefik strips the `/anilist-randomizer` prefix and nginx serves assets from root (`location /`), so the build must emit root-relative asset paths.
- `package.json` has `"homepage": "/anilist-randomizer"` but `next.config.ts` deliberately sets no `basePath`. This mismatch is a landmine: changing one deployment side (basePath, nginx conf, Traefik labels) without checking the other will break assets on one target.

## Conventions

- UI: shadcn/ui-style components in `src/components/ui/` (Radix + CVA + `cn()` from `src/lib/utils.ts`), Tailwind v3, path alias `@/*` → `src/*`.
- Dependency updates are handled by Renovate (`renovate.json`) — don't hand-bump versions in `package.json`.
- Default branch: `main`. Both workflows deploy/publish from it.
- README claims Vercel deploy but actual deployment is GitHub Pages + Docker (see above).
